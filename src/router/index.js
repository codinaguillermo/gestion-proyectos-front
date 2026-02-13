import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
    },
    {
      path: '/',
      redirect: '/dashboard'
    }
  ]
});

// EL GUARDIÁN: Protege las rutas por Token y por Rol
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.token) {
    return next('/login');
  }

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