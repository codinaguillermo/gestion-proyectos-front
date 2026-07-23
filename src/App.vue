<template>
  <nav v-if="mostrarNavbar" class="navbar is-dark">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/dashboard" class="navbar-item has-text-weight-bold has-text-white">
          GEPRES
        </router-link>

        <a 
          role="button" 
          class="navbar-burger" 
          :class="{ 'is-active': menuAbierto }"
          aria-label="menu" 
          aria-expanded="false" 
          @click="menuAbierto = !menuAbierto"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': menuAbierto }">
        <div class="navbar-end">
          
          <!-- NUEVO: Ícono de Solicitudes Pendientes con burbuja de notificación -->
          <div v-if="esDocenteOAdmin && authStore.usuario?.solicitudes_pendientes > 0" class="navbar-item">
            <router-link to="/solicitudes-pendientes" class="button is-ghost has-text-white p-2 icon-mensaje-contenedor" title="Solicitudes de Cuenta Pendientes">
              <span class="icon is-medium">
                <i class="fas fa-user-clock fa-lg has-text-warning"></i>
              </span>
              <span class="badge-facebook">
                {{ authStore.usuario.solicitudes_pendientes }}
              </span>
            </router-link>
          </div>

          <!-- Ícono de Mensajería Docente existente -->
          <div v-if="esDocenteOAdmin && authStore.usuario?.mensajes_sin_leer > 0" class="navbar-item">
            <router-link to="/mensajeria" class="button is-ghost has-text-white p-2 icon-mensaje-contenedor" title="Mensajería Docente">
              <span class="icon is-medium">
                <i class="fas fa-envelope fa-lg"></i>
              </span>
              <span class="badge-facebook">
                {{ authStore.usuario.mensajes_sin_leer }}
              </span>
            </router-link>
          </div>

          <div class="navbar-item is-flex is-align-items-center">
            <figure class="image is-32x32 mr-3">
              <img 
                v-if="authStore.usuario?.avatar && authStore.usuario.avatar !== ''"
                :src="`/uploads/avatars/${authStore.usuario.avatar}`"
                class="is-rounded"
                style="object-fit: cover; width: 32px; height: 32px; min-width: 32px; border: 1px solid #fff;"
              >
              <div 
                v-else 
                class="is-rounded has-background-primary has-text-white is-flex is-justify-content-center is-align-items-center"
                style="width: 32px; height: 32px; font-size: 0.75rem; font-weight: bold; border-radius: 50% !important;"
              >
                {{ nombreUsuario.substring(0, 2).toUpperCase() }}
              </div>
            </figure>
            
            <span class="has-text-white">
              Hola, <strong class="has-text-white">{{ nombreUsuario }}</strong>
            </span>
          </div>

          <div class="navbar-item has-dropdown is-arrowless is-hoverable">
            <a class="navbar-link is-arrowless">
              <span class="icon has-text-white">
                <i class="fas fa-cog"></i> 
              </span>
            </a>

            <div class="navbar-dropdown is-right">
              <router-link v-if="esDocenteOAdmin" to="/usuarios" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-users-cog"></i></span>
                Gestión de Usuarios
              </router-link>
              
              <!-- NUEVO: Acceso directo desde el menú desplegable a las Solicitudes Pendientes -->
              <router-link v-if="esDocenteOAdmin" to="/solicitudes-pendientes" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-user-clock has-text-warning"></i></span>
                Solicitudes de Cuenta
                <span v-if="authStore.usuario?.solicitudes_pendientes > 0" class="tag is-warning is-rounded ml-auto has-text-weight-bold">
                  {{ authStore.usuario.solicitudes_pendientes }}
                </span>
              </router-link>

              <router-link v-if="esDocenteOAdmin" to="/escuelas" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-school"></i></span>
                Gestionar Escuelas
              </router-link>
              
              <router-link v-if="esDocenteOAdmin" to="/gestion-curricular" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-book"></i></span>
                Especialidades y Materias
              </router-link>

              <a v-if="esDocenteOAdmin" class="navbar-item" @click="abrirExportacion">
                <span class="icon is-small mr-2 has-text-success"><i class="fas fa-file-excel"></i></span>
                Exportar Planilla Excel
              </a>

              <router-link v-if="esDocenteOAdmin" to="/sugerencias" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-lightbulb has-text-warning"></i></span>
                Sugerencias y Errores
              </router-link>

              <router-link v-if="esDocenteOAdmin" to="/mensajeria" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-envelope-open-text has-text-info"></i></span>
                Mensajería Docente
              </router-link>
              
              <hr v-if="esDocenteOAdmin" class="navbar-divider">

              <router-link v-if="esDocenteOAdmin" to="/tutoriales" class="navbar-item">
                <span class="icon is-small mr-2 has-text-danger"><i class="fas fa-play-circle"></i></span>
                Tutoriales GEPRES
              </router-link>

              <a class="navbar-item" @click="abrirPerfil">
                <span class="icon is-small mr-2"><i class="fas fa-user"></i></span>
                Mi Perfil
              </a>

              <hr class="navbar-divider">

              <a class="navbar-item has-text-danger" @click="handleLogout">
                <span class="icon is-small mr-2"><i class="fas fa-sign-out-alt"></i></span>
                Cerrar Sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <router-view />

  <UsuarioModal 
    v-if="modalPerfilActivo && roles.length > 0 && escuelas.length > 0"
    :key="usuarioParaEditar?.id" 
    :is-active="modalPerfilActivo"
    :usuario-edit="usuarioParaEditar"
    :escuelas="escuelas"
    :roles="roles"
    @close="modalPerfilActivo = false"
    @usuario-guardado="refrescarDatos"
  />

  <ExportarNotasModal 
    v-if="modalExportarActivo"
    @close="modalExportarActivo = false"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import api from './services/api';
