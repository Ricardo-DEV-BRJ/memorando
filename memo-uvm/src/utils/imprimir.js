import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfMake.vfs;

// Rutas de tus assets de imagen
import { menbrete, lateral, final } from './imagenes.js'
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
  ubicacion: 'Que se dearrollara en Estovacuy' //[cite: 1]
};

// Convierte cualquier formato de imagen (WebP, JPEG, raw base64, etc.) a PNG Data URL compatible con pdfmake
const convertirADataUrlPng = (imagenSrc) => {
  return new Promise((resolve) => {
    if (!imagenSrc || typeof imagenSrc !== 'string' || !imagenSrc.trim()) {
      return resolve(null);
    }

    let src = imagenSrc.trim();

    // Si viene la cadena base64 cruda sin prefijo data:image
    if (!src.startsWith('data:image/')) {
      src = `data:image/png;base64,${src}`;
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
      // Si falló como PNG y era base64 puro, intentar como JPEG
      if (!imagenSrc.trim().startsWith('data:image/')) {
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
            resolve(null);
          }
        };
        fallbackImg.onerror = () => resolve(null);
        fallbackImg.src = `data:image/jpeg;base64,${imagenSrc.trim()}`;
      } else {
        resolve(null);
      }
    };
    img.src = src;
  });
};

export const generarMemo = async (datos) => {
  memoData = datos;
  if (datos.equipos.length <= 6) {
    cantidadEquiposPorHoja = 5;
  } else if (datos.equipos.length > 6) {
    cantidadEquiposPorHoja = 7;
  } else if(datos.equipos.length >= 10){
    cantidadEquiposPorHoja = 8;
  }
  await generarMemorando();
};

export const generarMemorando = async () => {
  const b64Lateral = lateral;
  const b64Membrete = menbrete;
  const b64Footer = final;

  const firmaPng = await convertirADataUrlPng(memoData.firma);

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
        { image: b64Lateral, width: 100, height: 792, absolutePosition: { x: 0, y: 0 } }
      ];
    },
    header: function () {
      return { image: b64Membrete, width: 400, margin: [120, 20, 0, 0] };
    },
    footer: function () {
      return { image: b64Footer, width: 500, margin: [60, 0, 0, 20] };
    },

    content: [
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

  pdfMake.createPdf(docDefinition).open();
};
