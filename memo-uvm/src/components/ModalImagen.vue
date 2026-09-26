<script setup>
const imagD = ref(false)
const dataImagen = ref({})

function verImagen(item) {
    dataImagen.value = {
        img: item.imagen ? item.imagen : item.firma,
        nombre: item.nombre
    }
    imagD.value = true
}

defineExpose({
    verImagen,
})
</script>
<template>
    <!-- Modal ver imagen -->
    <v-dialog v-model="imagD" :max-width="$vuetify.display.smAndUp ? '500px' : '90%'">
        <v-card>
            <v-card-item>
                <v-row justify="end">
                    <v-col cols="auto">
                        <v-btn icon="mdi-close" variant="tonal" size="small" color="error"
                            @click="imagD = false"></v-btn>
                    </v-col>
                </v-row>
            </v-card-item>
            <v-card-text>
                <v-img class="rounded-lg" :src="dataImagen.img" :alt="dataImagen.nombre" v-if="dataImagen">
                </v-img>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>