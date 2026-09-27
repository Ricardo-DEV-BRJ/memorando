import loginModel from "../models/loginM.js"
import jwt from "jsonwebtoken"

const model = new loginModel()

class logincontroller {
  all(user_id) {
    return new Promise((resolve, reject) => {
      model.all(user_id)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    });
  }

  authenticate(data) {
    return new Promise((resolve, reject) => {
      model.authenticate(data)
        .then(({ responsable, permisos }) => {
          const secretKey = process.env.JWT_SECRET
          const token = jwt.sign(
            {
              id: responsable.id,
              cedula: responsable.cedula,
              nombre: responsable.nombre,
              apellido: responsable.apellido,
            },
            secretKey,
            { expiresIn: '8h' }
          )
          resolve({
            status: 200,
            message: 'Inicio de sesión exitoso',
            token,
            permisos,
            responsable,
          })
        })
        .catch((err) => reject(err))
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

  delete(id, user_id) {
    return new Promise((resolve, reject) => {
      model.delete(id, user_id)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    });
  }
}

export default logincontroller;
