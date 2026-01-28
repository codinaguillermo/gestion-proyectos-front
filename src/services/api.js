import axios from 'axios';

// Creamos una instancia de axios configurada
const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Esta es la URL de tu Backend de Node
});

// Este "interceptor" servirá para que, una vez logueado, 
// el token se envíe automáticamente en cada pedido.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;