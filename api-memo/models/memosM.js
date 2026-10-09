const db = require('../database/db.js');
const { generarMemoBuffer } = require('../utils/plantilla.pdf.envio.js');
const { envioCorreo } = require('../utils/envioCorreo.js');

class memoModel {
  all(id_dep) {
    return new Promise(async (resolve, reject) => {
      const sql = `
      SELECT m.id, m.id_responsable, m.id_ubicacion, r.nombre, r.apellido, r.cedula, r.firma, u.nombre AS nom_dir, u.direccion, m.asunto, m.fecha, m.descripcion, m.pa_quien, m.creado_por, folio_me, d.nombre_dep AS dep_emisor, 
      (SELECT COUNT(*) FROM equipo_memo me WHERE me.id_memo = m.id ) AS total_equipos, estado 
      FROM memorando m 
      INNER JOIN ubicacion u ON m.id_ubicacion = u.id 
      INNER JOIN responsable r ON m.id_responsable = r.id
      INNER JOIN departamentos d ON d.id_dep = m.id_dep
      WHERE m.id_dep = ? OR (m.vigilancia = ? OR pa_quien = ?)
      ORDER BY m.fecha DESC`;
      try {
        const [rows] = await db.query(sql, [id_dep, id_dep, id_dep]);
        if (rows.length > 0) {
          resolve({ status: 200, data: rows, message: 'Consulta con exito' });
        } else {
          resolve({ status: 200, data: rows, message: 'Sin resultados' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  getOne(id) {
    return new Promise(async (resolve, reject) => {
      const sql = `
      SELECT m.id, m.id_responsable, m.id_ubicacion, r.nombre, r.apellido, r.cedula, r.firma, u.nombre AS nom_dir, u.direccion, m.asunto, m.fecha, m.descripcion, m.pa_quien, m.creado_por, folio_me, depa_emi.nombre_dep AS dep_emisor, depa_rep.nombre_dep AS pa_quien,
      (SELECT COUNT(*) FROM equipo_memo me WHERE me.id_memo = m.id ) AS total_equipos, estado 
      FROM memorando m 
      INNER JOIN ubicacion u ON m.id_ubicacion = u.id 
      INNER JOIN responsable r ON m.id_responsable = r.id 
      INNER JOIN departamentos depa_emi ON depa_emi.id_dep = m.id_dep
      INNER JOIN departamentos depa_rep ON depa_rep.id_dep = m.pa_quien
      WHERE m.id = ?
      `;
      const sql2 = 'SELECT e.id, e.nombre, e.serial, e.descripcion, e.estado FROM equipo e INNER JOIN equipo_memo em ON e.id = em.id_equipo WHERE em.id_memo = ?';
      const valores = [id];
      try {
        const [rows] = await db.query(sql, valores);
        const [rows2] = await db.query(sql2, valores);
        if (rows.length > 0) {
          resolve({ status: 200, data: { ...rows[0], equipos: rows2 }, message: 'Consulta con exito' });
        } else {
          resolve({ status: 200, data: [], message: 'Sin resultados' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  documento(id) {
    return new Promise(async (resolve, reject) => {
      const sql = `
      SELECT r.nombre, r.apellido, r.firma, u.nombre AS nom_dir, u.direccion, m.asunto, DATE_FORMAT(m.fecha, '%d/%m/%Y') AS fecha, m.descripcion, folio_me, depa_emi.nombre_dep AS dep_emisor, depa_emi.email AS em_email, depa_rep.nombre_dep AS pa_quien, depa_rep.email AS pa_email, r.email_resp, estado
      FROM memorando m 
      INNER JOIN ubicacion u ON m.id_ubicacion = u.id 
      INNER JOIN responsable r ON m.id_responsable = r.id 
      INNER JOIN departamentos depa_emi ON depa_emi.id_dep = m.id_dep
      INNER JOIN departamentos depa_rep ON depa_rep.id_dep = m.pa_quien
      WHERE m.id = ?
      `;
      const sql2 = 'SELECT e.nombre, e.serial, e.descripcion FROM equipo e INNER JOIN equipo_memo em ON e.id = em.id_equipo WHERE em.id_memo = ?';
      const valores = [id];
      try {
        const [rows] = await db.query(sql, valores);
        const [rows2] = await db.query(sql2, valores);
        if (rows.length > 0) {
          resolve({ ...rows[0], equipos: rows2 });
        } else {
          resolve({ status: 200, data: [], message: 'Sin resultados' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  create(data) {
    return new Promise(async (resolve, reject) => {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const { respSeleccionado, fecha, ubicacion, asunto, descripcion, pa_quien, creado_por, equiposSeleccionados, id_dep, vigilancia } = data;
        const { direccionUrl } = data
        const sqlMemo = 'INSERT INTO memorando (id_responsable, id_ubicacion, asunto, fecha, descripcion, pa_quien, creado_por, id_dep, vigilancia) VALUES (?,?,?,?,?,?,?,?,?)';
        const re_vigilancia = vigilancia ? 11 : 0;
        const valoresMemo = [respSeleccionado, ubicacion, asunto, fecha, descripcion, pa_quien, creado_por, id_dep, re_vigilancia];
        const [resultMemo] = await connection.query(sqlMemo, valoresMemo);
        const idMemo = resultMemo.insertId;
        const year = new Date().getFullYear();
        const idFormateado = String(idMemo).padStart(5, '0');
        const folio_me = `ALDEA-${year}-${idFormateado}`;
        const sqlFolio = 'UPDATE memorando SET folio_me = ? WHERE id = ?';
        await connection.query(sqlFolio, [folio_me, idMemo]);

        if (equiposSeleccionados && equiposSeleccionados.length > 0) {
          const valoresEquipos = equiposSeleccionados.map((equipo) => [
            idMemo,
            typeof equipo === 'object' && equipo !== null ? equipo.id : equipo
          ]);

          const placeholders = valoresEquipos.map(() => '(?, ?)').join(', ');
          const sqlEquipos = `INSERT INTO equipo_memo (id_memo, id_equipo) VALUES ${placeholders}`;

          await connection.query(sqlEquipos, valoresEquipos.flat());
        }

        await connection.commit();
        const result = await this.documento(idMemo)
        const pdfBuffer = await generarMemoBuffer(result, direccionUrl)
        let direcciones = ['memorando@uvm.edu.ve']
        direcciones.push(result.email_resp)
        direcciones.push(result.em_email)
        direcciones.push(result.pa_email)
        // await envioCorreo(direcciones.join(', '), result.asunto, result.descripcion, result.folio_me, pdfBuffer)
        resolve({ status: 201, data: { id: idMemo }, message: 'Memorando creado con éxito' });
      } catch (error) {
        await connection.rollback();
        reject(error);
      } finally {
        connection.release();
      }
    });
  }

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      const { nombre, direccion } = data;
      const sql = 'UPDATE ubicacion SET nombre = ? , direccion = ?, eliminado = ? WHERE id = ?';
      const valores = [nombre, direccion, 1, id];
      try {
        await db.query(sql, valores);
        resolve({ status: 200, data: [], message: 'Actualizado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  recibir(id) {
    return new Promise(async (resolve, reject) => {
      const sql = 'UPDATE memorando SET estado = ? WHERE id = ?';
      const valores = ['recibido', id];
      try {
        await db.query(sql, valores);
        resolve({ status: 200, data: [], message: 'Memorando recibido con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  anular(id) {
    return new Promise(async (resolve, reject) => {
      const sql = 'UPDATE memorando SET estado = ? WHERE id = ?';
      const valores = ['anulado', id];
      try {
        await db.query(sql, valores);
        resolve({ status: 200, data: [], message: 'Memorando anulado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = memoModel;