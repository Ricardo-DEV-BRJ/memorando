<script setup>
import DepartamentosForm from '@/components/Forms/DepartamentosForm.vue'

const departamentos = ref([])
const cargando = ref(false)
const busqueda = ref('')
// 'todos' | 'activos' (con memorandos activos) | 'libres' (sin memorandos activos)
const filtro = ref('todos')
const lista = ref(null)
const departamentosForm = ref(null)
const confirmDialogRef = ref(null)

const headers = [
  { key: 'nombre_dep', title: 'Departamento', subtitle: 'Correo', sortable: true },
  { key: 'total_personal', title: 'Personal', sortable: true, align: 'center' },
  { key: 'memos_activos', title: 'Memorandos', subtitle: 'Activos / Total', sortable: true, align: 'center' },
  { key: 'estado', title: 'Estado', sortable: false },
  { key: 'acciones', title: 'Opciones', sortable: false, align: 'end' },
]

function tieneActivos(departamento) {
  return departamento.memos_activos > 0
}

function plural(cantidad, singular, pluralTexto = `${singular}s`) {
  return `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`
}

function iniciales(nombre = '') {
  const palabras = nombre.trim().split(/\s+/).filter((p) => p.length > 2 || /^[A-ZÁÉÍÓÚÑ]/.test(p))
  return ((palabras[0]?.[0] || '') + (palabras[1]?.[0] || '')).toUpperCase() || nombre.charAt(0).toUpperCase()
}

const resumen = computed(() => {
  const total = departamentos.value.length
  const conActivos = departamentos.value.filter(tieneActivos).length
  return { total, conActivos, libres: total - conActivos }
})

const tarjetas = computed(() => [
  {
    valor: 'todos',
    titulo: 'Departamentos registrados',
    cantidad: resumen.value.total,
    icono: 'mdi-office-building-outline',
    color: 'primary',
  },
  {
    valor: 'activos',
    titulo: 'Con memorandos activos',
    cantidad: resumen.value.conActivos,
    icono: 'mdi-file-document-alert-outline',
    color: 'warning',
  },
  {
    valor: 'libres',
    titulo: 'Sin memorandos activos',
    cantidad: resumen.value.libres,
    icono: 'mdi-file-document-check-outline',
    color: 'success',
  },
])

const departamentosFiltrados = computed(() => {
  if (filtro.value === 'activos') return departamentos.value.filter(tieneActivos)
  if (filtro.value === 'libres') return departamentos.value.filter((d) => !tieneActivos(d))
  return departamentos.value
})

function seleccionarFiltro(valor) {
  filtro.value = filtro.value === valor ? 'todos' : valor
}

function cargaInicial() {
  cargando.value = true
  apiCall('departamentos/')
    .then((res) => {
      departamentos.value = (res.data.data || []).map((d) => ({
        ...d,
        total_personal: Number(d.total_personal) || 0,
        total_memos: Number(d.total_memos) || 0,
        memos_activos: Number(d.memos_activos) || 0,
      }))
    })
    .catch((err) => {
      toast.error(err.response?.data?.message || 'No se pudieron cargar los departamentos')
    })
    .finally(() => {
      cargando.value = false
    })
}

function abrirFormularioLista(tipo) {
  lista.value.abrir(tipo)
}

function abrirEliminarDepa(item) {
  // Un departamento con memorandos activos solo se puede editar
  if (tieneActivos(item)) return
  const aviso = item.total_personal > 0
    ? ` Tiene ${plural(item.total_personal, 'usuario activo', 'usuarios activos')} que deberás reasignar a otro departamento.`
    : ''
  confirmDialogRef.value.abrir(item, {
    titulo: 'Eliminar departamento',
    mensaje: `¿Estás seguro de que deseas eliminar el departamento ${item.nombre_dep}?${aviso}`,
    textoBoton: 'Eliminar',
  })
}

function eliminarDepartamento(item) {
  confirmDialogRef.value.setCargando(true)
  apiCall(`departamentos/${item.id_dep}`, {}, 'DELETE')
    .then((res) => {
      toast.success(res.data.message || 'Departamento eliminado con éxito')
      confirmDialogRef.value.cerrar()
      cargaInicial()
    })
    .catch((err) => {
      toast.error(err.response?.data?.message || 'Error al conectar con el servidor')
      confirmDialogRef.value.setCargando(false)
      // Se generó un memorando mientras la vista estaba abierta: se actualiza la información
      if (err.response?.status === 409 || err.response?.status === 404) {
        confirmDialogRef.value.cerrar()
        cargaInicial()
      }
    })
}

onMounted(() => {
  cargaInicial()
})
</script>

