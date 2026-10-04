<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiCall } from '@/utils/api'
import { generarMemo } from '@/utils/imprimir'
import { toast } from '@/composables/useToast'

const route = useRoute()
const folio = computed(() => route.params.folio || '')

// Estados de la vista
const cargando = ref(true)
const mostrarCheck = ref(false)
const mostrarError = ref(false)
const documento = ref(null)
const error = ref(null)
const imprimiendo = ref(false)

// Cabeceras para la tabla de equipos (manteniendo el estándar del proyecto)
const headersEquipos = [
  { key: 'nombre', title: 'Equipo / Nombre' },
  { key: 'serial', title: 'Serial' },
  { key: 'descripcion', title: 'Descripción' },
  { key: 'estado', title: 'Estado' }
]

function formatFecha(fecha) {
  if (!fecha) return '-'
  const str = String(fecha).substring(0, 10)
  const partes = str.split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return str
}

// Llamada a la API para consultar el documento
async function consultarDocumento() {
  if (!folio.value) {
    error.value = 'No se ha proporcionado un folio de verificación válido.'
    toast.error(error.value)
    cargando.value = false
    return
  }

  cargando.value = true
  mostrarCheck.value = false
  error.value = null

  await apiCall(`memorandos/documento/${folio.value}`)
    .then((res) => {
      documento.value = res.data.memos
      mostrarCheck.value = true
      setTimeout(() => {
        mostrarCheck.value = false
      }, 1800)
    })
    .catch((error) => {
      console.error('Error al obtener el documento:', error)
      cargando.value = false
      error.value = error.response?.data?.message || 'No se pudo verificar el documento o el folio no existe en el sistema.'
      mostrarError.value = true
    })
  cargando.value = false
}

// Función para imprimir / generar el PDF utilizando la utilidad del proyecto
async function imprimirDocumento() {
  if (!documento.value) return

  imprimiendo.value = true
  try {
    const doc = documento.value

    // Mapeo adaptativo para cumplir con el esquema que requiere generarMemo()
    const datosMemo = {
      folio_me: doc.folio_me || doc.folio || folio.value,
      asunto: doc.asunto || 'Verificación de Memorando',
      descripcion: doc.descripcion || doc.motivo || '',
      fecha: formatFecha(doc.fecha),
      de: doc.de || 'Centro Aldea Tecnológica / Sede Estovacuy',
      para: doc.pa_quien || doc.para || 'A quien corresponda',
      ubicacion: doc.ubicacion || (doc.nom_dir ? `que se desarrollara en ${doc.nom_dir} ${doc.direccion || ''}` : ''),
      firmante: doc.firmante || (doc.nombre ? `${doc.nombre} ${doc.apellido || ''}` : 'Responsable'),
      firma: doc.firma || '',
      urlMemo: `${window.location.origin}/verificacion/${doc.folio_me || doc.folio || folio.value}`,
      equipos: Array.isArray(doc.equipos)
        ? doc.equipos.map(item => ({
          nombre: item.nombre || item,
          descripcion: item.descripcion || '',
          serial: item.serial || ''
        }))
        : []
    }

    await generarMemo(datosMemo)
  } catch (err) {
    console.error('Error al generar PDF:', err)
    toast.error('Ocurrió un error al generar el PDF. Abriendo vista de impresión estándar...')
    window.print()
  } finally {
    imprimiendo.value = false
  }
}

onMounted(() => {
  consultarDocumento()
})
</script>

