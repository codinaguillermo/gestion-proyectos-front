import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  // El estado recupera los datos del disco al arrancar o refrescar
  state: () => ({
    usuario: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  
  actions: {
    async login(email, password) {
      try {
        const response = await api.post('/auth/login', { email, password });
        
        // 1. Sincronizamos la memoria activa (reactividad de Vue)
        this.token = response.data.token;
        this.usuario = response.data.usuario; // Aquí ya viaja el campo "nombre"
        
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

    logout() {
      // Limpieza total para cerrar la sesión
      this.token = null;
      this.usuario = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});