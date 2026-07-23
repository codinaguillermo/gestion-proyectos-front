<template>
  <section class="hero is-fullheight home-page">
    <div class="hero-body is-flex is-justify-content-center is-align-items-center py-4-mobile">
      <div class="container has-text-centered">
        <div class="logo-container mb-4-mobile mb-6-tablet">
          <img src="../assets/iconoOscuro.png" alt="GEPRES Logo" class="main-logo">
        </div>

        <p class="subtitle is-5-mobile is-4-tablet has-text-info has-text-weight-light mb-4-mobile mb-6-tablet px-2 has-text-centered">
          Gestión de Proyectos Estudiantiles
        </p>

        <div class="columns is-centered is-mobile-padding">
          <div class="column is-10-mobile is-8-tablet is-6-desktop">
            <div class="box glass-box p-4-mobile p-5-tablet has-text-centered">
              <p class="has-text-white is-size-6-mobile is-size-5-tablet has-text-centered">
                Una plataforma integral diseñada para la planificación, el seguimiento 
                y la organización de proyectos académicos. Facilita la colaboración 
                entre equipos y el control de hitos, transformando ideas en resultados 
                profesionales.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-4-mobile mt-6-tablet has-text-centered">
          <router-link 
            :to="rutaDestino" 
            class="button is-info is-medium-mobile is-large-tablet is-rounded has-text-weight-bold shadow-lg responsive-button"
          >
            {{ textoBoton }}
          </router-link>
        </div>
      </div>
    </div>

    <footer class="footer-home">
      <div class="has-text-centered has-text-grey-light is-size-7 px-2">
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
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* El cuerpo toma todo el espacio disponible entre el tope y el footer para centrar el contenido */
.hero-body {
  flex-grow: 1;
  display: flex !important;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* Contenedor del logo con centrado explícito */
.logo-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Tamaño del logo estándar para escritorio y tablets */
.main-logo {
  width: 320px;
  height: 320px;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(52, 152, 219, 0.4));
  transition: width 0.3s ease, height 0.3s ease;
  margin: 0 auto;
  display: block;
}

/* Corrección de centrado para el contenedor de la columna en grillas nativas de Bulma */
.columns {
  width: 100%;
  display: flex !important;
  justify-content: center !important;
  margin: 0 auto !important;
}

.column {
  margin: 0 auto !important;
  display: flex;
  justify-content: center;
}

/* Efecto de cristal para la descripción con centrado forzado */
.glass-box {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  margin: 0 auto !important;
  width: 100%;
  text-align: center !important;
}

/* Garantizar que el texto interno de la caja de cristal herede el centrado */
.glass-box p {
  text-align: center !important;
  width: 100%;
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
  padding: 1.5rem 1rem;
  background: transparent;
  width: 100%;
  flex-shrink: 0;
}

/* 
  Optimizaciones para Viewports Móviles Estándar (360x800 y 412x915)
*/
@media (max-width: 768px) {
  .main-logo {
    width: 200px;
    height: 200px;
  }
}

@media (max-width: 480px) {
  /* Alineación forzada para evitar que Bulma empuje el bloque de texto en móvil */
  .columns {
    margin-left: 0 !important;
    margin-right: 0 !important;
    width: 100% !important;
  }

  .column {
    margin: 0 auto !important;
    float: none !important;
  }

  /* Ajuste para 360px y 412px de ancho lógico */
  .main-logo {
    width: 150px;
    height: 150px;
  }
  
  /* Reducción de márgenes verticales para pantallas de 800px/915px de alto */
  .mb-4-mobile {
    margin-bottom: 1rem !important;
  }
  
  .mt-4-mobile {
    margin-top: 1rem !important;
  }

  .py-4-mobile {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
  }

  /* Ajuste de espaciado interno en la tarjeta de cristal */
  .p-4-mobile {
    padding: 1rem !important;
  }

  /* Control del ancho del botón para mantener centrado absoluto */
  .responsive-button {
    width: 85%;
    max-width: 280px;
    white-space: normal;
    height: auto;
    padding-top: 0.75em;
    padding-bottom: 0.75em;
    margin: 0 auto;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .footer-home {
    padding: 1rem 0.5rem;
  }
}
</style>