const pdfmake = require('pdfmake');

const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

pdfmake.setFonts(fonts);

function generarPdfBuffer(docDefinition) {
  return new Promise((resolve, reject) => {
    try {
      const docConFuente = {
        defaultStyle: { font: 'Helvetica' },
        ...docDefinition
      };

      const pdfDoc = pdfmake.createPdf(docConFuente);
      pdfDoc.getBuffer()
        .then(resolve)
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generarPdfBuffer };
