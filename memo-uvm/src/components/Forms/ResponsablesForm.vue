<script setup>
import { imagenABase64Optimizado } from '@/utils/imagen.js'
import {reglas} from '@/utils/rules.js'
const diag = ref(false)
const datos = ref({
  nombre: '',
  apellido: '',
  cedula: '',
  firma: '',
})
const validado = ref(null)
async function obtenerFirma(e) {
  if (e) {
    try {
      const base64 = await imagenABase64Optimizado(e, 600, 0.76);
      datos.value.firma = base64;
    } catch (error) {
      console.error('Error al convertir la imagen a Base64:', error);
      datos.value.firma = '';
    }
  } else {
    datos.value.firma = '';
  }
}

const firmaBase64 = computed(() => {
  return datos.value.firma;
})


function cerrar() {
  diag.value = false;
}

function abrir(data = {}) {
  datos.value = data;
  diag.value = true;
}

function cancelar() {
  datos.value = {
    nombre: '',
    apellido: '',
    cedula: '',
    firma: '',
  }
  cerrar();
}

async function agregar() {
  apiCall('responsables', datos.value, 'POST')
  .then((res)=>{
    console.log(res)
  }).catch((err)=>{
    console.log(err)
  })
}

defineExpose({
  abrir,
  cerrar
})
</script>

<template>
  <v-dialog v-model="diag" max-width="500px">
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="8" class="text-h6 font-weight-bold">
            Agregar
          </v-col>
          <v-col cols="4" class="text-right">
            <v-btn color="error" variant="tonal" icon="mdi-close-circle-outline" size="small" @click="cancelar"></v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-subtitle>
        <v-icon>
          mdi-account-group
        </v-icon>
        Responsables del departamento
      </v-card-subtitle>
      <v-card-text>
        <v-form v-model="validado" lazy-validation>
          <v-row align="center">
            <v-col cols="12" sm="6" class="py-0">
              <v-text-field label="Nombre" prepend-inner-icon="mdi-account" density="compact"
                v-model="datos.nombre" :rules="[reglas.required]"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" class="py-0">
              <v-text-field label="Apellido" prepend-inner-icon="mdi-account" density="compact"
                v-model="datos.apellido" :rules="[reglas.required]"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" class="py-0">
              <v-text-field label="Cedula" prepend-inner-icon="mdi-card-account-details" density="compact"
                v-model="datos.cedula" :rules="[reglas.positive, reglas.required]" type="number" min='0'></v-text-field>
            </v-col>
            <v-col cols="12" class="py-0">
              <v-file-input label="Firma" density="compact" @update:model-value="obtenerFirma"></v-file-input>
            </v-col>
            <transition name="fade">
              <v-col cols="12" class="d-flex justify-center" v-if="datos.firma">
                <v-col cols="12" sm="6">
                  <v-img :src="firmaBase64" :alt="datos.nombre" />
                </v-col>
              </v-col>
            </transition>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="error" prepend-icon="mdi-close-circle-outline" variant="tonal" @click="cancelar">Cancelar</v-btn>
        <v-btn color="primary" prepend-icon="mdi-check-circle-outline" variant="tonal" @click="agregar" :disabled="!validado">Agregar</v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>