import UsuarioModal from './components/modals/usuarioModal.vue';
import ExportarNotasModal from './components/modals/ExportarNotasModal.vue';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const menuAbierto = ref(false);
const modalPerfilActivo = ref(false);
const modalExportarActivo = ref(false); 
const usuarioParaEditar = ref(null); 
const escuelas = ref([]);
const roles = ref([]);

/**
 * Propósito: Cerrar automáticamente el menú móvil cuando el usuario cambia de página o ruta en la aplicación.
 * A quién alimenta: Comportamiento visual de la barra de navegación en resoluciones pequeñas (móvil y tablet).
 * Qué retorna: Void (cambia el estado de la variable reactiva menuAbierto a false).
 */
watch(() => route.path, () => {
  menuAbierto.value = false;
});

/**
 * Propósito: Determinar la visibilidad de la barra de navegación basada en el estado de autenticación y la ruta activa.
 * A quién alimenta: Template de App.vue (directiva v-if del tag nav).
 * Qué retorna: Booleano (true si el usuario está autenticado y no está en login o raíz, false en caso contrario).
 */
const mostrarNavbar = computed(() => {
  const rutasSinNavbar = ['/login', '/', '/solicitar-cuenta'];
  return authStore.token && !rutasSinNavbar.includes(route.path);
});

/**
 * Propósito: Obtener el nombre del usuario logueado de forma reactiva para el saludo en el navbar.
 * A quién alimenta: Template de App.vue (bloque de saludo e iniciales del avatar).
 * Qué retorna: String con el nombre del usuario o 'Usuario' por defecto si el dato no está disponible.
 */
const nombreUsuario = computed(() => {
  return authStore.usuario?.nombre || 'Usuario';
});

/**
 * Propósito: Validar si el usuario actual tiene privilegios de Administración (1) o Docencia (2).
 * A quién alimenta: Template de App.vue (directivas v-if de los elementos y enlaces del menú desplegable).
 * Qué retorna: Booleano (true si es Administrador o Docente, false en caso contrario).
 */
const esDocenteOAdmin = computed(() => {
  const rol = Number(authStore.usuario?.rol_id);
  return rol === 1 || rol === 2;
});

/**
 * Propósito: Finalizar la sesión del usuario actual limpiando el almacenamiento y redirigiendo al login.
 * A quién alimenta: Evento @click del botón "Cerrar Sesión" en el menú desplegable.
 * Qué retorna: Void (ejecuta logout en el store y redirige la ruta a /login).
 */
