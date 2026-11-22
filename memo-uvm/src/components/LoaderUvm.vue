<script setup>
import '../styles/loader.css'
import animacion from '../assets/uvm-loader.svg'
</script>

<template>
  <v-col id="uvm-loader" class="d-flex flex-column justify-center align-center" cols="12">
    <img :src="animacion" alt="Cargando..." width="270" />
    <div class="uvm-label">Cargando<i>.</i><i>.</i><i>.</i></div>
  </v-col>
</template>