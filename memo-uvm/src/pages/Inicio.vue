<script setup>
import { capitalize } from 'vue';


const panel = ref([])
const responsablesFormRef = ref(null);
const equiposFormRef = ref(null);
const confirmDialogRef = ref(null);

const headers = [
  { key: 'nombre', title: 'Nombre completo', sortable: false },
  { key: 'cedula', title: 'Cedula', sortable: false },
  { key: 'firma', title: 'Firma', sortable: false },
  { key: 'eliminado', title: 'Estado', sortable: false },
  { key: 'acciones', title: 'Opciones', sortable: false },
]
const headersEquipos = [
  { key: 'nombre', title: 'Nombre', sortable: false },
  { key: 'descripcion', title: 'Descripcion', sortable: false },
  { key: 'serial', title: 'Serial', sortable: false },
  { key: 'imagen', title: 'Imagen', sortable: false },
  { key: 'estado', title: 'Estado', sortable: false },
  { key: 'acciones', title: 'Opciones', sortable: false },
]
const resp = ref([])
const equipos = ref([])
const imagD = ref(false)
const dataImagen = ref({})
const tipoEl = ref('')

const diagEstadoEquipo = ref(false)
const equipoSeleccionado = ref(null)
const nuevoEstado = ref('')
const cargandoEstado = ref(false)

const diagActivarUser = ref(false)
const userSeleccionado = ref(null)
const cargandoActivar = ref(false)

const diagAccesoLogin = ref(false)
const userAcceso = ref(null)
const claveAcceso = ref('')
const mostrarPassword = ref(false)
const cargandoAcceso = ref(false)
const validadoAcceso = ref(null)

function cargaInicial() {
  apiCall('responsables')
    .then((res) => {
      resp.value = res.data.users
    })
}

function cargaInicialEquipos() {
  apiCall('equipos')
    .then((res) => {
      equipos.value = res.data.users
    })
}

