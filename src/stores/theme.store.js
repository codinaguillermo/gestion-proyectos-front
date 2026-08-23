import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // Por defecto arranca en oscuro, leyendo la preferencia del navegador
    esModoOscuro: localStorage.getItem('gepres_theme') !== 'light'
  }),
  actions: {
    toggleTheme() {
      this.esModoOscuro = !this.esModoOscuro;
      localStorage.setItem('gepres_theme', this.esModoOscuro ? 'dark' : 'light');
      this.aplicarClaseGlobal();
    },
    aplicarClaseGlobal() {
      if (this.esModoOscuro) {
        document.body.classList.remove('theme-light');
      } else {
        document.body.classList.add('theme-light');
      }
    }
  }
});