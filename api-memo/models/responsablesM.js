const db = require('../database/db.js');

class responsablesModel {

  permisos(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = 'SELECT permisos FROM login WHERE id_responsable = ?';
        const [rows] = await db.query(sql, [user_id]);
        console.log(rows);
        
        if (rows.length === 0) {
          return reject({ message: 'No tienes permiso para realizar esta acción', status: 403 });
        }
        if (rows[0].permisos === 0 || rows[0].permisos === 2 || rows[0].permisos == null) {
          return reject({ message: 'No tienes permiso para realizar esta acción', status: 403 });
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  all(id_dep) {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT r.id, r.nombre,r.apellido, r.cedula, r.firma, d.nombre_dep as departamento, d.id_dep, r.eliminado 
      FROM responsable r 
      INNER JOIN login l ON r.id = l.id_responsable
      INNER JOIN departamentos d ON d.id_dep = r.id_dep 
      WHERE l.permisos <> 0 AND r.id_dep = ?`
      const sql2 = `SELECT * FROM departamentos`
      try {
        const [rows] = await db.query(sql, [id_dep]);
        const [dep] = await db.query(sql2);
        if (rows.length > 0) {
          resolve({ status: 200, data: rows, dep: dep, message: 'Consulta con exito' });
        } else {
          resolve({ status: 200, data: rows, dep: dep, message: 'Sin resultados' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  getOne(id, id_log) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.permisos(id_log);
      } catch (error) {
        return reject(error);
      }
      const sql = 'SELECT * FROM responsable WHERE id = ?';
      const valores = [id];
      try {
        const [rows] = await db.query(sql, valores);
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

  create(data, id_log) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.permisos(id_log);
      } catch (error) {
        return reject(error);
      }
      const { nombre, apellido, cedula, firma, email_resp, id_dep } = data;
      const sql = 'INSERT INTO responsable (nombre, apellido, cedula, firma, email_resp, id_dep) VALUES (?,?,?,?,?,?)';
      const valores = [nombre, apellido, cedula, firma, email_resp, id_dep];
      try {
        await db.query(sql, valores);
        resolve({ status: 201, data: [], message: 'Creado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  update(id, data, id_log) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.permisos(id_log);
      } catch (error) {
        return reject(error);
      }
      const { nombre, apellido, cedula, firma, email_resp, id_dep } = data;
      const sql = 'UPDATE responsable SET nombre = ? , apellido = ? , cedula = ? , firma = ? , email_resp = ? , id_dep = ? WHERE id = ?';
      const valores = [nombre, apellido, cedula, firma, email_resp, id_dep, id];
      try {
        await db.query(sql, valores);
        resolve({ status: 200, data: [], message: 'Actualizado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  delete(id, id_log) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.permisos(id_log);
      } catch (error) {
        return reject(error);
      }
      const sql = 'UPDATE responsable SET eliminado = 0 WHERE id = ?';
      const valores = [id];
      try {
        await db.query(sql, valores);
        resolve({ status: 200, data: [], message: 'Inactivado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  activar(id, id_log) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.permisos(id_log);
      } catch (error) {
        return reject(error);
      }
      const sql = 'UPDATE responsable SET eliminado = 1 WHERE id = ?';
      const valores = [id];
      try {
        await db.query(sql, valores);
        resolve({ status: 200, data: [], message: 'Activado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = responsablesModel;