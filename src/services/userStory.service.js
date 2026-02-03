import api from './api';

export const userStoryService = {
  // Obtener todas las US de un proyecto
  getByProyecto(proyectoId) {
    return api.get(`/user-stories/proyecto/${proyectoId}`);
  },

  // Crear una nueva US
  create(payload) {
    return api.post('/user-stories', payload);
  },

  // Eliminar una US
  delete(id) {
    return api.delete(`/user-stories/${id}`);
  },

  // Actualizar una US (por si después querés cambiar el título o prioridad)
  update(id, payload) {
    return api.put(`/user-stories/${id}`, payload);
  }
};

export default userStoryService;