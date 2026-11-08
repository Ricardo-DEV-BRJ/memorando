<script setup>
import { reglas } from '@/utils/rules.js'

const diag = ref(false)
const datos = ref({
  nombre_dep: '',
  email: '',
})
const validado = ref(null)
const editando = ref(false)
const guardando = ref(false)
// Memorandos activos del departamento que se está editando (solo informativo)
const memosActivos = ref(0)

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
    memosActivos.value = 0;
    editando.value = false;
  } else {
    datos.value = {
      id_dep: data.id_dep,
      nombre_dep: data.nombre_dep || '',
      email: data.email || '',
    };
    memosActivos.value = Number(data.memos_activos) || 0;
    editando.value = true;
  }
  guardando.value = false;
  diag.value = true;
}

function cancelar() {
  datos.value = {
    nombre_dep: '',
    email: '',
  };
  cerrar();
}

function datosEnvio() {
  return {
    nombre_dep: datos.value.nombre_dep.trim(),
    email: datos.value.email.trim(),
  };
}

function guardar() {
  if (!validado.value || guardando.value) return;
  const peticion = editando.value
    ? apiCall(`departamentos/${datos.value.id_dep}`, datosEnvio(), 'PUT')
    : apiCall('departamentos/', datosEnvio(), 'POST');

  guardando.value = true;
  peticion
    .then((res) => {
      toast.success(res.data.message || (editando.value ? 'Departamento actualizado con éxito' : 'Departamento creado con éxito'));
      emit('guardado');
      cancelar();
    })
    .catch((err) => {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error al conectar con el servidor');
    })
    .finally(() => {
      guardando.value = false;
    });
}

defineExpose({
  abrir,
  cerrar,
});
</script>

<template>
  <v-dialog v-model="diag" max-width="500px" :persistent="guardando">
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="8" class="text-h6 font-weight-bold">
            {{ editando ? 'Editar departamento' : 'Agregar departamento' }}
          </v-col>
          <v-col cols="4" class="text-right">
            <v-btn color="error" variant="tonal" icon="mdi-close-circle-outline" size="small" :disabled="guardando"
              @click="cancelar"></v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-subtitle>
        <v-icon>
          mdi-office-building-outline
        </v-icon>
        Departamentos
      </v-card-subtitle>
      <v-card-text>
        <v-alert v-if="editando && memosActivos > 0" type="warning" variant="tonal" density="compact" rounded="lg"
          class="mb-4" icon="mdi-lock-outline">
          Tiene {{ memosActivos }} {{ memosActivos === 1 ? 'memorando activo' : 'memorandos activos' }}:
          puedes editar sus datos, pero no eliminarlo.
        </v-alert>
        <v-form v-model="validado" @submit.prevent="guardar">
          <v-row align="center">
            <v-col cols="12" class="py-0">
              <v-text-field label="Nombre del departamento" prepend-inner-icon="mdi-office-building-outline"
                density="compact" v-model="datos.nombre_dep" counter="100" maxlength="100"
                :rules="[reglas.required]"></v-text-field>
            </v-col>
            <v-col cols="12" class="py-0">
              <v-text-field label="Correo electrónico" prepend-inner-icon="mdi-email" density="compact" type="email"
                v-model="datos.email" :rules="[reglas.required, reglas.email]"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="error" prepend-icon="mdi-close-circle-outline" variant="tonal" :disabled="guardando"
          @click="cancelar">Cancelar</v-btn>
        <v-btn color="primary" prepend-icon="mdi-check-circle-outline" variant="tonal" :loading="guardando"
          :disabled="!validado" @click="guardar">
          {{ editando ? 'Actualizar' : 'Agregar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
