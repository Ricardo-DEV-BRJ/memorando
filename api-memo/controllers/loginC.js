import loginModel from "../models/loginM.js"
const model = new loginModel()

class logincontroller {
  all() {
    return new Promise((resolve, reject) => {

    });
  }

  getOne(id) {
    return new Promise((resolve, reject) => {
      model.getOne(id)
        .then((res) => {
          resolve(res)
        })
        .catch((err)=>{
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

    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {

    });
  }
}

export default logincontroller;