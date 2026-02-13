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
        <p class="modal-card-title">{{ form.id ? 'Editar Escuela' : 'Nueva Escuela' }}</p>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Nombre Corto (Siglas)</label>
          <input v-model="form.nombre_corto" class="input" placeholder="Ej: EET 24">
        </div>
        <div class="field">
          <label class="label">Nombre Largo</label>
          <input v-model="form.nombre_largo" class="input" placeholder="Ej: Simon de Iriondo">
        </div>
        <div class="field">
          <label class="label">CUE</label>
          <input v-model="form.cue" class="input" placeholder="Código Único de Establecimiento">
        </div>
        <div class="field">
          <label class="label">Dirección</label>
          <input v-model="form.direccion" class="input">
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" @click="guardar">Guardar</button>
        <button class="button" @click="$emit('close')">Cancelar</button>
      </footer>
    </div>
  </div>
</template>