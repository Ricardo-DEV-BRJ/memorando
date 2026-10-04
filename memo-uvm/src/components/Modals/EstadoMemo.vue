<script setup>
// Tipo de acción: 'recibir' | 'anular'
const dialog = ref(false)
const accion = ref('recibir')
const memoId = ref(null)
const folio = ref('')
const cargando = ref(false)

const emit = defineEmits(['actualizado'])

// Configuración dinámica según la acción
const config = computed(() => {
  if (accion.value === 'recibir') {
    return {
      color: 'success',
      icon: 'mdi-check-circle-outline',
      titulo: 'Confirmar recepción',
      mensaje: '¿Estás seguro de que deseas marcar este memorando como recibido? Esta acción no se puede deshacer.',
      btnTexto: 'Marcar como recibido',
      btnIcon: 'mdi-check',
      endpoint: `memorandos/recibir/${memoId.value}`,
      toastExito: 'Memorando marcado como recibido correctamente',
    }
  }
  return {
    color: 'error',
    icon: 'mdi-close-circle-outline',
    titulo: 'Anular memorando',
    mensaje: '¿Estás seguro de que deseas anular este memorando? Esta acción no se puede deshacer.',
    btnTexto: 'Anular memorando',
    btnIcon: 'mdi-close',
    endpoint: `memorandos/anular/${memoId.value}`,
    toastExito: 'Memorando anulado correctamente',
  }
})

function abrir(tipo, item) {
  accion.value = tipo
  memoId.value = item.id
  folio.value = item.folio_me || `#${item.id}`
  dialog.value = true
}

function confirmar() {
  cargando.value = true
  apiCall(config.value.endpoint, {}, 'PUT')
    .then((res) => {
      toast.success(res.data.message)
      dialog.value = false
      emit('actualizado')
    })
    .catch((err) => {
      console.error(err)
      toast.error(err.response.data.error)
    })
    .finally(() => {
      cargando.value = false
    })
}

defineExpose({ abrir })
</script>

<template>
  <v-dialog v-model="dialog" max-width="460px" persistent>
    <v-card rounded="xl">

      <!-- Ícono central de confirmación -->
      <v-card-text class="text-center pt-8 pb-2 px-6">
        <v-avatar
          :color="config.color"
          variant="tonal"
          size="72"
          class="mb-4"
        >
          <v-icon :icon="config.icon" size="40" />
        </v-avatar>

        <h2 class="text-h6 font-weight-bold mb-1">{{ config.titulo }}</h2>

        <p class="text-caption text-medium-emphasis mb-1">
          Memorando <strong>{{ folio }}</strong>
        </p>

        <p class="text-body-2 text-medium-emphasis mt-3 mb-0">
          {{ config.mensaje }}
        </p>
      </v-card-text>

      <v-card-actions class="flex-column ga-2 px-6 pb-6 pt-2">
        <!-- Botón de acción principal -->
        <v-btn
          :color="config.color"
          variant="flat"
          :prepend-icon="config.btnIcon"
          :loading="cargando"
          class="w-100"
          @click="confirmar"
        >
          {{ config.btnTexto }}
        </v-btn>

        <!-- Cancelar -->
        <v-btn
          variant="tonal"
          color="grey"
          class="w-100"
          :disabled="cargando"
          @click="dialog = false"
        >
          Cancelar
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>