function abrirEquipos() {
  equiposFormRef.value.abrir();
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
function abrirEliminarEquipos(item) {
  confirmDialogRef.value.abrir(item, {
    titulo: 'Eliminar Equipo',
    mensaje: `¿Estás seguro de que deseas eliminar el equipo ${item.nombre}?`,
    textoBoton: 'Eliminar',
  })
}

function eliminarResponsable(item) {
  confirmDialogRef.value.setCargando(true)
  apiCall(`responsables/${item.id}`, {}, 'DELETE')
    .then((res) => {
      if (res.status === 200 || res.status === 204) {
        toast.success(res.data.message);
        cargaInicial();
        confirmDialogRef.value.cerrar();
      } else {
        toast.error('Ocurrió un error al eliminar');
        confirmDialogRef.value.setCargando(false);
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error('Error al conectar con el servidor');
      confirmDialogRef.value.setCargando(false);
    });
}

function eliminarEquipos(item) {
  confirmDialogRef.value.setCargando(true)
  apiCall(`equipos/${item.id}`, {}, 'DELETE')
    .then((res) => {
      if (res.status === 200 || res.status === 204) {
        toast.success(res.data.message);
        cargaInicial();
        confirmDialogRef.value.cerrar();
      } else {
        toast.error('Ocurrió un error al eliminar');
        confirmDialogRef.value.setCargando(false);
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error('Error al conectar con el servidor');
      confirmDialogRef.value.setCargando(false);
    });
}

function abrirCambiarEstado(item) {
  equipoSeleccionado.value = item;
  nuevoEstado.value = item.estado;
  diagEstadoEquipo.value = true;
}

function cambiarEstadoEquipo() {
  if (!equipoSeleccionado.value || !nuevoEstado.value) return;
  cargandoEstado.value = true;
  apiCall(`equipos/${equipoSeleccionado.value.id}/changeStatus`, { estado: nuevoEstado.value }, 'PUT')
    .then((res) => {
      if (res.status === 200) {
        toast.success(res.data.message || 'Estado actualizado con éxito');
        cargaInicialEquipos();
        diagEstadoEquipo.value = false;
      } else {
        toast.error('Ocurrió un error al cambiar el estado');
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error('Error al conectar con el servidor');
    })
    .finally(() => {
      cargandoEstado.value = false;
    });
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
  apiCall('login', {
    id_responsable: userAcceso.value.id,
    cedula: userAcceso.value.cedula,
    pass: claveAcceso.value
  }, 'POST')
    .then((res) => {
      if (res.status === 200 || res.status === 201) {
        toast.success(res.data.message || 'Acceso al login concedido con éxito');
        diagAccesoLogin.value = false;
      } else {
        toast.error('Ocurrió un error al otorgar el acceso');
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error('Error al conectar con el servidor');
    })
    .finally(() => {
      cargandoAcceso.value = false;
    });
}

function colorEstado(estado) {
  const data = capitalize(estado)
  switch (data) {
    case 'Disponible':
      return 'success';
    case 'Dañado':
      return 'error';
    case 'Mantenimiento':
      return 'warning';
    default:
      return 'grey';
  }
}

function verImagen(item) {
  dataImagen.value = {
    img: item.imagen ? item.imagen : item.firma,
    nombre: item.nombre
  }
  imagD.value = true
}

function elimiar(item) {
  if (tipoEl.value == 'responsable') {
    eliminarResponsable(item)
    cargaInicial()
  } else if (tipoEl.value == 'equipos') {
    eliminarEquipos(item)
    cargaInicialEquipos()
  }
}

onMounted(() => {
  cargaInicial()
  cargaInicialEquipos()
})

</script>

<template>
  <v-container>
    <h1>Panel de control</h1>
    <v-card subtitle="Opciones de agregar">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="auto">
            <v-btn color="primary" @click="abrirFormulario">Agregar Responsable</v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="auto">
            <v-btn color="primary" @click="abrirEquipos">Agregar Equipo</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-col class="py-3">
      <v-expansion-panels v-model="panel" multiple>
        <v-expansion-panel title="Responsables">
          <v-expansion-panel-text class="bg-background">
            <v-data-table :headers="headers" :items="resp" :mobile="$vuetify.display.smAndDown">
              <template v-slot:item.nombre="{ item }">
                {{ item.nombre }} {{ item.apellido }}
              </template>
              <template v-slot:item.firma="{ item }">
                <v-img v-if="item.firma" :src="item.firma" max-width="150" max-height="60" contain alt="Firma"
                  @click="verImagen(item)"></v-img>
                <span v-else class="text-caption grey--text">Sin firma</span>
              </template>
              <template v-slot:item.eliminado="{ item }">
                <v-chip :color="item.eliminado == 0 ? 'error' : 'success'">
                  {{ item.eliminado == 1 ? 'Activo' : 'Inactivo ' }}
                </v-chip>
              </template>
              <template v-slot:item.acciones="{ item }">
                <div class="d-flex justify-center ga-1">
                  <v-btn icon="mdi-pencil" variant="tonal" size="small" color="primary"
                    title="Editar responsable" @click="responsablesFormRef.abrir(item)">
                  </v-btn>
                  <v-btn icon="mdi-key-plus" variant="tonal" size="small" color="warning"
                    title="Dar acceso al login" @click="abrirAccesoLogin(item)">
                  </v-btn>
                  <v-btn v-if="item.eliminado == 0" icon="mdi-account-check" variant="tonal" size="small" color="success"
                    title="Activar responsable" @click="abrirActivarUsuario(item)">
                  </v-btn>
                  <v-btn icon="mdi-delete" variant="tonal" size="small" color="error"
                    title="Inactivar responsable" @click="() => { tipoEl = 'responsable'; abrirEliminarRespo(item) }">
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Equipos">
          <v-expansion-panel-text class="bg-background">
            <v-data-table :headers="headersEquipos" :items="equipos" :mobile="$vuetify.display.smAndDown">
              <template v-slot:item.imagen="{ item }">
                <v-img v-if="item.imagen" :src="item.imagen" max-width="150" max-height="60" contain alt="Imagen"
                  @click="verImagen(item)"></v-img>
                <span v-else class="text-caption grey--text">Sin imagen</span>
              </template>
              <template v-slot:item.estado="{ item }">
                <v-chip :color="colorEstado(item.estado)">
                  {{ item.estado }}
                </v-chip>
              </template>
              <template v-slot:item.acciones="{ item }">
                <div class="d-flex justify-center ga-1">
                  <v-btn icon="mdi-pencil" variant="tonal" size="small" color="primary"
                    title="Editar equipo" @click="equiposFormRef.abrir(item)">
                  </v-btn>
                  <v-btn icon="mdi-list-status" variant="tonal" size="small" color="secondary"
                    title="Cambiar estado" @click="abrirCambiarEstado(item)">
                  </v-btn>
                  <v-btn icon="mdi-delete" variant="tonal" size="small" color="error"
                    title="Eliminar equipo" @click="() => { tipoEl = 'equipos'; abrirEliminarEquipos(item) }">
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-container>
  <responsables-form ref="responsablesFormRef" @guardado="cargaInicial" />
  <equipos-form ref="equiposFormRef" @guardado="cargaInicialEquipos" />
  <confirm-dialog ref="confirmDialogRef" @confirmar="elimiar" />

  <!-- Modal ver imagen -->
  <v-dialog v-model="imagD" :max-width="$vuetify.display.smAndUp ? '500px' : '90%'">
    <v-card>
      <v-card-text>
        <v-row justify="end">
          <v-col cols="auto">
            <v-btn icon="mdi-close" variant="tonal" size="small" color="error" @click="imagD = false"></v-btn>
          </v-col>
        </v-row>
        <v-img class="rounded-lg" :src="dataImagen.img" :alt="dataImagen.nombre" v-if="dataImagen">
        </v-img>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Modal Cambiar Estado de Equipo -->
  <v-dialog v-model="diagEstadoEquipo" max-width="400px">
    <v-card class="pa-2 rounded-lg">
      <v-card-title class="d-flex align-center font-weight-bold text-h6">
        <v-icon icon="mdi-list-status" color="primary" class="mr-2"></v-icon>
        Cambiar Estado del Equipo
      </v-card-title>
      <v-card-subtitle v-if="equipoSeleccionado">
        {{ equipoSeleccionado.nombre }} <span v-if="equipoSeleccionado.serial">({{ equipoSeleccionado.serial }})</span>
      </v-card-subtitle>
      <v-card-text class="pt-4">
        <v-select
          v-model="nuevoEstado"
          label="Nuevo Estado"
          :items="['Disponible', 'Dañado', 'Mantenimiento']"
          prepend-inner-icon="mdi-check-circle-outline"
          density="compact"
        ></v-select>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="tonal" color="grey-darken-1" @click="diagEstadoEquipo = false">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" :loading="cargandoEstado" @click="cambiarEstadoEquipo">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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
        ¿Estás seguro de que deseas reactivar al responsable <strong>{{ userSeleccionado.nombre }} {{ userSeleccionado.apellido }}</strong>?
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
        Asignar credenciales de inicio de sesión para <strong>{{ userAcceso.nombre }} {{ userAcceso.apellido }}</strong>
      </v-card-subtitle>
      <v-card-text class="pt-4">
        <v-form v-model="validadoAcceso" lazy-validation @submit.prevent="guardarAccesoLogin">
          <v-row>
            <v-col cols="12" class="py-0">
              <v-text-field
                label="Usuario (Cédula)"
                :model-value="userAcceso ? userAcceso.cedula : ''"
                prepend-inner-icon="mdi-account-lock"
                density="compact"
                disabled
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="py-0">
              <v-text-field
                label="Contraseña"
                v-model="claveAcceso"
                :type="mostrarPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="mostrarPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="mostrarPassword = !mostrarPassword"
                density="compact"
                :rules="[reglas.required]"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="tonal" color="grey-darken-1" @click="diagAccesoLogin = false">Cancelar</v-btn>
        <v-btn color="warning" variant="flat" :disabled="!validadoAcceso || !claveAcceso" :loading="cargandoAcceso" @click="guardarAccesoLogin">Conceder Acceso</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
