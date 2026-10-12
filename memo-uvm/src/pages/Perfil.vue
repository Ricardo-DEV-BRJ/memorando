<script setup>
import { imagenABase64Optimizado } from '@/utils/imagen.js'
import { reglas } from '@/utils/rules.js'
import { useSesion } from '@/composables/useSesion'

const { refrescarSesion } = useSesion()
const formRef = ref(null)
const cargando = ref(false)
const guardando = ref(false)
const perfil = ref({
  nombre: '',
  apellido: '',
  cedula: '',
  email_resp: '',
  departamento: '',
  firma: '',
})
// Copia de los datos guardados para detectar y descartar cambios
const original = ref({ ...perfil.value })
const archivoFirma = ref(null)
const firmaNueva = ref('')

const camposEditables = ['nombre', 'apellido', 'email_resp']

const hayCambios = computed(() => {
  const datosCambiados = camposEditables.some((campo) => (perfil.value[campo] || '') !== (original.value[campo] || ''))
  return datosCambiados || !!firmaNueva.value
})

const iniciales = computed(() => {
  const n = perfil.value.nombre?.trim()?.[0] || ''
  const a = perfil.value.apellido?.trim()?.[0] || ''
  return (n + a).toUpperCase()
})

const firmaMostrada = computed(() => firmaNueva.value || perfil.value.firma)

function cargarPerfil() {
  cargando.value = true
  apiCall('responsables/perfil')
    .then((res) => {
      if (res.status === 200) {
        perfil.value = { ...res.data.data }
        original.value = { ...res.data.data }
      }
    })
    .catch((err) => {
      console.error(err)
      toast.error(err.response?.data?.message || 'Error al cargar el perfil')
    })
    .finally(() => {
      cargando.value = false
    })
}

async function obtenerFirma(e) {
  const archivo = Array.isArray(e) ? e[0] : e
  if (!archivo) {
    firmaNueva.value = ''
    return
  }
  try {
    firmaNueva.value = await imagenABase64Optimizado(archivo, 600, 0.76, 'image/png')
  } catch (error) {
    console.error('Error al convertir la imagen a Base64:', error)
    toast.error('No se pudo procesar la imagen de la firma')
    firmaNueva.value = ''
    archivoFirma.value = null
  }
}

function descartarFirma() {
  firmaNueva.value = ''
  archivoFirma.value = null
}

function descartarCambios() {
  perfil.value = { ...original.value }
  descartarFirma()
  formRef.value?.resetValidation()
}

async function guardar() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const envioBack = {
    nombre: perfil.value.nombre.trim(),
    apellido: perfil.value.apellido.trim(),
    email_resp: perfil.value.email_resp.trim(),
  }
  if (firmaNueva.value) {
    envioBack.firma = firmaNueva.value
  }

  guardando.value = true
  apiCall('responsables/perfil', envioBack, 'PUT')
    .then((res) => {
      if (res.status === 200) {
        // El backend devuelve un token nuevo con el nombre actualizado
        if (res.data.token) {
          document.cookie = `token=${res.data.token}; path=/`
          refrescarSesion()
        }
        toast.success(res.data.message || 'Perfil actualizado con éxito')
        perfil.value = { ...perfil.value, ...envioBack }
        original.value = { ...perfil.value }
        descartarFirma()
      } else {
        toast.error('Ocurrió un error al actualizar el perfil')
      }
    })
    .catch((err) => {
      console.error(err)
      toast.error(err.response?.data?.message || 'Error al conectar con el servidor')
    })
    .finally(() => {
      guardando.value = false
    })
}

onMounted(() => {
  cargarPerfil()
})
</script>

