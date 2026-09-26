<template>
  <v-app>
    <!-- Barra de navegación para rutas autenticadas -->
    <NavBar v-if="mostrarNavbar" />

    <v-main>
      <!-- Botón de tema flotante solo en el login -->
      <BotonTema v-if="!mostrarNavbar" />
      <router-view />
    </v-main>
    <AppToast />
  </v-app>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mostrarNavbar = computed(() => route.path !== '/login')
</script>

