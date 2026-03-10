import api from './api';

const sugerenciaService = {
  // El backend ya filtra si es Admin o Docente basado en el token
  getAll() {
    return api.get('/sugerencias');
  },

  create(data) {
    return api.post('/sugerencias', data);
  },

  responder(id, data) {
    return api.put(`/sugerencias/${id}/responder`, data);
  }
};

export default sugerenciaService;