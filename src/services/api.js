import axios from 'axios';

// Creamos una instancia de axios configurada
const api = axios.create({    
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
});

// INTERCEPTOR DE PEDIDO (REQUEST)
// Envía automáticamente el token en cada petición al servidor.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// INTERCEPTOR DE RESPUESTA (RESPONSE)
api.interceptors.response.use(
    (response) => {
        // Si todo salió bien, devolvemos la respuesta normal.
        return response;
    },
    (error) => {
        // Si el servidor responde 401 (No autorizado / Token expirado)
        if (error.response && error.response.status === 401) {
            
            // 1. Limpiamos los datos locales por seguridad
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');

            // 2. REDIRECCIÓN DIRECTA (Sin alerts molestos)
            // Agregamos el parámetro ?session=expired por si querés mostrar un mensaje en el Login
            window.location.href = "http://eet24proyectos.ddns.net:3000/login?session=expired";
        }
        
        // Devolvemos el error para que el componente que hizo la llamada pueda manejarlo si quiere
        return Promise.reject(error);
    }
);

export default api;