import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import LoginView from '../views/LoginView.vue';
import HomeView from '../views/HomeView.vue';
import SugerenciasView from '../views/SugerenciasView.vue';

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
    // --- NUEVAS RUTAS PARA USER STORIES (FULL PAGE) ---
    {
      path: '/proyectos/:id/backlog/nueva',
      name: 'nueva-us',
      component: () => import('../views/UserStoryDetailView.vue'),
      meta: { requiresAuth: true, roles: [1, 2] } // Solo Admin y Docente pueden crear
    },
    {
      path: '/proyectos/:id/backlog/:usId',
      name: 'detalle-us',
      component: () => import('../views/UserStoryDetailView.vue'),
      meta: { requiresAuth: true } // Alumnos pueden entrar a ver/editar tareas
    },
    // --------------------------------------------------
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/usuariosView.vue'),
      meta: { requiresAuth: true, roles: [1, 2] } 
    },
    {
      path: '/escuelas',
      name: 'escuelas',
      component: () => import('../views/EscuelasLista.vue'), 
      meta: { requiresAuth: true, roles: [1, 2] } 
    },
    {
      path: '/sugerencias',
      name: 'Sugerencias',
      component: SugerenciasView,
      meta: { requiresAuth: true, roles: [1, 2] } 
    },
    {
      path: '/proyectos/:id/configuracion',
      name: 'configurar-proyecto',
      component: () => import('../views/ProyectoConfigView.vue'),
      meta: { requiresAuth: true, roles: [1, 2] } 
    },
    {
      path: '/proyectos/:id/backlog/:usId/tarea/:tareaId', // :tareaId será 'nueva' para crear
      name: 'tarea-detail',
      component: () => import('../views/TareaDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/tutoriales',
      name: 'tutoriales',
      component: () => import('../views/TutorialesView.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

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