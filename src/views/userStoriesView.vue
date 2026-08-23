<template>
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-4 px-2-mobile px-4-tablet pb-6">
        
        <!-- ENCABEZADO ADAPTATIVO (Reemplazo de .level por Flexbox/Columnas) -->
        <div class="glass-panel p-4 mb-4">
          <div class="is-flex is-align-items-center is-justify-content-space-between mb-3">
            <div class="is-flex is-align-items-center">
              <button class="button is-ghost has-text-white p-0 mr-3" @click="$router.back()">
                <span class="icon is-medium"><i class="fas fa-arrow-left fa-lg"></i></span>
              </button>
              <div>
                <h2 class="is-size-6-mobile is-size-5-tablet has-text-info has-text-weight-bold mb-0 is-flex is-align-items-center">
                  <i class="fas fa-project-diagram mr-2"></i> 
                  <span class="text-truncate-mobile">{{ proyectoData?.nombre || 'Cargando...' }}</span>
                </h2>
                <h1 class="title has-text-white is-size-4-mobile is-size-2-tablet mb-0">
                  Product Backlog
                  <span class="is-size-6-mobile is-size-4-tablet has-text-grey-lighter is-hidden-mobile" style="font-weight: 300;">(Entregables)</span>
                </h1>
              </div>
            </div>
          </div>

          <!-- FILTROS Y ACCIONES (Apilamiento inteligente en móvil) -->
          <div class="columns is-mobile is-multiline mt-2 mb-0">
            <div class="column is-12-mobile is-5-tablet pb-1">
              <div class="field">
                <div class="control">
                  <div class="select is-info is-fullwidth">
                    <select v-model="filtroCategoria">
                      <option value="0">Todas las categorías</option>
                      <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="column is-12-mobile is-7-tablet pt-1 is-flex is-justify-content-flex-end-tablet">
              <div class="buttons is-fullwidth-mobile mt-1-mobile">
                <router-link 
                  :to="{ name: 'configurar-proyecto', params: { id: proyectoId } }" 
                  class="button is-primary is-outlined has-text-white is-flex-grow-1-mobile mb-0"
                  title="Ir a Gestión Estratégica"
                >
                  <span class="icon"><i class="fas fa-bullseye"></i></span>
                  <span>Objetivos</span>
                </router-link>

                <button 
                  v-if="puedeGestionarBacklog" 
                  class="button is-info has-text-weight-bold is-flex-grow-1-mobile mb-0" 
                  @click="abrirModalNuevaUS"
                >
                  <span class="icon"><i class="fas fa-plus"></i></span>
                  <span>NUEVA US</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- NAVEGACIÓN POR PESTAÑAS (Estilo X.com con área táctil ampliada para pulgar en celular) -->
        <div class="tabs is-boxed is-centered custom-tabs mb-4">
          <ul>
            <li :class="{'is-active': tabActiva === 'backlog'}">
              <a @click="tabActiva = 'backlog'" class="px-3-mobile" title="Tablero de US">
                <span class="icon is-medium-mobile"><i class="fas fa-th-large fa-lg"></i></span>
                <span class="is-size-5-tablet is-hidden-mobile ml-2">Tablero de US</span>
              </a>
            </li>
            <li :class="{'is-active': tabActiva === 'equipo'}">
              <a @click="tabActiva = 'equipo'" class="px-3-mobile" title="Carga por Miembro">
                <span class="icon is-medium-mobile"><i class="fas fa-users-cog fa-lg"></i></span>
                <span class="is-size-5-tablet is-hidden-mobile ml-2">Carga por Miembro</span>
              </a>
            </li>
            <li :class="{'is-active': tabActiva === 'stats'}">
              <a @click="tabActiva = 'stats'" class="px-3-mobile" title="Métricas Avanzadas">
                <span class="icon is-medium-mobile"><i class="fas fa-chart-line fa-lg"></i></span>
                <span class="is-size-5-tablet is-hidden-mobile ml-2">Métricas Avanzadas</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- CONTENIDO TABS -->
        <div v-if="tabActiva === 'backlog'" class="animate__animated animate__fadeIn">
          <div v-if="cargando" class="notification glass-notification is-info is-size-6-mobile is-size-5-tablet">
            <span class="icon"><i class="fas fa-spinner fa-pulse"></i></span> Refrescando datos...
          </div>
          <div v-else-if="userStoriesFiltradas && userStoriesFiltradas.length > 0">
            <div class="columns is-multiline px-0-mobile px-2-tablet">
              <div v-for="us in userStoriesFiltradas" :key="'us-' + us.id" class="column is-12-mobile is-6-tablet is-4-desktop mb-3">
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
            <p class="is-size-5-mobile is-size-4-tablet has-text-grey-lighter">El Backlog está vacío.</p>
          </div>
        </div>

        <div v-if="tabActiva === 'equipo'" class="animate__animated animate__fadeIn">
          <div class="glass-panel p-4-mobile p-5-tablet">
            <h3 class="title is-5-mobile is-4-tablet has-text-white mb-4">
              <i class="fas fa-user-tag mr-2 has-text-info"></i> Desglose de Responsabilidades
            </h3>
            <div class="columns is-multiline">
              <div v-for="miembro in resumenTareasPorMiembro" :key="miembro.id" class="column is-12-mobile is-6-tablet is-4-desktop">
                <div class="box has-background-dark p-3-mobile p-4-tablet h-full" style="border: 1px solid rgba(255,255,255,0.1);">
                  <div class="is-flex is-justify-content-between is-align-items-center mb-3 border-bottom-info pb-2">
                    <span class="has-text-info has-text-weight-bold is-uppercase is-size-6 text-truncate-mobile">{{ miembro.nombre }}</span>
                    <span class="tag is-rounded is-info is-light is-normal">{{ miembro.total }} tareas</span>
                  </div>
                  
                  <div v-for="t in miembro.tareas" :key="t.id" class="mb-3 p-2 task-link-box" @click="irADetalleTarea(t.usId)">
                    <div class="is-size-7 has-text-info-light is-uppercase has-text-weight-bold mb-1 text-truncate-mobile">
                      <i class="fas fa-folder-open mr-1"></i> {{ t.usTitulo }}
                    </div>
                    <div class="is-flex is-justify-content-between is-align-items-start">
                      <span class="has-text-white is-size-6 pr-2">{{ t.titulo }}</span>
                      <span :class="obtenerClaseEstado(t.estado)" class="is-size-7 has-text-weight-bold is-flex-shrink-0">{{ t.estado }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="tabActiva === 'stats'" class="animate__animated animate__fadeIn">
          <div class="glass-panel p-3-mobile p-5-tablet">
            <div v-if="usSinTareas.length > 0" class="notification is-warning is-light mb-4 p-3" style="border-left: 6px solid #ffdd57;">
              <div class="is-flex is-align-items-center mb-2">
                <span class="icon is-medium has-text-warning mr-2"><i class="fas fa-exclamation-triangle"></i></span>
                <h4 class="title is-6-mobile is-5-tablet mb-0 has-text-dark">User Stories sin Planificar</h4>
              </div>
              <div class="tags">
                <span v-for="us in usSinTareas" :key="us.id" class="tag is-dark is-medium-mobile">{{ us.titulo }}</span>
              </div>
            </div>
            <div class="columns is-centered">
              <div class="column is-12-mobile is-11-tablet px-0-mobile">
                <StatsProyecto v-if="proyectoId" :proyectoId="proyectoId" class="stats-glass-fix" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <ConfirmarModal 
      :isActive="isConfirmActive" 
      :mensaje="`¿Estás seguro de eliminar esta User Story?`" 
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
const categorias = ref([]);
const filtroCategoria = ref(0);
const cargando = ref(true);
const tabActiva = ref('backlog'); 
const isConfirmActive = ref(false);
const usAEliminar = ref(null);
const proyectoData = ref(null);

const userStoriesFiltradas = computed(() => {
  if (filtroCategoria.value == 0) return userStories.value;
  return userStories.value.filter(us => us.tipo_us_id == filtroCategoria.value);
});

const puedeGestionarBacklog = computed(() => {
  const user = authStore.usuario;
  if (!user || !proyectoData.value) return false;
  if (Number(user.rol_id) === 1 || Number(user.rol_id) === 2) return true;
  
  const integrantes = proyectoData.value.integrantes || proyectoData.value.Usuarios || [];
  return integrantes.some(m => Number(m.id) === Number(user.id));
});

const resumenTareasPorMiembro = computed(() => {
  const mapa = {};
  userStories.value.forEach(us => {
    if (us.tareas && Array.isArray(us.tareas)) {
      us.tareas.forEach(t => {
        const responsable = t.responsable;
        const nombreCompleto = responsable ? `${responsable.nombre} ${responsable.apellido || ''}`.trim() : 'SIN ASIGNAR';
        const idResp = responsable ? responsable.id : '0';
        if (!mapa[idResp]) {
          mapa[idResp] = { id: idResp, nombre: nombreCompleto, total: 0, tareas: [] };
        }
        mapa[idResp].total++;
        mapa[idResp].tareas.push({
          id: t.id, titulo: t.titulo, usId: us.id, usTitulo: us.titulo,
          estado: t.estado_detalle?.nombre || 'PENDIENTE'
        });
      });
    }
  });
  return Object.values(mapa).sort((a, b) => b.total - a.total);
});

const usSinTareas = computed(() => userStories.value.filter(us => !us.tareas || us.tareas.length === 0));

const irADetalleTarea = (usId) => router.push(`/proyectos/${proyectoId.value}/backlog/${usId}`);

const obtenerClaseEstado = (estado) => {
  const e = String(estado).toUpperCase();
  if (e === 'DONE' || e === 'FINALIZADO') return 'has-text-success';
  if (e === 'DOING' || e === 'EN PROCESO') return 'has-text-warning';
  return 'has-text-danger';
};

const calcularVencimiento = (us) => {
  if (!us.fecha_entrega || String(us.estado_detalle?.nombre).toUpperCase() === 'DONE') return null;
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const entrega = new Date(us.fecha_entrega); entrega.setHours(0,0,0,0);
  const diffDays = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { texto: `${Math.abs(diffDays)} días vencidos`, clase: 'has-text-danger', icono: 'fa-exclamation-circle' };
  else if (diffDays <= 3) return { texto: diffDays === 0 ? 'Vence hoy' : `Cierra en ${diffDays} días`, clase: 'has-text-warning-dark', icono: 'fa-hourglass-half' };
  return null;
};

const cargarCategorias = async () => {
  try {
    const { data } = await api.get('/user-stories/categorias');
    categorias.value = data;
  } catch (error) { console.error(error); }
};

const cargarUserStories = async () => {
  if (!proyectoId.value) return;
  cargando.value = true;
  try {
    const res = await userStoryService.getByProyecto(proyectoId.value);
    userStories.value = res.data;
  } catch (error) {
    console.error("Error cargando US:", error);
  } finally { 
    cargando.value = false; 
  }
};

const abrirDetalleUS = (us) => router.push(`/proyectos/${proyectoId.value}/backlog/${us.id}`);

const abrirModalNuevaUS = () => router.push(`/proyectos/${proyectoId.value}/backlog/nueva`);

const prepararEliminacion = (us) => { 
  if (!us) return;
  usAEliminar.value = us; 
  isConfirmActive.value = true; 
};

const ejecutarEliminacion = async () => {
  if (!usAEliminar.value || !usAEliminar.value.id) return;
  
  try {
    await userStoryService.delete(usAEliminar.value.id);
    isConfirmActive.value = false;
    usAEliminar.value = null;
    await cargarUserStories(); 
  } catch (error) { 
    console.error("Error al eliminar US:", error);
    alert("No se pudo eliminar la User Story.");
  }
};

const cargarDatosProyecto = async () => {
  try {
    const res = await api.get(`/proyectos/${proyectoId.value}`);
    proyectoData.value = res.data; 
  } catch (error) { 
    console.error("Error cargando proyecto:", error); 
  }
};

onMounted(() => {
  proyectoId.value = route.params.id;
  cargarUserStories();
  cargarDatosProyecto();
  cargarCategorias();
});
</script>

<style scoped>
/* Fondo general con corrección para móviles (evita repainted lag en iOS/Android) */
.dashboard-bg { 
  min-height: 100vh; 
  background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.8)), url('../assets/fondo.jpg'); 
  background-size: cover; 
  background-position: center;
  background-attachment: fixed; 
}

