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
                <span class="is-size-4 has-text-grey-lighter" style="font-weight: 300; margin-left: 10px;">(Entregables)</span>
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
              <a @click="tabActiva = 'backlog'">
                <span class="icon is-medium"><i class="fas fa-th-large"></i></span>
                <span class="is-size-5">Tablero de US</span>
              </a>
            </li>
            <li :class="{'is-active': tabActiva === 'stats'}">
              <a @click="tabActiva = 'stats'">
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
                <div class="card-wrapper hover-tilt-effect">
                  <UserStoryCard 
                    :userStory="us" 
                    @click="abrirDetalleUS(us)" 
                    @eliminar="prepararEliminacion" 
                    :showDelete="puedeGestionarBacklog" 
                    class="user-story-card-custom"
                  />
                  <div v-if="calcularVencimiento(us)" class="vencimiento-badge px-4 pb-3 mt--2" :class="calcularVencimiento(us).clase">
                    <span class="icon is-small mr-1"><i class="fas" :class="calcularVencimiento(us).icono"></i></span>
                    <span class="is-size-7 has-text-weight-bold is-uppercase letter-spacing-1">{{ calcularVencimiento(us).texto }}</span>
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
          <div class="glass-panel p-5 animate__animated animate__fadeIn">
            <div class="mb-6">
              <h3 class="title is-4 has-text-white mb-4">
                <i class="fas fa-users-cog mr-2 has-text-info"></i> Tareas por Integrante
              </h3>
              <div class="columns is-multiline">
                <div v-for="miembro in resumenTareasPorMiembro" :key="miembro.id" class="column is-12-mobile is-6-tablet is-4-desktop">
                  <div class="box has-background-dark p-4 h-full" style="border: 1px solid rgba(255,255,255,0.1);">
                    <div class="is-flex is-justify-content-between is-align-items-center mb-4 border-bottom-info pb-2">
                      <span class="has-text-info has-text-weight-bold is-uppercase is-size-6">{{ miembro.nombre }}</span>
                      <span class="tag is-rounded is-info is-light">{{ miembro.total }}</span>
                    </div>
                    
                    <div 
                      v-for="t in miembro.tareas" 
                      :key="t.id" 
                      class="mb-3 p-2 task-link-box" 
                      @click="irADetalleTarea(t.usId)"
                      title="Ir a esta User Story"
                    >
                      <div class="is-size-7 has-text-info-light is-uppercase has-text-weight-bold mb-1" style="opacity: 0.9;">
                        <i class="fas fa-folder-open mr-1"></i> {{ t.usTitulo }}
                      </div>
                      <div class="is-flex is-justify-content-between is-align-items-start">
                        <span class="has-text-white is-size-6" style="line-height: 1.2;">{{ t.titulo }}</span>
                        <span :class="obtenerClaseEstado(t.estado)" class="is-size-7 has-text-weight-bold ml-2">{{ t.estado }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="usSinTareas.length > 0" class="notification is-warning is-light mb-6" style="border-left: 8px solid #ffdd57;">
              <div class="is-flex is-align-items-center mb-2">
                <span class="icon is-medium has-text-warning mr-2"><i class="fas fa-exclamation-triangle"></i></span>
                <h4 class="title is-5 mb-0 has-text-dark">User Stories sin Tareas</h4>
              </div>
              <p class="is-size-6 has-text-dark mb-3">Las historias sin tareas no aparecen en los gráficos de progreso:</p>
              <div class="tags">
                <span v-for="us in usSinTareas" :key="us.id" class="tag is-dark">{{ us.titulo }}</span>
              </div>
            </div>

            <hr style="background-color: rgba(255,255,255,0.1);">
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

const resumenTareasPorMiembro = computed(() => {
  const mapa = {};
  userStories.value.forEach(us => {
    if (us.tareas && Array.isArray(us.tareas)) {
      us.tareas.forEach(t => {
        const responsable = t.responsable;
        const nombreStr = responsable ? responsable.nombre : 'SIN ASIGNAR';
        const apellidoStr = (responsable && responsable.apellido) ? responsable.apellido : '';
        const nombreCompleto = responsable ? `${nombreStr} ${apellidoStr}`.trim() : 'SIN ASIGNAR';
        const idResp = responsable ? responsable.id : '0';

        if (!mapa[idResp]) {
          mapa[idResp] = { id: idResp, nombre: nombreCompleto, total: 0, tareas: [] };
        }
        mapa[idResp].total++;
        mapa[idResp].tareas.push({
          id: t.id,
          titulo: t.titulo,
          usId: us.id,
          usTitulo: us.titulo,
          estado: t.estado_detalle?.nombre || 'PENDIENTE'
        });
      });
    }
  });
  return Object.values(mapa).sort((a, b) => b.total - a.total);
});

const usSinTareas = computed(() => {
  return userStories.value.filter(us => !us.tareas || us.tareas.length === 0);
});

const irADetalleTarea = (usId) => {
  router.push(`/proyectos/${proyectoId.value}/backlog/${usId}`);
};

const obtenerClaseEstado = (estado) => {
  const e = String(estado).toUpperCase();
  if (e === 'DONE' || e === 'FINALIZADO') return 'has-text-success';
  if (e === 'DOING' || e === 'EN PROCESO' || e === 'WORKING') return 'has-text-warning';
  return 'has-text-danger';
};

const puedeGestionarBacklog = computed(() => {
  const user = authStore.usuario;
  if (!user || !proyectoData.value) return false;
  return Number(user.rol_id) === 1 || Number(user.rol_id) === 2;
});

const calcularVencimiento = (us) => {
  if (!us.fecha_entrega || String(us.estado_detalle?.nombre).toUpperCase() === 'DONE') return null;
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const entrega = new Date(us.fecha_entrega); entrega.setHours(0,0,0,0);
  const diffDays = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { texto: `${Math.abs(diffDays)} días vencidos`, clase: 'has-text-danger', icono: 'fa-exclamation-circle' };
  else if (diffDays <= 3) return { texto: diffDays === 0 ? 'Vence hoy' : `Cierra en ${diffDays} días`, clase: 'has-text-warning-dark', icono: 'fa-hourglass-half' };
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

const abrirModalNuevaUS = () => {
  const id = proyectoId.value || route.params.id;
  if (id) router.push(`/proyectos/${id}/backlog/nueva`);
};

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
.dashboard-bg { min-height: 100vh; background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.8)), url('../assets/fondo.jpg'); background-size: cover; background-attachment: fixed; }
.glass-panel { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; }
.custom-tabs ul { border-bottom: 2px solid rgba(255, 255, 255, 0.2); }
.custom-tabs li a { color: #ffffff !important; border: 1px solid transparent !important; }
.custom-tabs li.is-active a { background-color: rgba(52, 152, 219, 0.3) !important; border-bottom-color: #3498db !important; }

/* --- HOVER DINÁMICO MEJORADO --- */
.hover-tilt-effect {
  transform: rotate(0deg); /* Siempre alineado perfecto por defecto */
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.hover-tilt-effect:hover {
  transform: rotate(2deg) scale(1.02); /* Solo gira y crece al pasar el mouse */
  z-index: 10;
  box-shadow: 0px 12px 30px rgba(0,0,0,0.45) !important;
}

.card-wrapper { position: relative; border-radius: 12px; overflow: hidden; background-color: rgba(253, 250, 230, 0.95); }
:deep(.user-story-card-custom) { background-color: transparent !important; box-shadow: none !important; }
.vencimiento-badge { margin-top: -15px; background: transparent; }
.letter-spacing-1 { letter-spacing: 1px; }
:deep(.stats-glass-fix) { background: rgba(255, 255, 255, 0.88) !important; backdrop-filter: blur(8px); border-radius: 15px; padding: 25px; }
.has-text-warning-dark { color: #856404 !important; }
.border-bottom-info { border-bottom: 1px solid rgba(52, 152, 219, 0.3); }
.h-full { height: 100%; }
.task-link-box { background: rgba(255, 255, 255, 0.03); border-radius: 6px; cursor: pointer; transition: all 0.2s ease; border: 1px solid transparent; }
.task-link-box:hover { background: rgba(52, 152, 219, 0.15); border-color: rgba(52, 152, 219, 0.4); transform: translateX(3px); }
</style>