const db = require('../database/db.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
      const sql = `SELECT r.id, r.nombre,r.apellido, r.cedula, r.firma, r.email_resp, d.nombre_dep as departamento, d.id_dep, r.eliminado 
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

  create(data, id_log, user_departamento) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.permisos(id_log);
      } catch (error) {
        return reject(error);
      }

      const { nombre, apellido, cedula, firma, email_resp, id_dep } = data;
      const sqlRespo = 'INSERT INTO responsable (nombre, apellido, cedula, firma, email_resp, id_dep) VALUES (?,?,?,?,?,?)';
      const valores = [nombre, apellido, cedula, firma, email_resp, id_dep ? id_dep : user_departamento];

      const hashedPass = await bcrypt.hash(data.clave, saltRounds);
      const sqlLogin = 'INSERT INTO login (id_responsable, cedula, clave, permisos, change_pass) VALUES (?, ?, ?, ?, ?)';
      let per = 2
      if (data.permisos) {
        per = data.permisos
      }

      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.query(sqlRespo, valores);
        const id_responsable = result.insertId;
        const params = [id_responsable, data.cedula, hashedPass, per, data.change_pass ? 1 : 0];
        await connection.query(sqlLogin, params);
        await connection.commit();
        resolve({ status: 201, data: [], message: 'Creado con exito' });
      } catch (error) {
        await connection.rollback();
        reject(error);
      } finally {
        connection.release();
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
      const { nombre, apellido, cedula, firma, email_resp, id_dep, permisos } = data;
      const sql = 'UPDATE responsable SET nombre = ? , apellido = ? , cedula = ? , firma = ? , email_resp = ? , id_dep = ? WHERE id = ?';
      const valores = [nombre, apellido, cedula, firma, email_resp, id_dep, id];
      const sqlLogin = 'UPDATE login SET permisos = ? WHERE id_responsable = ?';
      const valoresLogin = [permisos, id];
      try {
        await db.query(sql, valores);
        await db.query(sqlLogin, valoresLogin);
        resolve({ status: 200, data: [], message: 'Actualizado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  perfil(id) {
    return new Promise(async (resolve, reject) => {
      const sql = `SELECT r.id, r.nombre, r.apellido, r.cedula, r.email_resp, r.firma, d.nombre_dep AS departamento
      FROM responsable r
      LEFT JOIN departamentos d ON d.id_dep = r.id_dep
      WHERE r.id = ?`;
      try {
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) {
          return reject({ message: 'Usuario no encontrado', status: 404 });
        }
        resolve({ status: 200, data: rows[0], message: 'Consulta con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Solo permite al usuario logueado corregir sus propios datos personales y su firma
  actualizarPerfil(id, data) {
    return new Promise(async (resolve, reject) => {
      const nombre = data.nombre?.trim();
      const apellido = data.apellido?.trim();
      const email_resp = data.email_resp?.trim();
      const { firma } = data;
      if (!nombre || !apellido || !email_resp) {
        return reject({ message: 'El nombre, el apellido y el correo son obligatorios', status: 400 });
      }
      if (!/.+@.+\..+/.test(email_resp)) {
        return reject({ message: 'El correo electrónico no es válido', status: 400 });
      }
      if (firma && !firma.startsWith('data:image/')) {
        return reject({ message: 'La firma debe ser una imagen', status: 400 });
      }

      // La firma solo se actualiza si se envía una nueva
      const sql = `UPDATE responsable SET nombre = ?, apellido = ?, email_resp = ?${firma ? ', firma = ?' : ''} WHERE id = ?`;
      const valores = firma ? [nombre, apellido, email_resp, firma, id] : [nombre, apellido, email_resp, id];
      const sqlUser = `SELECT r.id, r.nombre, r.apellido, r.cedula, r.id_dep, l.permisos, l.per_super AS super_admin, l.change_pass
      FROM responsable r
      INNER JOIN login l ON l.id_responsable = r.id
      WHERE r.id = ?`;
      try {
        const [result] = await db.query(sql, valores);
        if (result.affectedRows === 0) {
          return reject({ message: 'Usuario no encontrado', status: 404 });
        }
        const [rows] = await db.query(sqlUser, [id]);
        const { permisos, change_pass, ...responsable } = rows[0];
        resolve({ status: 200, message: 'Perfil actualizado con éxito', responsable, permisos, change_pass });
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