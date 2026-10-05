const equiposModel = require('../models/equiposM.js');
const model = new equiposModel();

class equiposcontroller {
  all() {
    return new Promise((resolve, reject) => {
      model.all()
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

  delete(id) {
    return new Promise((resolve, reject) => {
      model.delete(id)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  changeStatus(id, data) {
    return new Promise((resolve, reject) => {
      model.changeStatus(id, data)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

module.exports = equiposcontroller;