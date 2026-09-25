<script setup>
import { useToastState, toast } from '@/composables/useToast'

const toastState = useToastState()
</script>

<template>
  <v-snackbar
    v-model="toastState.show"
    :color="toastState.color"
    :timeout="toastState.timeout"
    location="top right"
    elevation="4"
    rounded="lg"
  >
    <div class="d-flex align-center">
      <v-icon v-if="toastState.icon" class="mr-2">{{ toastState.icon }}</v-icon>
      <span class="font-weight-medium">{{ toastState.message }}</span>
    </div>

    <template #actions>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        density="comfortable"
        @click="toast.hide()"
      ></v-btn>
    </template>
  </v-snackbar>
</template>
