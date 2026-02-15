<template>
  <div class="box mt-6 shadow-sm border-top-info">
    <h3 class="title is-4 has-text-centered has-text-info mb-5">
      <span class="icon-text">
        <span class="icon"><i class="fas fa-chart-line"></i></span>
        <span>Análisis de Rendimiento y Carga</span>
      </span>
    </h3>
    
    <div v-if="cargando" class="has-text-centered py-6">
      <span class="icon is-large has-text-info">
        <i class="fas fa-spinner fa-pulse fa-3x"></i>
      </span>
      <p class="mt-4 has-text-grey is-italic">Sincronizando métricas del equipo...</p>
    </div>

    <div v-else class="columns is-multiline">
      <div class="column is-7">
        <h5 class="subtitle is-5 ml-2 mb-4">
          <i class="fas fa-tasks mr-2 has-text-grey"></i>Progreso por User Story
        </h5>
        
        <div v-for="(segmentos, titulo) in avanceAgrupado" :key="titulo" class="us-stat-card mb-4 p-4">
          <div class="is-flex is-justify-content-between is-align-items-center mb-2">
            <span class="has-text-weight-bold is-size-6 has-text-dark">{{ titulo }}</span>
            <span class="tag is-success is-light has-text-weight-bold is-rounded">
              {{ calcularPorcentaje(segmentos) }}%
            </span>
          </div>
          
          <progress 
            class="progress is-warning mb-2" 
            :value="calcularTareasTerminadas(segmentos)" 
            :max="totalTareasUS(segmentos)">
          </progress>
          
          <div class="is-flex is-justify-content-between is-size-7 has-text-grey-dark">
             <span>
               <i class="fas fa-clipboard-list mr-1 has-text-info"></i>
               <strong>{{ totalTareasUS(segmentos) }}</strong> tareas
             </span>
             <span>
               <i class="fas fa-check-double mr-1 has-text-success"></i>
               <strong>{{ calcularTareasTerminadas(segmentos) }}</strong> finalizadas
             </span>
          </div>
        </div>
      </div>

      <div class="column is-5">
        <h5 class="subtitle is-5 ml-2 mb-4">
          <i class="fas fa-users mr-2 has-text-grey"></i>Carga de Trabajo Global
        </h5>
        <div class="chart-container shadow-inner">
          <Bar v-if="datosGrafico" :data="datosGrafico" :options="chartOptions" />
        </div>
        <div class="has-text-centered mt-3">
          <p class="is-size-7 has-text-grey">
            La barra muestra la carga total del alumno en el sistema.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { 
  Chart as ChartJS, Title, Tooltip, Legend, 
  BarElement, CategoryScale, LinearScale 
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  proyectoId: { type: [Number, String], required: true }
});

const rawData = ref(null);
const cargando = ref(true);

const fetchStats = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/stats/proyecto/${props.proyectoId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const result = await response.json();
    if (result.success) {
      rawData.value = result.data;
    }
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
  } finally {
    cargando.value = false;
  }
};

const avanceAgrupado = computed(() => {
  if (!rawData.value) return {};
  return rawData.value.avanceUS.reduce((acc, curr) => {
    if (!acc[curr.us_titulo]) acc[curr.us_titulo] = [];
    acc[curr.us_titulo].push(curr);
    return acc;
  }, {});
});

const totalTareasUS = (us) => us.reduce((sum, item) => sum + item.cantidad, 0);
const calcularTareasTerminadas = (us) => us.find(i => i.estado === 'DONE')?.cantidad || 0;
const calcularPorcentaje = (us) => Math.round((calcularTareasTerminadas(us) / totalTareasUS(us)) * 100) || 0;

const datosGrafico = computed(() => {
  if (!rawData.value) return null;
  return {
    labels: rawData.value.participacion.map(p => p.nombre || 'Sin Asignar'),
    datasets: [
      {
        label: 'Este Proyecto',
        backgroundColor: '#3e8ed0',
        data: rawData.value.participacion.map(p => p.tareas),
        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 }
      },
      {
        label: 'Otros Proyectos',
        backgroundColor: '#e2e8f0', // Un gris claro para la carga externa
        data: rawData.value.participacion.map(p => parseInt(p.tareas_externas) || 0),
        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
      }
    ]
  };
});

const chartOptions = { 
  responsive: true, 
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        footer: (tooltipItems) => {
          let sum = 0;
          tooltipItems.forEach((item) => { sum += item.raw; });
          return 'Carga Total: ' + sum;
        }
      }
    }
  },
  scales: {
    x: { 
      stacked: true,
      grid: { display: false }
    },
    y: { 
      stacked: true,
      beginAtZero: true,
      ticks: { stepSize: 1, color: '#b5b5b5' },
      grid: { color: '#f5f5f5' }
    }
  }
};

onMounted(fetchStats);
</script>

<style scoped>
.border-top-info { border-top: 5px solid #3e8ed0; }
.us-stat-card {
  background-color: #f9fbfd;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  transition: transform 0.2s ease;
}
.us-stat-card:hover {
  transform: translateX(5px);
  background-color: #f1f5f9;
}
.progress { height: 1rem; border-radius: 10px; }
.chart-container {
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  height: 340px;
}
.shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05); }
</style>