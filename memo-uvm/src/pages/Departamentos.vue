<script setup>
import DepartamentosForm from '@/components/Forms/DepartamentosForm.vue'


const departamentos = ref([])
const cargando = ref(false)
const tokenUser = ref('')
const lista = ref(null)
const departamentosForm = ref(null)
const confirmDialogRef = ref(null);

function cargaInicial() {
  apiCall('departamentos/')
    .then((res) => {
      departamentos.value = res.data.data
    })
    .catch((err) => {
      toast.error(err.response.data.error)
    })
}

function abrirFormularioLista(tipo) {
  lista.value.abrir(tipo);
}

function abrirEliminarDepa(item) {
  confirmDialogRef.value.abrir(item, {
    titulo: 'Eliminar Departamento',
    mensaje: `¿Estás seguro de que deseas eliminar el departamento de ${item.nombre_dep}?`,
    textoBoton: 'Eliminar',
  })
}

function eliminarDepartamento(item) {
  confirmDialogRef.value.setCargando(true)
  apiCall(`departamentos/${item.id_dep}`, {}, 'DELETE')
    .then((res) => {
      if (res.status === 200 || res.status === 204) {
        toast.success(res.data.message);
        confirmDialogRef.value.cerrar();
        cargaInicial()
      } else {
        toast.error('Ocurrió un error al eliminar');
      }
    })
    .catch((err) => {
      toast.error('Error al conectar con el servidor');
    });
}

onMounted(() => {
  cargaInicial()
  tokenUser.value = decodeToken()
})
</script>

<template>
  <v-container>
    <v-row align="center" class="mb-4">
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold">Gestión de departamentos</h1>
      </v-col>
      <v-col cols="12" sm="6" md="auto">
        <v-btn color="primary" prepend-icon="mdi-account-plus" @click="departamentosForm.abrir()">Agregar
          Departamento</v-btn>
      </v-col>
      <v-col cols="12" sm="6" md="auto">
        <v-btn color="primary" prepend-icon="mdi-view-list" @click="abrirFormularioLista('departamentos')">
          Agregar varios departamentos
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" v-for="d in departamentos" :key="d.id_dep">
        <v-card rounded="lg" elevation="1" :title="d.nombre_dep" :subtitle="d.email">
          <v-card-actions>
            <v-btn color="primary" prepend-icon="mdi-pencil" @click="departamentosForm.abrir(d)">Editar</v-btn>
            <v-btn color="error" prepend-icon="mdi-delete" @click="abrirEliminarDepa(d)">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <confirm-dialog ref="confirmDialogRef" @confirmar="eliminarDepartamento" />
  <listas-agregar-form ref="lista" @guardado="cargaInicial" />
  <departamentos-form ref="departamentosForm" @guardado="cargaInicial" />
</template>
