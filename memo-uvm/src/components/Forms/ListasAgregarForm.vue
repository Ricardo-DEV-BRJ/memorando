<script setup>
import { computed, ref } from 'vue'
import { obtenerDatos } from '@/utils/csv'
const diag = ref(false)
const validado = ref(null)
const tipo = ref('equipos')

const tableData = ref([])
const tableHeaders = ref([])
const cargandoLista = ref(false)
const guardando = ref(false)
// Errores por fila devueltos por el servidor (no se guarda nada si hay alguno)
const erroresArchivo = ref([])

const config = computed(() => {
  if (tipo.value === 'equipos') {
    return {
      title: 'Agregar lista de equipos',
      subtitle: 'Equipos del departamento',
      icon: 'mdi-desk-lamp',
      endpoint: 'equipos/lista-equipos',
    }
  } else if (tipo.value === 'responsables') {
    return {
      title: 'Agregar lista de personal',
      subtitle: 'Personal del departamento',
      icon: 'mdi-account-group-outline',
      endpoint: 'responsables/lista-personal',
      plantilla: '/plantillas/plantilla_usuarios.xlsx',
    }
  } else if (tipo.value === 'departamentos') {
    return {
      title: 'Agregar lista de departamentos',
      subtitle: 'Departamentos',
      icon: 'mdi-office-building-outline',
      endpoint: 'departamentos/lista-departamentos',
      plantilla: '/plantillas/plantilla_departamentos.xlsx',
    }
  } else {
    return {
      title: 'Agregar lista de equipos',
      subtitle: 'Equipos del departamento',
      icon: 'mdi-desk-lamp',
      endpoint: 'equipos/lista-equipos',
    }
  }
})

async function cargarLista(event) {
  erroresArchivo.value = []
  cargandoLista.value = true
  await obtenerDatos(event)
    .then(res => {
      tableData.value = res.data
      tableHeaders.value = res.headers
    })
    .catch(err => {
      console.error(err)
      toast.error('Error al cargar la lista')
    })
    .finally(() => {
      cargandoLista.value = false
    })
}

const emit = defineEmits(['guardado']);

function cerrar() {
  diag.value = false;
}

function abrir(type) {
  diag.value = true;
  tipo.value = type;
}

function cancelar() {
  tableData.value = []
  tableHeaders.value = []
  erroresArchivo.value = []
  cerrar();
}

async function agregar() {
  const obj = {
    lista: JSON.stringify(tableData.value)
  }
  erroresArchivo.value = []
  guardando.value = true
  apiCall(config.value.endpoint, obj, 'POST')
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
      erroresArchivo.value = err.response?.data?.errores || []
      toast.error(err.response?.data?.message || 'Error al conectar con el servidor');
    })
    .finally(() => {
      guardando.value = false
    });
}

defineExpose({
  abrir,
  cerrar,
});
</script>

<template>
  <v-dialog v-model="diag" :width="$vuetify.display.smAndDown ? '90%' : '60%'">
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="8" class="text-h6 font-weight-bold text-wrap">
            {{ config.title }}
          </v-col>
          <v-col cols="4" class="text-right">
            <v-btn color="error" variant="tonal" icon="mdi-close-circle-outline" size="small" @click="cancelar"></v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-subtitle class="d-flex flex-wrap align-center ga-2">
        <span>
          <v-icon>
            {{ config.icon }}
          </v-icon>
          {{ config.subtitle }}
        </span>
        <v-spacer />
        <v-btn v-if="config.plantilla" :href="config.plantilla" download variant="text" color="primary" size="small"
          prepend-icon="mdi-microsoft-excel" class="text-none">
          Descargar plantilla
        </v-btn>
      </v-card-subtitle>
      <v-card-text>
        <v-form v-model="validado" lazy-validation>
          <v-row align="center">
            <v-col cols="12" lg="6" class="py-0">
              <v-file-input :label="`Excel de ${config.subtitle}`" @change="cargarLista"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                prepend-icon="mdi-file-excel" outlined dense
                :rules="[v => v != null || 'Campo Requerido']">
              </v-file-input>
            </v-col>
            <v-col cols="12" v-if="erroresArchivo.length">
              <v-alert type="error" variant="tonal" density="compact" rounded="lg"
                :title="`Corrige el archivo (${erroresArchivo.length} ${erroresArchivo.length === 1 ? 'error' : 'errores'})`">
                <ul class="errores-archivo mt-1">
                  <li v-for="(e, i) in erroresArchivo" :key="i">{{ e }}</li>
                </ul>
              </v-alert>
            </v-col>
            <transition name="fade">
              <v-col cols="12" v-if="tableData.length">
                <v-data-table :items="tableData" :headers="tableHeaders" class="border-thin rounded-lg"
                  :mobile="$vuetify.display.smAndDown" hide-default-footer items-per-page>
                </v-data-table>
              </v-col>
            </transition>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="error" prepend-icon="mdi-close-circle-outline" variant="tonal" @click="cancelar">Cancelar</v-btn>
        <v-btn color="primary" prepend-icon="mdi-check-circle-outline" variant="tonal" @click="agregar"
          :disabled="!validado || !tableData.length" :loading="guardando">Agregar</v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>

<style scoped>
.errores-archivo {
  max-height: 180px;
  overflow-y: auto;
  padding-left: 18px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>