import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // Obtener el encabezado Authorization (espera el formato "Bearer <TOKEN>")
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

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, secretKey);

        // Guardar los datos del token decodificado dentro de `req.user` para usarlo en las rutas
        req.user_id = decoded.id;
        req.nombre = decoded.nombre;
        req.apellido = decoded.apellido;
        // Continuar al siguiente middleware o ruta
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Token inválido o expirado',
            access: false
        });
    }
};