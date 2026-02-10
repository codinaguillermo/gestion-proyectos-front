<template>
  <div class="card mb-3 is-clickable shadow-sm" @click="$emit('click')">
    <div class="card-content p-4">
      <div class="level is-mobile mb-2">
        <div class="level-left">
          <span class="tag is-info is-light mr-2">US-{{ userStory.id }}</span>
          <h3 class="subtitle is-6 mb-0"><strong>{{ userStory.titulo }}</strong></h3>
        </div>
        <div class="level-right">
          <button 
            v-if="showDelete" 
            class="button is-small is-danger is-inverted" 
            @click.stop="$emit('eliminar', userStory.id)"
            title="Eliminar User Story"
          >
            <span class="icon is-small">
              <i class="fas fa-trash"></i>
            </span>
          </button>
        </div>
      </div>

      <div class="content is-size-7 has-text-grey">
        <p class="is-marginless">{{ userStory.descripcion }}</p>
      </div>

      <div class="level is-mobile mt-3">
        <div class="level-left">
          <span class="tag is-small is-warning is-light">
            {{ userStory.prioridad?.nombre || 'Prioridad' }}
          </span>
        </div>
        <div class="level-right">
          <div class="tags has-addons">
            <span class="tag is-small is-dark">Tareas</span>
            <span class="tag is-small is-info">{{ userStory.tareas?.length || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  userStory: {
    type: Object,
    required: true
  },
  // Esta es la "antena" que recibe la señal del Admin desde el Padre
  showDelete: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click', 'eliminar']);
</script>

<style scoped>
.card {
  transition: transform 0.2s;
  border-radius: 8px;
  border: 1px solid #ededed;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>