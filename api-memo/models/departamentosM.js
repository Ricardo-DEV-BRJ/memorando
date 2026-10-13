const db = require('../database/db.js');

class departamentosModel {
  create(data) {
    return new Promise(async (resolve, reject) => {
      const { nombre, email } = data;
      const valores = [nombre, email];
      const sql = 'INSERT INTO departamentos (nombre, email) VALUES (?,?)';
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
      const sql = 'INSERT INTO departamentos (nombre, email) VALUES ?';
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
      const { nombre, email } = data;
      const sql = 'UPDATE departamentos SET nombre = ? , email = ? WHERE id = ?';
      const valores = [nombre, email, id];
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
      const sql = 'UPDATE departamentos SET dep_eli = 0 WHERE id = ?';
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