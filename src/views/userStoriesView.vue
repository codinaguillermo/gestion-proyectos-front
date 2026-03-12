<template>
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-6 px-4 pb-6">
        
        <div class="level mb-5 glass-panel p-5">
          <div class="level-left">
            <button class="button is-ghost has-text-white p-0 mr-5" @click="$router.back()">
              <span class="icon is-large"><i class="fas fa-arrow-left fa-lg"></i></span>
            </button>
            <div>
              <h2 class="subtitle is-4 has-text-info has-text-weight-bold mb-1">
                <i class="fas fa-project-diagram mr-2"></i> {{ proyectoData?.nombre || 'Cargando...' }}
              </h2>
              <h1 class="title has-text-white is-2 mb-0">
                Product Backlog
                <span class="is-size-4 has-text-grey-lighter" style="font-weight: 300; margin-left: 10px;">
                  (Entregables por Etapas)
                </span>
              </h1>
            </div>
          </div>
          <div class="level-right">
            <button v-if="puedeGestionarBacklog" class="button is-info is-medium has-text-weight-bold" @click="abrirModalNuevaUS">
              <span class="icon"><i class="fas fa-plus"></i></span>
              <span>NUEVA USER STORY</span>
            </button>
          </div>
        </div>

        <div class="tabs is-boxed is-centered custom-tabs mb-6">
          <ul>
            <li :class="{'is-active': tabActiva === 'backlog'}">
              <a @click="tabActiva = 'backlog'" :style="{ fontWeight: tabActiva === 'backlog' ? '800' : '400' }">
                <span class="icon is-medium"><i class="fas fa-th-large"></i></span>
                <span class="is-size-5">Tablero de US</span>
              </a>
            </li>
            <li :class="{'is-active': tabActiva === 'stats'}">
              <a @click="tabActiva = 'stats'" :style="{ fontWeight: tabActiva === 'stats' ? '800' : '400' }">
                <span class="icon is-medium"><i class="fas fa-chart-pie"></i></span>
                <span class="is-size-5">Métricas y Avance</span>
              </a>
            </li>
          </ul>
        </div>

        <div v-if="tabActiva === 'backlog'">
          <div v-if="cargando" class="notification glass-notification is-info is-size-5">
            <span class="icon"><i class="fas fa-spinner fa-pulse"></i></span> Refrescando datos...
          </div>
          <div v-else-if="userStories && userStories.length > 0">
            <div class="columns is-multiline px-2">
              <div v-for="us in userStories" :key="'us-' + us.id" class="column is-12-mobile is-6-tablet is-4-desktop mb-4">
                
                <div class="card-wrapper">
                  <UserStoryCard 
                    :userStory="us" 
                    @click="abrirDetalleUS(us)" 
                    @eliminar="prepararEliminacion" 
                    :showDelete="puedeGestionarBacklog" 
                    class="user-story-card-custom"
                  />
                  
                  <div v-if="calcularVencimiento(us)" 
                       class="vencimiento-badge px-4 pb-3 mt--2" 
                       :class="calcularVencimiento(us).clase">
                    <span class="icon is-small mr-1">
                      <i class="fas" :class="calcularVencimiento(us).icono"></i>
                    </span>
                    <span class="is-size-7 has-text-weight-bold is-uppercase letter-spacing-1">
                      {{ calcularVencimiento(us).texto }}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div v-else class="box glass-panel has-text-centered py-6">
            <p class="is-size-4 has-text-grey-lighter">El Backlog está vacío.</p>
          </div>
        </div>

        <div v-if="tabActiva === 'stats'">
          <div class="glass-panel p-6 animate__animated animate__fadeIn">
            <div class="columns is-centered">
              <div class="column is-11">
                <StatsProyecto v-if="proyectoId" :proyectoId="proyectoId" class="stats-glass-fix" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <ConfirmarModal 
      :isActive="isConfirmActive" 
      :mensaje="`¿Estás seguro de eliminar la US?`" 
      @confirmar="ejecutarEliminacion" 
      @cancelar="isConfirmActive = false" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import userStoryService from '../services/userStory.service';
import UserStoryCard from '../components/userStoryCard.vue';
import StatsProyecto from '../components/StatsProyecto.vue';
import ConfirmarModal from '../components/modals/ConfirmarModal.vue';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter(); 
const authStore = useAuthStore();

