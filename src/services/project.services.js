// Este archivo solo se encargará de la comunicación técnica con el Backend.
import api from './api';

export const projectService = {
    // Función para pedir todos los proyectos
    async getAll() {
        try {
            const response = await api.get('/proyectos');
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.mensaje || 'Error al obtener proyectos' 
            };
        }
    },

    // función para crear un proyecto
    async create(proyectoData) {
        try {
            // Mandamos nombre y descripcion al POST /proyectos
            const response = await api.post('/proyectos', proyectoData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.mensaje || 'Error al crear el proyecto'
            };
        }
    }
};

/*
Reutilización: Si mañana necesitás la lista de proyectos en otra pantalla, solo llamás a esta función.

Limpieza: El Dashboard no tiene que saber qué URL usa el servidor, solo pide los datos y listo.

Seguridad: Como importamos api.js, Axios pegará automáticamente el token Bearer que guardamos en el localStorage antes de enviar la petición.
*/
