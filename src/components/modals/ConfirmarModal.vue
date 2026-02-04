<template>
  <div class="modal" :class="{ 'is-active': isActive }">
    <div class="modal-background" @click="$emit('cancelar')"></div>
    <div class="modal-card">
      <header class="modal-card-head has-background-warning">
        <p class="modal-card-title">Confirmar Acción</p>
        <button class="delete" @click="$emit('cancelar')"></button>
      </header>
      <section class="modal-card-body">
        <div class="media">
          <div class="media-left">
            <span class="icon is-large has-text-warning">
              <i class="fas fa-exclamation-triangle fa-2x"></i>
            </span>
          </div>
          <div class="media-content">
            <p class="is-size-5">{{ mensaje }}</p>
            <p class="is-size-7 has-text-grey mt-2">Esta operación no se puede deshacer.</p>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="$emit('cancelar')">Cancelar</button>
        <button class="button is-danger" @click="$emit('confirmar')">
          Confirmar y Eliminar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isActive: Boolean,
  mensaje: {
    type: String,
    default: '¿Estás seguro de que deseas eliminar este elemento?'
  }
});
defineEmits(['confirmar', 'cancelar']);
</script>