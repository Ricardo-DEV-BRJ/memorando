const db = require('../database/db.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class loginmodel {
  all(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const superAdmin = await this.permisos(user_id);
        let whereClause = '';
        if (!superAdmin) {
          whereClause = 'WHERE u.id_dep = (SELECT id_dep FROM responsable WHERE id = ?)';
        }
        const sql = `
          SELECT
            u.id,
            u.nombre,
            u.apellido,
            u.cedula,
            u.firma,
            u.email_resp,
            u.eliminado,
            l.permisos,
            l.last_login,
            CASE WHEN l.id IS NOT NULL THEN 1 ELSE 0 END AS tiene_acceso,
            d.nombre_dep AS departamento,
            d.id_dep
          FROM responsable u
          LEFT JOIN login l ON l.cedula = u.cedula
          INNER JOIN departamentos d ON d.id_dep = u.id_dep
          ${whereClause}
        `;
        const sql2 = `SELECT * FROM departamentos`
        const [rows] = await db.query(sql, superAdmin ? [] : [user_id]);
        const [depa] = await db.query(sql2);
        resolve({ status: 200, message: 'Usuarios obtenidos con éxito', data: rows, depa: depa });
      } catch (error) {
        reject(error);
      }
    });
  }

  permisos(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = 'SELECT permisos, per_super FROM login WHERE id_responsable = ?';
        const [rows] = await db.query(sql, [user_id]);
        if (rows.length === 0) {
          return reject({ message: 'No tienes permiso para realizar esta acción', status: 403 });
        }
        if (rows[0].permisos === 0 || rows[0].permisos === 2) {
          return reject({ message: 'No tienes permiso para realizar esta acción', status: 403 });
        }
        let superAdmin = rows[0].per_super;
        if (superAdmin === 0) {
          return resolve();
        } else {
          resolve(true);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  asignarPermisos(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.permisos(data.user_id);
        const sqlAdmin = 'SELECT id_responsable FROM login WHERE per_super = ?';
        const [rowsAdmin] = await db.query(sqlAdmin, [1]);
        if (rowsAdmin.some(row => row.id_responsable == id)) {
          return reject({ message: 'La acción no puede ser realizada, el usuario es administrador', status: 403 });
        }
        const sql = 'UPDATE login SET permisos = ? WHERE id_responsable = ?';
        const [rows] = await db.query(sql, [data.permisos, id]);
        resolve({ status: 200, message: 'Permisos asignados con éxito', data: rows });
      } catch (error) {
        reject(error);
      }
    });
  }

  async authenticate(data) {
    return new Promise(async (resolve, reject) => {
      const sqlLogin = 'SELECT clave, permisos, per_super AS super_admin, change_pass, last_login FROM login WHERE cedula = ?';
      const sqlUser = 'SELECT id, nombre, apellido, cedula, firma, id_dep, eliminado FROM responsable WHERE cedula = ?';
      try {
        const [rows] = await db.query(sqlLogin, [data.cedula]);
        if (rows.length === 0) {
          return reject({ message: 'Usuario no encontrado', status: 404 });
        }
        
        const match = await bcrypt.compare(data.clave, rows[0].clave);
        console.log(match)
        if (!match) {
          return reject({ message: 'Contraseña incorrecta', status: 401 });
        }

        const [userRows] = await db.query(sqlUser, [data.cedula]);
        if (userRows.length === 0) {
          return reject({ message: 'Responsable no encontrado', status: 404 });
        }
        // Debe cambiar la contraseña si es su primer ingreso o si la base de datos lo indica.
        // Se guarda en change_pass para que siga pendiente aunque cierre sesión sin cambiarla.
        const change_pass = !rows[0].last_login || rows[0].change_pass ? 1 : 0;
        userRows[0].super_admin = rows[0].super_admin;
        userRows[0].change_pass = change_pass;
        await db.query('UPDATE login SET last_login = CURRENT_TIMESTAMP, change_pass = ? WHERE cedula = ?', [change_pass, data.cedula]);
        resolve({ message: 'Autenticación exitosa', status: 200, responsable: userRows[0], permisos: rows[0].permisos, change_pass });
      } catch (error) {
        reject({ message: 'Error al autenticar', status: 500, error: error.message });
      }
    });
  }

  cambiarClave(id, data) {
    return new Promise(async (resolve, reject) => {
      const sql = `
        SELECT r.id, r.nombre, r.apellido, r.cedula, r.id_dep, l.clave, l.permisos, l.per_super AS super_admin
        FROM login l
        INNER JOIN responsable r ON r.id = l.id_responsable
        WHERE l.id_responsable = ?
      `;
      try {
        if (!data.clave_actual || !data.clave_nueva) {
          return reject({ message: 'Debe indicar la contraseña actual y la nueva', status: 400 });
        }
        if (data.clave_nueva.length < 6) {
          return reject({ message: 'La nueva contraseña debe tener mínimo 6 caracteres', status: 400 });
        }
        const [rows] = await db.query(sql, [id]);
        if (rows.length === 0) {
          return reject({ message: 'Usuario no encontrado', status: 404 });
        }
        const match = await bcrypt.compare(data.clave_actual, rows[0].clave);
        if (!match) {
          return reject({ message: 'La contraseña actual es incorrecta', status: 400 });
        }
        if (data.clave_actual === data.clave_nueva) {
          return reject({ message: 'La nueva contraseña debe ser diferente a la actual', status: 400 });
        }
        const hashedPass = await bcrypt.hash(data.clave_nueva, saltRounds);
        await db.query('UPDATE login SET clave = ?, change_pass = 0 WHERE id_responsable = ?', [hashedPass, id]);
        const { clave, permisos, ...responsable } = rows[0];
        resolve({ message: 'Contraseña actualizada con éxito', status: 200, responsable, permisos });
      } catch (error) {
        reject({ message: 'Error al cambiar la contraseña', status: 500, error: error.message });
      }
    });
  }

  // create(data) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       await this.permisos(data.user_id);
  //       const hashedPass = await bcrypt.hash(data.clave, saltRounds);
  //       const usuario = 'SELECT * FROM login WHERE id_responsable = ?';
  //       const [rowsUsuario] = await db.query(usuario, [data.id_responsable]);
  //       if (rowsUsuario.length > 0) {
  //       }
  //       await this.update(data.id_responsable, { clave: data.clave });
  //       return resolve({ message: 'Contraseña actualizada con éxito', status: 201 });
  //     } catch (error) {
  //       reject(error);
  //     }
  //   });
  // }

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const hashedPass = await bcrypt.hash(data.clave, saltRounds);
        const sql = 'UPDATE login SET clave = ?, change_pass = ? WHERE id_responsable = ?';
        const [rows] = await db.query(sql, [hashedPass, data.change_pass, id]);
        resolve({ status: 200, message: 'Usuario actualizado con éxito', data: rows });
      } catch (error) {
        reject(error);
      }
    });
  }

  delete(id, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(user_id);
        await this.permisos(user_id);
        const sql = 'DELETE FROM login WHERE id_responsable = ?';
        const [rows] = await db.query(sql, [id]);
        resolve({ status: 200, message: 'Usuario eliminado con éxito', data: rows });
      } catch (error) {
        reject(error);
      }
    });
  }

  departamentos() {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = 'SELECT * FROM departamentos';
        const [rows] = await db.query(sql);
        resolve({ status: 200, message: 'Departamentos obtenidos con éxito', data: rows });
      } catch (error) {
        reject(error);
      }
    });
  }

}

module.exports = loginmodel;