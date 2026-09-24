const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']

/**
 * Convierte un archivo de imagen en un string Base64 optimizado (redimensionado y comprimido)
 * ideal para guardar en bases de datos.
 * 
 * @param {File | File[]} fileInput - Archivo de imagen o array de archivos (v-file-input)
 * @param {number} maxWidth - Ancho máximo de la imagen (por defecto 800px)
 * @param {number} quality - Calidad de compresión entre 0.1 y 1.0 (por defecto 0.75)
 * @param {string} format - Formato de salida 'image/webp' o 'image/jpeg' (por defecto 'image/webp')
 * @returns {Promise<string>} Promesa que resuelve con la cadena Base64 Data URL
 */
export const imagenABase64Optimizado = (fileInput, maxWidth = 800, quality = 0.75, format = 'image/webp') => {
  return new Promise((resolve, reject) => {
    // Si viene de v-file-input, puede ser un array o un archivo único
    const file = Array.isArray(fileInput) ? fileInput[0] : fileInput

    if (!file || !(file instanceof File)) {
      return reject(new Error('No se ha proporcionado un archivo válido.'))
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result

      img.onload = () => {
        // Definir dimensiones destino con proporción 16:9
        const targetWidth = maxWidth
        const targetHeight = Math.round((maxWidth * 9) / 16)

        // Calcular recorte central para mantener proporción 16:9 sin distorsión (Cover)
        const imgAspect = img.width / img.height
        const targetAspect = 16 / 9

        let sWidth, sHeight, sx, sy

        if (imgAspect > targetAspect) {
          // La imagen es más ancha que 16:9
          sHeight = img.height
          sWidth = Math.round(img.height * targetAspect)
          sx = Math.round((img.width - sWidth) / 2)
          sy = 0
        } else {
          // La imagen es más alta que 16:9
          sWidth = img.width
          sHeight = Math.round(img.width / targetAspect)
          sx = 0
          sy = Math.round((img.height - sHeight) / 2)
        }

        const canvas = document.createElement('canvas')
        canvas.width = targetWidth
        canvas.height = targetHeight

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight)

        // Obtener la cadena Base64 comprimida en 16:9
        const base64Data = canvas.toDataURL(format, quality)
        resolve(base64Data)
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}

// Mantener retrocompatibilidad con las funciones anteriores
export const compressAndResizeImage = async (file) => {
  const MAX_WIDTH = 1024
  const IMAGE_QUALITY = 0.75
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result

      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width)
          width = MAX_WIDTH
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
        }, 'image/jpeg', IMAGE_QUALITY)
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}

export const comprimirImagen = compressAndResizeImage
