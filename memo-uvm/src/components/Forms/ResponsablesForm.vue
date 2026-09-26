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
const editando = ref(false)
async function obtenerFirma(e) {
  if (e) {
    try {
      const base64 = await imagenABase64Optimizado(e, 600, 0.76, 'image/png');
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


const emit = defineEmits(['guardado']);

function cerrar() {
  diag.value = false;
}

function abrir(data = {}) {
  if (Object.keys(data).length === 0) {
    datos.value = {
      nombre: '',
      apellido: '',
      cedula: '',
      firma: '',
    };
    editando.value = false;
  } else {
    datos.value = { ...data };
    editando.value = true;
  }
  diag.value = true;
}

function cancelar() {
  datos.value = {
    nombre: '',
    apellido: '',
    cedula: '',
    firma: '',
  };
  cerrar();
}

async function agregar() {
  apiCall('responsables/', datos.value, 'POST')
    .then((res) => {
      if (res.status === 200 || res.status === 201) {
        toast.success('Responsable agregado exitosamente');
        emit('guardado');
        cancelar();
      } else {
        toast.error('Ocurrió un error al agregar');
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error('Error al conectar con el servidor');
    });
}

async function actualizar() {
  apiCall(`responsables/${datos.value.id}`, datos.value, 'PUT')
    .then((res) => {
      if (res.status === 200 || res.status === 201) {
        toast.success('Responsable actualizado exitosamente');
        emit('guardado');
        cancelar();
      } else {
        toast.error('Ocurrió un error al actualizar');
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error('Error al conectar con el servidor');
    });
}

defineExpose({
  abrir,
  cerrar,
});
</script>

<template>
  <v-dialog v-model="diag" max-width="500px">
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="8" class="text-h6 font-weight-bold">
            {{ editando ? 'Editar' : 'Agregar' }}
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
              <v-card-subtitle v-if="editando">
                Solo agregaras una foto si deseas actualizar la firma
              </v-card-subtitle>
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
        <v-btn color="primary" prepend-icon="mdi-check-circle-outline" variant="tonal" @click="agregar" :disabled="!validado" v-if="!editando">Agregar</v-btn>
        <v-btn color="primary" prepend-icon="mdi-check-circle-outline" variant="tonal" @click="actualizar" :disabled="!validado" v-else>Actualizar</v-btn>
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