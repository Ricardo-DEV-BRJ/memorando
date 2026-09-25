import db from '../database/db.js';

class responsablesModel {
    all() {
        return new Promise(async (resolve, reject) => {
            const sql = 'SELECT * FROM responsable'
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
            // Consulta por ID
        });
    }

    create(data) {
        return new Promise(async (resolve, reject) => {
            const sql = 'INSERT INTO responsable (nombre, apellido, cedula, firma) VALUES (?,?,?,?)'
            const valores = Object.values(data)
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
            // Consulta para actualizar
        });
    }

    delete(id) {
        return new Promise(async (resolve, reject) => {
            // Consulta para eliminar
        });
    }
}

export default responsablesModel;