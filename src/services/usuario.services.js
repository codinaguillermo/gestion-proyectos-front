import api from './api';

/**
 * Propósito: Gestionar las peticiones HTTP relacionadas con la entidad Usuario.
 * Quién la llama: Componentes de Vue como UsuarioModal.vue o listas de usuarios.
 * Retorna: Promesas de Axios con las respuestas del servidor.
 */
export const usuarioService = {
  // Obtener la lista de usuarios (admite filtros ?q=...&curso=...&division=...)
  getAll(params) {
    return api.get('/usuarios', { params });
  },

  // Crear un nuevo usuario (Desde el panel de Admin/Docente)
  create(payload) {
    return api.post('/usuarios', payload);
  },

  /**
   * Actualizar un usuario (Perfil propio o gestión de alumnos).
   * Soporta envío de JSON o FormData (para subida de archivos).
   */
  update(id, payload) {
    // Si el payload es instancia de FormData, Axios configura el boundary automáticamente
    return api.put(`/usuarios/${id}`, payload);
  },

  // Obtener datos de un usuario puntual
  getById(id) {
    return api.get(`/usuarios/${id}`);
  }
};

export default usuarioService;