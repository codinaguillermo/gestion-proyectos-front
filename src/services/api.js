import axios from 'axios';

// Creamos una instancia de axios configurada
const api = axios.create({    
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
});

// INTERCEPTOR DE PEDIDO (REQUEST)
// Envía automáticamente la llave (token) en cada viaje al servidor.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// INTERCEPTOR DE RESPUESTA (RESPONSE)
// Escucha lo que dice el servidor al volver. Si el servidor dice 401 (Token inválido/expirado)
// ejecutamos la limpieza y redirección.
api.interceptors.response.use(
    (response) => {
        // Si todo salió bien (status 200-299), devolvemos la respuesta normal.
        return response;
    },
    (error) => {
        // Si hubo un error en la respuesta
        if (error.response && error.response.status === 401) {
            // 1. Limpiamos los datos locales para seguridad
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');

            // 2. Mostramos el aviso al usuario
            alert("Tu sesión ha expirado o es inválida. Por favor, ingresa tus credenciales nuevamente.");

            // 3. Redirección forzosa al Login que me pasaste
            window.location.href = "http://eet24proyectos.ddns.net:3000/login";
        }
        
        // Devolvemos el error para que si un componente específico quiere manejarlo, pueda.
        return Promise.reject(error);
    }
);

export default api;