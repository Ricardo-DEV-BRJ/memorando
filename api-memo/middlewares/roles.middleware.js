const db = require('../database/db.js');

// Consulta en la base de datos el rol vigente del usuario logueado.
// No se confía solo en el token porque los permisos pueden cambiar mientras el token sigue vigente.
async function obtenerRol(user_id) {
  const sql = `
    SELECT l.permisos, l.per_super, r.id_dep
    FROM login l
    INNER JOIN responsable r ON r.id = l.id_responsable
    WHERE l.id_responsable = ?
  `;
  const [rows] = await db.query(sql, [user_id]);
  if (rows.length === 0) return null;
  return {
    permisos: rows[0].permisos,
    superAdmin: rows[0].per_super == 1,
    administrador: rows[0].permisos == 1,
    id_dep: rows[0].id_dep,
  };
}

// Solo el superadministrador puede gestionar los departamentos.
// Debe usarse después de verifyToken. No responde con access: false para que el front no cierre la sesión.
const soloSuperAdmin = async (req, res, next) => {
  try {
    const rol = await obtenerRol(req.user_id);
    if (!rol || !rol.superAdmin) {
      return res.status(403).json({
        message: 'No tienes permiso para realizar esta acción',
        error: 'No tienes permiso para realizar esta acción',
      });
    }
    req.rol = rol;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar los permisos', error: error.message });
  }
};

module.exports = { obtenerRol, soloSuperAdmin };
