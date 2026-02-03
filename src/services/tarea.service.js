import api from './api';

export const tareaService = {
  // Para el Time Tracking (Tareas técnicas)
  registrarHoras(id, horas) {
    return api.patch(`/tareas/${id}/log-horas`, { horasNuevas: horas });
  },

  // Para actualizar checks de calidad o estado
  update(id, datos) {
    return api.put(`/tareas/${id}`, datos);
  },

  // Crear una tarea hija de una US
  create(payload) {
    return api.post('/tareas', payload);
  }
};

export default tareaService;