<template>
  <v-container>
    <v-row align="center" class="mb-4">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Mi perfil</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Corrige tus datos personales y tu firma
        </p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" variant="flat" prepend-icon="mdi-refresh" :loading="cargando" :disabled="guardando"
          @click="cargarPerfil">
          Actualizar
        </v-btn>
      </v-col>
    </v-row>

    <v-form ref="formRef" @submit.prevent="guardar">
      <v-row>
        <!-- Datos personales -->
        <v-col cols="12" md="7">
          <v-card rounded="lg" elevation="1" class="h-100" :loading="cargando">
            <v-card-item class="pa-5">
              <template #prepend>
                <v-avatar color="primary" size="56" class="mr-2">
                  <span v-if="iniciales" class="text-h6 font-weight-bold">{{ iniciales }}</span>
                  <v-icon v-else icon="mdi-account" />
                </v-avatar>
              </template>
              <v-card-title class="font-weight-bold">
                {{ original.nombre || original.apellido ? `${original.nombre} ${original.apellido}` : 'Datos personales' }}
              </v-card-title>
              <v-card-subtitle>
                <v-icon icon="mdi-office-building-outline" size="14" class="mr-1" />
                {{ perfil.departamento || 'Sin departamento' }}
              </v-card-subtitle>
            </v-card-item>

            <v-divider />

            <v-card-text class="pa-5">
              <v-row>
                <v-col cols="12" sm="6" class="py-2">
                  <v-text-field v-model="perfil.nombre" label="Nombre" prepend-inner-icon="mdi-account-outline"
                    variant="outlined" density="comfortable" rounded="lg" :rules="[reglas.required]"
                    hide-details="auto" :disabled="cargando" />
                </v-col>
                <v-col cols="12" sm="6" class="py-2">
                  <v-text-field v-model="perfil.apellido" label="Apellido" prepend-inner-icon="mdi-account-outline"
                    variant="outlined" density="comfortable" rounded="lg" :rules="[reglas.required]"
                    hide-details="auto" :disabled="cargando" />
                </v-col>
                <v-col cols="12" class="py-2">
                  <v-text-field v-model="perfil.email_resp" label="Correo Institucional" type="email"
                    prepend-inner-icon="mdi-email-outline" variant="outlined" density="comfortable" rounded="lg"
                    :rules="[reglas.required, reglas.email]" hide-details="auto" :disabled="cargando" />
                </v-col>
                <v-col cols="12" sm="6" class="py-2">
                  <v-text-field :model-value="perfil.cedula" label="Cédula"
                    prepend-inner-icon="mdi-card-account-details-outline" variant="outlined" density="comfortable"
                    rounded="lg" readonly hide-details />
                </v-col>
                <v-col cols="12" sm="6" class="py-2">
                  <v-text-field :model-value="perfil.departamento" label="Departamento"
                    prepend-inner-icon="mdi-office-building-outline" variant="outlined" density="comfortable"
                    rounded="lg" readonly hide-details />
                </v-col>
              </v-row>

              <div class="d-flex align-center mt-4">
                <v-icon icon="mdi-information-outline" size="14" class="mr-1 text-medium-emphasis" />
                <span class="text-caption text-medium-emphasis">
                  La cédula y el departamento solo pueden ser modificados por un administrador
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Firma -->
        <v-col cols="12" md="5">
          <v-card rounded="lg" elevation="1" class="h-100" :loading="cargando">
            <v-card-item class="pa-5">
              <template #prepend>
                <v-avatar color="primary" variant="tonal" size="56" class="mr-2">
                  <v-icon icon="mdi-draw-pen" />
                </v-avatar>
              </template>
              <v-card-title class="font-weight-bold">Firma</v-card-title>
              <v-card-subtitle>Aparece en los memorandos que generas</v-card-subtitle>
            </v-card-item>

            <v-divider />

            <v-card-text class="pa-5">
              <!-- Vista previa sobre fondo blanco, como se verá en el documento -->
              <div class="firma-preview rounded-lg mb-2">
                <v-img v-if="firmaMostrada" :src="firmaMostrada" :alt="`Firma de ${perfil.nombre}`" contain
                  max-height="180" />
                <div v-else class="d-flex flex-column align-center justify-center text-grey-darken-1 py-8">
                  <v-icon icon="mdi-signature-freehand" size="40" class="mb-2" />
                  <span class="text-caption">Sin firma registrada</span>
                </div>
              </div>

              <div class="d-flex align-center justify-space-between mb-4" style="min-height: 32px;">
                <v-chip v-if="firmaNueva" color="warning" variant="tonal" size="small" prepend-icon="mdi-alert-outline">
                  Nueva firma sin guardar
                </v-chip>
                <v-chip v-else-if="perfil.firma" color="success" variant="tonal" size="small"
                  prepend-icon="mdi-check-circle-outline">
                  Firma actual
                </v-chip>
                <v-btn v-if="firmaNueva" variant="text" size="small" color="error" prepend-icon="mdi-undo"
                  class="text-none" @click="descartarFirma">
                  Descartar
                </v-btn>
              </div>

              <v-file-input v-model="archivoFirma" label="Subir nueva firma" accept="image/*"
                prepend-icon="" prepend-inner-icon="mdi-image-outline" variant="outlined" density="comfortable"
                rounded="lg" :disabled="cargando" hint="Usa una imagen con fondo blanco o transparente"
                persistent-hint @update:model-value="obtenerFirma" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Acciones -->
      <v-row justify="end" class="mt-2">
        <v-col cols="12" sm="auto">
          <v-btn block color="error" variant="tonal" prepend-icon="mdi-close-circle-outline" rounded="lg"
            :disabled="!hayCambios || guardando" @click="descartarCambios">
            Descartar cambios
          </v-btn>
        </v-col>
        <v-col cols="12" sm="auto">
          <v-btn block type="submit" color="primary" variant="flat" prepend-icon="mdi-content-save-outline"
            rounded="lg" :loading="guardando" :disabled="!hayCambios || cargando">
            Guardar cambios
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<style scoped>
.firma-preview {
  background: #fff;
  border: 1px dashed rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 12px;
}
</style>
