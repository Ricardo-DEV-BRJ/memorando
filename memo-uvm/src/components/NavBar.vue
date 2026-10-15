<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { toast } from '@/composables/useToast'
import { useSesion } from '@/composables/useSesion'

const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()
const { usuario, nombreCompleto, nombreCorto, iniciales, rol, refrescarSesion } = useSesion()
const permiso = computed(() => usuario.value?.permisos)
const drawer = ref(false)

const rutas = [
  { title: 'Inicio', path: '/', icon: 'mdi-home-outline', iconActive: 'mdi-home', permiso: 0 },
  { title: 'Crear Memo', path: '/memo', icon: 'mdi-file-document-edit-outline', iconActive: 'mdi-file-document-edit', permiso: 0 },
  { title: 'Memorandos', path: '/memorandos', icon: 'mdi-file-document-multiple-outline', iconActive: 'mdi-file-document-multiple', permiso: 0 },
  { title: 'Usuarios', path: '/usuarios', icon: 'mdi-account-group-outline', iconActive: 'mdi-account-group', permiso: 1 },
  { title: 'Departamentos', path: '/departamentos', icon: 'mdi-account-group-outline', iconActive: 'mdi-account-group', superAdmin: 'Super administrador' },
]

function isActive(path) {
  return route.path === path
}

onMounted(() => {
  // El token pudo cambiar desde la última vez (nuevo login), se vuelve a leer
  refrescarSesion()
})

function clearTokenCookie() {
  // 1. Borrado básico en la ruta raíz
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "permiso=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // 2. Borrado especificado para el dominio principal (si compartes cookies entre subdominios)
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.nextmemo.store;";
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=memo.nextmemo.store;";
}

function cerrarSesion() {
  // clearTokenCookie();
  apiCall('login/logout', {}, 'POST')
    .then((res) => {
      if (res.status === 200 || res.status === 201) {
        toast.info('Sesión cerrada con éxito')
        router.push('/login')
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error(err.response?.data?.message);
    });
  localStorage.clear();
  sessionStorage.clear();

  // 3. Redirigir al login y recargar la página para limpiar el estado de la app en memoria
  // router.push('/login').then(() => {
  //   window.location.reload();
  // });
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
          <v-btn v-if="item.superAdmin == 'Super administrador' && rol == 'Super administrador'" :to="item.path"
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

        <!-- Usuario logueado / Mi Perfil -->
        <v-btn to="/perfil" height="44" :title="`${nombreCompleto} · Mi Perfil`"
          :color="isActive('/perfil') ? 'primary' : undefined" :variant="isActive('/perfil') ? 'tonal' : 'text'"
          class="text-none rounded-lg px-1 px-md-2">
          <v-avatar color="primary" size="32">
            <span v-if="iniciales" class="text-caption font-weight-bold">{{ iniciales }}</span>
            <v-icon v-else icon="mdi-account" size="18" />
          </v-avatar>
          <div v-if="mdAndUp" class="d-flex flex-column align-start ml-2 usuario-texto">
            <span class="text-body-2 font-weight-medium text-truncate usuario-nombre">{{ nombreCorto }}</span>
            <span class="text-caption text-medium-emphasis">{{ rol }}</span>
          </div>
        </v-btn>

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

      <!-- Usuario logueado -->
      <v-list-item :title="nombreCompleto" :subtitle="rol" class="py-3">
        <template #prepend>
          <v-avatar color="primary" size="40">
            <span v-if="iniciales" class="text-body-2 font-weight-bold">{{ iniciales }}</span>
            <v-icon v-else icon="mdi-account" />
          </v-avatar>
        </template>
      </v-list-item>
      <v-divider />

      <v-list density="compact" nav class="pa-2">
        <v-list-item v-for="item in rutas" :key="item.path" :to="item.path"
          :prepend-icon="isActive(item.path) ? item.iconActive : item.icon" :title="item.title"
          :active="isActive(item.path)" color="primary" rounded="lg" @click="drawer = false" />
        <v-list-item to="/perfil" :prepend-icon="isActive('/perfil') ? 'mdi-account-circle' : 'mdi-account-circle-outline'"
          title="Mi Perfil" :active="isActive('/perfil')" color="primary" rounded="lg" @click="drawer = false" />
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

.usuario-texto {
  line-height: 1.15;
}

.usuario-nombre {
  max-width: 160px;
}
</style>
