function formatFecha(fecha) {
  if (!fecha) return '-'
  const str = String(fecha).substring(0, 10)
  const partes = str.split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return str
}

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

function coloresEstados(item) {
  const estado = item ? item.toLowerCase().trim() : ''
  switch (estado) {
    case 'salio':
      return '#FFB300'
    case 'en el sitio':
      return '#1E88E5'
    case 'retorno':
      return 'warning'
    case 'completado':
      return 'success'
    case 'recibido':
      return 'success'
    case 'anulado':
      return 'error'
    default:
      return '#B0BEC5'
  }
}

export {
  formatFecha,
  formatFechaHora,
  coloresEstados
}