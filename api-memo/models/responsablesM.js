const db = require('../database/db.js');

class responsablesModel {
    all() {
        return new Promise(async (resolve, reject) => {
            const sql = 'SELECT r.id, r.nombre,r.apellido, r.cedula, r.firma, r.eliminado FROM responsable r INNER JOIN login l ON r.id = l.id_responsable WHERE l.permisos <> 3;';
            try {
                const [rows] = await db.query(sql);
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

    getOne(id) {
        return new Promise(async (resolve, reject) => {
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

    create(data) {
        return new Promise(async (resolve, reject) => {
            const { nombre, apellido, cedula, firma } = data;
            const sql = 'INSERT INTO responsable (nombre, apellido, cedula, firma) VALUES (?,?,?,?)';
            const valores = [nombre, apellido, cedula, firma];
            try {
                await db.query(sql, valores);
                resolve({ status: 201, data: [], message: 'Creado con exito' });
            } catch (error) {
                reject(error);
            }
        });
    }

    update(id, data) {
        return new Promise(async (resolve, reject) => {
            const { nombre, apellido, cedula, firma } = data;
            const sql = 'UPDATE responsable SET nombre = ? , apellido = ? , cedula = ? , firma = ?  WHERE id = ?';
            const valores = [nombre, apellido, cedula, firma, id];
            try {
                await db.query(sql, valores);
                resolve({ status: 200, data: [], message: 'Actualizado con exito' });
            } catch (error) {
                reject(error);
            }
        });
    }

    delete(id) {
        return new Promise(async (resolve, reject) => {
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

    activar(id) {
        return new Promise(async (resolve, reject) => {
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