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

    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {

    });
  }
}

export default responsablesController;