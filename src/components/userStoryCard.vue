<template>
  <div class="card mb-4 is-clickable shadow-sm" @click="$emit('click')">
    <div class="card-content p-4">
      
      <div class="is-flex is-justify-content-between is-align-items-start mb-2">
        <div style="flex: 1;">
          <span class="tag is-info is-light is-small mr-2" style="vertical-align: middle;">US-{{ userStory.id }}</span>
          <h3 class="subtitle is-6 mb-0 is-inline-block custom-title-clamp">
            <strong>{{ userStory.titulo }}</strong>
          </h3>
        </div>
        
        <div class="ml-2">
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

// --- CONSTANTES DE ESTADO ---
const ID_DONE = 5; // Solo el ID 5 cuenta como terminado para las métricas

const stats = computed(() => {
  const tareas = props.userStory.tareas || [];
  const total = tareas.length;
  
  // Refactorización: Solo contamos como terminadas las que tienen ID 5 (DONE)
  const terminadas = tareas.filter(t => {
    const idEstado = Number(t.estado_id);
    const nombreEstado = String(t.estado_detalle?.nombre || '').toUpperCase().trim();
    return idEstado === ID_DONE || nombreEstado === 'DONE';
  }).length;

  const porcentaje = total > 0 ? Math.round((terminadas / total) * 100) : 0;

  // Manejo de clases visuales según el avance real (Auditoría Docente)
  let clase = 'is-danger'; 
  let claseTexto = 'has-text-danger';

  if (porcentaje > 0) {
    clase = 'is-warning'; 
    claseTexto = 'has-text-warning-dark';
  }
  
  // Si llegamos a más del 75% pero falta el OK final del docente
  if (porcentaje >= 75 && porcentaje < 100) {
    clase = 'is-link'; 
    claseTexto = 'has-text-link';
  }

  // SOLO verde cuando el docente puso TODO en ID 5
  if (porcentaje === 100 && total > 0) {
    clase = 'is-success'; 
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

const colorPrioridad = computed(() => {
  const p = String(props.userStory.prioridad_detalle?.nombre || '').toUpperCase();
  if (p.includes('ALTA')) return 'is-danger';
  if (p.includes('MEDIA')) return 'is-warning';
  if (p.includes('BAJA')) return 'is-success';
  return 'is-light';
});

const colorEstado = computed(() => {
  const e = String(props.userStory.estado_detalle?.nombre || '').toUpperCase();
  if (e.includes('PENDIENTE')) return 'is-info is-light';
  if (e.includes('DESARROLLO')) return 'is-link is-light';
  if (e.includes('BLOQUEADA')) return 'is-danger is-light';
  // El estado de la US también debería ser verde solo si está TERMINADA
  if (e.includes('TERMINADA') || e.includes('DONE')) return 'is-success is-light';
  return 'is-light';
});
</script>

<style scoped>
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

/* TÍTULO FORZADO A 2 RENGLONES FIJOS */
.custom-title-clamp {
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: normal !important;
  
  /* Altura fija calculada */
  line-height: 1.2em !important;
  height: 2.4em !important; 
  min-height: 2.4em !important;
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