const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

/**
 * Propósito: Obtener desde la API los catálogos de escuelas y roles necesarios para inicializar los modales del sistema.
 * A quién alimenta: Hook onMounted al iniciar y función abrirPerfil antes de desplegar la edición de usuario.
 * Qué retorna: Promise<void> (asigna los datos obtenidos a las referencias reactivas escuelas y roles).
 */
const cargarMaestras = async () => {
  try {
    const [resE, resR] = await Promise.all([
      api.get('/common/escuelas'),
      api.get('/common/roles')
    ]);
    escuelas.value = resE.data;
    roles.value = resR.data;
  } catch (err) {
    console.error("Error al cargar maestras en App.vue", err);
  }
};

/**
 * Propósito: Solicitar los datos actualizados del usuario en sesión y desplegar el modal para la edición de su perfil.
 * A quién alimenta: Evento @click de la opción "Mi Perfil" en el menú de configuración.
 * Qué retorna: Promise<void> (activa el flag reactivo modalPerfilActivo y carga usuarioParaEditar).
 */
const abrirPerfil = async () => {
  try {
    const res = await api.get(`/usuarios/${authStore.usuario.id}`);
    usuarioParaEditar.value = res.data;
    if (escuelas.value.length === 0) await cargarMaestras();
    modalPerfilActivo.value = true;
  } catch (err) {
    console.error("Error al abrir perfil:", err);
    usuarioParaEditar.value = authStore.usuario;
    modalPerfilActivo.value = true;
  }
};

/**
 * Propósito: Desplegar el modal que permite la exportación de planillas generalizadas en Excel.
 * A quién alimenta: Evento @click de la opción "Exportar Planilla Excel" en el menú de configuración.
 * Qué retorna: Void (activa el flag reactivo modalExportarActivo poniendo su valor en true).
 */
const abrirExportacion = () => {
  modalExportarActivo.value = true;
};

/**
 * Propósito: Sincronizar en el store global los datos modificados del usuario luego de cerrarse el modal de edición.
 * A quién alimenta: Evento custom @usuario-guardado emitido por el componente hijo UsuarioModal.vue.
 * Qué retorna: Promise<void> (cierra el modal de perfil y actualiza el estado local en authStore).
 */
const refrescarDatos = async () => {
  modalPerfilActivo.value = false;
  try {
    const res = await api.get(`/usuarios/${authStore.usuario.id}`);
    authStore.actualizarDatosUsuario(res.data);
    console.log("Avatar actualizado en Store:", authStore.usuario.avatar);
  } catch (error) {
    console.error("Error al refrescar datos:", error);
  }
};

/**
 * Propósito: Disparar la carga inicial del catálogo de tablas maestras al montarse el componente principal en el DOM si hay sesión activa.
 * A quién alimenta: Ciclo de vida inicial del componente Vue (onMounted).
 * Qué retorna: Void.
 */
onMounted(() => {
  if (authStore.token) {
    cargarMaestras();
  }
});
</script>

<style scoped>
.navbar-dropdown.is-right {
  right: 0;
  left: auto;
}

.navbar-item.is-flex {
  display: flex;
  align-items: center;
}

.image.is-32x32 {
    width: 32px !important;
    height: 32px !important;
}

.image.is-32x32 img {
    border-radius: 50% !important;
    object-fit: cover;
    width: 32px !important;
    height: 32px !important;
    max-height: 32px !important;
}

.avatar-siglas {
    border-radius: 50% !important;
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
    font-weight: bold;
}

/* Contenedor relativo del ícono de mensajes para anclar el globo flotante */
.icon-mensaje-contenedor {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Burbuja indicadora de mensajes nuevos al estilo Facebook */
.badge-facebook {
  position: absolute;
  top: 0px;
  right: -2px;
  background-color: #f14668; /* Rojo is-danger de Bulma */
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 2904a5px;
  padding: 1px 5px;
  line-height: 1;
  text-align: center;
  min-width: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 10;
}
</style>