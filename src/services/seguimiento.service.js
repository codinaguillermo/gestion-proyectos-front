import api from './api';

/**
 * @servicio seguimientoService
 * @propósito Centralizar las peticiones HTTP orientadas al seguimiento actitudinal, pedagógico y curricular de los alumnos.
 * @ecosistema Vue.js (Frontend) consumiendo la API de Express (Backend).
 */
export default {
    /**
     * @función crear
     * @propósito Registrar una nueva observación pedagógica individual asociada a una materia.
     * @alimenta SeguimientoModal.vue
     * @parámetros {Object} datos - Objeto conteniendo { proyecto_id, alumno_id, materia_id, desempeno, observacion }
     * @retorna {Promise} Promesa de Axios con la respuesta de la API ({ success: true, data: ObjetoCreado })
     */
    crear(datos) {
        return api.post('/seguimientos', datos);
    },

    /**
     * @función getStats
     * @propósito Obtener los promedios globales e individuales acumulados en un proyecto para el monitor de rendimiento.
     * @alimenta ProyectoConfigView.vue (Gráfico general de barras)
     * @parámetros {Number|String} proyectoId - ID único del proyecto tecnológico.
     * @retorna {Promise} Promesa con el array de alumnos y sus promedios cualitativos mapeados.
     */
    getStats(proyectoId) {
        return api.get(`/seguimientos/stats/${proyectoId}`);
    },

    /**
     * @función getHistorial
     * @propósito Obtener el desglose cronológico y completo de las notas de concepto de un alumno, incluyendo la materia asociada.
     * @alimenta DetalleSeguimientoModal.vue (Gráficos por materia, tablas históricas y exportación a PDF)
     * @parámetros {Number|String} proyectoId - ID del proyecto.
     * @parámetros {Number|String} alumnoId - ID del usuario con rol alumno.
     * @retorna {Promise} Promesa con la colección completa de registros ordenados de forma descendente.
     */
    getHistorial(proyectoId, alumnoId) {
        return api.get(`/seguimientos/historial/${proyectoId}/${alumnoId}`);
    },

    /**
     * @función obtenerMateriasPorEspecialidad
     * @propósito Recuperar el listado oficial de asignaturas cargadas en la base de datos para una especialidad técnica específica.
     * @alimenta SeguimientoModal.vue (Filtros y selects dinámicos)
     * @parámetros {Number} especialidadId - ID de la especialidad (ej. TEP = 2).
     * @retorna {Promise} Promesa con la respuesta de la API ({ success: true, data: [Materias] })
     */
    obtenerMateriasPorEspecialidad(especialidadId) {
        return api.get(`/common/materias/especialidad/${especialidadId}`); // Prefijo '/common' incorporado
    }
};