<script setup>
const claveActual = ref('')
const claveNueva = ref('')
const claveConfirmar = ref('')
const mostrarActual = ref(false)
const mostrarNueva = ref(false)
const mostrarConfirmar = ref(false)
const cargando = ref(false)
const formRef = ref(null)
const errorMsg = ref('')

const router = useRouter()
const nombre = decodeToken()?.nombre || ''

const rules = {
  required: (v) => !!v || 'Este campo es obligatorio',
  minLength: (v) => (v && v.length >= 6) || 'Mínimo 6 caracteres',
  distinta: (v) => v !== claveActual.value || 'Debe ser diferente a la contraseña actual',
  coincide: (v) => v === claveNueva.value || 'Las contraseñas no coinciden',
}

const requisitos = computed(() => [
  { texto: 'Mínimo 6 caracteres', cumple: claveNueva.value.length >= 6 },
  { texto: 'Diferente a la contraseña actual', cumple: !!claveNueva.value && claveNueva.value !== claveActual.value },
  { texto: 'Las contraseñas coinciden', cumple: !!claveConfirmar.value && claveConfirmar.value === claveNueva.value },
])

async function cambiarClave() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  cargando.value = true
  errorMsg.value = ''

  try {
    const res = await apiCall('auth/cambiar-clave', { clave_actual: claveActual.value, clave_nueva: claveNueva.value }, 'PUT')
    if (res.status === 200) {
      // El backend devuelve un token nuevo sin el cambio de contraseña pendiente
      const token = res.data.token
      if (token) {
        document.cookie = `token=${token}; path=/`
      }
      toast.success(res.data.message || 'Contraseña actualizada con éxito')
      router.push('/')
    } else {
      errorMsg.value = res.data?.message || 'No se pudo cambiar la contraseña'
    }
  } catch (err) {
    console.error(err)
    if (err.response?.status === 400 || err.response?.status === 404) {
      errorMsg.value = err.response?.data?.message || 'No se pudo cambiar la contraseña'
    } else {
      errorMsg.value = 'Error al conectar con el servidor'
    }
  } finally {
    cargando.value = false
  }
}

function cerrarSesion() {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  router.push('/login')
}
</script>

<template>
  <v-app>
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row justify="center" align="center" class="fill-height">
          <v-col cols="12" sm="8" md="5" lg="4" xl="3">

            <!-- Ícono centrado arriba de la card -->
            <div class="d-flex flex-column align-center mb-6">
              <v-avatar color="warning" size="72" class="mb-4 clave-avatar">
                <v-icon icon="mdi-lock-reset" size="36" />
              </v-avatar>
              <h1 class="text-h5 font-weight-bold">Cambia tu contraseña</h1>
              <p class="text-body-2 text-medium-emphasis mt-1 text-center">
                <template v-if="nombre">Hola {{ nombre }}, por</template>
                <template v-else>Por</template>
                seguridad debes establecer una nueva contraseña antes de continuar
              </p>
            </div>

            <!-- Card principal -->
            <v-card rounded="xl" elevation="4">
              <v-card-text class="pa-6">
                <v-form ref="formRef" @submit.prevent="cambiarClave" validate-on="submit">

                  <v-text-field v-model="claveActual" label="Contraseña actual" prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="mostrarActual ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="mostrarActual = !mostrarActual"
                    :type="mostrarActual ? 'text' : 'password'" variant="outlined" density="comfortable" class="mb-3"
                    :rules="[rules.required]" hide-details="auto" placeholder="Ingresa tu contraseña actual"
                    autocomplete="current-password" rounded="lg" />

                  <v-text-field v-model="claveNueva" label="Nueva contraseña" prepend-inner-icon="mdi-lock-plus-outline"
                    :append-inner-icon="mostrarNueva ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="mostrarNueva = !mostrarNueva"
                    :type="mostrarNueva ? 'text' : 'password'" variant="outlined" density="comfortable" class="mb-3"
                    :rules="[rules.required, rules.minLength, rules.distinta]" hide-details="auto"
                    placeholder="Ingresa tu nueva contraseña" autocomplete="new-password" rounded="lg" />

                  <v-text-field v-model="claveConfirmar" label="Confirmar contraseña"
                    prepend-inner-icon="mdi-lock-check-outline"
                    :append-inner-icon="mostrarConfirmar ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="mostrarConfirmar = !mostrarConfirmar"
                    :type="mostrarConfirmar ? 'text' : 'password'" variant="outlined" density="comfortable"
                    :rules="[rules.required, rules.coincide]" hide-details="auto"
                    placeholder="Repite tu nueva contraseña" autocomplete="new-password" rounded="lg" />

                  <!-- Requisitos de la nueva contraseña -->
                  <div class="mt-4">
                    <div v-for="item in requisitos" :key="item.texto" class="d-flex align-center mb-1">
                      <v-icon :icon="item.cumple ? 'mdi-check-circle' : 'mdi-circle-outline'"
                        :color="item.cumple ? 'success' : undefined" size="16"
                        :class="['mr-2', { 'text-medium-emphasis': !item.cumple }]" />
                      <span :class="['text-caption', item.cumple ? 'text-success' : 'text-medium-emphasis']">
                        {{ item.texto }}
                      </span>
                    </div>
                  </div>

                  <!-- Alerta de error -->
                  <v-slide-y-transition>
                    <v-alert v-if="errorMsg" type="error" variant="tonal" density="compact" class="mt-3" rounded="lg"
                      :text="errorMsg" />
                  </v-slide-y-transition>

                  <!-- Botón de cambio -->
                  <v-btn type="submit" color="primary" size="large" block rounded="lg" class="mt-5" :loading="cargando"
                    variant="flat" prepend-icon="mdi-content-save-outline">
                    Cambiar contraseña
                  </v-btn>
                </v-form>
              </v-card-text>

              <v-divider />

              <v-card-text class="text-center py-2">
                <v-btn variant="text" size="small" color="error" prepend-icon="mdi-logout" class="text-none"
                  @click="cerrarSesion">
                  Cerrar sesión
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.clave-avatar {
  animation: avatarPulse 3s ease-in-out infinite;
}

@keyframes avatarPulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-warning), 0.4);
  }

  50% {
    box-shadow: 0 0 0 10px rgba(var(--v-theme-warning), 0);
  }
}
</style>
