import db from "../database/db.js"
import bcrypt from "bcrypt"
const saltRounds = 10;


class loginmodel {
  all(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.permisos(user_id)
        const sql = `
          SELECT
            u.id,
            u.nombre,
            u.apellido,
            u.cedula,
            u.firma,
            u.eliminado,
            l.permisos,
            l.last_login,
            CASE WHEN l.id IS NOT NULL THEN 1 ELSE 0 END AS tiene_acceso
          FROM responsable u
          LEFT JOIN login l ON l.cedula = u.cedula
        `
        const [rows] = await db.query(sql)
        resolve({ status: 200, message: "Usuarios obtenidos con éxito", data: rows });
      } catch (error) {
        reject(error);
      }
    });
  }

  permisos(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const sql = "SELECT permisos FROM login WHERE id_responsable = ?"
        const [rows] = await db.query(sql, [user_id])
        if (rows.length === 0) {
          return reject({ message: "No tienes permiso para realizar esta acción 1", status: 403 })
        }
        if (rows[0].permisos === 0) {
          return reject({ message: "No tienes permiso para realizar esta acción 2", status: 403 })
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    })
  }

  async authenticate(data) {
    return new Promise(async (resolve, reject) => {
      const sqlLogin = "SELECT clave FROM login WHERE cedula = ?"
      const sqlUser = "SELECT id, nombre, apellido, cedula, firma, eliminado FROM responsable WHERE cedula = ?"
      try {
        const [rows] = await db.query(sqlLogin, [data.cedula])
        if (rows.length === 0) {
          return reject({ message: "Usuario no encontrado", status: 404 })
        }

        const match = await bcrypt.compare(data.clave, rows[0].clave)
        if (!match) {
          return reject({ message: "Contraseña incorrecta", status: 401 })
        }

        // Traer datos del responsable para incluirlos en el token
        const [userRows] = await db.query(sqlUser, [data.cedula])
        if (userRows.length === 0) {
          return reject({ message: "Responsable no encontrado", status: 404 })
        }
        await db.query("UPDATE login SET last_login = CURRENT_TIMESTAMP WHERE cedula = ?", [data.cedula])
        resolve({ message: "Autenticación exitosa", status: 200, responsable: userRows[0] })
      } catch (error) {
        reject({ message: "Error al autenticar", status: 500, error: error.message })
      }
    });
  }

  create(data) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.permisos(data.user_id)
        const hashedPass = await bcrypt.hash(data.clave, saltRounds);
        const usuario = 'SELECT * FROM login WHERE id_responsable = ?'
        const [rowsUsuario] = await db.query(usuario, [data.id_responsable]);
        if (rowsUsuario.length > 0) {
          await this.update(rowsUsuario[0].id, { clave: hashedPass, id_responsable: data.user_id })
          return resolve({ message: "Contraseña actualizada con éxito", status: 201 })
        }
        const sql = "INSERT INTO login (id_responsable, cedula, clave) VALUES (?, ?, ?)"
        const params = [data.id_responsable, data.cedula, hashedPass];
        const [rows] = await db.query(sql, params);
        resolve({ status: 201, message: "Acceso creado con éxito", data: rows });
      } catch (error) {
        reject(error);
      }
    });
  }

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const hashedPass = await bcrypt.hash(data.clave, saltRounds);
        const sql = "UPDATE login SET clave = ? WHERE id_responsable = ?"
        const [rows] = await db.query(sql, [hashedPass, id])
        resolve({ status: 200, message: "Usuario actualizado con éxito", data: rows });
      } catch (error) {
        reject(error);
      }
    });
  }

  delete(id, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(user_id);
        
        await this.permisos(user_id)
        const sql = "DELETE FROM login WHERE id_responsable = ?"
        const [rows] = await db.query(sql, [id])
        resolve({ status: 200, message: "Usuario eliminado con éxito", data: rows });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default loginmodel;