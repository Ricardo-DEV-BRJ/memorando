const nodemailer = require('nodemailer');
const { generarPdfBuffer } = require('../utils/pdf.js');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true para puerto 465, false para puerto 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Contraseña de aplicación o API Key
  },
});

class correoModel {

  enviar(data) {
    return new Promise(async (resolve, reject) => {
      const pdfBuffer = await generarPdfBuffer(data.content, data.qrTexto);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'bricenouzcateguirj@uvm.edu.ve, soportetecnicoes@uvm.edu.ve',
        subject: data.subject || 'Prueba de correo',
        text: data.message || 'Este es un correo de prueba enviado desde Node.js usando Nodemailer.',
        attachments: [
          {
            filename: data.fileName || 'documento.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      };
      try {
        await transporter.sendMail(mailOptions);
        resolve({ status: 200, message: 'Correo enviado con éxito', data: pdfBuffer });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = correoModel;