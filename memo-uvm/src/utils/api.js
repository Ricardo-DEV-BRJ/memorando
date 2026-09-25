import axios from 'axios';

export async function apiCall(endpoint, data = {}, method = 'GET') {
    return new Promise((resolve, reject) => {
        const url = import.meta.env.VITE_API_URL + endpoint;
        const token = document.cookie.split(';').find(row => row.startsWith('token='));
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token ? token : null
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
            resolve(res)
        }).catch((error) => reject(error))
    })
}