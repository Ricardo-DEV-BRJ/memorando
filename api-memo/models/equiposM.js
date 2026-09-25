import db from '../database/db.js';

class equiposmodel {
    all() {
        return new Promise(async (resolve, reject) => {
            const sql = 'SELECT * FROM equipo WHERE eliminado = 1'
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
            const sql = 'SELECT * FROM equipo WHERE id = ? AND eliminado = 1'
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
            const { nombre, serial, imagen, descripcion, estado } = data
            const valores = [nombre, serial, imagen, descripcion, estado]
            const sql = 'INSERT INTO equipo (nombre, serial, imagen, descripcion, estado) VALUES (?,?,?,?,?)'
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
            const {nombre, serial, imagen, descripcion, estado } = data
            const sql = 'UPDATE equipo SET nombre = ? , serial = ? , imagen = ? , descripcion = ? , estado = ? WHERE id = ?'
            const valores = [nombre, serial, imagen, descripcion, estado, id]
            try {
                const result = await db.query(sql, valores)
                resolve({ status: 200, data: [], message: 'Actualizado con exito' })
            } catch (error) {
                reject(error)
            }
        });
    }

    changeStatus(id, data) {
        return new Promise(async (resolve, reject) => {
            const { estado } = data
            const sql = 'UPDATE equipo SET estado = ? WHERE id = ?'
            const valores = [estado, id]
            try {
                const result = await db.query(sql, valores)
                resolve({ status: 200, data: [], message: 'Estado actualizado con exito' })
            } catch (error) {
                reject(error)
            }
        });
    }

    delete(id) {
        return new Promise(async (resolve, reject) => {
            const sql = 'UPDATE equipo SET eliminado = 0 WHERE id = ?'
            const valores = [id]
            try {
                const result = await db.query(sql, valores)
                resolve({ status: 200, data: [], message: 'Eliminado con exito' })
            } catch (error) {
                reject(error)
            }
        });
    }
}

export default equiposmodel;