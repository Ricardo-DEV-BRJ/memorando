import axios from 'axios';
import router from '@/router';
import { borrarToken, tokenVigente } from '@/utils/decode.js';
import { toast } from '@/composables/useToast.js';

let redirigiendo = false

// El backend rechazó el token (vencido, inválido o inexistente): se borra la cookie y se envía al login una sola vez,
// aunque varias peticiones fallen al mismo tiempo.
function sesionInvalida() {
    borrarToken()
    if (redirigiendo || router.currentRoute.value.path === '/login') return
    redirigiendo = true
    toast.warning('Tu sesión expiró, inicia sesión nuevamente')
    router.push('/login').finally(() => {
        redirigiendo = false
    })
}

export async function apiCall(endpoint, data = {}, method = 'GET') {
    const url = import.meta.env.VITE_API_URL + endpoint;
    // Un token vencido no se envía: se elimina antes de hacer la petición
    const token = tokenVigente();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    try {
        const res = await axios.request({
            url,
            method,
            headers,
            data: data ? data : {},
            withCredentials: true
        });
        if (res.data?.access === false) {
            sesionInvalida()
        }
        return res
    } catch (error) {
        console.log(error)
        if (error.response?.data?.access === false) {
            sesionInvalida()
        }
        throw error
    }
}
