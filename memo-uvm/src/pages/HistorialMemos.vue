<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/composables/useToast'
import { generarMemorando, generarMemo } from '@/utils/imprimir'
const router = useRouter()

const headersEquipos = [
  { key: 'nombre', title: 'Nombre' },
  { key: 'serial', title: 'Serial' },
  { key: 'estado', title: 'Estado' },
]
// Lista de Memorandos
const memorandos = ref([])
const cargando = ref(false)
const busqueda = ref('')

const headers = [
  { key: 'fecha', title: 'Fecha', sortable: true },
  { key: 'ubicacion', title: 'Ubicación', sortable: true },
  { key: 'responsable', title: 'Responsable', sortable: true },
  { key: 'asunto', title: 'Asunto', sortable: false },
  { key: 'total_equipos', title: 'Equipos', sortable: false },
  { key: 'acciones', title: 'Opciones', sortable: false },
]

// Modal de Detalles
const diagDetalle = ref(false)
const memoSeleccionado = ref(null)
const cargandoDetalle = ref(false)

function formatFecha(fecha) {
  if (!fecha) return '-'
  const str = String(fecha).substring(0, 10)
  const partes = str.split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return str
}

function cargarMemorandos() {
  cargando.value = true
  apiCall('memorandos')
    .then((res) => {
      memorandos.value = res.data.memos || []
    })
    .catch((err) => {
      console.error(err)
      toast.error('Error al cargar los memorandos')
    })
    .finally(() => {
      cargando.value = false
    })
}

function verDetalle(item) {
  memoSeleccionado.value = null
  cargandoDetalle.value = true
  diagDetalle.value = true
  apiCall(`memorandos/${item.id}`)
    .then((res) => {
      memoSeleccionado.value = res.data.memos
    })
    .catch((err) => {
      console.error(err)
      toast.error('Error al cargar los detalles del memorando')
    })
    .finally(() => {
      cargandoDetalle.value = false
    })
}

function obtenerDatosMemo(datos) {
  const datosMemo = {
    equipos: datos.equipos.map(item => ({
      nombre: item.nombre,
      descripcion: item.descripcion,
      serial: item.serial
    })),
    asunto: datos.asunto,
    descripcion: datos.descripcion,
    fecha: formatFecha(datos.fecha),
    de: 'Centro Aldea Tecnológica / Sede Estovacuy',
    motivo: datos.descripcion,
    firma: datos.firma,
    para: datos.pa_quien,
    ubicacion: `que se dearrollara en ${datos.nom_dir} ${datos.direccion}`,
    firmante: datos.nombre + ' ' + datos.apellido
  }
  generarMemo(datosMemo)
}

onMounted(() => {
  cargarMemorandos()
})
</script>

