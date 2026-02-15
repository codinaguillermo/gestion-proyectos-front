<template>
  <section class="hero is-fullheight login-page">
    <div class="main-content-wrapper hero-body">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-5-tablet is-4-desktop is-3-widescreen">
            <form class="box glass-box p-6 shadow-lg" @submit.prevent="handleLogin">
              <div class="is-flex is-justify-content-center is-align-items-center mb-6">
                <img src="../assets/iconoOscuro.png" alt="Logo" style="width: 150px; height: 150px; object-fit: contain;">
              </div>
              
              <div class="field">
                <label class="label has-text-white">Email</label>
                <div class="control has-icons-left">                  
                  <input v-model="email" type="email" placeholder="e.g. guille@gmail.com" class="input transparent-input" required>
                  <span class="icon is-small is-left">📧</span>
                </div>
              </div>

              <div class="field">
                <label class="label has-text-white">Password</label>
                <div class="control has-icons-left">
                  <input v-model="password" type="password" placeholder="*******" class="input transparent-input" required>
                  <span class="icon is-small is-left">🔒</span>
                </div>
              </div>

              <div v-if="errorMsg" class="notification is-danger is-light py-2 mt-4">
                {{ errorMsg }}
              </div>

              <div class="field mt-5">
                <button class="button is-info is-fullwidth has-text-weight-bold" :class="{'is-loading': cargando}">
                  Ingresar al Tablero
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <footer class="footer-dashboard">
        <div class="footer-container">
            <div class="footer-info">
                GEPRES
                <span class="version-badge">v1.0.3-stable</span>
            </div>

            <div class="footer-credits">
                &copy; {{ anioActual }} | Creado por Ing. Guillermo Codina. Todos los derechos reservados.
            </div>

            <div class="footer-contact">
                <span class="icon"><i class="fas fa-envelope"></i></span>
                <a href="mailto:codinaguillermo@gmail.com">Contacto de Soporte</a>
            </div>
        </div>
    </footer>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

/**
 * Propósito: Gestionar el acceso de usuarios con estética de tablero.
 * Alimentado por: Usuario final.
 * Retorna: Redirección a dashboard en éxito o mensaje de error.
 */
const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const cargando = ref(false);

/**
 * Propósito: Obtener el año actual para el copyright.
 * Alimenta a: Template del footer.
 * Datos que retorna: Number (Año actual).
 */
const anioActual = computed(() => new Date().getFullYear());

/**
 * Propósito: Procesar el intento de login del usuario.
 * Alimenta a: Formulario de acceso.
 * Datos que retorna: Void (Navega a /dashboard o setea errorMsg).
 */
const handleLogin = async () => {
  errorMsg.value = '';
  cargando.value = true;
  
  try {
    const resultado = await authStore.login(email.value, password.value);
    
    if (resultado && resultado.success) {
      router.push('/dashboard'); 
    } else {
      errorMsg.value = resultado?.error || 'Credenciales incorrectas';
    }
  } catch (err) {
    console.error("❌ ERROR CRÍTICO EN LOGINVIEW:", err);
    errorMsg.value = 'Error inesperado en el sistema';
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
/* Estructura para Sticky Footer */
.login-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), 
              url('../assets/fondo.jpg');
  background-size: cover;
  background-position: center;
}

.main-content-wrapper {
  flex: 1 0 auto;
  display: flex;
  align-items: center; /* Centra el formulario verticalmente */
}

/* Efecto Glassmorphism */
.glass-box {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
}

/* Footer adaptado (idéntico al Dashboard para consistencia) */
.footer-dashboard {
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 1rem;
  color: #bdc3c7;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
  font-size: 0.85rem;
}

.footer-info, .footer-credits, .footer-contact {
  margin: 5px 15px;
}

.version-badge {
  background-color: rgba(52, 152, 219, 0.2);
  color: #3498db;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  margin-left: 8px;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.footer-contact a {
  color: #3498db;
  text-decoration: none;
  margin-left: 5px;
}

.footer-contact a:hover {
  text-decoration: underline;
}

/* Inputs y tipografía */
.transparent-input {
  background: rgba(255, 255, 255, 0.9) !important;
  border: none;
  transition: all 0.3s ease;
}

.transparent-input:focus {
  background: white !important;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.title {
  letter-spacing: 2px;
  text-transform: uppercase;
}

.shadow-lg {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

</style>