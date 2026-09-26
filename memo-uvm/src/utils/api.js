import axios from 'axios';
import router from '@/router';


export async function apiCall(endpoint, data = {}, method = 'GET') {
    return new Promise((resolve, reject) => {
        const url = import.meta.env.VITE_API_URL + endpoint;
        const token = document.cookie.split(';').find(row => row.startsWith('token='));
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token.split('token=')[1]}` : null
        };
        const options = {
            method,
            headers,
            data: data ? data : {}
        };
        axios.request({
            url,
            ...options
        }).then((res) => {
            if (res.data?.access === false) {
                router.push('/login')
            }
            resolve(res)
        }).catch((error) => {
            console.log(error)
            if (error.response?.data?.access === false) {
                router.push('/login')
            }
            reject(error)
        })
    })
}