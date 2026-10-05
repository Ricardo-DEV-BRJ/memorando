const correoModel = require('../models/correosM.js');
const model = new correoModel();

class correosController {
  enviar(data) {
    return new Promise((resolve, reject) => {
      model.enviar(data)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = correosController;