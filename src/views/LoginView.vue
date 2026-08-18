<template>
  <section class="hero is-fullheight login-page">
    <div class="main-content-wrapper hero-body p-3-mobile">
      <div class="container">
        <div class="columns is-centered is-marginless">
          <div class="column is-12-mobile is-8-tablet is-5-desktop is-4-widescreen">
            <form class="box glass-box p-5-mobile p-6-tablet shadow-lg custom-login-width" @submit.prevent="handleLogin">
              
              <!-- Identidad Visual Superior -->
              <div class="is-flex is-flex-direction-column is-align-items-center mb-5">
                <div class="logo-circle-container mb-3">
                  <img src="../assets/iconoOscuro.png" alt="Logo GEPRES" class="responsive-logo">
                </div>
                <h1 class="title is-size-4-mobile is-size-3-tablet has-text-white has-text-centered has-text-weight-bold mb-1 cyan-glow-text">
                  GEPRES
                </h1>
                <p class="subtitle is-size-7-mobile is-size-6-tablet has-text-centered mb-0 cyan-subtitle">
                  Gestión de Proyectos Estudiantiles
                </p>                
              </div>
              
              <!-- Campo de Email / Usuario -->
              <div class="field mb-4">
                <label class="label has-text-white is-size-6-mobile is-size-5-tablet">EMAIL</label>
                <div class="control has-icons-left">                  
                  <input 
                    v-model="email" 
                    type="email" 
                    placeholder="tu cuenta de correo" 
                    class="input transparent-input is-medium-tablet is-normal-mobile" 
                    required
                  >
                  <span class="icon is-small is-left">📧</span>
                </div>
              </div>

              <!-- Campo de Contraseña con Toggle de Visibilidad -->
              <div class="field mb-5">
                <label class="label has-text-white is-size-6-mobile is-size-5-tablet">CONTRASEÑA</label>
                <div class="control has-icons-left has-icons-right">
                  <input 
                    v-model="password" 
                    :type="mostrarPassword ? 'text' : 'password'" 
                    placeholder="••••••••" 
                    class="input transparent-input is-medium-tablet is-normal-mobile" 
                    required
                  >
                  <span class="icon is-small is-left">🔒</span>
                  <span 
                    class="icon is-small is-right is-clickable password-toggle" 
                    @click="togglePasswordVisibility"
                    title="Mostrar/Ocultar clave"
                  >
                    {{ mostrarPassword ? '👁️' : '🕶️' }}
                  </span>
                </div>
              </div>

              <!-- Notificación de Error -->
              <div v-if="errorMsg" class="notification is-danger is-light py-2 px-3 mt-4 is-size-7-mobile">
                {{ errorMsg }}
              </div>

              <!-- Botón Principal -->
              <div class="field mt-5">
                <button 
                  class="button cyan-button is-fullwidth has-text-weight-bold is-medium-tablet is-normal-mobile" 
                  :class="{'is-loading': cargando}"
                >
                  Ingresar al Sistema ➔
                </button>
              </div>

              <!-- Enlaces Inferiores del Formulario -->
              <div class="is-flex is-justify-content-space-between is-align-items-center mt-4 is-size-7 form-links">
                <a href="#" class="has-text-grey-light hover-cyan" @click.prevent>¿Olvidaste tu clave?</a>
                <a href="#" class="has-text-info has-text-weight-bold hover-cyan" @click.prevent="irASolicitarCuenta">Crear Cuenta</a>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Pie de Página adaptable -->
    <footer class="footer-dashboard">
        <div class="footer-container">            

            <div class="footer-info has-text-centered">
                <span>&copy; {{ anioActual }}</span> | 
                <span>Creado por Guillermo Codina.</span>
                <span class="version-badge">v3.0.1</span>
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
const mostrarPassword = ref(false);

/**
 * Propósito: Calcular y proveer de manera reactiva el año calendario actual para renderizar de forma automática el aviso de derechos de autor en el pie de página de la interfaz de inicio de sesión.
 * A quién alimenta (quién la llama): Es invocada directamente en la plantilla de maquetado HTML del pie de página (footer) mediante interpolación de variables Vue ({{ anioActual }}).
 * Qué datos retorna: Retorna un número entero de cuatro dígitos que representa el año en curso (ej. 2026).
 */
const anioActual = computed(() => new Date().getFullYear());

/**
 * Propósito: Alternar (toggle) el valor de verdad del estado reactivo 'mostrarPassword', permitiendo al usuario conmutar entre ver los caracteres en texto plano u ocultarlos detrás de una máscara dentro del campo de entrada de contraseña.
 * A quién alimenta (quién la llama): Es llamada como manejador de evento por la directiva de captura (@click) del ícono interactivo ubicado en el margen derecho del input de clave.
 * Qué datos retorna: No retorna datos conceptuales (void). Modifica y muta de forma local el valor booleano en la referencia reactiva 'mostrarPassword.value'.
 */
const togglePasswordVisibility = () => {
  mostrarPassword.value = !mostrarPassword.value;
};