<template>
  <v-container>
    <!-- Encabezado -->
    <v-row align="center" class="mb-4">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Historial de Memorandos</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Lista cronológica de salidas y resguardos de equipos
        </p>
      </v-col>
      <v-col cols="12" sm="auto" class="d-flex ga-2">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="router.push('/memo')">
          Nuevo Memorando
        </v-btn>
      </v-col>
      <v-col cols="12" sm="auto" class="d-flex ga-2">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="cargando" @click="cargarMemorandos">
          Actualizar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tarjeta con la tabla de memorandos -->
    <v-card rounded="lg" elevation="1">
      <v-card-text>
        <!-- Barra de búsqueda -->
        <div class="mb-4">
          <v-text-field v-model="busqueda" prepend-inner-icon="mdi-magnify"
            label="Buscar por responsable, ubicación, fecha o asunto..." variant="outlined" density="compact"
            hide-details clearable rounded="lg" style="max-width: 450px;" />
        </div>

        <v-data-table :headers="headers" :items="memorandos" :search="busqueda" :loading="cargando"
          no-data-text="No hay memorandos registrados" loading-text="Cargando memorandos..."
          items-per-page-text="Memorandos por página" :mobile="$vuetify.display.smAndDown">
          <!-- 1. Fecha -->
          <template v-slot:item.fecha="{ item }">
            <div class="d-flex align-center ga-2 py-1">
              <v-icon icon="mdi-calendar-range" size="small" color="primary" />
              <span class="font-weight-medium">{{ formatFecha(item.fecha) }}</span>
            </div>
          </template>

          <!-- 2. Ubicación -->
          <template v-slot:item.ubicacion="{ item }">
            <div>
              <div class="font-weight-medium d-flex align-center ga-1">
                <v-icon icon="mdi-map-marker-outline" size="small" color="error" />
                {{ item.nom_dir || 'Sin ubicación' }}
              </div>
              <div class="text-caption text-medium-emphasis ml-4" v-if="item.direccion">
                {{ item.direccion }}
              </div>
            </div>
          </template>

          <!-- 3. Responsable -->
          <template v-slot:item.responsable="{ item }">
            <div>
              <div class="font-weight-medium d-flex align-center ga-1">
                <v-icon icon="mdi-account-outline" size="small" color="info" />
                {{ item.nombre + ' ' + item.apellido || 'Sin responsable' }}
              </div>
              <div class="text-caption text-medium-emphasis ml-4" v-if="item.cedula">
                V-{{ item.cedula }}
              </div>
            </div>
          </template>

          <!-- Asunto -->
          <template v-slot:item.asunto="{ item }">
            <span class="text-truncate d-inline-block" style="max-width: 220px;" :title="item.asunto">
              {{ item.asunto }}
            </span>
          </template>

          <!-- Total de Equipos -->
          <template v-slot:item.total_equipos="{ item }">
            <v-chip color="primary" variant="tonal" size="small" prepend-icon="mdi-devices">
              {{ item.total_equipos || 0 }} equipo(s)
            </v-chip>
          </template>

          <!-- Opciones / Ver detalle -->
          <template v-slot:item.acciones="{ item }">
            <v-btn icon="mdi-eye-outline" variant="tonal" size="small" color="primary" title="Ver detalle del memorando"
              @click="verDetalle(item)" />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Modal de Detalles del Memorando -->
    <v-dialog v-model="diagDetalle" max-width="700px">
      <v-card rounded="lg" v-if="memoSeleccionado">
        <v-card-title class="d-flex align-center justify-space-between pt-4 px-4">
          <div class="d-flex align-center ga-2">
            <v-avatar color="primary" variant="tonal" size="36">
              <v-icon icon="mdi-file-document-outline" size="20" />
            </v-avatar>
            <span class="text-h6 font-weight-bold">Memorando #{{ memoSeleccionado.id }}</span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="diagDetalle = false" />
        </v-card-title>

        <v-card-text class="px-4 py-2">
          <v-row class="mb-2">
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Fecha</div>
              <div class="font-weight-medium">{{ formatFecha(memoSeleccionado.fecha) }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Creado por</div>
              <div class="font-weight-medium">{{ memoSeleccionado.creado_por || 'Sistema' }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Responsable</div>
              <div class="font-weight-medium">{{ memoSeleccionado.nombre + ' ' + memoSeleccionado.apellido }} (V-{{
                memoSeleccionado.cedula
                }})</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-medium-emphasis">Ubicación</div>
              <div class="font-weight-medium">{{ memoSeleccionado.nom_dir }} - {{ memoSeleccionado.direccion
                }}
              </div>
            </v-col>
            <v-col cols="12">
              <div class="text-caption text-medium-emphasis">Asunto</div>
              <div class="font-weight-bold text-body-1">{{ memoSeleccionado.asunto }}</div>
            </v-col>
            <v-col cols="12">
              <div class="text-caption text-medium-emphasis">Descripción</div>
              <p class="text-body-2 bg-grey-lighten-4 pa-3 rounded-lg border mt-1 mb-0" style="white-space: pre-wrap;">
                {{ memoSeleccionado.descripcion }}
              </p>
            </v-col>
          </v-row>

          <v-divider class="my-3" />

          <!-- Equipos incluidos -->
          <div class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center ga-2">
            <v-icon icon="mdi-devices" size="small" color="primary" />
            Equipos incluidos ({{ memoSeleccionado.equipos?.length || 0 }})
          </div>

          <div class="border-thin rounded-lg">
            <v-data-table :headers="headersEquipos" density="compact" :items="memoSeleccionado.equipos"
              :loading="cargandoDetalle" no-data-text="No hay equipos registrados" loading-text="Cargando equipos..."
              items-per-page-text="Equipos por página" :mobile="$vuetify.display.smAndDown">
              <template v-slot:item.estado="{ item }">
                <v-chip size="x-small" :color="item.estado === 'Disponible' ? 'green' : 'red'">
                  {{ item.estado }}
                </v-chip>
              </template>
            </v-data-table>
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4 justify-end">
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-printer" @click="obtenerDatosMemo(memoSeleccionado)">
            Generar memorando
          </v-btn>
          <v-btn color="primary" variant="tonal" @click="diagDetalle = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
      <v-card rounded="lg" v-else-if="cargandoDetalle" class="pa-6 text-center">
        <v-progress-circular indeterminate color="primary" />
        <div class="text-caption text-medium-emphasis mt-2">Cargando detalles...</div>
      </v-card>
    </v-dialog>
  </v-container>
</template>
