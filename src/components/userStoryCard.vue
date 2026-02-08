<template>
  <div 
    class="box mb-4 is-clickable shadow-on-hover mx-auto card-custom-width" 
    @click="$emit('click')"
  >
    <div class="columns is-vcentered is-mobile">
      
      <div class="column">
        <div class="is-flex is-align-items-center">
          <span class="icon has-text-link mr-2">
            <i class="fas fa-bookmark"></i>
          </span>
          <h3 class="title is-5 mb-0">{{ userStory.titulo }}</h3>
        </div>
        
        <p class="is-size-7 has-text-grey mt-1">
          {{ userStory.descripcion || 'Sin descripción detallada' }}
        </p>

        <div v-if="userStory.condiciones || userStory.condicion" class="mt-2 p-2 is-light-gray-bg border-radius-sm">
          <p class="is-size-7 has-text-weight-semibold has-text-grey-dark mb-1">
            <span class="icon is-small has-text-info"><i class="fas fa-clipboard-check"></i></span>
            Criterios de Aceptación:
          </p>
          <p class="is-size-7 has-text-grey-darker is-italic">
            {{ userStory.condiciones || userStory.condicion }}
          </p>
        </div>
        
        <div class="tags mt-2">
          <span class="tag is-light is-info">
            {{ userStory.tareas?.length || 0 }} Tareas
          </span>
          <span v-if="userStory.prioridad_detalle" class="tag is-warning is-light">
            {{ userStory.prioridad_detalle.nombre }}
          </span>
        </div>
      </div>

      <div class="column is-narrow">
        <button 
          class="button is-white has-text-danger" 
          @click.stop="$emit('eliminar', userStory.id)"
          title="Eliminar User Story"
        >
          <span class="icon">
            <i class="fas fa-trash-alt"></i>
          </span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  userStory: Object
});

defineEmits(['click', 'eliminar']);
</script>

<style scoped>
.card-custom-width {
  max-width: 50%; /* Reducción del 30% del ancho */
  width: 100%;
}

.is-clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 5px solid #3273dc;
}

.shadow-on-hover:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transform: translateY(-2px);
  background-color: #fafafa;
}

.is-light-gray-bg {
  background-color: #f0f4f8; 
  border-left: 4px solid #3273dc;
}

.border-radius-sm {
  border-radius: 4px;
}

.button {
  cursor: pointer;
}

/* Para asegurar que en móviles no quede demasiado pequeña */
@media screen and (max-width: 768px) {
  .card-custom-width {
    max-width: 95%;
  }
}
</style>