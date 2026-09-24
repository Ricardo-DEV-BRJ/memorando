import db from '../database/db.js';

class responsablesModel {
    all() {
        return new Promise(async (resolve, reject) => {
            // Consulta para obtener todos
        });
    }

    getOne(id) {
        return new Promise(async (resolve, reject) => {
            // Consulta por ID
        });
    }

    create(data) {
        return new Promise(async (resolve, reject) => {
            const sql = 'INSERT INTO responsables (nombre, apellido, cedula, firma) VALUES (?,?,?,?)'
            try {
                const result = await db.query(sql, [data])
                resolve({ status: 200, data: result })
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