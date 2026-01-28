import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  
  actions: {
    async login(email, password) {
      try {
        const response = await api.post('/auth/login', { email, password });
        this.token = response.data.token;
        this.usuario = response.data.usuario;
        
        // Guardamos en el navegador para que no se borre al refrescar
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
    

    //limpiar todos los datos en localStorage
    logout() {
      this.token = null;
      this.usuario = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});