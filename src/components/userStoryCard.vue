<script setup>
import userStoryService from '../services/userStory.service'; // Usamos el service pro

const props = defineProps({
  userStory: {
    type: Object,
    required: true
  }
});

// Definimos el evento que va a escuchar el padre (userStoriesView)
const emit = defineEmits(['abrir-tareas']);
// Función para disparar la apertura del modal de tareas
const manejarClickTareas = () => {
  emit('abrir-tareas', props.userStory);
};


const eliminarUS = async () => {
  if (!confirm(`¿Estás seguro de eliminar la US: ${props.userStory.titulo}?`)) return;
  
  try {
    // Usamos el service, no la api pelada
    await userStoryService.delete(props.userStory.id);
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
          <button 
            class="button is-small is-info is-outlined" 
            title="Desglosar Tareas Técnicas"
            @click="manejarClickTareas"
          >
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