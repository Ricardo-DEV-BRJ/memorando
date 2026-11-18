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

function formatFechaHora(fecha) {
  if (!fecha) return '-'
  const dateObj = new Date(fecha)
  if (isNaN(dateObj.getTime())) return '-'
  
  const dia = String(dateObj.getDate()).padStart(2, '0')
  const mes = String(dateObj.getMonth() + 1).padStart(2, '0')
  const anio = dateObj.getFullYear()
  const horas = String(dateObj.getHours()).padStart(2, '0')
  const minutos = String(dateObj.getMinutes()).padStart(2, '0')
  
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`
}
/**
 * Genera el Buffer del PDF del Memorando listo para Nodemailer
 * @param {Object} memoData - Datos dinámicos del memorando
 * @returns {Promise<Buffer>}
 */
function generarMemoBuffer(memoData, direccionUrl) {
  return new Promise((resolve, reject) => {
    try {
      const b64Lateral = lateral;
      const b64Membrete = menbrete;
      const b64Footer = final;
      const b64Anulado = anulado;

      const fec_sal = formatFechaHora(memoData.fec_sal);
      const fec_ent = formatFechaHora(memoData.fec_ent);
      const fec_rec = formatFechaHora(memoData.fec_rec);

      // 1. Mapear los equipos al formato que requiere pdfmake
      const equiposFormateados = (memoData.equipos || []).map(item => {
        if (typeof item === 'string') {
          return { text: item, lineHeight: 1.4, margin: [0, 2, 0, 2] };
        }
        return {
          text: [
            { text: `${item.nombre || ''}: `, bold: true },
            { text: item.descripcion ? `${item.descripcion} ` : '' },
            { text: item.serial ? ` Serial: ${item.serial}` : '' }
          ],
          alignment: 'justify',
          lineHeight: 1.4,
        };
      });

      // 2. Separar los primeros 8 elementos del resto
      const listasDinamicas = [];

      if (equiposFormateados.length > 0) {
        const primeros8 = equiposFormateados.slice(0, 8);
        const elResto = equiposFormateados.slice(8);

        listasDinamicas.push({
          ul: primeros8,
          margin: [20, 0, 0, 20],
          pageBreak: elResto.length > 0 ? 'after' : undefined
        });

        if (elResto.length > 0) {
          listasDinamicas.push({
            ul: elResto,
            margin: [20, 0, 0, 20]
          });
        }
      }

      // 3. Estructura del Documento
      const docDefinition = {
        pageSize: 'LETTER',
        pageMargins: [100, 130, 40, 70],
        defaultStyle: { font: 'Helvetica', fontSize: 12 },

        background: function () {
          return [
            ...(b64Lateral ? [{ image: b64Lateral, width: 100, height: 792, absolutePosition: { x: 0, y: 0 } }] : []),
            {
              stack: [
                {
                  qr: process.env.URL_MEMO + memoData.folio_me,
                  fit: 80,
                  alignment: 'center',
                  eccLevel: 'M'
                },
                {
                  text: 'Escanear para verificar',
                  fontSize: 7,
                  alignment: 'center',
                  margin: [0, 4, 0, 0],
                  color: '#555555'
                }
              ],
              absolutePosition: { x: 450, y: 127 },
              width: 70,
              height: 70
            },
            ...(memoData.estado?.toLowerCase() == 'anulado' && b64Anulado
              ? [{ image: b64Anulado, width: 250, height: 250, absolutePosition: { x: 200, y: 200 } }]
              : [])
          ];
        },

        header: function () {
          return [
            ...(b64Membrete ? [{ image: b64Membrete, width: 400, margin: [120, 20, 0, 0] }] : [])
          ];
        },

        footer: function () {
          return [
            ...(b64Footer ? [{ image: b64Footer, width: 500, margin: [60, 0, 0, 20] }] : [])
          ];
        },

        content: [
          {
            columns: [
              { width: '*', text: memoData.folio_me || '', bold: true }
            ],
            margin: [0, 20, 0, 0]
          },
          {
            columns: [
              { width: 80, text: 'PARA:', bold: true },
              { width: '*', text: memoData.pa_quien || '' }
            ],
          },
          {
            columns: [
              { width: 80, text: 'DE:', bold: true },
              { width: '*', text: memoData.dep_emisor || '' }
            ],
          },
          {
            columns: [
              { width: 80, text: 'ASUNTO:', bold: true },
              { width: '*', text: memoData.asunto || '' }
            ],
          },
          {
            columns: [
              { width: 80, text: 'FECHA:', bold: true },
              { width: '*', text: memoData.fecha || '' }
            ],
            margin: [0, 0, 0, 20]
          },
          {
            text: `${memoData.descripcion || ''} ${memoData.direccion.trim() ? ' que se desarrollara en ' + memoData.nom_dir + ' ' + memoData.direccion : ''} `,
            margin: [0, 0, 0, 15],
            alignment: 'justify',
            lineHeight: 1.5
          },
          { text: 'Los equipos cuentan con las siguientes características:', margin: [20, 0, 0, 10] },

          // Listas dinámicas de equipos
          ...listasDinamicas,

          {
            table: {
              dontBreakRows: true,
              widths: ['*', 210, '*'],
              body: [[
                {
                  stack: [
                    ...(memoData.nom_vig_sal ? [
                      { text: 'Salida:', bold: true },
                      { text: fec_sal || '---', bold: false, fontSize: 10 },
                      memoData.firma_vig_sa ? { image: memoData.firma_vig_sa, width: 70 } : { text: '\n\n' },
                      { text: memoData.nom_vig_sal, bold: true },
                      { text: '' }
                    ] : []),
                    ...(Number(memoData.vigilancia) < 1 && memoData.nom_recp ? [
                      { text: 'Recibido por:', bold: true },
                      { text: fec_rec || '---', bold: false, fontSize: 10 },
                      memoData.firma_recp ? { image: memoData.firma_recp, width: 70 } : { text: '\n\n' },
                      { text: memoData.nom_recp, bold: true }
                    ] : [])
                  ],
                  alignment: 'left',
                  margin: [0, 0, 10, 0]
                },
                {
                  stack: [
                    { text: 'Atentamente', bold: true, alignment: 'center' },
                    memoData.firma ? { image: memoData.firma, width: 70, alignment: 'center' } : { text: '\n\n' },
                    { text: `${memoData.nombre} ${memoData.apellido}`, bold: true, alignment: 'center', margin: [0, 5, 0, 0] }, //[cite: 1]
                    { text: memoData.dep_emisor, alignment: 'center' }, //[cite: 1]
                  ],
                  alignment: 'center',
                  margin: [0, 0, 0, 0]
                },
                {
                  stack: [
                    ...(memoData.nom_vig_en ? [
                      { text: 'Entrada:', bold: true },
                      { text: fec_ent || '---', bold: false, fontSize: 10 },
                      memoData.firma_vig_en ? { image: memoData.firma_vig_en, width: 70, alignment: 'right' } : { text: '\n\n' },
                      { text: memoData.nom_vig_en, bold: true }
                    ] : [])
                  ],
                  alignment: 'right',
                  margin: [10, 0, 0, 0]
                }
              ]]
            },
            layout: 'noBorders',
            margin: [0, 20, 0, 0]
          },
        ]
      };

      // 4. Generación del Stream de PDFKit
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
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
  generarMemoBuffer
};