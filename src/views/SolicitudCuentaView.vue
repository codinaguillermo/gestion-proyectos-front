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

              <!-- SECCIÓN CONDICIONAL SI EL USUARIO ES ALUMNO (Rol ID 3) -->
              <template v-if="esAlumno">
                <hr class="has-background-grey-dark my-4">
                <p class="is-size-6 has-text-weight-bold cyan-subtitle mb-3">DATOS ACADÉMICOS (ALUMNO)</p>

                <!-- Fila: Curso y División -->
                <div class="columns is-mobile is-multiline mb-2">
                  <div class="column is-12-mobile is-6-tablet pb-1">
                    <div class="field">
                      <label class="label has-text-white is-size-5-mobile is-size-4-tablet">CURSO</label>
                      <div class="control has-icons-left is-expanded">
                        <div class="select is-fullwidth custom-select-wrapper">
                          <select 
                            v-model="form.curso" 
                            class="transparent-input is-medium-tablet is-normal-mobile custom-select" 
                            :required="esAlumno"
                            :disabled="exito"
                          >
                            <option value="" disabled>Selecciona curso...</option>
                            <option value="1ro">1ro Año</option>
                            <option value="2do">2do Año</option>
                            <option value="3ro">3ro Año</option>
                            <option value="4to">4to Año</option>
                            <option value="5to">5to Año</option>
                            <option value="6to">6to Año</option>
                          </select>
                        </div>
                        <span class="icon is-small is-left" style="z-index: 5;">📖</span>
                      </div>
                    </div>
                  </div>
                  <div class="column is-12-mobile is-6-tablet pb-1">
                    <div class="field">
                      <label class="label has-text-white is-size-5-mobile is-size-4-tablet">DIVISIÓN</label>
                      <div class="control has-icons-left is-expanded">
                        <div class="select is-fullwidth custom-select-wrapper">
                          <select 
                            v-model="form.division" 
                            class="transparent-input is-medium-tablet is-normal-mobile custom-select" 
                            :required="esAlumno"
                            :disabled="exito"
                          >
                            <option value="" disabled>Selecciona división...</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="1ra">1ra</option>
                            <option value="2da">2da</option>
                            <option value="3ra">3ra</option>
                            <option value="4ta">4ta</option>
                          </select>
                        </div>
                        <span class="icon is-small is-left" style="z-index: 5;">👥</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Especialidad -->
                <div class="field mb-5">
                  <label class="label has-text-white is-size-5-mobile is-size-4-tablet">ESPECIALIDAD</label>
                  <div class="control has-icons-left is-expanded">
                    <div class="select is-fullwidth custom-select-wrapper">
                      <select 
                        v-model="form.especialidad_id" 
                        class="transparent-input is-medium-tablet is-normal-mobile custom-select" 
                        :required="esAlumno"
                        :disabled="exito"
                      >
                        <option :value="null" disabled>Selecciona especialidad...</option>
                        <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">
                          {{ esp.nombre }}
                        </option>
                      </select>
                    </div>
                    <span class="icon is-small is-left" style="z-index: 5;">⚙️</span>
                  </div>
                </div>
              </template>

              <!-- RECAPTCHA WIDGET CONTAINER -->
              <div v-if="!exito" class="field is-flex is-justify-content-center my-4">
                <div id="recaptcha-container"></div>
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
                <span class="version-badge">v4.3.0</span>
            </div>
        </div>
    </footer>
  </section>
</template>

<script setup>
/**
 * @componente SolicitudCuentaView.vue
 * @propósito Vista de interfaz gráfica pública para el registro y solicitud de cuentas de nuevos usuarios, incorporando validación reCAPTCHA v2 y datos académicos condicionales.
 * Quién la alimenta (quién la llama): Sistema de enrutamiento web (Vue Router) al acceder a la ruta de registro público.
 * Qué datos retorna (o emite): Envía mediante authService.solicitarCuenta los datos ingresados al backend incluyendo la respuesta del captcha.
 */
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/auth.service';
import api from '../services/api';

const router = useRouter();

const form = reactive({
  nombre: '',
  apellido: '',
  telefono: '',
  rol_id: null,
  email: '',
  curso: '',
  division: '',
  especialidad_id: null
});

const especialidades = ref([]);
const recaptchaToken = ref(null);
let widgetId = null;

const errorMsg = ref('');
const exitoMsg = ref('');
const exito = ref(false);
const cargando = ref(false);

const esAlumno = computed(() => Number(form.rol_id) === 3);

/**
 * Propósito: Consultar de forma asíncrona el listado maestro de especialidades disponibles desde el backend para poblar el selector del formulario de solicitud.
 * A quién alimenta (quién la llama): Es invocada automáticamente por el gancho de ciclo de vida `onMounted` al inicializar la vista.
 * Qué datos retorna: No retorna datos; muta la variable reactiva `especialidades.value`.
 */
