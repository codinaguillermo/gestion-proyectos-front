<template>
  <div class="modal" :class="{ 'is-active': isActive }">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card" style="width: 80%; max-width: 900px;">
      <header class="modal-card-head has-background-link">
        <p class="modal-card-title has-text-white">Gestionar User Story</p>
        <button class="delete" @click="$emit('close')"></button>
      </header>
      
      <section class="modal-card-body">
        <transition name="fade">
          <div v-if="errorVisible" class="notification is-danger is-light mb-4">
            <button class="delete" @click="errorVisible = false"></button>
            <div class="is-flex is-align-items-center">
              <span class="icon mr-2"><i class="fas fa-exclamation-circle"></i></span>
              <div>
                <strong>{{ mensajeError }}</strong>
                <p v-if="detalleError" class="is-size-7">{{ detalleError }}</p>
              </div>
            </div>
          </div>
        </transition>

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
                <th>Responsable</th> 
                <th class="has-text-centered">Estado</th>
                <th class="has-text-centered">Horas</th>
                <th class="has-text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tarea in userStory.tareas" :key="tarea.id">
                <td style="vertical-align: middle;">{{ tarea.titulo }}</td>
                <td style="vertical-align: middle;">
                  <span class="is-size-7">{{ tarea.responsable?.nombre || 'Sin asignar' }}</span>
                </td>
                <td class="has-text-centered" style="vertical-align: middle;">
                  <span class="tag is-light is-rounded">
                    {{ tarea.estado_detalle?.nombre || 'Estado ' + tarea.estado_id }}
                  </span>
                </td>
                <td class="has-text-centered" style="vertical-align: middle;">
                  <span class="has-text-weight-semibold">{{ tarea.horasReales || 0 }}h</span>
                </td>
                <td class="has-text-right" style="vertical-align: middle;">
                  <div class="buttons is-right">
                    <button class="button is-small is-info is-light" @click="$emit('editar-tarea', tarea)">
                      <span class="icon is-small"><i class="fas fa-edit"></i></span>
                    </button>
                    <button class="button is-small is-danger is-light" @click="pedirConfirmacionEliminar(tarea)">
                      <span class="icon is-small"><i class="fas fa-trash"></i></span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!userStory.tareas?.length">
                <td colspan="5" class="has-text-centered py-5 has-text-grey">
                  <p>No hay tareas desglosadas aún.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="$emit('close')">Cancelar</button>
        <button class="button is-success" :class="{'is-loading': enviando}" @click="guardarCambios">
          <span class="icon is-small"><i class="fas fa-save"></i></span>
          <span>Guardar Cambios</span>
        </button>
      </footer>
    </div>

    <div class="modal" :class="{ 'is-active': mostrarConfirmar }">
      <div class="modal-background" @click="cancelarEliminacion"></div>
      <div class="modal-card" style="width: 400px;">
        <header class="modal-card-head has-background-danger">
          <p class="modal-card-title has-text-white is-size-6">Confirmar Eliminación</p>
        </header>
        <section class="modal-card-body">
          <p>¿Estás seguro de eliminar la tarea: <br><strong>{{ tareaSeleccionada?.titulo }}</strong>?</p>
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end py-2">
          <button class="button is-small" @click="cancelarEliminacion">Cancelar</button>
          <button class="button is-danger is-small" @click="confirmarEliminacion">Eliminar Tarea</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import userStoryService from '../../services/userStory.service';

const props = defineProps({
  isActive: Boolean,
  userStory: Object,
  prioridades: Array,
  estados: Array
});

const emit = defineEmits(['close', 'actualizar', 'agregar-tarea', 'editar-tarea', 'eliminar-tarea']);

const enviando = ref(false);
const mostrarConfirmar = ref(false);
const tareaSeleccionada = ref(null);

// Estados para el error elegante
const errorVisible = ref(false);
const mensajeError = ref('');
const detalleError = ref('');

const editForm = reactive({
  id: null,
  titulo: '',
  descripcion: '',
  condiciones: '',
  prioridad_id: null,
  estado_id: null
});

// Sincronizar el formulario cuando cambia la US seleccionada
watch(() => props.userStory, (newVal) => {
  if (newVal) {
    editForm.id = newVal.id;
    editForm.titulo = newVal.titulo;
    editForm.descripcion = newVal.descripcion;
    editForm.condiciones = newVal.condiciones;
    editForm.prioridad_id = newVal.prioridad_id;
    editForm.estado_id = newVal.estado_id;
    // Limpiamos errores al cambiar de US
    errorVisible.value = false;
  }
}, { immediate: true });

const guardarCambios = async () => {
  enviando.value = true;
  errorVisible.value = false;
  
  try {
    // Llamamos al servicio para actualizar
    await userStoryService.update(editForm.id, { ...editForm });
    // Si sale bien, avisamos al padre para refrescar la lista y cerramos
    emit('actualizar', { ...editForm });
    emit('close');
  } catch (error) {
    // CAPTURAMOS EL ERROR 400 DEL BACKEND
    mensajeError.value = error.response?.data?.mensaje || "Error al actualizar";
    detalleError.value = error.response?.data?.detalle || "";
    errorVisible.value = true;
  } finally {
    enviando.value = false;
  }
};

const pedirConfirmacionEliminar = (tarea) => {
  tareaSeleccionada.value = tarea;
  mostrarConfirmar.value = true;
};

const cancelarEliminacion = () => {
  mostrarConfirmar.value = false;
  tareaSeleccionada.value = null;
};

const confirmarEliminacion = () => {
  emit('eliminar-tarea', tareaSeleccionada.value.id);
  mostrarConfirmar.value = false;
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.tareas-container::-webkit-scrollbar {
  width: 6px;
}
.tareas-container::-webkit-scrollbar-thumb {
  background: #dbdbdb;
  border-radius: 10px;
}
</style>