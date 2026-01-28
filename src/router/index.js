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
      // Esto es "lazy loading": solo carga el código del Dashboard cuando vas ahí
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true } // Etiqueta para saber que esta ruta es privada
    },
    {
      path: '/',
      redirect: '/dashboard'
    }
  ]
});

// EL GUARDIÁN: Se ejecuta antes de cada cambio de ruta
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Si la ruta pide estar logueado y no hay token, te mando al login
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login');
  } else {
    next();
  }
});

export default router;