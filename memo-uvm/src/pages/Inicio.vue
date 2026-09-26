<script setup>
import ModalImagen from '@/components/ModalImagen.vue';
import { capitalize } from 'vue';

const panel = ref([])
const equiposFormRef = ref(null);
const confirmDialogRef = ref(null);
const modalImagenRef = ref(null)
const ubicacionesFormRef = ref(null)

const headers = [
  { key: 'nombre', title: 'Nombre completo', sortable: false },
  { key: 'cedula', title: 'Cedula', sortable: false },
  { key: 'firma', title: 'Firma', sortable: false },
  { key: 'eliminado', title: 'Estado', sortable: false },
]
const headersEquipos = [
  { key: 'nombre', title: 'Nombre', sortable: false },
  { key: 'descripcion', title: 'Descripcion', sortable: false },
  { key: 'serial', title: 'Serial', sortable: false },
  { key: 'imagen', title: 'Imagen', sortable: false },
  { key: 'estado', title: 'Estado', sortable: false },
  { key: 'acciones', title: 'Opciones', sortable: false },
]
const headersUbicaciones = [
  { key: 'nombre', title: 'Nombre', sortable: false },
  { key: 'direccion', title: 'Direccion', sortable: false },
  { key: 'eliminado', title: 'Estatus', sortable: false },
  { key: 'acciones', title: 'Opciones', sortable: false },
]
const resp = ref([])
const equipos = ref([])
const ubica = ref([])
const tipoEl = ref('')

const diagEstadoEquipo = ref(false)
const equipoSeleccionado = ref(null)
const nuevoEstado = ref('')
const cargandoEstado = ref(false)

function cargaInicial() {
  apiCall('responsables')
    .then((res) => {
      resp.value = res.data.users
    })
}

function cargaInicialEquipos() {
  apiCall('equipos')
    .then((res) => {
      equipos.value = res.data.equ
    })
}
function cargaInicialUbicaciones() {
  apiCall('ubicaciones')
    .then((res) => {
      ubica.value = res.data.ubi
    })
}

function abrirEquipos() {
  equiposFormRef.value.abrir();
}


function abrirEliminarEquipos(item) {
  confirmDialogRef.value.abrir(item, {
    titulo: 'Eliminar Equipo',
    mensaje: `¿Estás seguro de que deseas eliminar el equipo ${item.nombre}?`,
    textoBoton: 'Eliminar',
  })
}

