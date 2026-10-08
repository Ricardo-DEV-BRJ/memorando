const memoModel = require('../models/memosM.js');
const model = new memoModel();

class memoController {
  all(id_dep) {
    return new Promise((resolve, reject) => {
      model.all(id_dep)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
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

  documentoQr(folio) {
    return new Promise((resolve, reject) => {
      model.documentoQr(folio)
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

  recibir(id) {
    return new Promise((resolve, reject) => {
      model.recibir(id)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  anular(id) {
    return new Promise((resolve, reject) => {
      model.anular(id)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = memoController;