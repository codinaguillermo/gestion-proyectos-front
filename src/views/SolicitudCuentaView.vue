<template>
  <section class="hero is-fullheight solicitud-page">
    <div class="main-content-wrapper hero-body p-3-mobile">
      <div class="container">
        <div class="columns is-centered is-marginless">
          <div class="column is-12-mobile is-10-tablet is-7-desktop is-6-widescreen">
            <form class="box glass-box p-5-mobile p-6-tablet shadow-lg custom-solicitud-width" @submit.prevent="enviarSolicitud">
              
              <!-- Identidad Visual Superior -->
              <div class="is-flex is-flex-direction-column is-align-items-center mb-5">
                <div class="logo-circle-container mb-3">
                  <img src="../assets/iconoOscuro.png" alt="Logo GEPRES" class="responsive-logo">
                </div>
                <h1 class="title is-size-3-mobile is-size-2-tablet has-text-white has-text-centered has-text-weight-bold mb-1 cyan-glow-text">
                  SOLICITUD DE CUENTA
                </h1>
                <p class="subtitle is-size-6-mobile is-size-5-tablet has-text-centered mb-0 cyan-subtitle">
                  Ingresa tus datos para solicitar acceso a GEPRES
                </p>                
              </div>
              
              <!-- Fila: Nombre y Apellido -->
              <div class="columns is-mobile is-multiline mb-2">
                <div class="column is-12-mobile is-6-tablet pb-1">
                  <div class="field">
                    <label class="label has-text-white is-size-5-mobile is-size-4-tablet">NOMBRE</label>
                    <div class="control has-icons-left">                  
                      <input 
                        v-model="form.nombre" 
                        type="text" 
                        placeholder="Ej: Juan" 
                        class="input transparent-input is-medium-tablet is-normal-mobile" 
                        required
                        :disabled="exito"
                      >
                      <span class="icon is-small is-left">👤</span>
                    </div>
                  </div>
                </div>
                <div class="column is-12-mobile is-6-tablet pb-1">
                  <div class="field">
                    <label class="label has-text-white is-size-5-mobile is-size-4-tablet">APELLIDO</label>
                    <div class="control has-icons-left">                  
                      <input 
                        v-model="form.apellido" 
                        type="text" 
                        placeholder="Ej: Pérez" 
                        class="input transparent-input is-medium-tablet is-normal-mobile" 
                        required
                        :disabled="exito"
                      >
                      <span class="icon is-small is-left">👤</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fila: Teléfono y Tipo de Usuario -->
              <div class="columns is-mobile is-multiline mb-2">
                <div class="column is-12-mobile is-6-tablet pb-1">
                  <div class="field">
                    <label class="label has-text-white is-size-5-mobile is-size-4-tablet">TELÉFONO</label>
                    <div class="control has-icons-left">                  
                      <input 
                        v-model="form.telefono" 
                        type="tel" 
                        placeholder="Ej: 3624001122" 
                        class="input transparent-input is-medium-tablet is-normal-mobile" 
                        required
                        :disabled="exito"
                      >
                      <span class="icon is-small is-left">📱</span>
                    </div>
                  </div>
                </div>
                <div class="column is-12-mobile is-6-tablet pb-1">
                  <div class="field">
                    <label class="label has-text-white is-size-5-mobile is-size-4-tablet">TIPO DE CUENTA</label>
                    <div class="control has-icons-left is-expanded">
                      <div class="select is-fullwidth custom-select-wrapper">
                        <select 
                          v-model="form.rol_id" 
                          class="transparent-input is-medium-tablet is-normal-mobile custom-select" 
                          required
                          :disabled="exito"
                        >
                          <option :value="null" disabled>Selecciona tu rol...</option>
                          <option :value="3">Alumno</option>
                          <option :value="2">Profesor / Docente</option>
                        </select>
                      </div>
                      <span class="icon is-small is-left" style="z-index: 5;">🎓</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Campo de Email -->
              <div class="field mb-5">
                <label class="label has-text-white is-size-5-mobile is-size-4-tablet">CORREO ELECTRÓNICO PERSONAL</label>
                <div class="control has-icons-left">                  
                  <input 
                    v-model="form.email" 
                    type="email" 
                    placeholder="nombre.apellido@gmail.com" 
                    class="input transparent-input is-medium-tablet is-normal-mobile" 
                    required
                    :disabled="exito"
                  >
                  <span class="icon is-small is-left">📧</span>
                </div>
                <p class="help cyan-subtitle mt-1 is-size-6">
                  <i class="fas fa-info-circle"></i> Tu correo será nuestro contacto contigo
                </p>
              </div>

              <!-- Notificación de Error -->
              <div v-if="errorMsg" class="notification is-danger is-light py-3 px-4 mt-4 is-size-6 has-text-weight-bold">
                <i class="fas fa-exclamation-triangle mr-1"></i> {{ errorMsg }}
              </div>

              <!-- Notificación de Éxito -->
              <div v-if="exitoMsg" class="notification is-success is-light py-4 px-4 mt-4 is-size-6">
                <p class="has-text-weight-bold mb-1 is-size-5"><i class="fas fa-check-circle mr-1"></i> ¡Solicitud Recibida!</p>
                <p>{{ exitoMsg }}</p>
              </div>

              <!-- Botones de Acción -->
              <div class="field mt-5">
                <button 
                  v-if="!exito"
                  type="submit"
                  class="button cyan-button is-fullwidth has-text-weight-bold is-medium-tablet is-normal-mobile mb-4" 
                  :class="{'is-loading': cargando}"
                >
                  Enviar Solicitud ➔
                </button>
                <button 
                  type="button"
                  class="button is-ghost is-fullwidth has-text-grey-light hover-cyan is-size-6 has-text-weight-semibold" 
                  @click="volverAlLogin"
                >
                  ⬅ Volver al login
                </button>
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
                <span class="version-badge">v3.0.0</span>
            </div>
        </div>
    </footer>
  </section>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth.service';

