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
      SELECT m.id, m.id_responsable, m.id_ubicacion, r.nombre, r.apellido, r.cedula, r.firma, u.nombre AS nom_dir, u.direccion, m.asunto, m.fecha, m.descripcion, m.pa_quien, m.creado_por, folio_me, depa_emi.nombre_dep AS dep_emisor, m.id_dep as id_depa_emisor, depa_rep.nombre_dep AS pa_quien, depa_rep.id_dep as id_depa_pa_quien,
      (SELECT COUNT(*) FROM equipo_memo me WHERE me.id_memo = m.id ) AS total_equipos, estado, 
      m.vigilancia, m.vig_entrada, m.vig_salida,
      CONCAT(vig_sa.nombre,' ',vig_sa.apellido) AS nom_vig_sal, vig_sa.firma AS firma_vig_sa,
      CONCAT(vig_en.nombre,' ',vig_en.apellido) AS nom_vig_en, vig_en.firma AS firma_vig_en,
      m.fec_sal, m.fec_ent, m.fec_rec, recp.nombre AS nom_recp, recp.firma AS firma_recp 
      FROM memorando m 
      INNER JOIN ubicacion u ON m.id_ubicacion = u.id 
      INNER JOIN responsable r ON m.id_responsable = r.id
      LEFT JOIN responsable vig_sa ON vig_sa.id = m.vig_salida
      LEFT JOIN responsable vig_en ON vig_en.id = m.vig_entrada
      LEFT JOIN responsable recp ON recp.id = m.rec_responsable
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
      SELECT r.nombre, r.apellido, r.firma, u.nombre AS nom_dir, u.direccion, m.asunto, DATE_FORMAT(m.fecha, '%d/%m/%Y') AS fecha, m.descripcion, m.vigilancia,
      folio_me, depa_emi.nombre_dep AS dep_emisor, depa_emi.email AS em_email, depa_rep.nombre_dep AS pa_quien, depa_rep.email AS pa_email, r.email_resp, estado,
      CONCAT(vig_sa.nombre,' ',vig_sa.apellido) AS nom_vig_sal, vig_sa.firma AS firma_vig_sa, vig_sa.email_resp AS email_vig_sa,
      CONCAT(vig_en.nombre,' ',vig_en.apellido) AS nom_vig_en, vig_en.firma AS firma_vig_en, vig_en.email_resp AS email_vig_en,
      m.fec_sal, m.fec_ent, m.fec_rec, CONCAT(recp.nombre,' ',recp.apellido) AS nom_recp, recp.firma AS firma_recp 
      FROM memorando m 
      INNER JOIN ubicacion u ON m.id_ubicacion = u.id 
      INNER JOIN responsable r ON m.id_responsable = r.id 
      LEFT JOIN responsable vig_sa ON vig_sa.id = m.vig_salida
      LEFT JOIN responsable vig_en ON vig_en.id = m.vig_entrada
      LEFT JOIN responsable recp ON recp.id = m.rec_responsable
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
        await this.enviarCorreo(idMemo);
        resolve({ status: 201, data: { id: idMemo }, message: 'Memorando creado con éxito' });
      } catch (error) {
        await connection.rollback();
        reject(error);
      } finally {
        connection.release();
      }
    });
  }

  enviarCorreo(id, descripcion = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.documento(id)
        const pdfBuffer = await generarMemoBuffer(result)
        let direcciones = ['memorando@uvm.edu.ve']
        direcciones.push(result.email_resp)
        direcciones.push(result.em_email)
        direcciones.push(result.pa_email)
        direcciones.push(result.email_vig_sa)
        direcciones.push(result.email_vig_en)
        await envioCorreo(direcciones.join(', '), `${result.asunto} Folio ${result.folio_me}`, descripcion ? descripcion : result.descripcion, result.folio_me, pdfBuffer)
        resolve({ status: 200, data: [], message: 'Correo enviado con éxito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  recibir(id, id_dep, user_id) {
    return new Promise(async (resolve, reject) => {
      const connection = await db.getConnection();
      const sql = 'UPDATE memorando SET estado = ?, fec_rec = CURRENT_TIMESTAMP, rec_responsable = ? WHERE id = ?';
      const valores = ['recibido', user_id, id];
      const sqlEquipos = 'SELECT id_equipo FROM equipo_memo WHERE id_memo = ?';
      const valoresEquipos = [id];
      const sqlEquiposUpdate = 'UPDATE equipo SET id_dep = ? WHERE id IN (?)';
      try {
        await connection.beginTransaction();
        await db.query(sql, valores);
        const [equipos] = await db.query(sqlEquipos, valoresEquipos);
        const idEquipos = equipos.map((e) => e.id_equipo);
        await db.query(sqlEquiposUpdate, [id_dep, idEquipos]);
        await connection.commit();
        await this.enviarCorreo(id, 'El memorando ha sido recibido por el departamento correspondiente.');
        resolve({ status: 200, data: [], message: 'Memorando recibido con exito' });
      } catch (error) {
        await connection.rollback();
        reject(error);
      } finally {
        connection.release();
      }
    });
  }

  marcar_salida(id, vig_salida) {
    return new Promise(async (resolve, reject) => {
      const sql = 'UPDATE memorando SET estado = ?, vig_salida = ?, fec_sal = CURRENT_TIMESTAMP WHERE id = ?';
      const valores = ['Salio', vig_salida, id];
      try {
        await db.query(sql, valores);
        await this.enviarCorreo(id, 'El memorando ha salido del departamento correspondiente.');
        resolve({ status: 200, data: [], message: 'Memorando y equipos salieron con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  marcar_entrada(id, vig_entrada) {
    return new Promise(async (resolve, reject) => {
      const sql = 'UPDATE memorando SET estado = ?, vig_entrada = ?, fec_ent = CURRENT_TIMESTAMP WHERE id = ?';
      const valores = ['Retorno', vig_entrada, id];
      try {
        await db.query(sql, valores);
        await this.enviarCorreo(id, 'El memorando ha regresado al departamento correspondiente.');
        resolve({ status: 200, data: [], message: 'Memorando y equipos retornaron con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  marcar_sitio(id) {
    return new Promise(async (resolve, reject) => {
      const sql = 'UPDATE memorando SET estado = ? WHERE id = ?';
      const valores = ['En el sitio', id];
      try {
        await db.query(sql, valores);
        resolve({ status: 200, data: [], message: 'Memorando entregado en el sitio con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  marcar_completado(id, id_responsable) {
    return new Promise(async (resolve, reject) => {
      const sql = 'UPDATE memorando SET estado = ?, rec_responsable = ?, fec_rec = CURRENT_TIMESTAMP WHERE id = ?';
      const valores = ['Completado', id_responsable, id];
      try {
        await db.query(sql, valores);
        await this.enviarCorreo(id, 'El memorando ha sido completado por el responsable.');
        resolve({ status: 200, data: [], message: 'Memorando completado con exito' });
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
        await this.enviarCorreo(id, 'El memorando ha sido anulado.');
        resolve({ status: 200, data: [], message: 'Memorando anulado con exito' });
      } catch (error) {
        console.log(error)
        reject(error);
      }
    });
  }
}

module.exports = memoModel;