// Decodifica (sin verificar firma) un JWT generado con jsonwebtoken en el backend.
// La verificación de la firma debe hacerse SIEMPRE en el backend: aquí solo se leen los datos.

export function getToken() {
  const cookie = document.cookie
    .split(';')
    .find(row => row.trim().startsWith('token='))
  return cookie ? cookie.trim().slice('token='.length) : null
}

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  // Soporta caracteres UTF-8 (tildes, ñ, etc.)
  const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function decodeToken(token = getToken()) {
  if (!token) return null
  try {
    const [, payload] = token.split('.')
    return JSON.parse(base64UrlDecode(payload))
  } catch {
    return null
  }
}

export function isTokenExpired(token = getToken()) {
  const payload = decodeToken(token)
  if (!payload) return true
  if (!payload.exp) return false
  return payload.exp * 1000 < Date.now()
}

function atributosCookie() {
  const seguro = window.location.protocol === 'https:' ? '; Secure' : ''
  return `; path=/; SameSite=Lax${seguro}`
}

// Guarda el token en la cookie con la misma vigencia del JWT:
// cuando el token expira el navegador elimina la cookie por sí solo.
export function guardarToken(token) {
  if (!token) return
  const exp = decodeToken(token)?.exp
  const segundos = exp ? Math.floor(exp - Date.now() / 1000) : 0
  const vigencia = segundos > 0 ? `; max-age=${segundos}` : ''
  document.cookie = `token=${token}${vigencia}${atributosCookie()}`
}

export function borrarToken() {
  document.cookie = `token=; max-age=0${atributosCookie()}`
  // Cookies antiguas guardadas sin atributos
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
}

// Devuelve el token solo si se puede leer y no ha expirado.
// Si la cookie quedó con un token vencido o dañado se elimina, así no se hacen peticiones que el backend va a rechazar.
export function tokenVigente() {
  const token = getToken()
  if (!token) return null
  if (isTokenExpired(token)) {
    borrarToken()
    return null
  }
  return token
}