const router = useRouter();

const form = reactive({
  nombre: '',
  apellido: '',
  telefono: '',
  rol_id: null,
  email: ''
});

const errorMsg = ref('');
const exitoMsg = ref('');
const exito = ref(false);
const cargando = ref(false);

/**
 * Propósito: Calcular y proveer de manera reactiva el año calendario actual para renderizar el aviso de derechos de autor en el pie de página de la solicitud de cuenta.
 * A quién alimenta (quién la llama): Es invocada directamente en la plantilla de maquetado HTML del pie de página (footer) mediante interpolación de variables Vue ({{ anioActual }}).
 * Qué datos retorna: Retorna un número entero de cuatro dígitos que representa el año en curso (ej. 2026).
 */
const anioActual = computed(() => new Date().getFullYear());

/**
 * Propósito: Redirigir al usuario de regreso hacia la vista de inicio de sesión ('/login').
 * A quién alimenta (quién la llama): Disparada por el evento `@click` del botón "Volver al login".
 * Qué datos retorna: No retorna una structure de datos (función tipo void). Efectúa un cambio programático de ruta web en el enrutador Vue Router.
 */
const volverAlLogin = () => {
  router.push('/login');
};

/**
 * Propósito: Validar y despachar de forma asíncrona los datos del formulario de solicitud de nueva cuenta hacia el servicio de autenticación; controla la retroalimentación visual de errores (ej. correo duplicado) o éxito para el usuario.
 * A quién alimenta (quién la llama): Es disparada al capturar el evento de envío del formulario mediante la directiva de escucha (`@submit.prevent`) del elemento `<form>`.
 * Qué datos retorna: No retorna una estructura de datos (función asíncrona tipo void). Muta el estado local (`cargando`, `errorMsg`, `exitoMsg`, `exito`) para reflejar el resultado del alta inactiva.
 */
