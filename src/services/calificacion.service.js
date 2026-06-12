import api from './api'; // Tu instancia configurada de Axios

/**
 * @función obtenerHitosMaestros
 * @propósito Obtener los hitos maestros usando la ruta relativa limpia para respetar el proxy.
 * @alimenta Selector de hitos en ProyectoConfigView.vue.
 * @retorna {Array} Lista de hitos de evaluación configurados en el sistema.
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
 * @función obtenerCalificaciones
 * @propósito Recuperar todo el historial cronológico de calificaciones del proyecto.
 * @alimenta Acordeón de historial de notas en ProyectoConfigView.vue.
 * @retorna {Array} Historial detallado de calificaciones asignadas al proyecto.
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
 * @función registrarCalificacion
 * @propósito Registrar una nueva calificación grupal usando ruta relativa limpia, incorporando la fecha de evaluación manual.
 * @alimenta Método crearCalificacionDiaria en ProyectoConfigView.vue.
 * @retorna {Object} JSON con mensaje de confirmación y el registro de la nueva calificación.
 */
export const registrarCalificacion = async (proyectoId, { hito_id, nota, descripcion, fecha_evaluacion }, token) => {
    try {
        // CORRECCIÓN: Cambiamos '/proyectos/...' por 'proyectos/...'
        const response = await api.post(`proyectos/${proyectoId}/calificaciones`, {
            hito_id,
            nota,
            descripcion,
            fecha_evaluacion // <-- ACÁ SUMAMOS LA FECHA AL PAYLOAD
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error en registrarCalificacion servicio:", error);
        throw error;
    }
};

/**
 * @función actualizarCalificacion
 * @propósito Modificar los datos de una calificación grupal existente (nota, fecha u observación) v2.9.1.
 * @alimenta Método guardarEdicionNotaGrupal en ProyectoConfigView.vue.
 * @retorna {Object} JSON con mensaje de confirmación y la nota actualizada.
 */
export const actualizarCalificacion = async (proyectoId, calificacionId, datos, token) => {
    try {
        const response = await api.put(`proyectos/${proyectoId}/calificaciones/${calificacionId}`, datos, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error en actualizarCalificacion servicio:", error);
        throw error;
    }
};

/**
 * @función eliminarCalificacion
 * @propósito Borrar físicamente un registro de calificación grupal de la base de datos v2.9.1.
 * @alimenta Método confirmarEliminacionNotaGrupal en ProyectoConfigView.vue.
 * @retorna {Object} JSON con la confirmación de la eliminación.
 */
export const eliminarCalificacion = async (proyectoId, calificacionId, token) => {
    try {
        const response = await api.delete(`proyectos/${proyectoId}/calificaciones/${calificacionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error en eliminarCalificacion servicio:", error);
        throw error;
    }
};

export default {
    obtenerHitosMaestros,
    obtenerCalificaciones,
    registrarCalificacion,
    actualizarCalificacion,
    eliminarCalificacion
};