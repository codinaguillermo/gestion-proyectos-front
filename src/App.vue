<template>
  <nav v-if="mostrarNavbar" class="navbar is-dark">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/dashboard" class="navbar-item has-text-weight-bold has-text-white">
          SISTEMA GESTIÓN
        </router-link>
      </div>

      <div class="navbar-menu is-active">
        <div class="navbar-end">
          <div class="navbar-item">
            <span class="has-text-white">
              Hola, <strong class="has-text-white">{{ nombreUsuario }}</strong>
            </span>
          </div>

          <div class="navbar-item has-dropdown is-hoverable">
            <a class="navbar-link is-arrowless">
              <span class="icon has-text-white">
                <i class="fas fa-cog"></i> </span>
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

// Estados para el modal de perfil
const modalPerfilActivo = ref(false);
const usuarioParaEditar = ref(null); // <--- Variable para guardar el usuario completo de la BD
const escuelas = ref([]);
const roles = ref([]);

const mostrarNavbar = computed(() => {
  return authStore.token && route.path !== '/login';
});

const nombreUsuario = computed(() => {
  return authStore.usuario?.nombre || 'Usuario';
});

const esDocenteOAdmin = computed(() => {
  const rol = Number(authStore.usuario?.rol_id);
  return rol === 1 || rol === 2;
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

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

const abrirPerfil = async () => {
  try {
    // 1. Buscamos los datos REALES y COMPLETOS del usuario logueado
    const res = await api.get(`/usuarios/${authStore.usuario.id}`);
    // ESTE LOG ES CLAVE: Miralo en la consola del navegador (F12)
    console.log("DATOS DESDE BD:", res.data);

    // Si res.data es un array, tomamos el primer elemento, sino el objeto
    usuarioParaEditar.value = res.data;
    
    // 2. Cargamos escuelas/roles si no están
    if (escuelas.value.length === 0) await cargarMaestras();
    
    // 3. Abrimos el modal
    modalPerfilActivo.value = true;
  } catch (err) {
    console.error("Error al abrir perfil:", err);
    // Fallback: si falla la API, usamos lo que tenemos en el store
    usuarioParaEditar.value = authStore.usuario;
    modalPerfilActivo.value = true;
  }
};

const refrescarDatos = () => {
  modalPerfilActivo.value = false;
  // Si el usuario cambió su nombre, podrías actualizar el authStore aquí
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
</style>