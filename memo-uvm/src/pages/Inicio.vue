<script setup>
import { computed, ref } from 'vue';
import { imagenABase64Optimizado } from '../utils/imagen.js'

const datos = ref({
    nombre: '',
    apellido: '',
    cedula: '',
    firma: '',
})

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

</script>

<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h1>Inicio</h1>
            </v-col>
            <v-card>
                <v-card-title>
                    <v-row align="center">
                        <v-col cols="8" class="text-h6 font-weight-bold">
                            Agregar
                        </v-col>
                        <v-col cols="4" class="text-right">
                            <v-btn color="error" variant="tonal" icon="mdi-close-circle-outline" size="small"></v-btn>
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-card-subtitle>
                    Responsables del departamento
                </v-card-subtitle>
                <v-card-text>
                    <v-form>
                        <v-row align="center">
                            <v-col cols="12" sm="6" class="py-0">
                                <v-text-field label="Nombre" prepend-inner-icon="mdi-account" density="compact"
                                    v-model="datos.nombre"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" class="py-0">
                                <v-text-field label="Apellido" prepend-inner-icon="mdi-account" density="compact"
                                    v-model="datos.apellido"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" class="py-0">
                                <v-text-field label="Cedula" prepend-inner-icon="mdi-card-account-details"
                                    density="compact" v-model="datos.cedula"></v-text-field>
                            </v-col>
                            <v-col cols="12" class="py-0">
                                <v-file-input label="Firma" density="compact"
                                    @update:model-value="obtenerFirma"></v-file-input>
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
                    <v-btn color="error" prepend-icon="mdi-close-circle-outline" variant="tonal">Cancelar</v-btn>
                    <v-btn color="primary" prepend-icon="mdi-check-circle-outline" variant="tonal">Agregar</v-btn>
                </v-card-actions>
            </v-card>
        </v-row>
    </v-container>

</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>