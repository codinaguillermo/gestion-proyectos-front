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
                <input class="input" v-model="editForm.titulo" type="text" :disabled="!puedeGestionarEstructura">
              </div>
            </div>
            <div class="field">
              <label class="label">Descripción</label>
              <div class="control">
                <textarea class="textarea" v-model="editForm.descripcion" rows="2" :disabled="!puedeGestionarEstructura"></textarea>
              </div>
            </div>
          </div>
          
          <div class="column is-4">
            <div class="field">
              <label class="label">Importancia (Prioridad)</label>
              <div class="control">
                <div class="select is-fullwidth" :class="{'is-disabled': !puedeGestionarEstructura}">
                  <select v-model="editForm.prioridad_id" :disabled="!puedeGestionarEstructura">
                    <option v-for="p in prioridades" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label has-text-link">Estado (Gestión Manual)</label>
              <div class="control">
                <div class="select is-fullwidth" :class="{'is-disabled': !puedeGestionarEstructura}">
                  <select v-model="editForm.estado_id" :disabled="!puedeGestionarEstructura">
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
              :disabled="!puedeGestionarEstructura"
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
            <button v-if="puedeGestionarEstructura" class="button is-small is-primary" @click="$emit('agregar-tarea', userStory)">
              <span class="icon is-small"><i class="fas fa-plus"></i></span>
              <span>Nueva Tarea</span>
            </button>
          </div>
        </div>

        <div class="tareas-container" style="max-height: 250px; overflow-y: auto; border: 1px solid #dbdbdb; border-radius: 6px;">
          <table class="table is-fullwidth is-hoverable is-striped">
            <thead style="position: sticky; top: 0; background: white; z-index: 5;">
              <tr>
                <th>Tarea</th>
                <th>Responsable</th> 
                <th class="has-text-centered">Estado</th>
                <th class="has-text-centered">Horas</th>
                <th class="has-text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="tarea in userStory.tareas" 
                :key="tarea.id"
                :class="{ 'is-done-row': esTareaFinalizada(tarea) }"
              >
                <td class="is-vcentered">{{ tarea.titulo }}</td>
                <td class="is-vcentered">
                  <span class="is-size-7">{{ tarea.responsable?.nombre || 'Sin asignar' }}</span>
                </td>
                
                <td class="has-text-centered is-vcentered">
                  <span :class="['tag is-rounded', obtenerClaseEstadoTarea(tarea)]">
                    {{ tarea.estado_detalle?.nombre || 'TO DO' }}
                  </span>
                </td>

                <td class="has-text-centered is-vcentered">
                  <span class="has-text-weight-semibold">{{ tarea.horasReales || 0 }}h</span>
                </td>
                <td class="has-text-right is-vcentered">
                  <div class="buttons is-right">
                    <button class="button is-small is-info is-light" @click="$emit('editar-tarea', tarea)">
                      <span class="icon is-small"><i class="fas fa-eye"></i></span>
                    </button>
                    <button 
                      v-if="puedeGestionarEstructura" 
                      class="button is-small is-danger is-light" 
                      @click="pedirConfirmacionEliminar(tarea)"
                    >
                      <span class="icon is-small"><i class="fas fa-trash"></i></span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="$emit('close')">Cerrar</button>
        <button 
          v-if="puedeGestionarEstructura"
          class="button is-success" 
          :class="{'is-loading': enviando}" 
          @click="guardarCambios"
        >
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
import { reactive, ref, watch, computed } from 'vue';
import userStoryService from '../../services/userStory.service';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  isActive: Boolean,
  userStory: Object,
  prioridades: Array,
  estados: Array
});

const emit = defineEmits(['close', 'actualizar', 'agregar-tarea', 'editar-tarea', 'eliminar-tarea']);

const authStore = useAuthStore();
const enviando = ref(false);
const mostrarConfirmar = ref(false);
const tareaSeleccionada = ref(null);

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

// --- FUNCIONES DE APOYO ---

const obtenerClaseEstadoTarea = (tarea) => {
  if (!tarea || !tarea.estado_detalle) return 'is-light';
  const nombre = String(tarea.estado_detalle.nombre).toUpperCase().trim();
  
  if (nombre === 'DONE') return 'is-success has-text-white has-text-weight-bold';
  if (nombre === 'TO DO' || nombre === 'PENDIENTE') return 'is-danger has-text-white has-text-weight-bold';
  
  return 'is-light has-text-grey-dark';
};

const esTareaFinalizada = (tarea) => {
  if (!tarea || !tarea.estado_detalle) return false;
  const nombre = String(tarea.estado_detalle.nombre).toUpperCase().trim();
  return nombre === 'DONE';
};

// --- REGLAS DE NEGOCIO (PERMISOS) ---

// Solo Admin (1) o Docente (2) gestionan la US y la existencia de tareas
const puedeGestionarEstructura = computed(() => {
  const u = authStore.usuario;
  if (!u) return false;
  const miRol = Number(u.rol_id);
  return miRol === 1 || miRol === 2;
});

watch(() => props.userStory, (newVal) => {
  if (newVal) {
    editForm.id = newVal.id;
    editForm.titulo = newVal.titulo;
    editForm.descripcion = newVal.descripcion;
    editForm.condiciones = newVal.condiciones;
    editForm.prioridad_id = newVal.prioridad_id;
    editForm.estado_id = newVal.estado_id;
    errorVisible.value = false;
  }
}, { immediate: true });

const guardarCambios = async () => {
  enviando.value = true;
  errorVisible.value = false;
  try {
    await userStoryService.update(editForm.id, { ...editForm });
    emit('actualizar', { ...editForm });
    emit('close');
  } catch (error) {
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
.input:disabled, .textarea:disabled, .select select:disabled {
  background-color: #f5f5f5;
  border-color: #eeeeee;
  color: #7a7a7a;
  cursor: not-allowed;
}
.tag.is-danger {
  background-color: #ff1744 !important;
  color: white !important;
  font-weight: bold;
}
.tag.is-success {
  background-color: #00c853 !important;
  color: white !important;
  font-weight: bold;
}
.is-done-row {
  background-color: #f1fcf4 !important; 
  opacity: 0.85;
  transition: all 0.3s ease;
}
.is-done-row td {
  color: #2e7d32 !important; 
  font-style: italic;
}
</style>