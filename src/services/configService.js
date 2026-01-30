import api from './api';

export const configService = {
    async getTablasMaestras() {
        try {
            // Le pegamos al endpoint que certificamos ayer con Thunder Client
            const response = await api.get('/tareas/config/maestras');
            return response.data;
        } catch (error) {
            console.error("Error en ConfigService:", error);
            throw error;
        }
    }
};