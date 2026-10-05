<script setup>
import { generarMemo } from '@/utils/imprimir'
import { formatFecha, coloresEstados } from '@/composables/useFunciones'
import EstadoMemo from '@/components/Modals/EstadoMemo.vue'
import { capitalize } from 'vue'
import { generarMemoCorreo } from '@/utils/enviarMemo'

const emit = defineEmits(['actualizado'])
const estadoMemo = ref(null)

// Modal de Detalles
const diagDetalle = ref(false)
const memoSeleccionado = ref(null)
const cargandoDetalle = ref(false)
const tokenQr = ref('')

const headersEquipos = [
  { key: 'nombre', title: 'Nombre' },
  { key: 'serial', title: 'Serial' },
  { key: 'estado', title: 'Estado' },
]

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
    ubicacion: `que se desarrollara en ${datos.nom_dir} ${datos.direccion}`,
    firmante: datos.nombre + ' ' + datos.apellido,
    folio_me: datos.folio_me,
    urlMemo: `${window.location.origin}/verificacion/${datos.folio_me}`,
    estado: datos.estado ? capitalize(datos.estado) : ''

  }
  generarMemo(datosMemo)
}

function verDetalle(item) {
  memoSeleccionado.value = null
  cargandoDetalle.value = true
  diagDetalle.value = true
  apiCall(`memorandos/${item.id}`)
    .then((res) => {
      memoSeleccionado.value = res.data.memos
      tokenQr.value = res.data.tokenMemo
    })
    .catch((err) => {
      console.error(err)
      toast.error('Error al cargar los detalles del memorando')
    })
    .finally(() => {
      cargandoDetalle.value = false
    })
}

async function enviarMemoCorreo(item) {
  const datosMemo = {
    equipos: item.equipos.map(equipo => ({
      nombre: equipo.nombre,
      descripcion: equipo.descripcion,
      serial: equipo.serial
    })),
    asunto: item.asunto,
    descripcion: item.descripcion,
    fecha: formatFecha(item.fecha),
    de: 'Centro Aldea Tecnológica / Sede Estovacuy',
    motivo: item.descripcion,
    firma: item.firma,
    para: item.pa_quien,
    ubicacion: `que se desarrollara en ${item.nom_dir} ${item.direccion}`,
    firmante: item.nombre + ' ' + item.apellido,
    folio_me: item.folio_me,
    urlMemo: `${window.location.origin}/verificacion/${item.folio_me}`,
    estado: item.estado ? capitalize(item.estado) : ''
  }
  await generarMemoCorreo(datosMemo, item.id_responsable, `Memorando #${item.folio_me || 'sin_folio'}`)
}

function marcarRecepcion(item) {
  estadoMemo.value.abrir('recibir', item)
}

function anularMemo(item) {
  estadoMemo.value.abrir('anular', item)
}

function onActualizado() {
  diagDetalle.value = false
  memoSeleccionado.value = null
  emit('actualizado')
}

defineExpose({
  verDetalle
})
</script>

<template>
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
        <v-row class="mb-2 ga-2">
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
            <div class="font-weight-medium">
              {{ memoSeleccionado.nombre + ' ' + memoSeleccionado.apellido }} (V-{{ memoSeleccionado.cedula }})
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Ubicación</div>
            <div class="font-weight-medium">{{ memoSeleccionado.nom_dir }} - {{ memoSeleccionado.direccion }}
            </div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Asunto</div>
            <div class="font-weight-bold text-body-1">{{ memoSeleccionado.asunto }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Folio</div>
            <div class="font-weight-bold text-body-1">{{ memoSeleccionado.folio_me }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Estado</div>
            <v-chip :color="coloresEstados(memoSeleccionado.estado)" variant="tonal" prepend-icon="mdi-list-status"
              class="text-capitalize">
              {{ memoSeleccionado.estado ? memoSeleccionado.estado : 'Sin estado' }}
            </v-chip>
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

      <v-card-actions class="flex-column flex-sm-row px-4 pb-4 justify-end">
        <v-btn color="error" :class="$vuetify.display.xs ? 'w-100' : ''" variant="tonal" prepend-icon="mdi-close"
          @click="anularMemo(memoSeleccionado)" v-if="!memoSeleccionado.estado">
          Anular
        </v-btn>
        <v-btn color="success" :class="$vuetify.display.xs ? 'w-100' : ''" variant="tonal" prepend-icon="mdi-check"
          @click="marcarRecepcion(memoSeleccionado)" v-if="!memoSeleccionado.estado">
          Recibido
        </v-btn>
        <v-btn color="primary" :class="$vuetify.display.xs ? 'w-100' : ''" variant="tonal" prepend-icon="mdi-printer"
          @click="obtenerDatosMemo(memoSeleccionado)">
          Imprimir
        </v-btn>
        <v-btn color="primary" :class="$vuetify.display.xs ? 'w-100' : ''" variant="tonal" prepend-icon="mdi-printer"
          @click="enviarMemoCorreo(memoSeleccionado)">
          Enviar por correo
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card rounded="lg" v-else-if="cargandoDetalle" class="pa-6 text-center">
      <v-progress-circular indeterminate color="primary" />
      <div class="text-caption text-medium-emphasis mt-2">Cargando detalles...</div>
    </v-card>
  </v-dialog>

  <EstadoMemo ref="estadoMemo" @actualizado="onActualizado" />
</template>