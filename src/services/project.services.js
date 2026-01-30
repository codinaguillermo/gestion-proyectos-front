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
            const response = await api.post('/proyectos', proyectoData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.mensaje || 'Error al crear el proyecto'
            };
        }
    },

    // MÉTODO CORREGIDO: Usando 'api' y sacando logs ruidosos
    async delete(id) {
        try {
            // Usamos la instancia 'api' para que use el puerto 3000 y mande el Token
            const response = await api.delete(`proyectos/${id}`); 
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.mensaje || "Error al eliminar" 
            };
        }
    },
    update: async (id, data) => {
        try {
            const res = await api.put(`/proyectos/${id}`, data);
            return res.data;
        } catch (error) {
            throw error;
        }
    }
};

/*
Reutilización: Si mañana necesitás la lista de proyectos en otra pantalla, solo llamás a esta función.

Limpieza: El Dashboard no tiene que saber qué URL usa el servidor, solo pide los datos y listo.

Seguridad: Como importamos api.js, Axios pegará automáticamente el token Bearer que guardamos en el localStorage antes de enviar la petición.
*/
