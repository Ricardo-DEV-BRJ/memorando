const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            error: 'Acceso denegado: Token no proporcionado',
            access: false
        });
    }

    try {
        const secretKey = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secretKey);

        req.user_id = decoded.id;
        req.nombre = decoded.nombre;
        req.apellido = decoded.apellido;
        req.id_dep = decoded.id_dep;
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Token inválido o expirado',
            access: false
        });
    }
};

module.exports = { verifyToken };