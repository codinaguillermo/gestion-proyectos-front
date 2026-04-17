<template>
  <section class="hero is-fullheight login-page">
    <div class="main-content-wrapper hero-body">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-8-tablet is-5-desktop is-4-widescreen">
            <form class="box glass-box p-6 shadow-lg custom-login-width" @submit.prevent="handleLogin">
              <div class="is-flex is-justify-content-center is-align-items-center mb-6">
                <img src="../assets/iconoOscuro.png" alt="Logo" style="width: 300px; height: 300px; object-fit: contain;">
              </div>
              
              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Email</label>
                <div class="control has-icons-left">                  
                  <input v-model="email" type="email" placeholder="e.g. guille@gmail.com" class="input transparent-input is-medium" required>
                  <span class="icon is-small is-left">📧</span>
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Password</label>
                <div class="control has-icons-left">
                  <input v-model="password" type="password" placeholder="*******" class="input transparent-input is-medium" required>
                  <span class="icon is-small is-left">🔒</span>
                </div>
              </div>

              <div v-if="errorMsg" class="notification is-danger is-light py-2 mt-4">
                {{ errorMsg }}
              </div>

              <div class="field mt-6">
                <button class="button is-info is-fullwidth has-text-weight-bold is-medium" :class="{'is-loading': cargando}">
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
                <span class="version-badge">v2.3.1</span>
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

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const cargando = ref(false);

const anioActual = computed(() => new Date().getFullYear());

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
  align-items: center;
}

/* Forzamos que el cuadro sea más ancho */
.custom-login-width {
  width: 100%;
  max-width: 550px; /* Aquí ajustamos el ancho horizontal */
  margin: 0 auto;
}

.glass-box {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
}

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

/* Estilo del Input reforzado para visibilidad total */
.transparent-input {
  background: rgba(255, 255, 255, 0.9) !important;
  border: none;
  transition: all 0.3s ease;
  height: 50px;
  /* FUERZA EL COLOR DEL TEXTO EN NEGRO */
  color: #1a1a1a !important; 
  font-weight: 500;
}

.transparent-input:focus {
  background: white !important;
  color: #000000 !important;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

/* BLINDAJE DEL PLACEHOLDER (el texto de sugerencia) */
.transparent-input::placeholder {
  color: #666666 !important; /* Gris oscuro para que se lea siempre */
  opacity: 1; /* Necesario para Firefox */
}

/* BLINDAJE DEL AUTOCOMPLETADO (Evita el fondo azul/amarillo feo) */
.transparent-input:-webkit-autofill,
.transparent-input:-webkit-autofill:hover, 
.transparent-input:-webkit-autofill:focus {
  -webkit-text-fill-color: #1a1a1a !important;
  -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 1) inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.title {
  letter-spacing: 2px;
  text-transform: uppercase;
}

.shadow-lg {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
</style>