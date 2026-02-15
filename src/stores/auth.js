import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  // El estado recupera los datos del disco al arrancar o refrescar
  state: () => ({
    usuario: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  
  actions: {
    /**
     * Propósito: Autenticar al usuario y persistir su sesión.
     * Alimentado por: Vista de Login.
     * Datos que retorna: Objeto con success (boolean) y error (string opcional).
     */
    async login(email, password) {
      try {
        const response = await api.post('/auth/login', { email, password });
        
        // 1. Sincronizamos la memoria activa (reactividad de Vue)
        this.token = response.data.token;
        this.usuario = response.data.usuario; 
        
        // 2. Sincronizamos el almacenamiento persistente
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.usuario));
        
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.mensaje || 'Error al conectar con el servidor' 
        };
      }
    },

    /**
     * Propósito: Finalizar la sesión y limpiar el almacenamiento local.
     * Alimentado por: Botón de cerrar sesión en Navbar o App.vue.
     * Datos que retorna: void.
     */
    logout() {
      this.token = null;
      this.usuario = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    /**
     * Propósito: Sincronizar los datos del usuario en la memoria global y el disco tras una edición de perfil.
     * Alimentado por: App.vue (función refrescarDatos) tras el evento del Modal de Usuario.
     * Datos que recibe: nuevosDatos (Objeto con la información actualizada del usuario).
     * Datos que retorna: void.
     */
    actualizarDatosUsuario(nuevosDatos) {
      // 1. Actualizamos el estado reactivo en Pinia
      // Mantenemos los datos anteriores y sobreescribimos con los nuevos para no perder campos
      this.usuario = { ...this.usuario, ...nuevosDatos };

      // 2. Actualizamos el localStorage para que los cambios persistan al recargar la página
      localStorage.setItem('user', JSON.stringify(this.usuario));
      
      console.log("Store: Datos de usuario actualizados correctamente.");
    }
  }
});