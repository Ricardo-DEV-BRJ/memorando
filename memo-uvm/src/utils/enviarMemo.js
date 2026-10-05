import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { apiCall } from './api.js';
const vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts;
pdfMake.vfs = vfs;
// Rutas de tus assets de imagen
import { menbrete, lateral, final, anulado } from './imagenes.js'
let cantidadEquiposPorHoja = 6;
// Datos dinámicos recibidos de la BD o formulario en Vue
let memoData = {
  para: 'Centro Aldea Tecnológica / Sede Estovacuy', //[cite: 1]
  de: 'Centro Aldea Tecnológica / Sede Estovacuy', //[cite: 1]
  asunto: 'Salida – Entrada de equipos', //[cite: 1]
  fecha: '17/04/2026', //[cite: 1]
  motivo: 'Actos de Grado en la Sede Tempe', //[cite: 1]
  equipos: [
    'Inversor eléctrico recargable grande (Con cable)', //[cite: 1]
    'Antena Starlink (Color blanco con su cargador)', //[cite: 1]
    'Cable de red: (Puerto LAN, color azul)', //[cite: 1]
    'Cable POE: (Color amarillo)', //[cite: 1]
    'Adaptador de red (Color gris)', //[cite: 1]
    'Repartidor RUIJIE REYEE (Color blanco dos antenas)' //[cite: 1]
  ],
  firmante: 'José Reyes', //[cite: 1]
  ubicacion: 'Que se dearrollara en Estovacuy', //[cite: 1]
  urlMemo: 'hola',
  estado: '',
};

/* 
  La hoja mide 600 de ancho y 770 de largo
  Centro x:300 y:385
*/

// Convierte cualquier formato de imagen (WebP, JPEG, raw base64, etc.) a PNG Data URL compatible con pdfmake
const convertirADataUrlPngCorreo = (imagenSrc) => {
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

const generarPdfEnBase64 = (pdfMake, timeoutMs = 60000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Tiempo de espera agotado al generar el PDF.'));
    }, timeoutMs);

    try {
      pdfMake.getBase64((base64Data) => {
        clearTimeout(timeoutId);
        resolve(base64Data);
      });
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
};

export const generarMemoCorreo = async (datos, destinatario, asunto) => {
  memoData = datos;
  if (datos.equipos.length <= 6) {
    cantidadEquiposPorHoja = 5;
  } else if (datos.equipos.length > 6) {
    cantidadEquiposPorHoja = 7;
  } else if (datos.equipos.length >= 10) {
    cantidadEquiposPorHoja = 8;
  }
  await enviarCorreo(destinatario, asunto);
};

export const enviarCorreo = async (destinatario, asunto) => {
  const b64Lateral = lateral;
  const b64Membrete = menbrete;
  const b64Footer = final;
  const b64Anulado = await convertirADataUrlPngCorreo(anulado);

  const firmaPng = await convertirADataUrlPngCorreo(memoData.firma);

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

  // 2. Separar los primeros 5 elementos del resto
  const listasDinamicas = [];

  if (equiposFormateados.length > 0) {
    const primeros5 = equiposFormateados.slice(0, 8);
    const elResto = equiposFormateados.slice(8);

    // Insertar la lista de la primera página
    listasDinamicas.push({
      ul: primeros5,
      margin: [20, 0, 0, 20],
      // Forzar salto de página SOLO si hay más elementos guardados en "elResto"
      pageBreak: elResto.length > 0 ? 'after' : undefined
    });

    // Si hay más de 5 equipos, agregamos todos los restantes en una sola lista.
    // pdfmake hará los saltos automáticos en la página 2, 3, 4... según se llene el espacio.
    if (elResto.length > 0) {
      listasDinamicas.push({
        ul: elResto,
        margin: [20, 0, 0, 20]
      });
    }
  }

  const docDefinition = {
    pageSize: 'LETTER',
    pageMargins: [100, 130, 40, 70],
    defaultStyle: { fontSize: 12 },

    background: function (currentPage) {
      return [
        { image: b64Lateral, width: 100, height: 792, absolutePosition: { x: 0, y: 0 } },
        // ...(qrPng ? [{ image: qrPng, width: 70, height: 70, absolutePosition: { x: 500, y: 127 } }] : [])
        {
          stack: [
            {
              qr: memoData.urlMemo,
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
          width: 70, height: 70
        },
        (memoData.estado?.toLowerCase() === 'anulado' ? [{ image: b64Anulado, width: 250, height: 250, absolutePosition: { x: 200, y: 200 } }] : [])
      ]
    },
    header: function () {
      return [
        { image: b64Membrete, width: 400, margin: [120, 20, 0, 0] },
      ];
    },
    footer: function () {
      return { image: b64Footer, width: 500, margin: [60, 0, 0, 20] };
    },

    content: [
      {
        columns: [
          { width: '*', text: memoData.folio_me, bold: true }, //[cite: 1]
        ],
      },
      {
        columns: [
          { width: 80, text: 'PARA:', bold: true },
          { width: '*', text: memoData.para } //
        ],
      },
      {
        columns: [
          { width: 80, text: 'DE:', bold: true },
          { width: '*', text: memoData.de } //[cite: 1]
        ],
      },
      {
        columns: [
          { width: 80, text: 'ASUNTO:', bold: true },
          { width: '*', text: memoData.asunto } //[cite: 1]
        ],
      },
      {
        columns: [
          { width: 80, text: 'FECHA:', bold: true },
          { width: '*', text: memoData.fecha } //[cite: 1]
        ],
        margin: [0, 0, 0, 20]
      },
      {
        text: `${memoData.descripcion || ''} ${memoData.ubicacion || ''} `, //[cite: 1]
        margin: [0, 0, 0, 15],
        alignment: 'justify',
        lineHeight: 1.5
      },
      { text: 'Los equipos cuentan con las siguientes características:', margin: [20, 0, 0, 10] },

      // 3. Insertar las listas procesadas
      ...listasDinamicas,

      { text: 'Recibido por:', margin: [0, 10, 0, 40] }, //[cite: 1]
      { text: 'Atentamente,', alignment: 'center' }, //[cite: 1]
      { text: memoData.firmante, bold: true, alignment: 'center', margin: [0, 5, 0, 0] }, //[cite: 1]
      ...(firmaPng
        ? [{ image: firmaPng, width: 100, alignment: 'center', margin: [0, 5, 0, 0] }]
        : []
      ),
      { text: memoData.de, alignment: 'center' }, //[cite: 1]
    ]
  };
  try {
    console.log('Generando PDF del memo para correo...');
    // const pdfDoc = pdfMake.createPdf(docDefinition);
    // const base64Data = await generarPdfEnBase64(pdfDoc);
    console.log('PDF generado correctamente, enviando correo...');

    const response = await apiCall('correos/enviar',
      {
        qrTexto: memoData.urlMemo,
        to: destinatario,
        subject: asunto,
        message: 'Hola, aquí tienes el PDF adjunto.',
        content: docDefinition,
        fileName: `Memo_${memoData.folio_me || 'sin_folio'}.pdf`
      },
      'POST'
    );

    console.log('Respuesta del servidor:', response.data);
  } catch (error) {
    console.error('Error al generar o enviar el PDF:', error);
  }
};
