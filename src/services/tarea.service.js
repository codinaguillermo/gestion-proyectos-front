import api from './api';

export const tareaService = {
  /**
   * Obtiene todas las tareas del sistema sin filtrar por proyecto.
   * Alimenta: El cálculo de carga de trabajo global en el modal de edición de proyectos.
   * Retorna: Promise con el array completo de tareas (incluyendo prioridad_detalle y estado_detalle).
   */
  getAll() {
    return api.get('/tareas');
  },

  /**
   * Registra un incremento de horas en una tarea específica (Time Tracking).
   * Alimenta: Los componentes de seguimiento de tiempo en las tareas técnicas.
   * Retorna: Promise con el resultado de la actualización de horas.
   */
  registrarHoras(id, horas) {
    // Sincronizado con la ruta PATCH /tareas/:id/log-horas definida en el backend
    return api.patch(`/tareas/${id}/log-horas`, { horasNuevas: horas });
  },

  /**
   * Actualiza los datos generales de una tarea.
   * Alimenta: El editor de tareas en el Backlog y el Tablero.
   */
  update(id, datos) {
    return api.put(`/tareas/${id}`, datos);
  },

  /**
   * Crea una nueva tarea (usualmente hija de una User Story).
   * Alimenta: El flujo de desglose de tareas en el Backlog.
   */
  create(payload) {
    return api.post('/tareas', payload);
  }
};

export default tareaService;