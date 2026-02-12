<template>
  <div class="card mb-4 is-clickable shadow-sm" @click="$emit('click')">
    <div class="card-content p-4">
      
      <div class="level is-mobile mb-2">
        <div class="level-left">
          <span class="tag is-info is-light is-small mr-2">US-{{ userStory.id }}</span>
          <h3 class="subtitle is-6 mb-0"><strong>{{ userStory.titulo }}</strong></h3>
        </div>
        <div class="level-right">
          <button 
            v-if="showDelete" 
            class="button is-small is-danger is-inverted" 
            @click.stop="$emit('eliminar', userStory.id)"
          >
            <span class="icon is-small"><i class="fas fa-trash"></i></span>
          </button>
        </div>
      </div>

      <div class="content is-size-7 has-text-grey custom-description">
        <p class="is-marginless">{{ userStory.descripcion }}</p>
      </div>

      <div class="mt-3">
        <div class="tags">
          <span class="tag is-small is-light" :class="colorPrioridad">
            <span class="has-text-weight-bold">Prioridad:</span>&nbsp;{{ userStory.prioridad_detalle?.nombre || 'N/A' }}
          </span>
          
          <span class="tag is-small is-light" :class="colorEstado">
            <span class="has-text-weight-bold">Estado:</span>&nbsp;{{ userStory.estado_detalle?.nombre || 'N/A' }}
          </span>
        </div>
      </div>

      <div class="mt-4">
        <div class="mb-1">
          <span class="is-size-7 has-text-grey-dark">
            Tareas: <strong class="has-text-dark">{{ stats.terminadas }}</strong> de {{ stats.total }}
          </span>
        </div>

        <div class="is-flex is-align-items-center">
          <div style="flex-grow: 1; margin-right: 10px;">
            <progress 
              class="progress is-small m-0" 
              :class="stats.claseBarra" 
              :value="stats.porcentaje" 
              max="100">
              {{ stats.porcentaje }}%
            </progress>
          </div>
          <div style="min-width: 45px;" class="has-text-right">
            <span :class="['is-size-7 has-text-weight-bold', stats.claseTexto]">
              {{ stats.porcentaje }}%
            </span>
          </div>
        </div>
      </div>

      <div class="level is-mobile mt-2">
        <div class="level-left"></div>
        <div class="level-right">
          <div class="tags has-addons">
            <span class="tag is-small is-dark">Tareas Totales</span>
            <span class="tag is-small is-info">{{ stats.total }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  userStory: { type: Object, required: true },
  showDelete: { type: Boolean, default: false }
});

defineEmits(['click', 'eliminar']);

// --- LÓGICA DE PROGRESO POR CANTIDAD DE TAREAS ---
const stats = computed(() => {
  const tareas = props.userStory.tareas || [];
  const total = tareas.length;
  
  // FILTRO CORRECTO: Buscamos el ID 4 o el nombre 'DONE'
  const terminadas = tareas.filter(t => {
    const idEstado = Number(t.estado_id);
    const nombreEstado = String(t.estado_detalle?.nombre || '').toUpperCase().trim();
    
    // Validamos contra tu tabla real: ID 4 o nombre 'DONE'
    return idEstado === 4 || nombreEstado === 'DONE';
  }).length;

  const porcentaje = total > 0 ? Math.round((terminadas / total) * 100) : 0;

  // Lógica de colores dinámica
  let clase = 'is-danger'; // 0% - Rojo
  let claseTexto = 'has-text-danger';

  if (porcentaje > 0) {
    clase = 'is-warning'; // Iniciado - Amarillo
    claseTexto = 'has-text-warning-dark';
  }
  if (porcentaje >= 75) {
    clase = 'is-link'; // Avanzado - Azul
    claseTexto = 'has-text-link';
  }
  if (porcentaje === 100) {
    clase = 'is-success'; // Completado - Verde
    claseTexto = 'has-text-success';
  }

  return { 
    total, 
    terminadas, 
    porcentaje, 
    claseBarra: clase, 
    claseTexto: claseTexto 
  };
});

// Lógica de Colores para PRIORIDAD
const colorPrioridad = computed(() => {
  const p = String(props.userStory.prioridad_detalle?.nombre || '').toUpperCase();
  if (p.includes('ALTA')) return 'is-danger';
  if (p.includes('MEDIA')) return 'is-warning';
  if (p.includes('BAJA')) return 'is-success';
  return 'is-light';
});

// Lógica de Colores para ESTADO
const colorEstado = computed(() => {
  const e = String(props.userStory.estado_detalle?.nombre || '').toUpperCase();
  if (e.includes('PENDIENTE')) return 'is-info is-light';
  if (e.includes('DESARROLLO')) return 'is-link is-light';
  if (e.includes('BLOQUEADA')) return 'is-danger is-light';
  if (e.includes('TERMINADA')) return 'is-success is-light';
  return 'is-light';
});
</script>

<style scoped>
/* Tu CSS existente se mantiene igual */
.card {
  transition: all 0.2s ease;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1) !important;
}
.custom-description {
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.progress {
  transition: all 0.5s ease;
}
</style>