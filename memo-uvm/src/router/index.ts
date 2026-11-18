/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
// El login se carga junto con la app porque es la primera vista sin sesión.
// El resto de vistas se cargan bajo demanda para que la carga inicial sea liviana
// (pdfmake, xlsx y las imágenes de los memorandos solo se descargan en las vistas que los usan).
import Login from '@/pages/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: Login,
      meta: { title: 'Login', public: true }
    },
    {
      path: '/verificacion/:folio',
      component: () => import('@/pages/VerificacionMemos.vue'),
      meta: { title: 'Verificación de Memorando', requiresAuth: false}
    },
    {
      path: '/cambiar-clave',
      component: () => import('@/pages/CambioClave.vue'),
      meta: { title: 'Cambiar Contraseña', requiresAuth: true }
    },
    {
      path: '/',
      component: () => import('@/pages/Inicio.vue'),
      meta: { title: 'Inicio', requiresAuth: true }
    },
    {
      path: '/usuarios',
      component: () => import('@/pages/Usuarios.vue'),
      meta: { title: 'Usuarios', requiresAuth: true, adminUser: true }
    },
    {
      path: '/departamentos',
      component: () => import('@/pages/Departamentos.vue'),
      meta: { title: 'Departamentos', requiresAuth: true, superAdmin: true }
    },
    {
      path: '/memo',
      component: () => import('@/pages/Memo.vue'),
      meta: { title: 'Crear Memorando', requiresAuth: true }
    },
    {
      path: '/memorandos',
      component: () => import('@/pages/HistorialMemos.vue'),
      meta: { title: 'Historial de Memorandos', requiresAuth: true }
    },
    {
      path: '/perfil',
      component: () => import('@/pages/Perfil.vue'),
      meta: { title: 'Mi Perfil', requiresAuth: true }
    },
  ],
})

router.beforeEach((to) => {
  // Un token vencido o dañado se elimina aquí mismo, sin consultar al backend,
  // así se va directo al login en lugar de cargar vistas cuyas peticiones van a fallar.
  const token = tokenVigente()
  const payload = token ? decodeToken(token) : null
  const permiso = payload?.permisos
  const superAdmin = payload?.super_admin
  const cambioClave = !!payload?.change_pass
  // Tiene token e intenta ir al login → redirigir al inicio
  if (to.meta.public && token) {
    return '/'
  }
  // No tiene token e intenta ir a ruta protegida → redirigir al login
  if (to.meta.requiresAuth && !token) {
    return '/login'
  }
  // Tiene el cambio de contraseña pendiente → solo puede estar en la vista de cambio de clave
  if (to.meta.requiresAuth && cambioClave && to.path !== '/cambiar-clave') {
    return '/cambiar-clave'
  }
  // No tiene el cambio pendiente e intenta ir a la vista de cambio de clave → redirigir al inicio
  if (to.path === '/cambiar-clave' && !cambioClave) {
    return '/'
  }
  // Si tiene permiso 0 y quiere ir a usuarios → redirigir al inicio
  if (to.meta.adminUser && permiso != 1) {
    return '/'
  }
  // Solo super admin puede acceder
  if (to.meta.superAdmin && superAdmin != 1) {
    return '/'
  }
})

// Si se publica una nueva versión mientras el usuario tiene la página abierta, los archivos
// de las vistas anteriores ya no existen: se recarga para obtener la versión nueva.
router.onError((error, to) => {
  const mensaje = String(error?.message || '')
  if (!/dynamically imported module|Importing a module script failed/i.test(mensaje)) return
  // Solo se recarga una vez por ruta para no entrar en un ciclo si el servidor no responde
  const clave = `recarga:${to.fullPath}`
  try {
    if (sessionStorage.getItem(clave)) return
    sessionStorage.setItem(clave, '1')
  } catch {
    // Sin acceso a sessionStorage: se intenta la recarga igualmente
  }
  window.location.assign(to.fullPath)
})

export default router
