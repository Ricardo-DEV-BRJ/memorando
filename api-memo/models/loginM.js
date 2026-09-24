import db from "../database/db.js"

class loginmodel {
  all() {
    return new Promise((resolve, reject) => {
      // Consulta para obtener todos
    });
  }

  getOne(id) {
    return new Promise(async (resolve, reject) => {
      const sql = "SELECT cedula, pass FROM login WHERE cedula = ?"
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
      const sql = "INSERT INTO login (cedula, pass) VALUES (?, ?)"
      try {
        const [rows] = await db.query(sql, [data.cedula, data.pass])
        resolve(rows)
      } catch (error) {
        reject(error)
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