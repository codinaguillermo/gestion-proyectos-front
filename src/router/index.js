import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';
import HomeView from '../views/HomeView.vue';

/**
 * Propósito: Definir la configuración de rutas y navegación de la aplicación.
 * Alimentado por: main.js y eventos de navegación del usuario.
 * Retorna: Instancia del Router configurada.
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/proyectos/:id/backlog', 
      name: 'backlog-proyecto',
      component: () => import('../views/userStoriesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/usuariosView.vue'),
      meta: { requiresAuth: true, roles: [1, 2] } // 1: Admin, 2: Docente
    },
    {
      path: '/escuelas',
      name: 'escuelas',
      component: () => import('../views/EscuelasLista.vue'), 
      meta: { requiresAuth: true, roles: [1, 2] } 
    }
  ]
});

/**
 * Propósito: Guardián global para proteger rutas por autenticación y roles de usuario.
 * Alimentado por: Intentos de navegación (to, from).
 * Retorna: Ejecución de next() con la ruta destino o redirección de seguridad.
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Verificación de existencia de Token
  if (to.meta.requiresAuth && !authStore.token) {
    return next('/login');
  }

  // Verificación de Permisos por Rol
  if (to.meta.roles) {
    const rolUsuario = Number(authStore.usuario?.rol_id);
    if (!to.meta.roles.includes(rolUsuario)) {
      console.warn("Acceso denegado por rol insuficiente");
      return next('/dashboard');
    }
  }

  next();
});

export default router;