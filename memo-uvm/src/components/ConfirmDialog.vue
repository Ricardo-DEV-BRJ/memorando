<script setup>
import { ref } from 'vue'

const emit = defineEmits(['confirmar'])

const visible = ref(false)
const loading = ref(false)
const itemData = ref(null)
const config = ref({
  titulo: '¿Eliminar elemento?',
  mensaje: '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
  textoBoton: 'Eliminar',
  colorBoton: 'error',
  icono: 'mdi-alert-circle-outline',
})

function abrir(item = null, opciones = {}) {
  itemData.value = item
  config.value = {
    titulo: opciones.titulo || '¿Eliminar elemento?',
    mensaje: opciones.mensaje || '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
    textoBoton: opciones.textoBoton || 'Eliminar',
    colorBoton: opciones.colorBoton || 'error',
    icono: opciones.icono || 'mdi-alert-circle-outline',
  }
  loading.value = false
  visible.value = true
}

function cerrar() {
  visible.value = false
  loading.value = false
}

function setCargando(estado = true) {
  loading.value = estado
}

function confirmar() {
  emit('confirmar', itemData.value)
}

defineExpose({
  abrir,
  cerrar,
  setCargando,
})
</script>

<template>
  <v-dialog v-model="visible" max-width="450px" persistent>
    <v-card class="pa-3 rounded-lg">
      <v-card-title class="d-flex align-center text-h6 font-weight-bold">
        <v-avatar :color="config.colorBoton" variant="tonal" size="40" class="mr-3">
          <v-icon :icon="config.icono" size="24"></v-icon>
        </v-avatar>
        <span>{{ config.titulo }}</span>
      </v-card-title>

      <v-card-text class="pt-3 text-body-1 text-medium-emphasis">
        {{ config.mensaje }}
      </v-card-text>

      <v-card-actions class="justify-end pt-4">
        <v-btn
          variant="tonal"
          color="grey-darken-1"
          @click="cerrar"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-btn
          :color="config.colorBoton"
          variant="flat"
          @click="confirmar"
          :loading="loading"
          prepend-icon="mdi-delete"
        >
          {{ config.textoBoton }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
