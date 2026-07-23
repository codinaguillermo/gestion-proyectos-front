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
  },

  getProyectosAsignados(id) {
    return api.get(`/usuarios/${id}/proyectos-asignados`);
  },

  /**
   * Propósito: Enviar una petición PUT para reiniciar a cero el contador de mensajes sin leer del usuario en la Base de Datos.
   * Quién la llama: Ciclo de vida onMounted de la vista MensajeriaView.vue.
   * Qué datos retorna: Promesa de Axios con el resultado de la operación (success: true).
   */
  resetContadorMensajes() {
    return api.put('/usuarios/reset-mensajes');
  },

  /**
   * Propósito: Recuperar el listado completo de usuarios que solicitaron cuenta y se encuentran en estado pendiente de revisión.
   * Quién la llama: Ciclo de vida onMounted y métodos de actualización de la vista SolicitudesPendientesView.vue.
   * Retorna: Promesa de Axios cuya respuesta contiene el array de objetos con las solicitudes en espera.
   */
  obtenerPendientes() {
    return api.get('/usuarios/pendientes');
  },

  /**
   * Propósito: Enviar una petición PUT al servidor para habilitar el acceso de una cuenta pendiente y asignarle una contraseña inicial operativamente válida.
   * Quién la llama: Acción del botón "Aprobar Acceso" en la interfaz de gestión de solicitudes de SolicitudesPendientesView.vue.
   * Retorna: Promesa de Axios con el objeto JSON que confirma el éxito de la aprobación en la base de datos.
   */
  aprobarSolicitud(id, payload = {}) {
    return api.put(`/usuarios/${id}/aprobar`, payload);
  }
};

export default usuarioService;