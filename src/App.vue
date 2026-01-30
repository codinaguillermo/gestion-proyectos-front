<template>
  <nav v-if="mostrarNavbar" class="navbar is-dark">
    <div class="container">
      <div class="navbar-brand">
        <a class="navbar-item has-text-weight-bold">SISTEMA GESTIÓN</a>
      </div>
      <div class="navbar-menu is-active">
        <div class="navbar-end">
          <div class="navbar-item has-text-white">
            <span class="has-text-white">
              Hola, <strong class="has-text-white">{{ nombreUsuario }}</strong>
            </span>
          </div>
          <div class="navbar-item">
            <button class="button is-danger is-small" @click="handleLogout">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <router-view />
</template>

<script setup>
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from './stores/auth';

  const authStore = useAuthStore();
  const route = useRoute();
  const router = useRouter();

  // 1. Esto ya lo tenés y funciona (oculta la barra en login)
  const mostrarNavbar = computed(() => {
    return authStore.token && route.path !== '/login' && route.path !== '/';
  });

  // 2. AGREGAMOS ESTO: Un "sensor" específico para el nombre
  // Al ser computed, Vue se ve obligado a actualizar el HTML apenas el Store cambie
  const nombreUsuario = computed(() => {
    return authStore.usuario?.nombre || 'Usuario';
  });

  const handleLogout = () => {
    authStore.logout();
    router.push('/login');
  };
</script>