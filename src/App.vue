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
          <div class="navbar-item is-flex is-align-items-center">
            <figure class="image is-32x32 mr-3">
              <img 
                v-if="authStore.usuario?.avatar && authStore.usuario.avatar !== ''"
                :src="`http://localhost:3000/uploads/avatars/${authStore.usuario.avatar}`"
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

          <div class="navbar-item has-dropdown is-hoverable">
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

              <hr v-if="esDocenteOAdmin" class="navbar-divider">

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
 * Alimentado por: authStore.token y route.path.
 * Retorna: Boolean (false si está en / o /login).
 */
const mostrarNavbar = computed(() => {
  const rutasSinNavbar = ['/login', '/'];
  return authStore.token && !rutasSinNavbar.includes(route.path);
});

/**
 * Propósito: Obtener el nombre del usuario de forma reactiva desde el store.
 * Alimentado por: authStore.usuario.
 * Retorna: String (Nombre o 'Usuario').
 */
const nombreUsuario = computed(() => {
  return authStore.usuario?.nombre || 'Usuario';
});

/**
 * Propósito: Validar permisos de acceso a menús administrativos.
 * Alimentado por: authStore.usuario.rol_id.
 * Retorna: Boolean.
 */
const esDocenteOAdmin = computed(() => {
  const rol = Number(authStore.usuario?.rol_id);
  return rol === 1 || rol === 2;
});

/**
 * Propósito: Ejecutar el cierre de sesión y redirección.
 * Alimentado por: Evento click en el menú de navegación.
 * Retorna: void.
 */
const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

/**
 * Propósito: Obtener catálogos de escuelas y roles para los modales.
 * Alimentado por: Ciclo onMounted y abrirPerfil.
 * Retorna: void (actualiza refs locales).
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
 * Alimentado por: Botón "Mi Perfil" en el menú.
 * Retorna: void.
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
 * Alimentado por: Evento @usuario-guardado del componente UsuarioModal.
 * Llamadas: api.get para datos frescos y authStore.actualizarDatosUsuario para sincronizar memoria.
 * Retorna: void.
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
    console.log("DEBUG AUTH: Usuario actual en Store:", authStore.usuario);
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
</style>