function abrirEliminarUbicaciones(item) {
  confirmDialogRef.value.abrir(item, {
    titulo: 'Eliminar Ubicación',
    mensaje: `¿Estás seguro de que deseas eliminar la ubicación ${item.nombre}?`,
    textoBoton: 'Eliminar',
  })
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

function abrirUbicaciones() {
  ubicacionesFormRef.value.abrir()
}

function eliminarUbicaciones(item) {
  confirmDialogRef.value.setCargando(true)
  apiCall(`ubicaciones/${item.id}`, {}, 'DELETE')
    .then((res) => {
      if (res.status === 200 || res.status === 204) {
        toast.success(res.data.message);
        cargaInicialUbicaciones();
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

function eliminar(item) {
  if (tipoEl.value === 'equipos') {
    eliminarEquipos(item)
    cargaInicialEquipos()
  } else if (tipoEl.value === 'ubicaciones') {
    eliminarUbicaciones(item)
    cargaInicialUbicaciones()
  }
}

onMounted(() => {
  cargaInicial()
  cargaInicialEquipos()
  cargaInicialUbicaciones()
})

</script>

<template>
  <v-container>
    <h1>Panel de control</h1>
    <v-card subtitle="Opciones de agregar">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="auto">
            <v-btn color="primary" @click="abrirEquipos">Agregar Equipo</v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="auto">
           <v-btn color="primary" @click="abrirUbicaciones">Agregar Ubicación</v-btn>
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
                  @click="modalImagenRef.verImagen(item)"></v-img>
                <span v-else class="text-caption grey--text">Sin firma</span>
              </template>
              <template v-slot:item.eliminado="{ item }">
                <v-chip :color="item.eliminado == 0 ? 'error' : 'success'">
                  {{ item.eliminado == 1 ? 'Activo' : 'Inactivo ' }}
                </v-chip>
              </template>
            </v-data-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Equipos">
          <v-expansion-panel-text class="bg-background">
            <v-data-table :headers="headersEquipos" :items="equipos" :mobile="$vuetify.display.smAndDown">
              <template v-slot:item.imagen="{ item }">
                <v-img v-if="item.imagen" :src="item.imagen" max-width="150" max-height="60" contain alt="Imagen"
                  @click="modalImagenRef.verImagen(item)"></v-img>
                <span v-else class="text-caption grey--text">Sin imagen</span>
              </template>
              <template v-slot:item.estado="{ item }">
                <v-chip :color="colorEstado(item.estado)">
                  {{ item.estado }}
                </v-chip>
              </template>
              <template v-slot:item.acciones="{ item }">
                <div class="d-flex justify-center ga-1">
                  <v-btn icon="mdi-pencil" variant="tonal" size="small" color="primary" title="Editar equipo"
                    @click="equiposFormRef.abrir(item)">
                  </v-btn>
                  <v-btn icon="mdi-list-status" variant="tonal" size="small" color="secondary" title="Cambiar estado"
                    @click="abrirCambiarEstado(item)">
                  </v-btn>
                  <v-btn icon="mdi-delete" variant="tonal" size="small" color="error" title="Eliminar equipo"
                    @click="() => { tipoEl = 'equipos'; abrirEliminarEquipos(item) }">
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Ubicaciones">
          <v-expansion-panel-text class="bg-background">
            <v-data-table :headers="headersUbicaciones" :items="ubica" :mobile="$vuetify.display.smAndDown">
              <template v-slot:item.eliminado="{ item }">
                <v-chip :color="item.eliminado == 0 ? 'error' : 'success'">
                  {{ item.eliminado == 1 ? 'Activo' : 'Inactivo ' }}
                </v-chip>
              </template>
              <template v-slot:item.acciones="{ item }">
                <div class="d-flex justify-center ga-1">
                  <v-btn icon="mdi-pencil" variant="tonal" size="small" color="primary" title="Editar ubicacion"
                    @click="ubicacionesFormRef.abrir(item)">
                  </v-btn>
                  <v-btn icon="mdi-delete" variant="tonal" size="small" color="error" title="Eliminar ubicacion"
                    @click="() => { tipoEl = 'ubicaciones'; abrirEliminarUbicaciones(item) }">
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-container>
  <equipos-form ref="equiposFormRef" @guardado="cargaInicialEquipos" />
  <confirm-dialog ref="confirmDialogRef" @confirmar="eliminar" />
  <modal-imagen ref="modalImagenRef" />
  <ubicaciones ref="ubicacionesFormRef" @guardado="cargaInicialUbicaciones" />

  <v-dialog v-model="diagEstadoEquipo" max-width="400px">
    <v-card class="pa-2 rounded-lg">
      <v-card-title class="d-flex align-center font-weight-bold text-h6">
        <v-icon icon="mdi-list-status" color="primary" class="mr-2"></v-icon>
        Cambiar Estado del Equipo
      </v-card-title>
      <v-card-subtitle v-if="equipoSeleccionado">
        {{ equipoSeleccionado.nombre }} <span v-if="equipoSeleccionado.serial">({{ equipoSeleccionado.serial
        }})</span>
      </v-card-subtitle>
      <v-card-text class="pt-4">
        <v-select v-model="nuevoEstado" label="Nuevo Estado" :items="['Disponible', 'Dañado', 'Mantenimiento']"
          prepend-inner-icon="mdi-check-circle-outline" density="compact"></v-select>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="tonal" color="grey-darken-1" @click="diagEstadoEquipo = false">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" :loading="cargandoEstado" @click="cambiarEstadoEquipo">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>