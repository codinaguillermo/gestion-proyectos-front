import api from './api'; // Tu instancia configurada de Axios

/**
 * Propósito: Obtener los hitos maestros usando la ruta relativa limpia para respetar el proxy.
 */
export const obtenerHitosMaestros = async (token) => {
    try {
        // CORRECCIÓN: Sacamos la barra inicial de '/common/...' a 'common/...'
        const response = await api.get('common/hitos-evaluacion', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error en obtenerHitosMaestros servicio:", error);
        throw error;
    }
};

/**
 * Propósito: Recuperar todo el historial cronológico de calificaciones del proyecto.
 */
export const obtenerCalificaciones = async (proyectoId, token) => {
    try {
        // CORRECCIÓN: Cambiamos '/proyectos/...' por 'proyectos/...'
        const response = await api.get(`proyectos/${proyectoId}/calificaciones`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error(`Error en obtenerCalificaciones para proyecto ${proyectoId}:`, error);
        throw error;
    }
};

/**
 * Propósito: Registrar una nueva calificación usando ruta relativa limpia.
 */
export const registrarCalificacion = async (proyectoId, { hito_id, nota, descripcion }, token) => {
    try {
        // CORRECCIÓN: Cambiamos '/proyectos/...' por 'proyectos/...'
        const response = await api.post(`proyectos/${proyectoId}/calificaciones`, {
            hito_id,
            nota,
            descripcion
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error en registrarCalificacion servicio:", error);
        throw error;
    }
};

export default {
    obtenerHitosMaestros,
    obtenerCalificaciones,
    registrarCalificacion
};