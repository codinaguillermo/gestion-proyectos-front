import api from './api';

/**
 * @propósito Gestionar las peticiones HTTP exclusivas del módulo de registro de presentismo.
 * @alimenta Componente AsistenciaView.vue (para traer la lista de alumnos y enviar los datos guardados).
 * @retorna Promesas de Axios con las respuestas generadas por el controlador del backend.
 */
export const asistenciaService = {
  
  /**
   * @propósito Consultar al backend el listado de alumnos y su estado actual de asistencia para una fecha específica.
   * @alimenta Método cargarListaAlumnos() en AsistenciaView.vue.
   * @retorna Promesa de Axios con array de alumnos (incluyendo su estado de presentismo).
   */
  obtenerAlumnos(params) {
    return api.get('/asistencias/alumnos', { params });
  },

  /**
   * @propósito Enviar el bloque completo de alumnos con sus estados (Presente/Ausente) para guardarlo en la base de datos.
   * @alimenta Método confirmarAsistencia() en AsistenciaView.vue.
   * @retorna Promesa de Axios con el mensaje de confirmación de éxito.
   */
  guardarAsistencia(payload) {
    return api.post('/asistencias', payload);
  }
};

export default asistenciaService;