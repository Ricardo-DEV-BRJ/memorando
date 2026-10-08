const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true para puerto 465, false para puerto 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Contraseña de aplicación o API Key
  },
});


async function envioCorreo(correo, asunto, mensaje, folio_me, buffer) {
  return new Promise(async (resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: asunto,
      text: mensaje,
      attachments: [
        {
          filename: `memorando-${folio_me}.pdf`,
          content: buffer,
          contentType: 'application/pdf',
        },
      ],
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve({ status: 200, message: 'Correo enviado con éxito', data: info.response });
      }
    });
  })
}

module.exports = {
  envioCorreo
}
