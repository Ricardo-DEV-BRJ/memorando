<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/composables/useToast'
import { formatFecha, coloresEstados } from '@/composables/useFunciones'
import Detalles from '@/components/Modals/Detalles.vue'

const router = useRouter()

// Lista de Memorandos
const memorandos = ref([])
const cargando = ref(false)
const busqueda = ref('')
const copiarCargando = ref(false)
const headers = [
  { key: 'fecha', title: 'Fecha', sortable: true },
  { key: 'ubicacion', title: 'Ubicación', sortable: true },
  { key: 'responsable', title: 'Responsable', sortable: true },
  { key: 'asunto', title: 'Folio', subtitle: 'Asunto', sortable: true },
  { key: 'total_equipos', title: 'Equipos', sortable: true },
  { key: 'acciones', title: 'Opciones', sortable: true },
]
const memoCopiar = ref([])
const detalle = ref(null)

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

async function copiarMemo(item) {
  copiarCargando.value = true
  await apiCall(`memorandos/${item.id}`)
    .then((res) => {
      memoCopiar.value = res.data.memos
    })
    .catch((err) => {
      console.error(err)
      toast.error('Error al cargar los detalles del memorando')
    })
    .finally(() => {
      copiarCargando.value = false
    })
  localStorage.setItem('memo', JSON.stringify(memoCopiar.value))
  router.push('/memo')
}

onMounted(() => {
  cargarMemorandos()
})
</script>

<template>
  <v-container >
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
          <template #header.asunto="{ column }">
            <p class="my-0">
              {{ column.title }}
            </p>
            <small>
              {{ column.subtitle }}
            </small>
          </template>
          <!-- 1. Fecha -->
          <template v-slot:item.fecha="{ item }">
            <div class="d-flex align-center ga-2 py-1">
              <v-icon icon="mdi-calendar-range" size="small" color="primary" />
              <span class="font-weight-medium">{{ formatFecha(item.fecha) }}</span>
            </div>
            <v-chip :color="coloresEstados(item.estado)" variant="tonal" size="small" prepend-icon="mdi-list-status" class="text-capitalize">
              {{ item.estado ? item.estado : 'Sin estado' }}
            </v-chip>
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
            <div class="d-flex flex-column">
              <span class="text-truncate d-inline-block" :title="item.folio_me">
                {{ item.folio_me }}
              </span>
              <span class="text-truncate d-inline-block" :title="item.asunto">
                {{ item.asunto }}
              </span>
            </div>
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
              @click="detalle.verDetalle(item)" />
            <v-btn icon="mdi-content-copy" variant="tonal" size="small" color="primary" title="Copiar memorando"
              @click="copiarMemo(item)" :loading="copiarCargando" />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
  <Detalles ref="detalle" @actualizado="cargarMemorandos" />
</template>
