<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { toast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()
const permiso = ref(null)
const drawer = ref(false)

const rutas = [
  { title: 'Inicio', path: '/', icon: 'mdi-home-outline', iconActive: 'mdi-home', permiso: 0 },
  { title: 'Crear Memo', path: '/memo', icon: 'mdi-file-document-edit-outline', iconActive: 'mdi-file-document-edit', permiso: 0 },
  { title: 'Memorandos', path: '/memorandos', icon: 'mdi-file-document-multiple-outline', iconActive: 'mdi-file-document-multiple', permiso: 0 },
  { title: 'Usuarios', path: '/usuarios', icon: 'mdi-account-group-outline', iconActive: 'mdi-account-group', permiso: 1 },
]

function isActive(path) {
  return route.path === path
}

onMounted(() => {
  if (document.cookie) {
    permiso.value = document.cookie.split(';')[1].split('=')[1] || null
  }
})

export function clearTokenCookie() {
  // 1. Borrado básico en la ruta raíz
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "permiso=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // 2. Borrado especificado para el dominio principal (si compartes cookies entre subdominios)
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.nextmemo.store;";
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=memo.nextmemo.store;";
}

function cerrarSesion() {
  clearTokenCookie();
  toast.info('Sesión cerrada con éxito')
  localStorage.clear();
  sessionStorage.clear();

  // 3. Redirigir al login y recargar la página para limpiar el estado de la app en memoria
  router.push('/login').then(() => {
    window.location.reload();
  });
}
</script>

<template>
  <div>
    <!-- Barra superior -->
    <v-app-bar flat border="b" elevation="1" class="px-2 px-md-4">
      <!-- Botón menú móvil -->
      <v-app-bar-nav-icon v-if="!mdAndUp" @click="drawer = !drawer" />

      <!-- Logo / Marca -->
      <v-avatar color="primary" variant="tonal" size="38" class="mr-3 cursor-pointer" @click="router.push('/')">
        <v-icon icon="mdi-file-document-multiple" size="22" color="primary"></v-icon>
      </v-avatar>
      <div class="d-flex align-center cursor-pointer mr-6" @click="router.push('/')">
        <span class="text-h6 font-weight-bold" style="letter-spacing: -0.5px;">Memo UVM</span>
        <v-chip size="x-small" color="primary" variant="flat" class="ml-2 font-weight-bold" rounded="sm">
          SISTEMA
        </v-chip>
      </div>

      <!-- Navegación para pantallas medianas y grandes -->
      <div v-if="mdAndUp" class="d-flex align-center ga-1">
        <template v-for="item in rutas" :key="item.path">
          <v-btn v-if="item.permiso == 0" :to="item.path"
            :prepend-icon="isActive(item.path) ? item.iconActive : item.icon"
            :color="isActive(item.path) ? 'primary' : undefined" :variant="isActive(item.path) ? 'tonal' : 'text'"
            class="text-none font-weight-medium rounded-lg px-4">
            {{ item.title }}
          </v-btn>
          <v-btn v-if="item.permiso == 1 && permiso == 1" :to="item.path"
            :prepend-icon="isActive(item.path) ? item.iconActive : item.icon"
            :color="isActive(item.path) ? 'primary' : undefined" :variant="isActive(item.path) ? 'tonal' : 'text'"
            class="text-none font-weight-medium rounded-lg px-4">
            {{ item.title }}
          </v-btn>
        </template>
      </div>

      <v-spacer />

      <!-- Acciones a la derecha -->
      <div class="d-flex align-center ga-2" v-if="$vuetify.display.smAndUp">
        <!-- Botón Cambiar Tema -->
        <BotonTema />

        <!-- Cerrar Sesión -->
        <v-btn icon="mdi-logout" variant="tonal" size="small" color="error" title="Cerrar Sesión"
          @click="cerrarSesion" />
      </div>
    </v-app-bar>

    <!-- Drawer lateral para móvil -->
    <v-navigation-drawer v-model="drawer" temporary location="left">
      <v-list-item prepend-icon="mdi-file-document-multiple" title="Memo UVM" subtitle="Control de Memorandos"
        class="py-3" />
      <v-divider />

      <v-list density="compact" nav class="pa-2">
        <v-list-item v-for="item in rutas" :key="item.path" :to="item.path"
          :prepend-icon="isActive(item.path) ? item.iconActive : item.icon" :title="item.title"
          :active="isActive(item.path)" color="primary" rounded="lg" @click="drawer = false" />
        <v-list-item v-if="$vuetify.display.smAndDown">
          <div class="d-flex align-center ga-2">
            <BotonTema />
            <span>Cambiar tema</span>
          </div>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-3">
          <v-btn block color="error" variant="tonal" prepend-icon="mdi-logout" class="text-none rounded-lg"
            @click="cerrarSesion">
            Cerrar Sesión
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