const cargarCatalogos = async () => {
  try {
    const resEspecialidades = await api.get('/common/especialidades').catch(() => ({ data: { data: [] } }));
    especialidades.value = resEspecialidades.data.data || resEspecialidades.data || [];
  } catch (err) {
    console.error("❌ Error al cargar especialidades para la solicitud:", err);
  }
};

/**
 * Propósito: Inyectar dinámicamente el script oficial de Google reCAPTCHA y renderizar el widget visual en el contenedor correspondiente.
 * A quién alimenta (quién la llama): Invocada al montar el componente en el cliente mediante onMounted.
 * Qué datos retorna: Void. Inicializa la variable global de Google `grecaptcha`.
 */
const initRecaptcha = () => {
  if (window.grecaptcha && window.grecaptcha.render) {
    renderWidget();
    return;
  }

  // Si el script no fue cargado previamente, lo inyectamos de forma segura
  if (!document.getElementById('recaptcha-script')) {
    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.grecaptcha.ready(() => {
        renderWidget();
      });
    };
    document.head.appendChild(script);
  }
};

const renderWidget = () => {
  const container = document.getElementById('recaptcha-container');
  if (container && window.grecaptcha && widgetId === null) {
    try {
      widgetId = window.grecaptcha.render('recaptcha-container', {
        sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
        callback: (token) => {
          recaptchaToken.value = token;
          errorMsg.value = ''; // Limpiamos error si el usuario resuelve el captcha
        },
        'expired-callback': () => {
          recaptchaToken.value = null;
        }
      });
    } catch (e) {
      console.error("Error al renderizar reCAPTCHA:", e);
    }
  }
};

onMounted(() => {
  cargarCatalogos();
  initRecaptcha();
});

onUnmounted(() => {
  // Limpieza defensiva del widget si el usuario abandona la vista
  widgetId = null;
});

const anioActual = computed(() => new Date().getFullYear());

const volverAlLogin = () => {
  router.push('/login');
};

/**
 * Propósito: Validar y despachar de forma asíncrona los datos del formulario de solicitud junto al token de reCAPTCHA hacia el backend.
 * A quién alimenta (quién la llama): Disparada por el evento `@submit.prevent` del formulario.
 * Qué datos retorna: Void. Muta el estado local para reflejar éxito o error.
 */
const enviarSolicitud = async () => {
  errorMsg.value = '';
  exitoMsg.value = '';
  
  if (!form.nombre || !form.apellido || !form.telefono || !form.rol_id || !form.email) {
    errorMsg.value = 'Por favor, completa todos los campos obligatorios del formulario para continuar.';
    return;
  }

  if (esAlumno.value && (!form.curso || !form.division || !form.especialidad_id)) {
    errorMsg.value = 'Por favor, completa todos los datos académicos requeridos para el perfil de alumno.';
    return;
  }

  // Validación estricta del reCAPTCHA en el cliente
  if (!recaptchaToken.value) {
    errorMsg.value = 'Por favor, completa la verificación de seguridad "No soy un robot".';
    return;
  }

  cargando.value = true;
  
  try {
    const payload = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      telefono: form.telefono.trim(),
      rol_id: Number(form.rol_id),
      email: form.email.trim().toLowerCase(),
      curso: esAlumno.value ? form.curso : null,
      division: esAlumno.value ? form.division : null,
      especialidad_id: esAlumno.value ? Number(form.especialidad_id) : null,
      recaptchaToken: recaptchaToken.value
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
    // Si el backend rechaza el token o hay otro error, reseteamos el widget para que el usuario pueda reintentar
    if (window.grecaptcha && widgetId !== null) {
      try { window.grecaptcha.reset(widgetId); } catch(ex) {}
    }
    recaptchaToken.value = null;

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

.custom-solicitud-width {
  width: 100%;
  max-width: 650px; 
  margin: 0 auto;
}

.glass-box {
  background: rgba(20, 25, 30, 0.65) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 210, 255, 0.25);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7), 
              0 0 15px rgba(0, 210, 255, 0.1);
}

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

.cyan-glow-text {
  text-shadow: 0 0 10px rgba(0, 210, 255, 0.5);
  letter-spacing: 2px;
}

.cyan-subtitle {
  color: #00d2ff !important;
  font-weight: 500;
}

.label {
  letter-spacing: 0.5px;
  margin-bottom: 0.6em !important;
}

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

.transparent-input:-webkit-autofill,
.transparent-input:-webkit-autofill:hover, 
.transparent-input:-webkit-autofill:focus {
  -webkit-text-fill-color: #1a1a1a !important;
  -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 1) inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.custom-select-wrapper {
  height: 55px;
}

.custom-select {
  width: 100%;
  padding-left: 2.5em !important;
  font-size: 1.15rem !important;
}

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