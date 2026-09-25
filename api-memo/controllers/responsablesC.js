import responsablesModel from '../models/responsablesM.js';

const model = new responsablesModel();

class responsablesController {
  all() {
    return new Promise((resolve, reject) => {
      model.all()
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    });
  }

  getOne(id) {
    return new Promise((resolve, reject) => {
      model.getOne(id)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    });
  }

  create(data) {
    return new Promise((resolve, reject) => {
      model.create(data)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    });
  }

  update(id, data) {
    return new Promise((resolve, reject) => {
      model.update(id, data)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      model.delete(id)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    });
  }

  activar(id) {
    return new Promise((resolve, reject) => {
      model.activar(id)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    });
  }
}

export default responsablesController;