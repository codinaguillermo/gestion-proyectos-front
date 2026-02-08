<template>
  <div class="modal" :class="{ 'is-active': isActive }">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card" style="width: 80%; max-width: 900px;">
      <header class="modal-card-head has-background-link">
        <p class="modal-card-title has-text-white">Gestionar User Story</p>
        <button class="delete" @click="$emit('close')"></button>
      </header>
      
      <section class="modal-card-body">
        <div class="columns mb-0">
          <div class="column is-8">
            <div class="field">
              <label class="label">Título</label>
              <div class="control">
                <input class="input" v-model="editForm.titulo" type="text" placeholder="Título de la historia">
              </div>
            </div>
            <div class="field">
              <label class="label">Descripción</label>
              <div class="control">
                <textarea class="textarea" v-model="editForm.descripcion" rows="2" placeholder="Detalles de la US..."></textarea>
              </div>
            </div>
          </div>
          
          <div class="column is-4">
            <div class="field">
              <label class="label">Importancia (Prioridad)</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="editForm.prioridad_id">
                    <option v-for="p in prioridades" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label has-text-link">Estado (Gestión Manual)</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="editForm.estado_id">
                    <option v-for="e in estados" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="field mt-4">
          <label class="label">Condiciones (Criterios de Aceptación)</label>
          <div class="control">
            <textarea 
              class="textarea" 
              v-model="editForm.condiciones" 
              rows="2" 
              placeholder="¿Qué debe cumplir esta US para considerarse terminada?"
            ></textarea>
          </div>
        </div>

        <hr class="my-4">

        <div class="level mb-2">
          <div class="level-left">
            <h3 class="title is-5 mb-0">
              <span class="icon mr-2"><i class="fas fa-tasks"></i></span>Tareas Técnicas
            </h3>
          </div>
          <div class="level-right">
            <button class="button is-small is-primary" @click="$emit('agregar-tarea', userStory)">
              <span class="icon is-small"><i class="fas fa-plus"></i></span>
              <span>Nueva Tarea</span>
            </button>
          </div>
        </div>

        <div class="tareas-container" style="max-height: 250px; overflow-y: auto; border: 1px solid #dbdbdb; border-radius: 6px;">
          <table class="table is-fullwidth is-hoverable is-striped">
            <thead style="position: sticky; top: 0; background: white; z-index: 5; box-shadow: 0 2px 2px -2px rgba(0,0,0,0.2);">
              <tr>
                <th>Tarea</th>
                <th class="has-text-centered">Estado</th>
                <th class="has-text-centered">Horas</th>
                <th class="has-text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tarea in userStory.tareas" :key="tarea.id">
                <td style="vertical-align: middle;">{{ tarea.titulo }}</td>
                <td class="has-text-centered" style="vertical-align: middle;">
                  <span class="tag is-light is-rounded">{{ tarea.estado_detalle?.nombre || tarea.estado_id }}</span>
                </td>
                <td class="has-text-centered" style="vertical-align: middle;">
                  <span class="has-text-weight-semibold">{{ tarea.horasReales || 0 }}h</span>
                </td>
                <td class="has-text-right" style="vertical-align: middle;">
                  <button class="button is-small is-info is-light" @click="$emit('editar-tarea', tarea)">
                    <span class="icon is-small"><i class="fas fa-edit"></i></span>
                  </button>
                </td>
              </tr>
              <tr v-if="!userStory.tareas?.length">
                <td colspan="4" class="has-text-centered py-5 has-text-grey">
                  <p>No hay tareas desglosadas aún.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="$emit('close')">Cancelar</button>
        <button class="button is-success" @click="guardarCambios">
          <span class="icon is-small"><i class="fas fa-save"></i></span>
          <span>Guardar Cambios</span>
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  isActive: Boolean,
  userStory: Object,
  prioridades: Array,
  estados: Array
});

const emit = defineEmits(['close', 'actualizar', 'agregar-tarea', 'editar-tarea']);

const editForm = reactive({
  titulo: '',
  descripcion: '',
  condiciones: '', 
  prioridad_id: null,
  estado_id: null
});

watch(() => props.userStory, (newVal) => {
  if (newVal) {
    editForm.titulo = newVal.titulo;
    editForm.descripcion = newVal.descripcion;
    editForm.condiciones = newVal.condiciones || ''; 
    editForm.prioridad_id = newVal.prioridad_id;
    editForm.estado_id = newVal.estado_id;
  }
}, { immediate: true });

const guardarCambios = () => {
  emit('actualizar', { id: props.userStory.id, ...editForm });
};
</script>