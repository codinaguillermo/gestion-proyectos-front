<template>
  <nav v-if="mostrarNavbar" class="navbar is-dark">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/dashboard" class="navbar-item has-text-weight-bold has-text-white">
          GEPRES - GESTIÓN DE PROYECTOS ESTUDIANTILES
        </router-link>
      </div>

      <div class="navbar-menu is-active">
        <div class="navbar-end">
          
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
              <router-link v-if="esDocenteOAdmin" to="/escuelas" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-school"></i></span>
                Gestionar Escuelas
              </router-link>
              
              <router-link v-if="esDocenteOAdmin" to="/gestion-curricular" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-book"></i></span>
                Especialidades y Materias
              </router-link>

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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import api from './services/api';
import UsuarioModal from './components/modals/usuarioModal.vue';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const modalPerfilActivo = ref(false);
const usuarioParaEditar = ref(null); 
const escuelas = ref([]);
const roles = ref([]);

/**
 * Propósito: Determinar la visibilidad de la barra de navegación basada en autenticación y ruta.
 * A quién alimenta: Template de App.vue (directiva v-if del nav).
 * Qué retorna: Booleano true/false.
 */
const mostrarNavbar = computed(() => {
  const rutasSinNavbar = ['/login', '/'];
  return authStore.token && !rutasSinNavbar.includes(route.path);
});

/**
 * Propósito: Obtener el nombre del usuario de forma reactiva desde el store.
 * A quién alimenta: Template de App.vue (saludo del usuario).
 * Qué retorna: String con el nombre o 'Usuario' por defecto.
 */
const nombreUsuario = computed(() => {
  return authStore.usuario?.nombre || 'Usuario';
});

/**
 * Propósito: Validar permisos de acceso a menús administrativos.
 * A quién alimenta: Template de App.vue (directivas v-if de los menús dropdown).
 * Qué retorna: Booleano true si es admin (1) o docente (2).
 */
const esDocenteOAdmin = computed(() => {
  const rol = Number(authStore.usuario?.rol_id);
  return rol === 1 || rol === 2;
});

/**
 * Propósito: Ejecutar el cierre de sesión y redirección.
 * A quién alimenta: Evento @click del botón "Cerrar Sesión".
 * Qué retorna: Void (redirecciona ruta).
 */
const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

/**
 * Propósito: Obtener catálogos de escuelas y roles para los modales.
 * A quién alimenta: Hook onMounted y función abrirPerfil.
 * Qué retorna: Void (asigna valores reactivos a ref escuelas y roles).
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
 * Propósito: Preparar y mostrar el modal de edición para el usuario logueado.
 * A quién alimenta: Evento @click de "Mi Perfil".
 * Qué retorna: Void (activa flag reactivo modalPerfilActivo).
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
 * Propósito: Refrescar la información del usuario tras una edición exitosa.
 * A quién alimenta: Evento @usuario-guardado emitido por UsuarioModal.vue.
 * Qué retorna: Void (actualiza el store de autenticación).
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