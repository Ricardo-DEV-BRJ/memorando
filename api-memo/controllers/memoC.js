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

  recibir(id, id_dep, user_id) {
    return new Promise((resolve, reject) => {
      model.recibir(id, id_dep, user_id)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  marcar_salida(id, user_id) {
    return new Promise((resolve, reject) => {
      model.marcar_salida(id, user_id)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  marcar_entrada(id, user_id) {
    return new Promise((resolve, reject) => {
      model.marcar_entrada(id, user_id)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  marcar_completado(id, id_responsable) {
    return new Promise((resolve, reject) => {
      model.marcar_completado(id, id_responsable)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  marcar_sitio(id) {
    return new Promise((resolve, reject) => {
      model.marcar_sitio(id)
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