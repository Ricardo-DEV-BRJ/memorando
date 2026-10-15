<script setup>
const diag = ref(false)
const datos = ref({
  nombre_dep: '',
  email: '',
})
const validado = ref(null)
const editando = ref(false)

const emit = defineEmits(['guardado']);

function cerrar() {
  diag.value = false;
}

function abrir(data = {}) {
  if (Object.keys(data).length === 0) {
    datos.value = {
      nombre_dep: '',
      email: '',
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
    nombre_dep: '',
    email: '',
  };
  cerrar();
}

async function agregar() {
  apiCall('departamentos/', datos.value, 'POST')
    .then((res) => {
      if (res.status === 200 || res.status === 201) {
        toast.success(res.data.message);
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
  apiCall(`departamentos/${datos.value.id_dep}`, datos.value, 'PUT')
    .then((res) => {
      if (res.status === 200 || res.status === 201) {
        toast.success(res.data.message);
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
          mdi-factory
        </v-icon>
        Departamentos
      </v-card-subtitle>
      <v-card-text>
        <v-form v-model="validado" lazy-validation>
          <v-row align="center">
            <v-col cols="12" class="py-0">
              <v-text-field label="Nombre del departamento" prepend-inner-icon="mdi-monitor" density="compact"
                v-model="datos.nombre_dep" :rules="[reglas.required]"></v-text-field>
            </v-col>
            <v-col cols="12" class="py-0">
              <v-text-field label="Correo electrónico" prepend-inner-icon="mdi-email" density="compact"
                v-model="datos.email" :rules="[reglas.required]"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="error" prepend-icon="mdi-close-circle-outline" variant="tonal" @click="cancelar">Cancelar</v-btn>
        <v-btn color="primary" prepend-icon="mdi-check-circle-outline" variant="tonal" @click="agregar"
          :disabled="!validado" v-if="!editando">Agregar</v-btn>
        <v-btn color="primary" prepend-icon="mdi-check-circle-outline" variant="tonal" @click="actualizar"
          :disabled="!validado" v-else>Actualizar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>