import axios from 'axios';

// Creamos una instancia de axios configurada
const api = axios.create({    
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
});

/**
 * Propósito: Inyectar automáticamente el token de autenticación (JWT) desde el localStorage 
 * en las cabeceras de cada petición HTTP/HTTPS saliente hacia el servidor.
 * A quién alimenta (quién la llama): Es ejecutada automáticamente por la instancia de Axios 
 * ('api') justo antes de enviar cualquier petición al backend.
 * Qué datos retorna: Retorna el objeto de configuración ('config') de la petición 
 * modificado con la cabecera estándar 'Authorization: Bearer'.
 */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Propósito: Interceptar las respuestas del servidor para detectar errores de autenticación 
 * (código 401). Si el token expira o es inválido, limpia el almacenamiento local y 
 * redirige de forma segura (HTTPS) a la pantalla de login para evitar advertencias de contenido mixto.
 * A quién alimenta (quién la llama): Es ejecutada automáticamente por Axios inmediatamente 
 * después de recibir la respuesta del backend y antes de entregarla al componente que realizó la llamada.
 * Qué datos retorna: Retorna el objeto 'response' intacto si la petición fue exitosa. 
 * Si detecta un error, ejecuta la redirección o retorna una promesa rechazada para que el componente la maneje.
 */
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
            // Se actualizó a https:// para prevenir bloqueos por contenido mixto en la nueva arquitectura
            window.location.href = "https://eet24proyectos.ddns.net:3000/login?session=expired";
        }
        
        // Devolvemos el error para que el componente que hizo la llamada pueda manejarlo si quiere
        return Promise.reject(error);
    }
);

export default api;