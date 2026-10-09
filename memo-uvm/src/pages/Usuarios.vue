<script setup>
import PermisosForm from '@/components/Forms/PermisosForm.vue';

// ── Estado ──────────────────────────────────────────────
const usuarios = ref([])
const departamentos = ref([])
const cargando = ref(false)
const tokenUser = ref('')
// Tabla
const responsablesFormRef = ref(null);
const confirmDialogRef = ref(null);
const busqueda = ref('')
const headers = [
  { key: 'nombre', title: 'Nombre', subtitle: 'Departamento', sortable: true },
  { key: 'cedula', title: 'Cédula', subtitle: 'Correo', sortable: false },
  // { key: 'email_resp', title: 'Correo', sortable: true },
  { key: 'last_login', title: 'Último acceso', sortable: true },
  { key: 'permisos', title: 'Permisos', sortable: false },
  { key: 'acciones', title: 'Opciones', sortable: false },
]
const opciones = [
  { title: 'Editar', icon: 'mdi-pencil', action: 'abrirFormulario' },
  { title: 'Eliminar', icon: 'mdi-delete', action: 'abrirEliminarRespo' },
  { title: 'Activar', icon: 'mdi-check-circle', action: 'abrirActivarUsuario' },
  { title: 'Acceso', icon: 'mdi-account', action: 'abrirAccesoLogin' }
]

const diagActivarUser = ref(false)
const userSeleccionado = ref(null)
const cargandoActivar = ref(false)

const diagAccesoLogin = ref(false)
const userAcceso = ref(null)
const claveAcceso = ref('')
const mostrarPassword = ref(false)
const cargandoAcceso = ref(false)
const validadoAcceso = ref(null)
const permisosFormRef = ref(null)

function cargaInicial() {
  apiCall('login/')
    .then((res) => {
      usuarios.value = res.data.users
      departamentos.value = res.data.depa
    })
    .catch((err) => {
      toast.error(err.response.data.error)
    })
}

function abrirFormulario() {
  responsablesFormRef.value.abrir();
}

function abrirEliminarRespo(item) {
  confirmDialogRef.value.abrir(item, {
    titulo: 'Eliminar Responsable',
    mensaje: `¿Estás seguro de que deseas eliminar a ${item.nombre} ${item.apellido}?`,
    textoBoton: 'Eliminar',
  })
}

function eliminarResponsable(item) {
  confirmDialogRef.value.setCargando(true)
  apiCall(`responsables/${item.id}`, {}, 'DELETE')
    .then((res) => {
      if (res.status === 200 || res.status === 204) {
        toast.success(res.data.message);
      } else {
        toast.error('Ocurrió un error al eliminar');
      }
    })
    .catch((err) => {
      toast.error('Error al conectar con el servidor');
    });
  apiCall(`login/${item.id}`, {}, 'DELETE')
    .then((res) => {
      if (res.status === 200) {
        toast.success(res.data.message || 'Usuario eliminado con éxito');
        cargaInicial();
        confirmDialogRef.value.cerrar();
      } else {
        toast.error('Ocurrió un error al eliminar');
        confirmDialogRef.value.setCargando(false);
      }
    })
    .catch((err) => {
      toast.error('Error al conectar con el servidor');
      confirmDialogRef.value.setCargando(false);
    });
}

function formatFecha(fecha) {
  if (!fecha) return 'Nunca'
  return new Date(fecha).toLocaleString('es-VE', {
    dateStyle: 'short', timeStyle: 'short'
  })
}

function abrirActivarUsuario(item) {
  userSeleccionado.value = item;
  diagActivarUser.value = true;
}

