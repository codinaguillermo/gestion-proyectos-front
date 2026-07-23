<script setup>
import { reactive, watch } from 'vue';
import api from '../../services/api';

const props = defineProps({
  isActive: Boolean,
  escuelaEdit: { type: Object, default: null }
});

const emit = defineEmits(['close', 'escuela-guardada']);
const form = reactive({ id: null, nombre_corto: '', nombre_largo: '', cue: '', direccion: '' });

watch(() => props.isActive, (val) => {
  if (val && props.escuelaEdit) {
    Object.assign(form, props.escuelaEdit);
  } else if (val) {
    Object.assign(form, { id: null, nombre_corto: '', nombre_largo: '', cue: '', direccion: '' });
  }
});

const guardar = async () => {
  try {
    if (form.id) {
      await api.put(`/escuelas/${form.id}`, form);
    } else {
      await api.post('/escuelas', form);
    }
    emit('escuela-guardada');
    emit('close');
  } catch (err) {
    alert("Error al guardar la escuela");
  }
};
</script>

<template>
  <div class="modal" :class="{ 'is-active': isActive }">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title text-truncate-mobile">{{ form.id ? 'Editar Escuela' : 'Nueva Escuela' }}</p>
        <button class="delete" aria-label="close" @click="$emit('close')"></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label is-size-7-mobile">Nombre Corto (Siglas)</label>
          <input v-model="form.nombre_corto" class="input is-medium-tablet is-small-mobile custom-input-mobile" placeholder="Ej: EET 24">
        </div>
        <div class="field">
          <label class="label is-size-7-mobile">Nombre Largo</label>
          <input v-model="form.nombre_largo" class="input is-medium-tablet is-small-mobile custom-input-mobile" placeholder="Ej: Simon de Iriondo">
        </div>
        <div class="field">
          <label class="label is-size-7-mobile">CUE</label>
          <input v-model="form.cue" class="input is-medium-tablet is-small-mobile custom-input-mobile" placeholder="Código Único de Establecimiento">
        </div>
        <div class="field">
          <label class="label is-size-7-mobile">Dirección</label>
          <input v-model="form.direccion" class="input is-medium-tablet is-small-mobile custom-input-mobile">
        </div>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button is-success" @click="guardar">Guardar</button>
        <button class="button" @click="$emit('close')">Cancelar</button>
      </footer>
    </div>
  </div>
</template>

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

  .custom-input-mobile {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Apilamiento de botones y prioridad táctil con el pulgar (botón de acción primario arriba) */
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