@media (max-width: 768px) {
  .dashboard-bg {
    background-attachment: scroll; 
  }
}

.glass-panel { 
  background: rgba(255, 255, 255, 0.03) !important; 
  backdrop-filter: blur(12px); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 12px; 
}

/* Pestañas adaptables estilo X.com sin desbordamiento */
.custom-tabs ul { 
  border-bottom: 2px solid rgba(255, 255, 255, 0.2); 
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.custom-tabs li a { 
  color: #ffffff !important; 
  border: 1px solid transparent !important; 
  white-space: nowrap;
}
.custom-tabs li.is-active a { 
  background-color: rgba(52, 152, 219, 0.3) !important; 
  border-bottom-color: #3498db !important; 
}

/* ERGONOMÍA TÁCTIL EN MÓVILES: Distribución equitativa y mayor área de toque para el pulgar */
@media (max-width: 768px) {
  .custom-tabs ul {
    display: flex;
    width: 100%;
  }
  .custom-tabs li {
    flex: 1 1 0%;
    text-align: center;
  }
  .custom-tabs li a {
    justify-content: center;
    padding: 0.85rem 0 !important;
    width: 100%;
    display: flex;
    align-items: center;
  }
  .custom-tabs li a .icon {
    margin: 0 !important;
  }
}

/* Efecto Tilt solo en dispositivos con cursor real */
@media (hover: hover) and (pointer: fine) {
  .hover-tilt-effect { 
    transform: rotate(0deg); 
    transition: transform 0.2s ease-out, box-shadow 0.2s ease-out; 
  }
  .hover-tilt-effect:hover { 
    transform: rotate(2deg) scale(1.02); 
    z-index: 10; 
    box-shadow: 0px 12px 30px rgba(0,0,0,0.45) !important; 
  }
}

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

.vencimiento-badge { 
  margin-top: -15px; 
  background: transparent; 
}
.letter-spacing-1 { 
  letter-spacing: 1px; 
}

:deep(.stats-glass-fix) { 
  background: rgba(255, 255, 255, 0.88) !important; 
  backdrop-filter: blur(8px); 
  border-radius: 15px; 
  padding: 25px; 
}
@media (max-width: 768px) {
  :deep(.stats-glass-fix) {
    padding: 12px;
  }
}

.has-text-warning-dark { color: #856404 !important; }
.border-bottom-info { border-bottom: 1px solid rgba(52, 152, 219, 0.3); }
.h-full { height: 100%; }

.task-link-box { 
  background: rgba(255, 255, 255, 0.03); 
  border-radius: 6px; 
  cursor: pointer; 
  transition: all 0.2s ease; 
  border: 1px solid transparent; 
}
.task-link-box:hover { 
  background: rgba(52, 152, 219, 0.15); 
  border-color: rgba(52, 152, 219, 0.4); 
  transform: translateX(3px); 
}

/* Utilidades específicas para control de desbordamiento en móviles */
.text-truncate-mobile {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Blindaje anti-desbordamiento para modales externos (como ConfirmarModal.vue) */
@media (max-width: 768px) {
  .text-truncate-mobile {
    max-width: 210px;
  }
  .is-flex-grow-1-mobile {
    flex-grow: 1 !important;
  }
  
  :deep(.modal-card) {
    margin: 0 12px !important;
    width: calc(100vw - 24px) !important;
    max-width: 500px !important;
  }
  :deep(.modal-card-head),
  :deep(.modal-card-body),
  :deep(.modal-card-foot) {
    padding: 12px 16px !important;
  }
  :deep(.modal-card-body) {
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
  }
  :deep(.modal-card-foot) {
    flex-wrap: wrap !important;
    gap: 8px !important;
    justify-content: stretch !important;
  }
  :deep(.modal-card-foot .button) {
    width: 100% !important;
    margin: 0 !important;
  }
}
/* ==========================================
   ADAPTACIÓN MODO CLARO: PRODUCT BACKLOG
   ================================---------- */

/* 1. Encabezado principal y botones de navegación */
body.theme-light .glass-panel h1.title,
body.theme-light .glass-panel h2 {
    color: #1a252f !important;
}

body.theme-light .glass-panel .button.is-ghost {
    color: #1d6fa5 !important; /* Flecha de retroceso visible */
}

body.theme-light .glass-panel .button.is-outlined {
    color: #1d6fa5 !important;
    border-color: #1d6fa5 !important;
}
body.theme-light .glass-panel .button.is-outlined:hover {
    background-color: rgba(29, 111, 165, 0.1) !important;
    color: #0b5ed7 !important;
}

body.theme-light .glass-panel .has-text-grey-lighter {
    color: #606f7b !important;
}

/* 2. Pestañas de navegación (Tabs) */
body.theme-light .custom-tabs ul {
    border-bottom-color: rgba(0, 0, 0, 0.15) !important;
}
body.theme-light .custom-tabs li a {
    color: #2c3e50 !important;
}
body.theme-light .custom-tabs li.is-active a {
    background-color: rgba(52, 152, 219, 0.15) !important;
    color: #1d6fa5 !important;
    border-bottom-color: #1d6fa5 !important;
}

/* 3. Tarjetas tipo Post-it con el color exacto solicitado */
body.theme-light .card-wrapper {
    background-color: rgba(236, 227, 183, 0.95) !important;
    border: 1px solid rgba(0, 0, 0, 0.12) !important;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05) !important;
}

/* 4. Tarjetas internas de la pestaña "Carga por Miembro" */
body.theme-light .box.has-background-dark {
    background: #ffffff !important;
    border: 1px solid #dcdcdc !important;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05) !important;
}
body.theme-light .box.has-background-dark .has-text-white {
    color: #2c3e50 !important;
}

/* 5. Título y subtítulos de la solapa Carga por Miembro */
body.theme-light .glass-panel h3.title {
    color: #1a252f !important;
}

body.theme-light .glass-panel .box.has-background-dark .has-text-info-light {
    color: #1d6fa5 !important;
}

/* 6. Cajas individuales de tareas dentro de la tarjeta de miembro */
body.theme-light .task-link-box {
    background: #f8f9fa !important;
    border: 1px solid #e9ecef !important;
}
body.theme-light .task-link-box:hover {
    background: #e2e8f0 !important;
    border-color: #cbd5e1 !important;
}
</style>