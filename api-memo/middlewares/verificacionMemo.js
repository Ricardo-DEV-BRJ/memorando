import crypto from 'crypto'

export const verificarDocumento = (req, res, next) => {
  const firma = req.params.token
  if (!firma) {
    return res.status(401).json({
      error: 'Acceso denegado: Token no proporcionado',
      access: false
    });
  }

  try {
    const secretKey = process.env.JWT_SECRET;
    console.log('aqui')
    const memo = desencriptarToken(firma, secretKey, iv)
    console.log(memo)
    req.id_memo = memo;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Token inválido o expirado',
      message: error,
      access: false
    });
  }
};

function desencriptarToken(tokenEncriptadoHex, secretKeyHex, ivHex) {
  const key = Buffer.from(secretKeyHex, 'hex'); // Debe ser de 32 bytes para AES-256
  const iv = Buffer.from(ivHex, 'hex');         // Debe ser de 16 bytes
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  let decrypted = decipher.update(tokenEncriptadoHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  // Convertimos el texto recuperado a objeto JSON
  return JSON.parse(decrypted);
}