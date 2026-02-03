<script setup>
import { ref } from 'vue';
import api from '../services/api';

const props = defineProps({
  userStory: {
    type: Object,
    required: true
  }
});

const eliminarUS = async () => {
  if (!confirm(`¿Estás seguro de eliminar la US: ${props.userStory.titulo}?`)) return;
  
  try {
    await api.delete(`/user-stories/${props.userStory.id}`);
    location.reload(); 
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("No se pudo eliminar la User Story");
  }
};
</script>

<template>
  <div class="box mb-4 border-us">
    <div class="columns is-mobile is-vcentered">
      
      <div class="column">
        <div class="tags mb-1">
          <span class="tag is-info is-light">User Story #{{ userStory.id }}</span>
          <span :class="['tag', userStory.prioridad === 'Alta' ? 'is-danger' : 'is-warning']">
            {{ userStory.prioridad || 'Media' }}
          </span>
        </div>
        <h3 class="title is-5 mb-1">{{ userStory.titulo }}</h3>
        <p class="is-size-7 has-text-grey">{{ userStory.descripcion }}</p>
      </div>

      <div class="column is-narrow">
        <div class="buttons">
          <button class="button is-small is-info is-outlined" title="Desglosar Tareas Técnicas">
            <span class="icon"><i class="fas fa-layer-group"></i></span>
            <span>Tareas</span>
          </button>
          
          <button class="button is-small is-danger is-light" @click="eliminarUS">
            <span class="icon is-small"><i class="fas fa-trash"></i></span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.border-us {
  border-left: 6px solid #3273dc;
  transition: all 0.2s ease;
  background-color: #ffffff;
}
.border-us:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
</style>