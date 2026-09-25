<script setup>
import { imagenABase64Cuadrada } from '@/utils/imagen.js'
import { reglas } from '@/utils/rules.js'
const diag = ref(false)
const datos = ref({
    nombre: '',
    serial: '',
    imagen: '',
    estado: '',
})
const validado = ref(null)
const editando = ref(false)
async function obtenerFoto(e) {
    if (e) {
        try {
            const base64 = await imagenABase64Cuadrada(e, 600, 0.76);
            datos.value.imagen = base64;
        } catch (error) {
            console.error('Error al convertir la imagen a Base64:', error);
            datos.value.imagen = '';
        }
    } else {
        datos.value.imagen = '';
    }
}

const imagenBase64 = computed(() => {
    return datos.value.imagen;
})


const emit = defineEmits(['guardado']);

function cerrar() {
    diag.value = false;
}

function abrir(data = {}) {
    if (Object.keys(data).length === 0) {
        datos.value = {
            nombre: '',
            serial: '',
            imagen: '',
            descripcion: '',
            estado: '',
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
        serial: '',
        imagen: '',
        descripcion: '',
        estado: '',
    };
    cerrar();
}

async function agregar() {
    apiCall('equipos/', datos.value, 'POST')
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
    apiCall(`equipos/${datos.value.id}`, datos.value, 'PUT')
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
                        <v-btn color="error" variant="tonal" icon="mdi-close-circle-outline" size="small"
                            @click="cancelar"></v-btn>
                    </v-col>
                </v-row>
            </v-card-title>
            <v-card-subtitle>
                <v-icon>
                    mdi-desk-lamp
                </v-icon>
                Equipos del departamento
            </v-card-subtitle>
            <v-card-text>
                <v-form v-model="validado" lazy-validation>
                    <v-row align="center">
                        <v-col cols="12" sm="6" class="py-0">
                            <v-text-field label="Nombre" prepend-inner-icon="mdi-monitor" density="compact"
                                v-model="datos.nombre" :rules="[reglas.required]"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" class="py-0">
                            <v-text-field label="Serial" prepend-inner-icon="mdi-barcode" density="compact"
                                v-model="datos.serial" :rules="[reglas.required]"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" class="py-0">
                            <v-select label="Estado" prepend-inner-icon="mdi-check-circle-outline" density="compact"
                                v-model="datos.estado" :rules="[reglas.required]" :items="['Disponible', 'Dañado', 'Mantenimiento']">
                            </v-select>
                        </v-col>
                        <v-col cols="12" class="py-0">
                            <v-textarea label="Descripción" prepend-inner-icon="mdi-text-box" density="compact"
                                v-model="datos.descripcion" :rules="[reglas.required]" rows="2" no-resize>
                            </v-textarea>
                        </v-col>
                        <v-col cols="12" class="py-0">
                            <v-file-input label="Foto" density="compact"
                                @update:model-value="obtenerFoto"></v-file-input>
                            <v-card-subtitle v-if="editando">
                                Solo agregaras una foto si deseas actualizar la imagen
                            </v-card-subtitle>
                        </v-col>
                        <transition name="fade">
                            <v-col cols="12" class="d-flex justify-center" v-if="datos.imagen">
                                <v-col cols="12" sm="6">
                                    <v-img :src="imagenBase64" :alt="datos.nombre" />
                                </v-col>
                            </v-col>
                        </transition>
                    </v-row>
                </v-form>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn color="error" prepend-icon="mdi-close-circle-outline" variant="tonal"
                    @click="cancelar">Cancelar</v-btn>
                <v-btn color="primary" prepend-icon="mdi-check-circle-outline" variant="tonal" @click="agregar"
                    :disabled="!validado" v-if="!editando">Agregar</v-btn>
                <v-btn color="primary" prepend-icon="mdi-check-circle-outline" variant="tonal" @click="actualizar"
                    :disabled="!validado" v-else>Actualizar</v-btn>
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