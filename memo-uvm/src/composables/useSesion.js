import { ref, computed } from 'vue'
import { decodeToken } from '@/utils/decode.js'

// Datos del usuario logueado (leídos del token), compartidos entre componentes
const usuario = ref(decodeToken())

const roles = {
  0: 'Becado',
  1: 'Administrador',
  2: 'Responsable',
}

const nombreCompleto = computed(() => {
  if (!usuario.value) return ''
  return `${usuario.value.nombre || ''} ${usuario.value.apellido || ''}`.trim()
})

// Primer nombre y primer apellido, para espacios reducidos como la barra superior
const nombreCorto = computed(() => {
  if (!usuario.value) return ''
  const nombre = usuario.value.nombre?.trim().split(/\s+/)[0] || ''
  const apellido = usuario.value.apellido?.trim().split(/\s+/)[0] || ''
  return `${nombre} ${apellido}`.trim()
})

const iniciales = computed(() => {
  if (!usuario.value) return ''
  const n = usuario.value.nombre?.trim()?.[0] || ''
  const a = usuario.value.apellido?.trim()?.[0] || ''
  return (n + a).toUpperCase()
})

const rol = computed(() => {
  if (!usuario.value) return ''
  if (usuario.value.super_admin == 1) return 'Super administrador'
  return roles[usuario.value.permisos] || ''
})

// Se debe llamar cada vez que cambie el token (login, cambio de perfil, etc.)
function refrescarSesion() {
  usuario.value = decodeToken()
}

export function useSesion() {
  return { usuario, nombreCompleto, nombreCorto, iniciales, rol, refrescarSesion }
}
