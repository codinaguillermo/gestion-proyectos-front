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
    // --- RUTAS PARA USER STORIES ---
    {
      path: '/proyectos/:id/backlog/nueva',
      name: 'nueva-us',
      component: () => import('../views/UserStoryDetailView.vue'),
      meta: { requiresAuth: true } // LIBERADO: El alumno puede crear US si es de su proyecto
    },
    {
      path: '/proyectos/:id/backlog/:usId',
      name: 'detalle-us',
      component: () => import('../views/UserStoryDetailView.vue'),
      meta: { requiresAuth: true }
    },
    // --- ADMINISTRACIÓN (SE MANTIENE RESTRINGIDO) ---
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/usuariosView.vue'),
      meta: { requiresAuth: true, roles: [1, 2] } // Solo Admin y Docente
    },
    {
      path: '/escuelas',
      name: 'escuelas',
      component: () => import('../views/EscuelasLista.vue'), 
      meta: { requiresAuth: true, roles: [1, 2] } // Solo Admin y Docente
    },
    // --- GESTIÓN DE PROYECTO Y SUGERENCIAS ---
    {
      path: '/sugerencias',
      name: 'Sugerencias',
      component: SugerenciasView,
      meta: { requiresAuth: true, roles: [1, 2] } // Solo Admin y Docente
    },
    {
      path: '/proyectos/:id/configuracion',
      name: 'configurar-proyecto',
      component: () => import('../views/ProyectoConfigView.vue'),
      meta: { requiresAuth: true } // LIBERADO: La seguridad real la hace el Backend
    },
    {
      path: '/proyectos/:id/backlog/:usId/tarea/:tareaId',
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

// GUARD DE NAVEGACIÓN
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.token) {
    return next('/login');
  }

  // Validación de roles solo si la ruta tiene la propiedad 'roles' definida
  if (to.meta.roles) {
    const rolUsuario = Number(authStore.usuario?.rol_id);
    if (!to.meta.roles.includes(rolUsuario)) {
      console.warn("Acceso denegado por rol insuficiente a:", to.path);
      return next('/dashboard');
    }
  }

  next();
});

export default router;