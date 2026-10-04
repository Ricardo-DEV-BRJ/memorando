function formatFecha(fecha) {
  if (!fecha) return '-'
  const str = String(fecha).substring(0, 10)
  const partes = str.split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return str
}

function coloresEstados(item) {
  switch (item) {
    case 'recibido':
      return 'success'
    case 'anulado':
      return 'error'
    default:
      return 'secondary'
  }
}

export {
  formatFecha,
  coloresEstados
}