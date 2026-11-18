const PdfPrinter = require('pdfmake/src/printer');
const { menbrete, lateral, final, anulado } = require('./imagenes.js');

const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

const printer = new PdfPrinter(fonts);

const convertirADataUrlPng = (imagenSrc) => {
  return new Promise((resolve) => {
    if (!imagenSrc || typeof imagenSrc !== 'string' || !imagenSrc.trim()) {
      return resolve(null);
    }

    let src = imagenSrc.trim();

    // Si viene la cadena base64 cruda sin prefijo data:image, detectar formato por firma mágica
    if (!src.startsWith('data:image/')) {
      if (src.startsWith('iVBORw')) {
        src = `data:image/png;base64,${src}`;
      } else if (src.startsWith('/9j/')) {
        src = `data:image/jpeg;base64,${src}`;
      } else if (src.startsWith('UklGR')) {
        src = `data:image/webp;base64,${src}`;
      } else {
        src = `data:image/png;base64,${src}`;
      }
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // pdfmake solo acepta PNG y JPEG (no soporta WebP)
        const pngBase64 = canvas.toDataURL('image/png');
        resolve(pngBase64);
      } catch (err) {
        console.warn('Error convirtiendo imagen en canvas:', err);
        if (src.includes('image/png') || src.includes('image/jpeg')) {
          resolve(src);
        } else {
          resolve(null);
        }
      }
    };
    img.onerror = () => {
      // Si falló, intentar como otros formatos si era base64 puro
      const rawBase64 = imagenSrc.trim().replace(/^data:image\/[^;]+;base64,/, '');
      const formatos = ['image/png', 'image/webp', 'image/jpeg'];
      let idx = 0;

      const intentarSiguiente = () => {
        if (idx >= formatos.length) return resolve(null);
        const mime = formatos[idx++];
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'anonymous';
        fallbackImg.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = fallbackImg.naturalWidth || fallbackImg.width;
            canvas.height = fallbackImg.naturalHeight || fallbackImg.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(fallbackImg, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } catch {
            intentarSiguiente();
          }
        };
        fallbackImg.onerror = intentarSiguiente;
        fallbackImg.src = `data:${mime};base64,${rawBase64}`;
      };

      intentarSiguiente();
    };
    img.src = src;
  });
};

function plantillaAldea({ qrTexto }) {
  const b64Lateral = lateral;
  const b64Membrete = menbrete;
  const b64Footer = final;
  const b64Anulado = anulado;

  return {
    pageSize: 'A4',
    pageMargins: [60, 140, 40, 90], // copia los márgenes de tu front

    background: () => [
      { image: b64Lateral, absolutePosition: { x: 0, y: 0 }, width: 100, height: 792 },
      { image: b64Membrete, absolutePosition: { x: 100, y: 0 }, width: 400 },
      { image: b64Footer, absolutePosition: { x: 60, y: 740 }, width: 500 },
      ...(qrTexto
        ? [
          { qr: qrTexto, fit: 70, absolutePosition: { x: 480, y: 125 } },
          {
            text: 'Escanear para verificar', fontSize: 6, color: '#2E7D32',
            absolutePosition: { x: 476, y: 197 }
          },
        ]
        : []),
    ],
  };
}



function generarPdfBuffer(docDefinition = {}, qrTexto = null) {
  return new Promise((resolve, reject) => {
    try {
      const docConFuente = {
        ...plantillaAldea({ qrTexto }),
        ...docDefinition,
        defaultStyle: {
          font: 'Helvetica',
          ...(docDefinition.defaultStyle || {})
        }
      };

      const pdfDoc = printer.createPdfKitDocument(docConFuente);
      const chunks = [];

      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', (err) => reject(err));

      pdfDoc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generarPdfBuffer
};