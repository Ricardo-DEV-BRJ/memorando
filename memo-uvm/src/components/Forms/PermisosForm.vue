<script setup>
import { reglas } from '@/utils/rules.js'
const diag = ref(false)
const datos = ref({
})
const validado = ref(null)
const emit = defineEmits(['guardado']);

function cerrar() {
  diag.value = false;
}

function abrir(data = {}) {
  datos.value = { ...data }
  diag.value = true;
}

function cancelar() {
  datos.value = {}
  cerrar();
}

const permisosUser = [
  { title: 'Responsable', value: '2', subtitle: 'Sera responsable de los memorando generados' },
  { title: 'Administrador', value: '1', subtitle: 'Tendra acceso total al sistema' },
  { title: 'Becado', value: '0', subtitle: 'Podra generar memorandos pero no estar acargo de ellos' },
]

async function agregar() {
  apiCall(`auth/permisos/${datos.value.id}`, { permisos: datos.value.permisos }, 'PUT')
    .then((res) => {
      if (res.status === 200 || res.status === 201) {
        toast.success(res.data.message);
        cancelar();
        emit('guardado');
      } else {
        toast.error('Ocurrió un error al agregar');
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error(err.response?.data?.message);
    });
}

const listaPermisos = (item) => {
  return {
    title: item.title,
    value: item.value,
    subtitle: item.subtitle,
  }
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
            Asignar permiso
          </v-col>
          <v-col cols="4" class="text-right">
            <v-btn color="error" variant="tonal" icon="mdi-close-circle-outline" size="small" @click="cancelar"></v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-subtitle>
        <v-icon>
          mdi-account-switch
        </v-icon>
        Cambiar el rol del usuario
      </v-card-subtitle>
      <v-card-text>
        <v-form v-model="validado" lazy-validation>
          <v-row align="center">
            <v-col cols="12" class="py-0">
              <v-select label="Rol" prepend-inner-icon="mdi-account-switch" density="compact"
                v-model="datos.permisos" :rules="[reglas.required]" :items="permisosUser" item-title="title"
                item-value="value" :item-props="listaPermisos">
              </v-select>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="error" prepend-icon="mdi-close-circle-outline" variant="tonal" @click="cancelar">Cancelar</v-btn>
        <v-btn color="primary" prepend-icon="mdi-check-circle-outline" variant="tonal" @click="agregar"
          :disabled="!validado">Asignar</v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>