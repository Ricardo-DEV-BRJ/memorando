<script setup>
import { reglas } from '@/utils/rules.js'
import { toast } from '@/composables/useToast'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref(null)
const formValido = ref(null)
const intentoEnvio = ref(false)
const cargando = ref(false)
const equipos = ref([])
const resp = ref([])
const depa = ref([])
const ubica = ref([])
const buscar = ref('')
const headers = [
  { key: 'nombre', title: 'Nombre', sortable: false },
  { key: 'descripcion', title: 'Descripcion', sortable: false },
  { key: 'serial', title: 'Serial', sortable: false },
  { key: 'imagen', title: 'Imagen', sortable: false },
  { key: 'estado', title: 'Estado', sortable: false },
]
const equiposSeleccionados = ref([])

const textoBase = 'Sirva la presente para dar salida de los siguientes equipos por parte del departamento de Aldea tecnológica. Los equipos van a ser resguardados por el departamento, para la actividad a realizarse el día'

const datos = ref({
  respSeleccionado: null,
  fecha: '',
  ubicacion: null,
  pa_quien: null,
  asunto: 'Salida - Entrada de equipos',
  descripcion: textoBase,
})

function restablecer() {
  datos.value = {
    respSeleccionado: null,
    fecha: '',
    ubicacion: null,
    pa_quien: null,
    asunto: 'Salida - Entrada de equipos',
    descripcion: textoBase,
  }
  equiposSeleccionados.value = []
  intentoEnvio.value = false
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

function cargaInicialEquipos() {
  apiCall('equipos')
    .then((res) => {
      equipos.value = res.data.equ
    })
}

function cargarResponsables() {
  apiCall('responsables')
    .then((res) => {
      resp.value = res.data.users
      depa.value = res.data.depa
      resp.value = resp.value.filter((item) => item.eliminado === 1)
    })
}

function cargarUbicaciones() {
  apiCall('ubicaciones')
    .then((res) => {
      ubica.value = res.data.ubi
      ubica.value = ubica.value.filter((item) => item.eliminado === 1)
    })
}

const listaUsuarios = (item) => {
  return {
    title: item.nombre,
    value: item.id,
    subtitle: 'V-' + item.cedula,
  }
}

const listaUbicaciones = (item) => {
  return {
    title: item.nombre,
    value: item.id,
    subtitle: item.direccion,
  }
}

async function generarMemorando() {
  intentoEnvio.value = true

  const { valid } = await formRef.value.validate()

  if (equiposSeleccionados.value.length === 0) {
    toast.error('Debe tener al menos un equipo en la lista seleccionado')
    return
  }

  if (!valid) {
    toast.error('Por favor completa todos los campos requeridos')
    return
  }

  const memorando = {
    respSeleccionado: datos.value.respSeleccionado,
    fecha: datos.value.fecha,
    ubicacion: datos.value.ubicacion,
    pa_quien: datos.value.pa_quien,
    asunto: datos.value.asunto,
    descripcion: datos.value.descripcion,
    equiposSeleccionados: equiposSeleccionados.value,
    direccionUrl: `${window.location.origin}/verificacion/`
  }
  cargando.value = true
  apiCall('memorandos', memorando, 'POST')
    .then((res) => {
      toast.success(res.data.message || 'Memorando generado con éxito')
      restablecer()
      router.push('/memorandos')
    })
    .catch((err) => {
      toast.error(err.response?.data?.message || 'Error al generar memorando')
    })
    .finally(() => {
      cargando.value = false
    })
}

function obtenerDatos() {
  const dataMemo = JSON.parse(localStorage.getItem('memo'))
  if (dataMemo) {
    datos.value = {
      respSeleccionado: dataMemo.id_responsable,
      fecha: new Date(dataMemo.fecha,).toISOString().split('T')[0],
      ubicacion: dataMemo.id_ubicacion,
      pa_quien: dataMemo.pa_quien,
      asunto: dataMemo.asunto,
      descripcion: dataMemo.descripcion,
    }
    equiposSeleccionados.value = dataMemo.equipos.map(item => item.id),
      console.log(datos.value)
  }
}

watch(() => datos.value.fecha, (newVal) => {
  if (newVal) {
    const [anio, mes, dia] = newVal.split('-')
    datos.value.descripcion = `${textoBase} ${dia}/${mes}/${anio}`
  } else {
    datos.value.descripcion = textoBase
  }
})

onMounted(() => {
  cargaInicialEquipos()
  cargarResponsables()
  cargarUbicaciones()
  obtenerDatos()
})
</script>

<template>
  <v-container>
    <!-- Encabezado con acceso al historial -->
    <v-row align="center" class="mb-4">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Generar Memorando</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Crea un nuevo memorando asignando equipos a un responsable y ubicación
        </p>
      </v-col>
      <v-col cols="auto">
        <v-btn variant="tonal" color="primary" prepend-icon="mdi-history" to="/memorandos">
          Ver Historial
        </v-btn>
      </v-col>
    </v-row>

    <v-card title="Lista de equipos" subtitle="Selecciona los equipos que deseas agregar al memorando" rounded="lg"
      elevation="1">
      <v-card-text>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-2">
          <v-text-field label="Buscar equipo..." v-model="buscar" density="compact" prepend-inner-icon="mdi-magnify"
            variant="outlined" hide-details clearable style="max-width: 320px;" />
          <v-chip :color="equiposSeleccionados.length > 0 ? 'success' : (intentoEnvio ? 'error' : 'default')"
            variant="tonal" size="small"
            :prepend-icon="equiposSeleccionados.length > 0 ? 'mdi-check-circle' : 'mdi-alert-circle-outline'">
            {{ equiposSeleccionados.length > 0 ? `${equiposSeleccionados.length} equipo(s) seleccionado(s)` : 'Al menos 1 equipo requerido' }}
          </v-chip>
        </div>

        <!-- Alerta si intentó enviar sin seleccionar equipos -->
        <v-alert v-if="intentoEnvio && equiposSeleccionados.length === 0" type="error" variant="tonal" density="compact"
          class="mb-3" icon="mdi-alert-circle">
          Debe tener al menos un equipo en la lista seleccionado.
        </v-alert>
        <v-data-table v-model="equiposSeleccionados" :headers="headers" :items="equipos" :search="buscar" show-select>
          <template #item.imagen="{ item }">
            <v-img v-if="item.imagen" :src="item.imagen" max-width="100" max-height="100" />
            <span v-else>Sin imagen</span>
          </template>
          <template #item.estado="{ item }">
            <v-chip :color="item.estado === 'Disponible' ? 'green' : 'red'">
              {{ item.estado }}
            </v-chip>
          </template>
        </v-data-table>

        <v-divider class="my-4" />

        <!-- Formulario con validaciones -->
        <v-form ref="formRef" v-model="formValido" lazy-validation>
          <v-row class="my-2">
            <v-col cols="12" md="4">
              <v-select v-model="datos.respSeleccionado" :items="resp" item-title="nombre" item-value="id"
                label="Responsable" :item-props="listaUsuarios" density="compact" variant="outlined"
                prepend-inner-icon="mdi-account" :rules="[reglas.required]" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="datos.fecha" label="Fecha" type="date" density="compact" variant="outlined"
                prepend-inner-icon="mdi-calendar" :rules="[reglas.required]" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="datos.ubicacion" :items="ubica" item-title="nombre" item-value="id"
                :item-props="listaUbicaciones" label="Ubicación" density="compact" variant="outlined"
                prepend-inner-icon="mdi-map-marker" :rules="[reglas.required]" />
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete v-model="datos.pa_quien" label="Para quien" type="text" density="compact"
                variant="outlined" prepend-inner-icon="mdi-account" :items="depa" item-title="nombre_dep" item-value="id_dep" :rules="[reglas.required]" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="datos.asunto" label="Asunto" type="text" density="compact" variant="outlined"
                prepend-inner-icon="mdi-text-box" :rules="[reglas.required]" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="datos.descripcion" label="Descripción" type="text" rows="3" no-resize
                density="compact" variant="outlined" prepend-inner-icon="mdi-comment-text-outline"
                :rules="[reglas.required]" />
            </v-col>
            <v-col cols="12" sm="auto">
              <v-btn color="primary" prepend-icon="mdi-file-document-check" @click="generarMemorando"
                :loading="cargando">
                Generar memorando
              </v-btn>
            </v-col>
            <v-col cols="12" sm="auto">
              <v-btn color="error" variant="tonal" prepend-icon="mdi-restore" @click="restablecer">
                Restablecer
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Overlay de carga -->
    <v-overlay
      :model-value="cargando"
      class="align-center justify-center"
      persistent
      scrim="black"
    >
      <v-card class="pa-8 d-flex flex-column align-center text-center rounded-xl" max-width="400" elevation="12">
        <div class="position-relative d-flex align-center justify-center mb-5">
          <v-progress-circular indeterminate color="primary" size="90" width="6"></v-progress-circular>
          <v-icon icon="mdi-file-document-edit" color="primary" size="44" class="position-absolute" />
        </div>
        <h3 class="text-h6 font-weight-bold mb-2 text-primary">Generando Memorando</h3>
        <p class="text-body-2 text-medium-emphasis">
          Construyendo el documento PDF y enviando notificaciones por correo. Por favor, espere un momento...
        </p>
      </v-card>
    </v-overlay>

  </v-container>
</template>