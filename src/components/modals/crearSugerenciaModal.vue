<template>
  <div :class="['modal', { 'is-active': isActive }]">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-size-5 text-truncate-mobile">
          <span class="icon mr-2"><i class="fas fa-lightbulb has-text-warning"></i></span>
          Nueva Sugerencia o Reporte
        </p>
        <button class="delete" aria-label="close" @click="$emit('close')"></button>
      </header>
      <section class="modal-card-body">
        <div v-if="error" class="notification is-danger is-light py-2 mb-4 is-size-7-mobile">
          {{ error }}
        </div>

        <div class="field">
          <label class="label is-size-7-mobile">Título de la sugerencia</label>
          <div class="control">
            <input 
              v-model="form.titulo" 
              class="input is-medium-tablet is-small-mobile custom-input-mobile" 
              type="text" 
              placeholder="Ej: Error en carga de avatars, Sugerencia de diseño..."
              required
            >
          </div>
        </div>

        <div class="field">
          <label class="label is-size-7-mobile">Descripción detallada</label>
          <div class="control">
            <textarea 
              v-model="form.descripcion" 
              class="textarea is-medium-tablet is-small-mobile custom-textarea-mobile" 
              placeholder="Explicanos qué sucede o qué te gustaría mejorar..."
              rows="5"
              required
            ></textarea>
          </div>
          <p class="help is-size-7-mobile mt-1">Tu nombre y la fecha actual se registrarán automáticamente.</p>
        </div>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <button 
          class="button is-success" 
          :class="{'is-loading': enviando}" 
          @click="enviar"
          :disabled="!form.titulo || !form.descripcion"
        >
          Enviar Sugerencia
        </button>
        <button class="button" @click="$emit('close')">Cancelar</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import sugerenciaService from '../../services/sugerencia.service';

const props = defineProps({
  isActive: Boolean
});

const emit = defineEmits(['close', 'sugerencia-enviada']);

const enviando = ref(false);
const error = ref('');

const form = reactive({
  titulo: '',
  descripcion: ''
});

const enviar = async () => {
  if (!form.titulo || !form.descripcion) return;
  
  enviando.value = true;
  error.value = '';
  
  try {
    await sugerenciaService.create(form);
    form.titulo = '';
    form.descripcion = '';
    emit('sugerencia-enviada');
    emit('close');
  } catch (err) {
    error.value = err.response?.data?.mensaje || "Error al enviar la sugerencia.";
  } finally {
    enviando.value = false;
  }
};
</script>

<style scoped>
/* Control de desbordamiento de texto */
.text-truncate-mobile {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Blindaje anti-desbordamiento y ergonomía táctil para móviles de 360px - 400px */
@media (max-width: 768px) {
  .modal-card {
    margin: 0 12px !important;
    width: calc(100vw - 24px) !important;
    max-width: 500px !important;
  }

  .modal-card-head,
  .modal-card-body,
  .modal-card-foot {
    padding: 12px 16px !important;
  }

  .modal-card-title {
    font-size: 1rem !important;
    max-width: calc(100% - 30px);
  }

  .custom-input-mobile,
  .custom-textarea-mobile {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Apilamiento de botones y prioridad táctil con el pulgar (acción principal verde arriba) */
  .modal-card-foot {
    flex-wrap: wrap !important;
    gap: 8px !important;
    justify-content: stretch !important;
  }
  
  .modal-card-foot .button {
    width: 100% !important;
    margin: 0 !important;
  }
  
  .modal-card-foot .button.is-success {
    order: 1;
  }
  
  .modal-card-foot .button:not(.is-success) {
    order: 2;
  }
}
</style>