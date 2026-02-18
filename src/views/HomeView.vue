<template>
  <section class="hero is-fullheight home-page">
    <div class="hero-body">
      <div class="container has-text-centered">
        <div class="logo-container mb-6">
          <img src="../assets/iconoOscuro.png" alt="GEPRES Logo" class="main-logo">
        </div>

        <p class="subtitle is-4 has-text-info has-text-weight-light mb-6">
          Gestión de Proyectos Estudiantiles
        </p>

        <div class="columns is-centered">
          <div class="column is-6">
            <div class="box glass-box p-5">
              <p class="has-text-white is-size-5">
                Una plataforma integral diseñada para la planificación, el seguimiento 
                y la organización de proyectos académicos. Facilita la colaboración 
                entre equipos y el control de hitos, transformando ideas en resultados 
                profesionales.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <router-link 
            :to="rutaDestino" 
            class="button is-info is-large is-rounded has-text-weight-bold shadow-lg"
          >
            {{ textoBoton }}
          </router-link>
        </div>
      </div>
    </div>

    <footer class="footer-home">
      <div class="has-text-centered has-text-grey-light is-size-7">
        &copy; {{ anioActual }} | Creado por Guillermo Codina.
      </div>
    </footer>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

/**
 * Propósito: Instanciar el store de autenticación para validar estado del usuario.
 * Alimentado por: Pinia Store (auth.js).
 * Datos que retorna: Object (Estado de autenticación).
 */
const authStore = useAuthStore();

/**
 * Propósito: Obtener el año actual para el pie de página.
 * Alimentado por: Renderizado del template (footer).
 * Datos que retorna: Number (Año actual).
 */
const anioActual = computed(() => new Date().getFullYear());

/**
 * Propósito: Determinar el texto del botón principal según el estado de sesión.
 * Alimentado por: authStore.token.
 * Datos que retorna: String ('Ir al Tablero' o 'Ingresar al Sistema').
 */
const textoBoton = computed(() => {
  return authStore.token ? 'Ir al Tablero' : 'Ingresar al Sistema';
});

/**
 * Propósito: Definir la ruta de redirección según si el usuario está autenticado.
 * Alimentado por: authStore.token.
 * Datos que retorna: String ('/dashboard' o '/login').
 */
const rutaDestino = computed(() => {
  return authStore.token ? '/dashboard' : '/login';
});
</script>

<style scoped>
/* Fondo de pizarra consistente con Login y Dashboard */
.home-page {
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
              url('../assets/fondo.jpg');
  background-size: cover;
  background-position: center;
}

/* Tamaño del logo duplicado nuevamente (320px) para protagonismo central */
.main-logo {
  width: 320px;
  height: 320px;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(52, 152, 219, 0.4));
}

/* Efecto de cristal para la descripción */
.glass-box {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
}

/* Sombra y respuesta visual del botón */
.shadow-lg {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.button.is-info:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
}

.footer-home {
  padding: 2rem 1rem;
  background: transparent;
}
</style>