<script setup>

const panel = ref([])
const responsablesFormRef = ref(null);
const headers = [
  { key: 'nombre', title: 'Nombre completo', sortable: false },
  { key: 'cedula', title: 'Cedula', sortable: false },
  { key: 'firma', title: 'Firma', sortable: false },
  { key: 'eliminado', title: 'Estado', sortable: false },
  { key: 'acciones', title: 'Opciones', sortable: false },
]
const resp = ref([])

function cargaInicial() {
  apiCall('responsables')
    .then((res) => {
      resp.value = res.data.users
    })

}

function abrirFormulario() {
  responsablesFormRef.value.abrir();
}

onMounted(() => {
  cargaInicial()
})

</script>

<template>
  <v-container>
    <h1>Panel de control</h1>
    <v-card subtitle="Opciones de agregar">
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-btn color="primary" @click="abrirFormulario">Agregar Responsable</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-col class="py-3">
      <v-expansion-panels v-model="panel" multiple>
        <v-expansion-panel title="Responsables">
          <v-expansion-panel-text class="bg-background">
            <v-data-table :headers="headers" :items="resp">
              <template v-slot:item.nombre="{ item }">
               {{ item.nombre }} {{ item.apellido }}
              </template>
              <template v-slot:item.firma="{ item }">
               <v-img v-if="item.firma" :src="item.firma" max-width="150" max-height="60" contain alt="Firma"></v-img>
                <span v-else class="text-caption grey--text">Sin firma</span>
              </template>
              <template v-slot:item.eliminado="{ item }">
                <v-chip :color="item.eliminado == 0 ? 'error': 'success'">
                  {{ item.eliminado == 1 ? 'Activo' : 'Inactivo ' }}
                </v-chip>
              </template>
              <template v-slot:item.acciones="{ item }">
                <v-btn icon="mdi-pencil" variant="tonal" size="small" color="primary" @click="responsablesFormRef.abrir(item)">
                </v-btn>
                <v-btn icon="mdi-delete" variant="tonal" size="small" color="error" @click="responsablesFormRef.abrir(item)">
                </v-btn>
              </template>
            </v-data-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel title="Equipos">
          <v-expansion-panel-text class="bg-background">
            <v-table density="compact">
              <thead>
                <tr>
                  <th>
                    Nombre completo
                  </th>
                  <th>
                    Cedula
                  </th>
                  <th>
                    Firma
                  </th>
                  <th>
                    Estado
                  </th>
                </tr>
              </thead>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-container>
  <responsables-form ref="responsablesFormRef" />
</template>