function activarUsuario() {
  if (!userSeleccionado.value) return;
  cargandoActivar.value = true;
  apiCall(`responsables/${userSeleccionado.value.id}/activar`, {}, 'PUT')
    .then((res) => {
      if (res.status === 200) {
        toast.success(res.data.message || 'Responsable activado con éxito');
        cargaInicial();
        diagActivarUser.value = false;
      } else {
        toast.error('Ocurrió un error al activar el usuario');
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error('Error al conectar con el servidor');
    })
    .finally(() => {
      cargandoActivar.value = false;
    });
}

function abrirAccesoLogin(item) {
  userAcceso.value = item;
  claveAcceso.value = '';
  mostrarPassword.value = false;
  diagAccesoLogin.value = true;
}

function guardarAccesoLogin() {
  if (!userAcceso.value || !claveAcceso.value) return;
  cargandoAcceso.value = true;
  apiCall('login/acceso', {
    id_responsable: userAcceso.value.id,
    cedula: userAcceso.value.cedula,
    clave: claveAcceso.value
  }, 'POST')
    .then((res) => {
      if (res.status === 200 || res.status === 201) {
        toast.success(res.data.message || 'Acceso al login concedido con éxito');
        diagAccesoLogin.value = false;
      } else {
        toast.error(res.data.message);
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Error al conectar con el servidor');
    })
    .finally(() => {
      cargandoAcceso.value = false;
      cargaInicial()
    });
}

function roles(id) {
  switch (id) {
    case 1:
      return 'Admin'
    case 2:
      return 'Usuario'
    case 0:
      return 'Becado'
    default:
      break;
  }
}

function coloresRoles(id) {
  switch (id) {
    case 1:
      return 'warning'
    case 2:
      return 'primary'
    case 0:
      return 'error'
    default:
      break;
  }
}

onMounted(() => {
  cargaInicial()
  tokenUser.value = decodeToken()
})
</script>

<template>
  <v-container>
  {{ tokenUser }}
    <v-row align="center" class="mb-4">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Gestión de Usuarios</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Administra los accesos al sistema
        </p>
      </v-col>
      <v-col cols="12" sm="6" md="auto">
        <v-btn color="primary" @click="abrirFormulario">Agregar Responsable</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" variant="flat" prepend-icon="mdi-refresh" :loading="cargando" @click="cargaInicial">
          Actualizar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabla de usuarios -->
    <v-card rounded="lg" elevation="1">
      <v-card-text>
        <!-- Barra de búsqueda -->
        <v-text-field v-model="busqueda" prepend-inner-icon="mdi-magnify" label="Buscar usuario..." variant="outlined"
          density="compact" hide-details clearable rounded="lg" class="mb-4" style="max-width: 380px;" />

        <v-data-table :headers="headers" :items="usuarios" :search="busqueda" :loading="cargando"
          :mobile="$vuetify.display.smAndDown" no-data-text="No hay usuarios registrados"
          loading-text="Cargando usuarios..." items-per-page-text="Usuarios por página">

          <!-- Headers -->
          <template #header.nombre="{ column }">
            <span class="text-subtitle-2 font-weight-bold">{{ column.title }}</span>
            <small class="text-body-2 text-medium-emphasis d-block">{{ column.subtitle }}</small>
          </template>

          <template #header.cedula="{ column }">
            <span class="text-subtitle-2 font-weight-bold">{{ column.title }}</span>
            <small class="text-body-2 text-medium-emphasis d-block">{{ column.subtitle }}</small>
          </template>

          <!-- Nombre completo -->
          <template v-slot:item.nombre="{ item }">
            <div class="d-flex align-center ga-3 py-1">
              <v-avatar color="primary" variant="tonal" size="26">
                <small class="font-weight-bold">
                  {{ item.nombre?.charAt(0) }}{{ item.apellido?.charAt(0) }}
                </small>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.nombre }} {{ item.apellido }}</div>
              </div>
            </div>
            <div class="d-flex align-center ga-1 mt-1">
              <v-icon color="primary" class="mr-1">
                mdi-map-marker-account-outline
              </v-icon>
              <small class="text-body-2 text-medium-emphasis">{{ item.departamento || 'Sin departamento' }}</small>
            </div>
          </template>
          <!-- Cédula y correo -->
          <template v-slot:item.cedula="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-medium">{{ item.cedula || 'Sin cédula' }}</span>
              <small class="text-body-2 text-medium-emphasis">{{ item.email_resp || 'Sin correo' }}</small>
            </div>
          </template>

          <!-- Último acceso -->
          <template v-slot:item.last_login="{ item }">
            <span class="text-body-2">{{ formatFecha(item.last_login) }}</span>
          </template>

          <!-- email -->
          <template v-slot:item.email_resp="{ item }">
            <span class="text-body-2">{{ item.email_resp || 'Sin correo' }}</span>
          </template>

          <!-- Permisos -->
          <template v-slot:item.permisos="{ item }">
            <div class="d-flex flex-wrap ga-2 my-2">
              <v-chip :color="coloresRoles(item.permisos)" variant="tonal" size="small"
                :prepend-icon="item.permisos === 1 ? 'mdi-shield-crown' : 'mdi-account'" v-if="item.tiene_acceso == 1">
                {{ roles(item.permisos) }}
              </v-chip>
              <v-chip color="error" variant="tonal" size="small" prepend-icon="mdi-account-cancel" v-else>
                Sin acceso
              </v-chip>
              <v-chip :color="item.eliminado === 1 ? 'success' : 'error'" variant="tonal" size="small"
                :prepend-icon="item.eliminado === 1 ? 'mdi-shield-crown' : 'mdi-account'">
                {{ item.eliminado === 0 ? 'Eliminado' : 'Activo' }}
              </v-chip>
            </div>
          </template>

          <!-- Acciones -->
          <template v-slot:item.acciones="{ item }">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn color="warning" v-bind="props" size="small" icon="mdi-dots-vertical" variant="tonal"></v-btn>
              </template>
              <v-list>
                <v-list-item>
                  <v-btn icon="mdi-pencil" variant="tonal" size="small" color="primary" title="Editar responsable"
                    @click="responsablesFormRef.abrir(item)">
                  </v-btn>
                </v-list-item>
                <v-list-item>
                  <v-btn icon="mdi-delete" variant="tonal" size="small" color="error" title="Eliminar acceso"
                    @click="abrirEliminarRespo(item)">
                  </v-btn>
                </v-list-item>
                <v-list-item v-if="item.eliminado == 0">
                  <v-btn icon="mdi-check-circle" variant="tonal" size="small" color="success"
                    title="Activar responsable" @click="abrirActivarUsuario(item)">
                  </v-btn>
                </v-list-item>
                <v-list-item>
                  <v-btn icon="mdi-key-plus" variant="tonal" size="small" color="warning" title="Dar acceso"
                    @click="abrirAccesoLogin(item)">
                  </v-btn>
                </v-list-item>
                <v-list-item>
                  <v-btn icon="mdi-account-convert" variant="tonal" size="small" color="secondary"
                    title="Cambiar permisos" @click="permisosFormRef.abrir({ id: item.id })">
                  </v-btn>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
  <permisos-form ref="permisosFormRef" @guardado="cargaInicial" />
  <responsables-form ref="responsablesFormRef" @guardado="cargaInicial" :departamentos="departamentos" />
  <confirm-dialog ref="confirmDialogRef" @confirmar="eliminarResponsable" />
  <!-- Modal Activar Responsable -->
  <v-dialog v-model="diagActivarUser" max-width="400px">
    <v-card class="pa-2 rounded-lg">
      <v-card-title class="d-flex align-center font-weight-bold text-h6">
        <v-avatar color="success" variant="tonal" size="40" class="mr-3">
          <v-icon icon="mdi-account-check" size="24"></v-icon>
        </v-avatar>
        Activar Responsable
      </v-card-title>
      <v-card-text class="pt-3 text-body-1 text-medium-emphasis" v-if="userSeleccionado">
        ¿Estás seguro de que deseas reactivar al responsable <strong>{{ userSeleccionado.nombre }} {{
          userSeleccionado.apellido }}</strong>?
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="tonal" color="grey-darken-1" @click="diagActivarUser = false">Cancelar</v-btn>
        <v-btn color="success" variant="flat" :loading="cargandoActivar" @click="activarUsuario">Activar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal Dar Acceso al Login -->
  <v-dialog v-model="diagAccesoLogin" max-width="450px">
    <v-card class="pa-2 rounded-lg">
      <v-card-title class="d-flex align-center font-weight-bold text-h6">
        <v-avatar color="warning" variant="tonal" size="40" class="mr-3">
          <v-icon icon="mdi-key-plus" size="24"></v-icon>
        </v-avatar>
        Acceso al Sistema
      </v-card-title>
      <v-card-subtitle v-if="userAcceso" class="mt-1">
        Asignar credenciales de inicio de sesión para <strong>{{ userAcceso.nombre }} {{ userAcceso.apellido
        }}</strong>
      </v-card-subtitle>
      <v-card-text class="pt-4">
        <v-form v-model="validadoAcceso" lazy-validation @submit.prevent="guardarAccesoLogin">
          <v-row>
            <v-col cols="12" class="py-0">
              <v-text-field label="Usuario (Cédula)" :model-value="userAcceso ? userAcceso.cedula : ''"
                prepend-inner-icon="mdi-account-lock" density="compact" disabled readonly></v-text-field>
            </v-col>
            <v-col cols="12" class="py-0">
              <v-text-field label="Contraseña" v-model="claveAcceso" :type="mostrarPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock" :append-inner-icon="mostrarPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="mostrarPassword = !mostrarPassword" density="compact"
                :rules="[reglas.required]"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="tonal" color="grey-darken-1" @click="diagAccesoLogin = false">Cancelar</v-btn>
        <v-btn color="warning" variant="flat" :disabled="!validadoAcceso || !claveAcceso" :loading="cargandoAcceso"
          @click="guardarAccesoLogin">Conceder Acceso</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
