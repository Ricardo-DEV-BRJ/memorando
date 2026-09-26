import db from '../database/db.js';

class memoModel {
  all() {
    return new Promise(async (resolve, reject) => {
      const sql = 'SELECT m.id, m.id_responsable, m.id_ubicacion, r.nombre, r.apellido, r.cedula, r.firma, u.nombre AS nom_dir, u.direccion, m.asunto, m.fecha, m.descripcion, m.pa_quien, m.creado_por, ( SELECT COUNT(*) FROM equipo_memo me WHERE me.id_memo = m.id ) AS total_equipos FROM memorando m INNER JOIN ubicacion u ON m.id_ubicacion = u.id INNER JOIN responsable r ON m.id_responsable = r.id;'
      try {
        const [rows] = await db.query(sql)
        if (rows.length > 0) {
          resolve({ status: 200, data: rows, message: 'Consulta con exito' })
        } else {
          resolve({ status: 200, data: rows, message: 'Sin resultados' })
        }
      } catch (error) {
        reject(error)
      }
    });
  }

  getOne(id) {
    return new Promise(async (resolve, reject) => {
      const sql = 'SELECT m.id, m.id_responsable, m.id_ubicacion, r.nombre, r.apellido, r.cedula, r.firma, u.nombre AS nom_dir, u.direccion, m.asunto, m.fecha, m.descripcion, m.pa_quien, m.creado_por, ( SELECT COUNT(*) FROM equipo_memo me WHERE me.id_memo = m.id ) AS total_equipos FROM memorando m INNER JOIN ubicacion u ON m.id_ubicacion = u.id INNER JOIN responsable r ON m.id_responsable = r.id WHERE m.id = ?'
      const sql2 = 'SELECT e.id, e.nombre, e.serial, e.descripcion, e.estado FROM equipo e INNER JOIN equipo_memo em ON e.id = em.id_equipo WHERE em.id_memo = ?'
      const valores = [id]
      try {
        const [rows] = await db.query(sql, valores)
        const [rows2] = await db.query(sql2, valores)
        if (rows.length > 0) {
          resolve({ status: 200, data: { ...rows[0], equipos: rows2 }, message: 'Consulta con exito' })
        } else {
          resolve({ status: 200, data: [], message: 'Sin resultados' })
        }
      } catch (error) {
        reject(error)
      }
    });
  }

  create(data) {
    return new Promise(async (resolve, reject) => {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const { respSeleccionado, fecha, ubicacion, asunto, descripcion, pa_quien, creado_por, equiposSeleccionados } = data;
        // 1. Insertar memorando principal
        const sqlMemo = 'INSERT INTO memorando (id_responsable, id_ubicacion, asunto, fecha, descripcion, pa_quien, creado_por) VALUES (?,?,?,?,?,?,?)';
        const valoresMemo = [respSeleccionado, ubicacion, asunto, fecha, descripcion, pa_quien, creado_por];
        const [resultMemo] = await connection.query(sqlMemo, valoresMemo);

        const idMemo = resultMemo.insertId;

        // 2. Insertar todos los equipos seleccionados al mismo tiempo (Bulk Insert)
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
      const { nombre, direccion } = data
      const sql = 'UPDATE ubicacion SET nombre = ? , direccion = ?, eliminado = ? WHERE id = ?'
      const valores = [nombre, direccion, 1, id]
      try {
        const result = await db.query(sql, valores)
        resolve({ status: 200, data: [], message: 'Actualizado con exito' })
      } catch (error) {
        reject(error)
      }
    });
  }

  delete(id) {
    return new Promise(async (resolve, reject) => {
      const sql = 'UPDATE ubicacion SET eliminado = 0 WHERE id = ?'
      const valores = [id]
      try {
        const result = await db.query(sql, valores)
        resolve({ status: 200, data: [], message: 'Inactivado con exito' })
      } catch (error) {
        reject(error)
      }
    });
  }
}

export default memoModel;