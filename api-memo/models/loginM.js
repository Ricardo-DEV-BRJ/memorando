import db from "../database/db.js"
import bcrypt from "bcrypt"

class loginmodel {
  all() {
    return new Promise((resolve, reject) => {
      // Consulta para obtener todos
    });
  }

  getOne(id) {
    return new Promise(async (resolve, reject) => {
      const sql = "SELECT id, id_responsable, cedula, pass FROM login WHERE cedula = ?"
      try {
        const [rows] = await db.query(sql, [id])
        if (rows.length > 0) {
          resolve({ message: "Usuario encontrado", status: 200, res: rows })
        } else {
          reject({ message: "Usuario no encontrado", status: 404 })
        }
      } catch (error) {
        reject({ message: "error al obtener usuario", status: 500, error: error.message })
      }
    });
  }

  create(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const passValue = data.pass || data.clave || '';
        const saltRounds = 10;
        const hashedPass = await bcrypt.hash(passValue, saltRounds);

        const sql = data.id_responsable
          ? "INSERT INTO login (id_responsable, cedula, clave) VALUES (?, ?, ?)"
          : "INSERT INTO login (cedula, pass) VALUES (?, ?)";
        const params = data.id_responsable
          ? [data.id_responsable, data.cedula, hashedPass]
          : [data.cedula, hashedPass];

        const [rows] = await db.query(sql, params);
        resolve({ status: 201, message: "Acceso creado con éxito", data: rows });
      } catch (error) {
        reject(error);
      }
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      // Consulta para actualizar
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      // Consulta para eliminar
    });
  }
}

export default loginmodel;