/**
 * Propósito: Redirigir la navegación del usuario hacia la vista de solicitud de nueva cuenta ('/solicitar-cuenta') al accionar el enlace correspondiente en el formulario de acceso.
 * A quién alimenta (quién la llama): Es invocada directamente desde el template HTML al capturar el evento de clic (@click.prevent="irASolicitarCuenta") en el hipervínculo "Crear Cuenta".
 * Qué datos retorna: No retorna una estructura de datos (función tipo void). Efectúa un cambio programático de ruta web en el enrutador del cliente Vue Router.
 */
const irASolicitarCuenta = () => {
  router.push('/solicitar-cuenta');
};

/**
 * Propósito: Procesar de manera asíncrona la solicitud de inicio de sesión del usuario enviando el email y la clave a la tienda del módulo de autenticación de Pinia; en caso de éxito, redirige la navegación al tablero general ('/dashboard'), y de lo contrario captura y expone los mensajes de error en la interfaz.
 * A quién alimenta (quién la llama): Es disparada al capturar el evento de envío del formulario de login mediante la directiva de escucha (@submit.prevent) del elemento <form>.
 * Qué datos retorna: No retorna una estructura de datos (función asíncrona tipo void). Muta las referencias locales 'cargando' y 'errorMsg' para reflejar el estado visual del intento de acceso y efectúa un cambio programático de ruta web en el enrutador del cliente si las credenciales son válidas.
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
.login-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(rgba(5, 10, 15, 0.85), rgba(5, 10, 15, 0.90)), 
              url('../assets/fondo.jpg');
  background-size: cover;
  background-position: center;
}

.main-content-wrapper {
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Contenedor central adaptable */
.custom-login-width {
  width: 100%;
  max-width: 480px; 
  margin: 0 auto;
}

/* Efecto Glassmorphism oscuro similar a la imagen */
.glass-box {
  background: rgba(20, 25, 30, 0.65) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 210, 255, 0.25);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7), 
              0 0 15px rgba(0, 210, 255, 0.1);
}

/* Logotipo circular con resplandor neón */
.logo-circle-container {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(0, 210, 255, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 20px rgba(0, 210, 255, 0.3);
  padding: 15px;
}

.responsive-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Acentos visuales en cyan neón */
.cyan-glow-text {
  text-shadow: 0 0 10px rgba(0, 210, 255, 0.5);
  letter-spacing: 2px;
}

.cyan-subtitle {
  color: #00d2ff !important;
  font-weight: 500;
}

/* Estilo del Botón estilo Cían Neón */
.cyan-button {
  background: linear-gradient(135deg, #00d2ff 0%, #0099cc 100%) !important;
  color: #000000 !important;
  border: none;
  border-radius: 30px;
  box-shadow: 0 5px 15px rgba(0, 210, 255, 0.4);
  transition: all 0.3s ease;
  height: 50px;
}

.cyan-button:hover {
  box-shadow: 0 8px 25px rgba(0, 210, 255, 0.7);
  transform: translateY(-2px);
}

/* Enlaces del formulario */
.form-links a {
  transition: color 0.2s ease;
  text-decoration: none;
}

.hover-cyan:hover {
  color: #00d2ff !important;
}

.password-toggle {
  pointer-events: auto !important;
  cursor: pointer;
}

/* Estilo del Input reforzado para visibilidad y tacto en móviles */
.transparent-input {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
  height: 50px;
  color: #1a1a1a !important; 
  font-weight: 500;
}

.transparent-input:focus {
  background: white !important;
  color: #000000 !important;
  border-color: #00d2ff;
  box-shadow: 0 0 10px rgba(0, 210, 255, 0.5);
}

.transparent-input::placeholder {
  color: #666666 !important; 
  opacity: 1; 
}

/* Blindaje del Autocompletado de Chrome/Safari */
.transparent-input:-webkit-autofill,
.transparent-input:-webkit-autofill:hover, 
.transparent-input:-webkit-autofill:focus {
  -webkit-text-fill-color: #1a1a1a !important;
  -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 1) inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* Footer responsivo estilo consola */
.footer-dashboard {
  flex-shrink: 0;
  background: rgba(5, 10, 15, 0.9);
  border-top: 1px solid rgba(0, 210, 255, 0.2);
  padding: 1.2rem 1rem;
  color: #8f9aa3;
}

.footer-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
  font-size: 0.80rem;
  gap: 10px;
}

.footer-quote {
  font-style: italic;
  color: #b0c0cf;
  max-width: 600px;
}

.version-badge {
  background-color: rgba(0, 210, 255, 0.15);
  color: #00d2ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  margin-left: 6px;
  border: 1px solid rgba(0, 210, 255, 0.3);
}

/* MEDIA QUERIES PARA ADAPTACIÓN MÓVIL ESTRICTA */
@media screen and (max-width: 768px) {
  .custom-login-width {
    max-width: 100%;
    border-radius: 12px;
  }
  
  .logo-circle-container {
    width: 85px;
    height: 85px;
    padding: 10px;
  }

  .transparent-input, .cyan-button {
    height: 45px; /* Altura optimizada para pulgares sin ocupar excesiva pantalla vertical */
  }

  .footer-container {
    font-size: 0.75rem;
    text-align: center;
  }
  
  .footer-quote {
    font-size: 0.75rem;
  }
}
</style>