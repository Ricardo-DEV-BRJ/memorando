const db = require('../database/db.js');

class departamentosModel {

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


  all(user_id) {
    return new Promise(async (resolve, reject) => {
      this.permisos(user_id)
      const sql = `
      SELECT d.*, CASE 
      WHEN EXISTS (
        SELECT 1 FROM memorando m 
        WHERE m.id_dep = d.id_dep OR m.pa_quien = d.id_dep
      ) THEN 0 ELSE 1 END eliminable
      FROM departamentos d 
      WHERE d.dep_eli = 1
      ORDER BY nombre_dep ASC
      `;
      try {
        const [rows] = await db.query(sql);
        resolve({ status: 200, data: rows, message: 'Datos obtenidos con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  create(data) {
    return new Promise(async (resolve, reject) => {
      const { nombre_dep, email } = data;
      const valores = [nombre_dep, email];
      const sql = 'INSERT INTO departamentos (nombre_dep, email) VALUES (?,?)';
      try {
        await db.query(sql, valores);
        resolve({ status: 201, data: [], message: 'Creado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  agregarDepartamentos(data) {
    return new Promise(async (resolve, reject) => {
      const { lista } = data;
      const departamentos = JSON.parse(lista);
      let items = [];
      departamentos.map(e => {
        const item = Object.values(e);
        items.push(item)
      })
      const sql = 'INSERT INTO departamentos (nombre_dep, email) VALUES ?';
      try {
        await db.query(sql, [items]);
        resolve({ status: 201, data: [], message: 'Creado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      const { nombre_dep, email } = data;
      const sql = 'UPDATE departamentos SET nombre_dep = ? , email = ? WHERE id_dep = ?';
      const valores = [nombre_dep, email, id];
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
      const sql = 'UPDATE departamentos SET dep_eli = 0 WHERE id_dep = ?';
      const valores = [id];
      try {
        await db.query(sql, valores);
        resolve({ status: 200, data: [], message: 'Eliminado con exito' });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = departamentosModel;