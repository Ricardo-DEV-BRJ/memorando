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
