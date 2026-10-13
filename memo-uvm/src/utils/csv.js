import * as XLSX from 'xlsx'
import { capitalize } from 'vue'

export const obtenerDatos = async (event) => {
  let file = event?.target?.files?.[0]

  if (!file) return Promise.resolve(null)

  const esCsv = file.type === 'text/csv' || file.name?.toLowerCase().endsWith('.csv')

  if (esCsv) {
    return await csv(file)
  } else {
    return await excel(file)
  }
}

function excel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        // 1. Leer el archivo como un arreglo de bytes binarios
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        // 2. Tomar la primera pestaña (hoja) del archivo Excel
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // 3. Convertir la hoja de Excel a un arreglo de objetos JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        const jsonHeader = []
        if (jsonData.length > 0) {
          Object.keys(jsonData[0]).forEach((e) => {
            jsonHeader.push({
              key: e,
              title: capitalize(e)
            })
          })
        }
        resolve({
          data: jsonData,
          headers: jsonHeader
        })
      } catch (error) {
        console.error("Error al leer el archivo Excel:", error)
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsArrayBuffer(file)
  })
}

function csv(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (evento) {
      try {
        const contenidoTexto = evento.target.result
        const resultado = parsearCSVNativo(contenidoTexto)
        resolve(resultado)
      } catch (error) {
        console.error("Error al leer el archivo CSV:", error)
        reject(error)
      }
    }
    reader.onerror = (error) => reject(error)
    reader.readAsText(file)
  })
}

function parsearCSVNativo(texto) {
  const lineas = texto.split(/\r\n|\n/)
  if (lineas.length === 0) return { data: [], headers: [] }
  const primeraLinea = lineas[0].trim()
  if (!primeraLinea) return { data: [], headers: [] }

  const separador = primeraLinea.includes(';') ? ';' : ','
  const encabezados = primeraLinea.split(separador).map(h => h.trim().replace(/^["']|["']$/g, ''))

  const jsonHeader = encabezados.map((e) => ({
    key: e,
    title: capitalize(e)
  }))

  const resultados = []
  for (let i = 1; i < lineas.length; i++) {
    const lineaActual = lineas[i].trim()
    if (!lineaActual) continue // Ignorar líneas vacías

    const valores = lineaActual.split(separador).map(v => v.trim().replace(/^["']|["']$/g, ''))
    let objetoFila = {}

    encabezados.forEach((encabezado, index) => {
      objetoFila[encabezado] = valores[index] !== undefined ? valores[index] : ''
    })

    resultados.push(objetoFila)
  }

  const datosAjustados = resultados.map(fila => {
    const getVal = (prop) => {
      const key = Object.keys(fila).find(k => k.trim().toLowerCase() === prop.toLowerCase())
      return key ? fila[key] : (fila[prop] ?? '')
    }
    return {
      nombre: getVal('nombre'),
      serial: getVal('serial'),
      descripcion: getVal('descripcion'),
      estado: getVal('estado'),
      ...fila
    }
  })

  return {
    data: datosAjustados,
    headers: jsonHeader
  }
}