const enviarSolicitud = async () => {
  errorMsg.value = '';
  exitoMsg.value = '';
  
  if (!form.nombre || !form.apellido || !form.telefono || !form.rol_id || !form.email) {
    errorMsg.value = 'Por favor, completa todos los campos del formulario para continuar.';
    return;
  }

  cargando.value = true;
  
  try {
    const payload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      telefono: form.telefono.trim(),
      rol_id: Number(form.rol_id),
      email: form.email.trim().toLowerCase()
    };

    const respuesta = await authService.solicitarCuenta(payload);
    
    if (respuesta && (respuesta.success || respuesta.mensaje)) {
      exito.value = true;
      exitoMsg.value = respuesta.mensaje || 'Tu solicitud ha sido procesada con éxito. Un administrador revisará tus datos y habilitará el acceso en breve.';
    } else {
      errorMsg.value = respuesta?.error || 'No se pudo procesar la solicitud en este momento.';
    }
  } catch (err) {
    console.error("❌ ERROR EN SOLICITUD DE CUENTA:", err);
    if (err.response && err.response.data && (err.response.data.mensaje || err.response.data.error)) {
      errorMsg.value = `${err.response.data.error || 'Error'}: ${err.response.data.mensaje || ''}`;
    } else {
      errorMsg.value = 'Ocurrió un error inesperado al intentar conectar con el servidor.';
    }
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.solicitud-page {
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

/* Contenedor central adaptable - un poco más ancho que el login para alojar las columnas */
.custom-solicitud-width {
  width: 100%;
  max-width: 650px; 
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
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(0, 210, 255, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 20px rgba(0, 210, 255, 0.3);
  padding: 12px;
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

/* Refuerzo de tipografía accesible para etiquetas del formulario */
.label {
  letter-spacing: 0.5px;
  margin-bottom: 0.6em !important;
}

/* Estilo del Botón estilo Cían Neón con tipografía ampliada */
.cyan-button {
  background: linear-gradient(135deg, #00d2ff 0%, #0099cc 100%) !important;
  color: #000000 !important;
  border: none;
  border-radius: 30px;
  box-shadow: 0 5px 15px rgba(0, 210, 255, 0.4);
  transition: all 0.3s ease;
  height: 55px;
  font-size: 1.15rem !important;
}

.cyan-button:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(0, 210, 255, 0.7);
  transform: translateY(-2px);
}

/* Estilo del Input reforzado con fuente de mayor tamaño para fácil lectura */
.transparent-input {
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
  height: 55px;
  color: #1a1a1a !important; 
  font-weight: 600;
  font-size: 1.15rem !important;
}

.transparent-input:focus {
  background: white !important;
  color: #000000 !important;
  border-color: #00d2ff;
  box-shadow: 0 0 10px rgba(0, 210, 255, 0.5);
}

.transparent-input::placeholder {
  color: #555555 !important; 
  opacity: 1; 
  font-weight: 500;
  font-size: 1.05rem !important;
}

/* Blindaje del Autocompletado de Chrome/Safari */
.transparent-input:-webkit-autofill,
.transparent-input:-webkit-autofill:hover, 
.transparent-input:-webkit-autofill:focus {
  -webkit-text-fill-color: #1a1a1a !important;
  -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 1) inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* Ajustes para el elemento Select con mayor área de toque */
.custom-select-wrapper {
  height: 55px;
}

.custom-select {
  width: 100%;
  padding-left: 2.5em !important;
  font-size: 1.15rem !important;
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
  font-size: 0.85rem;
  gap: 10px;
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
  .custom-solicitud-width {
    max-width: 100%;
    border-radius: 12px;
  }
  
  .logo-circle-container {
    width: 80px;
    height: 80px;
    padding: 10px;
  }

  .transparent-input, .cyan-button, .custom-select-wrapper {
    height: 50px; 
    font-size: 1.05rem !important;
  }

  .transparent-input::placeholder {
    font-size: 0.95rem !important;
  }

  .footer-container {
    font-size: 0.75rem;
    text-align: center;
  }
}
</style>