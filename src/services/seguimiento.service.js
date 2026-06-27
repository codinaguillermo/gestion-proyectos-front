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
     * @parámetros {Object} datos - Objeto conteniendo { proyecto_id, alumno_id, materia_id, desempeno, observacion, fecha_evaluacion }
     * @retorna {Promise} Promesa de Axios con la respuesta de la API ({ success: true, data: ObjetoCreado })
     */
    crear(datos) {
        return api.post('/seguimientos', datos);
    },

    /**
     * @función actualizar
     * @propósito Modificar los datos de un seguimiento existente (nota, fecha u observación).
     * @alimenta DetalleSeguimientoModal.vue (Formulario de edición)
     * @parámetros {Number} id - ID del seguimiento en la base de datos.
     * @parámetros {Object} datos - Payload con la nueva información a asentar.
     * @retorna {Promise} Promesa de Axios con la respuesta de la API.
     */
    actualizar(id, datos) {
        return api.put(`/seguimientos/${id}`, datos);
    },

    /**
     * @función eliminar
     * @propósito Borrar físicamente o lógicamente un registro de seguimiento de la base de datos.
     * @alimenta DetalleSeguimientoModal.vue (Confirmación de borrado)
     * @parámetros {Number} id - ID del seguimiento a eliminar.
     * @retorna {Promise} Promesa de Axios con la confirmación de la operación.
     */
    eliminar(id) {
        return api.delete(`/seguimientos/${id}`);
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
        return api.get(`/common/materias/especialidad/${especialidadId}`);
    },
    obtenerMateriasPorAlumno(especialidadId, curso) {
        return api.get(`/common/materias/especialidad/${especialidadId}?curso=${curso}`);
    }
};