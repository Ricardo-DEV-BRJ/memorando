/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/pages/index.vue'
import Inicio from '@/pages/Inicio.vue'
import Login from '@/pages/Login.vue'
import Usuarios from '@/pages/Usuarios.vue'
import Memo from '@/pages/Memo.vue'
import HistorialMemos from '@/pages/HistorialMemos.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: Login,
      meta: { title: 'Login', public: true }
    },
    {
      path: '/',
      component: Inicio,
      meta: { title: 'Inicio', requiresAuth: true }
    },
    {
      path: '/usuarios',
      component: Usuarios,
      meta: { title: 'Usuarios', requiresAuth: true }
    },
    {
      path: '/memo',
      component: Memo,
      meta: { title: 'Crear Memorando', requiresAuth: true }
    },
    {
      path: '/memorandos',
      component: HistorialMemos,
      meta: { title: 'Historial de Memorandos', requiresAuth: true }
    },
  ],
})

function getToken(): string | null {
  const cookie = document.cookie.split(';').find(row => row.trim().startsWith('token='))
  return cookie ? cookie.split('=')[1] : null
}

router.beforeEach((to) => {
  const token = getToken()

  // Tiene token e intenta ir al login → redirigir al inicio
  if (to.meta.public && token) {
    return '/'
  }

  // No tiene token e intenta ir a ruta protegida → redirigir al login
  if (to.meta.requiresAuth && !token) {
    return '/login'
  }
})

export default router
