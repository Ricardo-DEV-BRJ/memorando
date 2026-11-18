const jwt = require('jsonwebtoken');

function generarToken(responsable, permisos, change_pass) {
  const secretKey = process.env.JWT_SECRET;
  return jwt.sign(
    {
      id: responsable.id,
      cedula: responsable.cedula,
      nombre: responsable.nombre,
      apellido: responsable.apellido,
      permisos: permisos,
      id_dep: responsable.id_dep,
      super_admin: responsable.super_admin,
      change_pass: change_pass
    },
    secretKey,
    { expiresIn: '8h' }
  );
}

module.exports = { generarToken };
