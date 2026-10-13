const responsablesModel = require('../models/responsablesM.js');
const { generarToken } = require('../utils/token.js');

const model = new responsablesModel();

class responsablesController {
  all(id_dep, id_log) {
    return new Promise((resolve, reject) => {
      model.all(id_dep, id_log)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getOne(id, id_log) {
    return new Promise((resolve, reject) => {
      model.getOne(id, id_log)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  create(data, id_log, user_departamento) {
    return new Promise((resolve, reject) => {
      model.create(data, id_log, user_departamento)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  update(id, data, id_log) {
    return new Promise((resolve, reject) => {
      model.update(id, data, id_log)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  perfil(id) {
    return new Promise((resolve, reject) => {
      model.perfil(id)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  actualizarPerfil(id, data) {
    return new Promise((resolve, reject) => {
      model.actualizarPerfil(id, data)
        .then(({ status, message, responsable, permisos, change_pass }) => {
          // Nuevo token con el nombre y apellido corregidos
          const token = generarToken(responsable, permisos, change_pass);
          resolve({ status, message, token });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  delete(id, id_log) {
    return new Promise((resolve, reject) => {
      model.delete(id, id_log)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  activar(id, id_log) {
    return new Promise((resolve, reject) => {
      model.activar(id, id_log)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = responsablesController;