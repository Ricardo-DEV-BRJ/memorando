import db from '../database/db.js';

class ubicacionModel {
  all() {
    return new Promise(async (resolve, reject) => {
      const sql = 'SELECT * FROM ubicacion'
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
      const sql = 'SELECT * FROM ubicacion WHERE id = ?'
      const valores = [id]
      try {
        const [rows] = await db.query(sql, valores)
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

  create(data) {
    return new Promise(async (resolve, reject) => {
      const { nombre, direccion } = data
      const sql = 'INSERT INTO ubicacion (nombre, direccion) VALUES (?,?)'
      const valores = [nombre, direccion]
      try {
        const result = await db.query(sql, valores)
        resolve({ status: 201, data: [], message: 'Creado con exito' })
      } catch (error) {
        reject(error)
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

export default ubicacionModel;