import api from './api';

export const usuarioService = {
  // Obtener la lista de usuarios (admite filtros ?q=...&curso=...&division=...)
  getAll(params) {
    return api.get('/usuarios', { params });
  },

  // Crear un nuevo usuario (Desde el panel de Admin/Docente)
  create(payload) {
    return api.post('/usuarios', payload);
  },

  // Actualizar un usuario (Perfil propio o gestión de alumnos)
  // Usamos el ID en la URL como definimos en el Backend
  update(id, payload) {
    return api.put(`/usuarios/${id}`, payload);
  },

  // Por si necesitás los datos de un usuario puntual
  getById(id) {
    return api.get(`/usuarios/${id}`);
  }
};

export default usuarioService;