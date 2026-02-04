// En config.service.js
import api from './api';

export const configService = {
    async getTablasMaestras() {
        try {
            const response = await api.get('/tareas/config/maestras');
            return response.data;
        } catch (error) {
            console.error("Error en config.service:", error);
            throw error;
        }
    }
};

export default configService; // Agregamos el default para que sea fácil de importar