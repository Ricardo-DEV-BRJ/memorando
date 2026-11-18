const jwt = require('jsonwebtoken');

// permitirCambioClave: deja pasar a usuarios con el cambio de contraseña pendiente
const autenticar = (permitirCambioClave) => (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            error: 'Acceso denegado: Token no proporcionado',
            access: false
        });
    }

    let decoded;
    try {
        const secretKey = process.env.JWT_SECRET;
        decoded = jwt.verify(token, secretKey);
    } catch (error) {
        return res.status(403).json({
            error: 'Token inválido o expirado',
            access: false
        });
    }

    if (decoded.change_pass && !permitirCambioClave) {
        return res.status(403).json({
            message: 'Debe cambiar su contraseña antes de continuar',
            change_pass: true
        });
    }

    req.user_id = decoded.id;
    req.nombre = decoded.nombre;
    req.apellido = decoded.apellido;
    req.id_dep = decoded.id_dep;
    next();
};

const verifyToken = autenticar(false);
const verifyTokenCambioClave = autenticar(true);

module.exports = { verifyToken, verifyTokenCambioClave };