<template>
  <v-container>
    <v-row align="center" class="mb-2">
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold">Gestión de departamentos</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Consulta los departamentos registrados y sus memorandos activos.
          Un departamento con memorandos activos solo puede editarse.
        </p>
      </v-col>
      <v-col cols="12" sm="6" md="auto">
        <v-btn color="primary" prepend-icon="mdi-office-building-plus-outline" block
          @click="departamentosForm.abrir()">
          Agregar departamento
        </v-btn>
      </v-col>
      <v-col cols="12" sm="6" md="auto">
        <v-btn color="primary" prepend-icon="mdi-view-list" block @click="abrirFormularioLista('departamentos')">
          Agregar varios departamentos
        </v-btn>
      </v-col>
      <v-col cols="12" sm="6" md="auto">
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" block :loading="cargando"
          @click="cargaInicial">
          Actualizar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Resumen: cada tarjeta filtra la tabla -->
    <v-row class="mb-2">
      <v-col v-for="t in tarjetas" :key="t.valor" cols="12" sm="4">
        <v-card rounded="lg" :elevation="filtro === t.valor ? 3 : 1" :color="filtro === t.valor ? t.color : undefined"
          :variant="filtro === t.valor ? 'tonal' : 'elevated'" :aria-pressed="filtro === t.valor"
          @click="seleccionarFiltro(t.valor)">
          <v-card-text class="d-flex align-center ga-4">
            <v-avatar :color="t.color" variant="tonal" size="48" rounded="lg">
              <v-icon :icon="t.icono" size="26" />
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">
                <v-progress-circular v-if="cargando && !departamentos.length" indeterminate size="20" width="2" />
                <template v-else>{{ t.cantidad }}</template>
              </div>
              <div class="text-body-2 text-medium-emphasis">{{ t.titulo }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de departamentos -->
    <v-card rounded="lg" elevation="1">
      <v-card-text>
        <div class="d-flex flex-wrap align-center ga-3 mb-4">
          <v-text-field v-model="busqueda" prepend-inner-icon="mdi-magnify" label="Buscar departamento..."
            variant="outlined" density="compact" hide-details clearable rounded="lg" style="max-width: 380px;" />
          <v-chip v-if="filtro !== 'todos'" closable color="primary" variant="tonal" prepend-icon="mdi-filter-variant-remove"
            @click:close="filtro = 'todos'">
            {{ tarjetas.find((t) => t.valor === filtro)?.titulo }}
          </v-chip>
        </div>

        <v-data-table :headers="headers" :items="departamentosFiltrados" :search="busqueda"
          :filter-keys="['nombre_dep', 'email']" :loading="cargando" :mobile="$vuetify.display.smAndDown"
          item-value="id_dep" no-data-text="No hay departamentos para mostrar" loading-text="Cargando departamentos..."
          items-per-page-text="Departamentos por página">

          <!-- Headers -->
          <template #header.nombre_dep="{ column }">
            <span class="text-subtitle-2 font-weight-bold">{{ column.title }}</span>
            <small class="text-body-2 text-medium-emphasis d-block">{{ column.subtitle }}</small>
          </template>
          <template #header.memos_activos="{ column }">
            <span class="text-subtitle-2 font-weight-bold">{{ column.title }}</span>
            <small class="text-body-2 text-medium-emphasis d-block">{{ column.subtitle }}</small>
          </template>

          <!-- Nombre y correo -->
          <template v-slot:item.nombre_dep="{ item }">
            <div class="d-flex align-center ga-3 py-2">
              <v-avatar v-if="!$vuetify.display.smAndDown" :color="tieneActivos(item) ? 'warning' : 'primary'"
                variant="tonal" size="36" rounded="lg">
                <small class="font-weight-bold">{{ iniciales(item.nombre_dep) }}</small>
              </v-avatar>
              <div class="nombre-departamento">
                <div class="font-weight-medium">{{ item.nombre_dep }}</div>
                <small class="text-body-2 text-medium-emphasis d-flex align-center ga-1">
                  <v-icon :icon="item.email ? 'mdi-email-outline' : 'mdi-email-off-outline'" size="14" />
                  {{ item.email || 'Sin correo' }}
                </small>
              </div>
            </div>
          </template>

          <!-- Personal activo -->
          <template v-slot:item.total_personal="{ item }">
            <v-chip variant="text" size="small" prepend-icon="mdi-account-multiple-outline"
              :title="plural(item.total_personal, 'usuario activo', 'usuarios activos')">
              {{ item.total_personal }}
            </v-chip>
          </template>

          <!-- Memorandos activos / total -->
          <template v-slot:item.memos_activos="{ item }">
            <div class="d-inline-flex flex-column align-center py-1">
              <v-chip :color="tieneActivos(item) ? 'warning' : undefined" variant="tonal" size="small"
                prepend-icon="mdi-file-document-multiple-outline">
                {{ plural(item.memos_activos, 'activo') }}
              </v-chip>
              <small class="text-caption text-medium-emphasis mt-1">de {{ item.total_memos }} en total</small>
            </div>
          </template>

          <!-- Estado -->
          <template v-slot:item.estado="{ item }">
            <v-chip v-if="tieneActivos(item)" color="warning" variant="tonal" size="small" prepend-icon="mdi-lock-outline">
              Con memorandos activos
            </v-chip>
            <v-chip v-else color="success" variant="tonal" size="small" prepend-icon="mdi-check-circle-outline">
              Sin memorandos activos
            </v-chip>
          </template>

          <!-- Acciones -->
          <template v-slot:item.acciones="{ item }">
            <div class="d-flex justify-end align-center ga-1">
              <v-btn icon="mdi-pencil-outline" variant="tonal" size="small" color="primary"
                :title="`Editar ${item.nombre_dep}`" @click="departamentosForm.abrir(item)" />
              <v-btn v-if="!tieneActivos(item)" icon="mdi-delete-outline" variant="tonal" size="small" color="error"
                :title="`Eliminar ${item.nombre_dep}`" @click="abrirEliminarDepa(item)" />
              <v-tooltip v-else location="top">
                <template #activator="{ props }">
                  <v-icon v-bind="props" icon="mdi-lock-outline" color="warning" class="mx-2" tabindex="0"
                    :aria-label="`No se puede eliminar: tiene ${plural(item.memos_activos, 'memorando activo', 'memorandos activos')}`" />
                </template>
                No se puede eliminar: tiene {{ plural(item.memos_activos, 'memorando activo', 'memorandos activos') }}
              </v-tooltip>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
  <confirm-dialog ref="confirmDialogRef" @confirmar="eliminarDepartamento" />
  <listas-agregar-form ref="lista" @guardado="cargaInicial" />
  <departamentos-form ref="departamentosForm" @guardado="cargaInicial" />
</template>

<style scoped>
.nombre-departamento {
  min-width: 0;
  word-break: break-word;
}
</style>
