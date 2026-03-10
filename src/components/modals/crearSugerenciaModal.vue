<template>
  <div :class="['modal', { 'is-active': isActive }]">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-size-5">
          <span class="icon mr-2"><i class="fas fa-lightbulb has-text-warning"></i></span>
          Nueva Sugerencia o Reporte
        </p>
        <button class="delete" aria-label="close" @click="$emit('close')"></button>
      </header>
      <section class="modal-card-body">
        <div v-if="error" class="notification is-danger is-light py-2 mb-4">
          {{ error }}
        </div>

        <div class="field">
          <label class="label">Título de la sugerencia</label>
          <div class="control">
            <input 
              v-model="form.titulo" 
              class="input" 
              type="text" 
              placeholder="Ej: Error en carga de avatars, Sugerencia de diseño..."
              required
            >
          </div>
        </div>

        <div class="field">
          <label class="label">Descripción detallada</label>
          <div class="control">
            <textarea 
              v-model="form.descripcion" 
              class="textarea" 
              placeholder="Explicanos qué sucede o qué te gustaría mejorar..."
              rows="5"
              required
            ></textarea>
          </div>
          <p class="help">Tu nombre y la fecha actual se registrarán automáticamente.</p>
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