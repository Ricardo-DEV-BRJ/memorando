<script setup>
const cedula = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const cargando = ref(false)
const formRef = ref(null)
const errorMsg = ref('')

const router = useRouter()

const rules = {
  required: (v) => !!v || 'Este campo es obligatorio',
  minLength: (v) => (v && v.length >= 6) || 'Mínimo 6 caracteres',
}

async function iniciarSesion() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  cargando.value = true
  errorMsg.value = ''

  try {
    const res = await apiCall('auth/login', { cedula: cedula.value, clave: password.value }, 'POST')
    if (res.status === 200 || res.status === 201) {
      const token = res.data.token
      if (token) {
        document.cookie = `token=${token}; path=/`
      }
      toast.success(res.data.message || '¡Bienvenido!')
      router.push('/')
    } else {
      errorMsg.value = res.data?.message || 'Credenciales incorrectas'
    }
  } catch (err) {
    console.error(err)
    if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
      errorMsg.value = err.response?.data?.message || 'Usuario o contraseña incorrectos'
    } else {
      errorMsg.value = 'Error al conectar con el servidor'
    }
  } finally {
    cargando.value = false
  }
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
              <v-avatar color="primary" size="72" class="mb-4 login-avatar">
                <v-icon icon="mdi-shield-key" size="36" />
              </v-avatar>
              <h1 class="text-h5 font-weight-bold">Bienvenido</h1>
              <p class="text-body-2 text-medium-emphasis mt-1 text-center">
                Sistema de Memorandos UVM
              </p>
            </div>

            <!-- Card principal -->
            <v-card rounded="xl" elevation="4">
              <v-card-text class="pa-6">
                <v-form ref="formRef" @submit.prevent="iniciarSesion" validate-on="submit">

                  <v-text-field v-model="cedula" label="Cédula" prepend-inner-icon="mdi-card-account-details-outline"
                    variant="outlined" density="comfortable" class="mb-3" :rules="[rules.required]" hide-details="auto"
                    placeholder="Ingresa tu cédula" autocomplete="username" rounded="lg" />

                  <v-text-field v-model="password" label="Contraseña" prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="mostrarPassword = !mostrarPassword"
                    :type="mostrarPassword ? 'text' : 'password'" variant="outlined" density="comfortable"
                    :rules="[rules.required]" hide-details="auto" placeholder="Ingresa tu contraseña"
                    autocomplete="current-password" rounded="lg" />

                  <!-- Alerta de error -->
                  <v-slide-y-transition>
                    <v-alert v-if="errorMsg" type="error" variant="tonal" density="compact" class="mt-3" rounded="lg"
                      :text="errorMsg" />
                  </v-slide-y-transition>

                  <!-- Botón de ingreso -->
                  <v-btn type="submit" color="primary" size="large" block rounded="lg" class="mt-5" :loading="cargando"
                    variant="flat" prepend-icon="mdi-login">
                    Iniciar sesión
                  </v-btn>
                </v-form>
              </v-card-text>

              <v-divider />

              <v-card-text class="text-center py-3">
                <v-icon icon="mdi-information-outline" size="14" class="mr-1 text-medium-emphasis" />
                <span class="text-caption text-medium-emphasis">
                  Usa tus credenciales asignadas por el administrador
                </span>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.login-avatar {
  animation: avatarPulse 3s ease-in-out infinite;
}

@keyframes avatarPulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0.4);
  }

  50% {
    box-shadow: 0 0 0 10px rgba(var(--v-theme-primary), 0);
  }
}
</style>