const proyectoId = ref(null);
const userStories = ref([]);
const cargando = ref(true);
const tabActiva = ref('backlog'); 

const isConfirmActive = ref(false);
const usAEliminar = ref(null);
const proyectoData = ref(null);

const puedeGestionarBacklog = computed(() => {
  const user = authStore.usuario;
  if (!user || !proyectoData.value) return false;
  return Number(user.rol_id) === 1 || Number(user.rol_id) === 2;
});

// NUEVA FUNCIÓN: Lógica de banderas de vencimiento
const calcularVencimiento = (us) => {
  if (!us.fecha_entrega || String(us.estado_detalle?.nombre).toUpperCase() === 'DONE') return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const entrega = new Date(us.fecha_entrega);
  entrega.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      texto: `${Math.abs(diffDays)} días vencidos`,
      clase: 'has-text-danger',
      icono: 'fa-exclamation-circle'
    };
  } else if (diffDays <= 3) {
    return {
      texto: diffDays === 0 ? 'Vence hoy' : `Cierra en ${diffDays} días`,
      clase: 'has-text-warning-dark',
      icono: 'fa-hourglass-half'
    };
  }
  return null;
};

const cargarUserStories = async () => {
  cargando.value = true;
  try {
    const res = await userStoryService.getByProyecto(proyectoId.value);
    userStories.value = res.data;
  } finally { cargando.value = false; }
};

const abrirDetalleUS = (us) => router.push(`/proyectos/${proyectoId.value}/backlog/${us.id}`);
const abrirModalNuevaUS = () => router.push(`/proyectos/${proyectoId.value}/backlog/nueva`);

const prepararEliminacion = (us) => {
  usAEliminar.value = us;
  isConfirmActive.value = true;
};

const ejecutarEliminacion = async () => {
  if (!usAEliminar.value) return;
  try {
    await userStoryService.delete(usAEliminar.value.id);
    isConfirmActive.value = false;
    await cargarUserStories(); 
  } catch (error) { console.error(error); }
};

const cargarDatosProyecto = async () => {
  try {
    const res = await api.get(`/proyectos/${proyectoId.value}`);
    proyectoData.value = res.data; 
  } catch (error) { console.error(error); }
};

onMounted(() => {
  proyectoId.value = route.params.id;
  cargarUserStories();
  cargarDatosProyecto();
});
</script>

<style scoped>
.dashboard-bg {
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.8)), url('../assets/fondo.jpg');
  background-size: cover;
  background-attachment: fixed;
}
.glass-panel {
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
.custom-tabs ul { border-bottom: 2px solid rgba(255, 255, 255, 0.2); }
.custom-tabs li a { color: #ffffff !important; border: 1px solid transparent !important; }
.custom-tabs li.is-active a { background-color: rgba(52, 152, 219, 0.3) !important; border-bottom-color: #3498db !important; }

/* Estilo de la Card */
.card-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background-color: rgba(253, 250, 230, 0.95);
}

:deep(.user-story-card-custom) { 
  background-color: transparent !important; 
  box-shadow: none !important;
}

/* Bandera de vencimiento */
.vencimiento-badge {
  margin-top: -15px; /* Para que quede pegado a la zona de tags */
  background: transparent;
}

.letter-spacing-1 { letter-spacing: 1px; }

:deep(.user-story-card-custom .title), :deep(.user-story-card-custom h3) { font-size: 1.5rem !important; font-weight: 800 !important; color: #2c3e50 !important; }
:deep(.user-story-card-custom p) { font-size: 1.15rem !important; color: #333 !important; }
:deep(.has-text-grey-dark.is-size-7) { font-size: 1.1rem !important; font-weight: 700 !important; color: #2c3e50 !important; }
:deep(.user-story-card-custom .tag) { font-size: 0.95rem !important; font-weight: 700 !important; }

:deep(.stats-glass-fix) {
  background: rgba(255, 255, 255, 0.88) !important;
  backdrop-filter: blur(8px);
  border-radius: 15px;
  padding: 25px;
}

.has-text-warning-dark { color: #856404 !important; } /* Amarillo más legible en fondo crema */
</style>