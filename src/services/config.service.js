// En config.service.js
import api from './api';

export const configService = {
    async getTablasMaestras() {
        try {
            // Hacemos las dos peticiones en paralelo para que sea rápido
            const [resMaestras, resEscuelas] = await Promise.all([
                api.get('/tareas/config/maestras'),
                api.get('/escuelas')
            ]);

            // Unificamos todo en un solo objeto
            return {
                ...resMaestras.data,          // Trae prioridades, estados, tipos
                escuelas: resEscuelas.data.data || resEscuelas.data // Agrega las escuelas
            };
        } catch (error) {
            console.error("Error en config.service unificando maestras:", error);
            throw error;
        }
    }
};

export default configService;