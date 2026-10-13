const loginModel = require('../models/loginM.js');
const { generarToken } = require('../utils/token.js');

const model = new loginModel();

class logincontroller {
  all(user_id) {
    return new Promise((resolve, reject) => {
      model.all(user_id)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  authenticate(data) {
    return new Promise((resolve, reject) => {
      model.authenticate(data)
        .then(({ responsable, permisos, change_pass }) => {
          const token = generarToken(responsable, permisos, change_pass);
          resolve({
            status: 200,
            message: 'Inicio de sesión exitoso',
            token,
            permisos,
            change_pass,
            responsable,
          });
        })
        .catch((err) => reject(err));
    });
  }

  cambiarClave(id, data) {
    return new Promise((resolve, reject) => {
      model.cambiarClave(id, data)
        .then(({ message, responsable, permisos }) => {
          // Nuevo token sin el cambio de contraseña pendiente
          const token = generarToken(responsable, permisos, 0);
          resolve({ status: 200, message, token });
        })
        .catch((err) => reject(err));
    });
  }

  getOne(id) {
    return new Promise((resolve, reject) => {
      model.getOne(id)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  asignarPermisos(id, data) {
    return new Promise((resolve, reject) => {
      model.asignarPermisos(id, data)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  create(data) {
    return new Promise((resolve, reject) => {
      model.create(data)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      model.update(id, data)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  delete(id, user_id) {
    return new Promise((resolve, reject) => {
      model.delete(id, user_id)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = logincontroller;