<template>
  <v-container class="fill-height py-8 px-4" fluid>
    <v-row justify="center" align="center" class="w-100 ma-0">
      <v-col cols="12" sm="10" md="8" lg="7" xl="6">
        <!-- 1. ANIMACIÓN DE CARGA MIENTRAS ESPERA LA RESPUESTA -->
        <v-card v-if="cargando" rounded="xl" elevation="3" class="pa-8 text-center loading-card mx-auto">
          <v-progress-circular indeterminate color="primary" size="72" width="6" class="mb-6 pulse-animation" />
          <h2 class="text-h5 font-weight-bold mb-2">Verificando Documento</h2>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Consultando en el sistema el folio: <strong>{{ folio }}</strong>
          </p>
          <v-chip color="primary" variant="tonal" size="small" prepend-icon="mdi-shield-search">
            Validando autenticidad en la base de datos...
          </v-chip>
        </v-card>

        <!-- 2. ANIMACIÓN DE CHECK / APROBADO EN EL MEDIO (TEMPORAL) -->
        <v-overlay :model-value="mostrarCheck" class="align-center justify-center text-center"
          scrim="rgba(0, 0, 0, 0.65)" persistent>
          <div class="check-success-container">
            <div class="check-circle-wrapper mb-4">
              <v-icon icon="mdi-check-circle" color="success" size="110" class="check-icon-animated" />
            </div>
            <h2 class="text-h4 font-weight-bold text-white mb-2">
              ¡Operación Exitosa!
            </h2>
            <p class="text-h6 text-green-lighten-4 mb-2">
              Documento Verificado y Aprobado
            </p>
            <v-chip color="success" variant="flat" size="large" class="mt-2 font-weight-bold">
              <v-icon start icon="mdi-check-decagram" />
              Folio: {{ folio }}
            </v-chip>
          </div>
        </v-overlay>

        <!-- 2. ANIMACIÓN DE ERROR EN EL MEDIO (TEMPORAL) -->
        <v-overlay :model-value="mostrarError" class="align-center justify-center text-center"
          scrim="rgba(0, 0, 0, 0.65)" persistent>
          <div class="check-success-container">
            <div class="check-circle-wrapper mb-4">
              <v-icon icon="mdi-file-document-alert" color="error" size="110" class="error-icon-animated" />
            </div>
            <h2 class="text-h4 font-weight-bold text-white mb-2">
              Verificación Fallida
            </h2>
            <p class="text-h6 text-green-lighten-4 mb-2">
              El documento no existe o no fue emitido por el sistema
            </p>
            <v-chip color="error" variant="flat" size="large" class="mt-2 font-weight-bold">
              <v-icon start icon="mdi-check-decagram" />
              Folio: {{ folio }}
            </v-chip>
          </div>
        </v-overlay>

        <!-- 3. INFORMACIÓN DEL DOCUMENTO UNA VEZ VERIFICADO -->
        <v-slide-y-transition>
          <v-card v-if="documento && !cargando && !mostrarCheck" rounded="xl" elevation="4" class="overflow-hidden">
            <!-- Cabecera Institucional del Documento -->
            <div class="bg-primary px-6 py-5 d-flex flex-wrap align-center justify-space-between ga-3">
              <div class="d-flex align-center ga-3">
                <v-avatar color="white" size="48">
                  <v-icon icon="mdi-shield-check" color="primary" size="28" />
                </v-avatar>
                <div>
                  <p class="text-h7 text-sm-h6 font-weight-bold text-white mb-0">
                    Verificación de Memorando
                  </p>
                  <span class="text-caption text-blue-lighten-4">
                    Aldea Tecnológica
                  </span>
                </div>
              </div>

              <v-chip :color="coloresEstados(documento.estado)" variant="flat" size="default" class="font-weight-bold text-capitalize">
                <v-icon start icon="mdi-check-bold" />
                {{ documento.estado ? documento.estado : 'Sin estado' }}
              </v-chip>
            </div>

            <!-- Cuerpo de Detalles -->
            <v-card-text class="pa-6">
              <!-- Banner con Folio y Fecha -->
              <v-row class="mb-4">
                <v-col cols="12" sm="6">
                  <v-sheet rounded="lg" class="pa-3">
                    <span class="text-caption text-medium-emphasis d-block">Folio del
                      Documento:</span>
                    <strong class="text-subtitle-1 text-primary">
                      {{ documento.folio_me || documento.folio || folio }}
                    </strong>
                  </v-sheet>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-sheet rounded="lg" class="pa-3">
                    <span class="text-caption text-medium-emphasis d-block">Fecha de Emisión:</span>
                    <strong class="text-subtitle-1">
                      {{ formatFecha(documento.fecha) }}
                    </strong>
                  </v-sheet>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <!-- Datos Principales -->
              <v-row class="ga-y-2">
                <v-col cols="12" sm="6">
                  <div class="text-caption text-medium-emphasis">Para:</div>
                  <div class="text-body-1 font-weight-medium">
                    {{ documento.pa_quien || documento.para || '-' }}
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="text-caption text-medium-emphasis">De / Departamento:</div>
                  <div class="text-body-1 font-weight-medium">
                    {{ documento.de || 'Centro Aldea Tecnológica / Sede Estovacuy' }}
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="text-caption text-medium-emphasis">Responsable / Firmante:</div>
                  <div class="text-body-1 font-weight-medium">
                    {{ documento.firmante || (documento.nombre ? `${documento.nombre}
                    ${documento.apellido || ''}` : '-') }}
                  </div>
                </v-col>

                <v-col cols="12" sm="6">
                  <div class="text-caption text-medium-emphasis">Ubicación / Destino:</div>
                  <div class="text-body-1 font-weight-medium">
                    {{ documento.ubicacion || (documento.nom_dir ? `${documento.nom_dir} -
                    ${documento.direccion || ''}` : '-') }}
                  </div>
                </v-col>

                <v-col cols="12" class="mt-2">
                  <div class="text-caption text-medium-emphasis">Asunto:</div>
                  <div class="text-body-1 font-weight-bold">
                    {{ documento.asunto || '-' }}
                  </div>
                </v-col>

                <v-col cols="12" class="mt-1">
                  <div class="text-caption text-medium-emphasis">Motivo / Descripción:</div>
                  <p class="text-body-2 text-medium-emphasis pa-3 rounded-lg mt-1 mb-0">
                    {{ documento.descripcion || documento.motivo || 'Sin observaciones adicionales.'
                    }}
                  </p>
                </v-col>
              </v-row>

              <!-- Tabla de Equipos Asociados (Si los tiene) -->
              <div v-if="documento.equipos && documento.equipos.length > 0" class="mt-6">
                <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center ga-2">
                  <v-icon icon="mdi-devices" size="20" color="primary" />
                  Equipos Registrados ({{ documento.equipos.length }})
                </h3>
                <v-data-table :headers="headersEquipos" :items="documento.equipos" density="compact"
                  class="border rounded-lg" items-per-page="1" hide-default-footer :mobile="$vuetify.display.smAndDown">
                  <template #item.estado="{item}">
                    <v-chip size="x-small"
                      :color="item.estado === 'Disponible' || !item.estado ? 'success' : 'warning'">
                      {{ item.estado || 'Registrado' }}
                    </v-chip>
                  </template>
                </v-data-table>
              </div>
            </v-card-text>

            <v-divider />

            <!-- Acciones / Botón Imprimir -->
            <v-card-actions class="pa-5 d-flex flex-wrap justify-space-between align-center ga-3">
              <span class="text-caption text-medium-emphasis">
                <v-icon icon="mdi-check-decagram-outline" size="16" class="mr-1 text-success" />
                Documento oficial verificado electrónicamente.
              </span>

              <div class="d-flex ga-2">
                <v-btn color="primary" variant="flat" size="large" prepend-icon="mdi-printer" :loading="imprimiendo"
                  rounded="lg" class="px-6 font-weight-bold" @click="imprimirDocumento">
                  Imprimir Documento
                </v-btn>
              </div>
            </v-card-actions>
          </v-card>
        </v-slide-y-transition>

        <!-- 4. ESTADO DE ERROR O NO ENCONTRADO -->
        <v-slide-y-transition>
          <v-card v-if="error && !cargando" rounded="xl" elevation="3" class="pa-8 text-center mx-auto">
            <v-avatar color="error" variant="tonal" size="72" class="mb-4">
              <v-icon icon="mdi-alert-circle-outline" size="44" color="error" />
            </v-avatar>
            <h2 class="text-h5 font-weight-bold mb-2">Error de Verificación</h2>
            <p class="text-body-1 text-medium-emphasis mb-6">
              {{ error }}
            </p>
            <div class="d-flex justify-center ga-3">
              <v-btn variant="outlined" color="primary" prepend-icon="mdi-refresh" rounded="lg"
                @click="consultarDocumento">
                Reintentar
              </v-btn>
            </div>
          </v-card>
        </v-slide-y-transition>

      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* Animación suave de carga */
.pulse-animation {
  animation: pulse 1.8s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.85;
  }

  50% {
    transform: scale(1.05);
    opacity: 1;
  }

  100% {
    transform: scale(0.95);
    opacity: 0.85;
  }
}

/* Animación del check exitoso */
.check-success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.check-circle-wrapper {
  animation: bounceIn 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.check-icon-animated {
  filter: drop-shadow(0px 8px 24px rgba(76, 175, 80, 0.45));
}

.error-icon-animated {
  filter: drop-shadow(0px 8px 24px rgba(175, 76, 76, 0.45));
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-20deg);
  }

  50% {
    opacity: 0.9;
    transform: scale(1.15) rotate(5deg);
  }

  70% {
    transform: scale(0.95) rotate(-2deg);
  }

  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
</style>
