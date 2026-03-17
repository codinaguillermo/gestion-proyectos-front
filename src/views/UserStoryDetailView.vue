<template>
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-6 px-4 pb-6">
        
        <div class="glass-panel p-5 mb-5">
          <div class="level mb-4">
            <div class="level-left">
              <div class="is-flex is-align-items-center">
                <button class="button is-ghost has-text-white p-0 mr-4" @click="$router.back()">
                  <span class="icon is-medium"><i class="fas fa-arrow-left fa-lg"></i></span>
                </button>
                <h2 class="subtitle is-6 has-text-info has-text-weight-bold is-uppercase letter-spacing-1 mb-0">
                  {{ esEdicion ? 'Editando User Story' : 'Nueva User Story' }}
                </h2>
              </div>
            </div>
            <div class="level-right">
              <div class="buttons">
                <button class="button is-light is-medium px-5" @click="$router.back()">Cancelar</button>
                <button 
                  v-if="puedeGestionarEstructura"
                  class="button is-info is-medium has-text-weight-bold px-5" 
                  :class="{'is-loading': enviando}"
                  @click="guardarCambios"
                >
                  <span class="icon"><i class="fas fa-save"></i></span>
                  <span>{{ esEdicion ? 'Guardar Cambios' : 'Crear User Story' }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="border-top-glass pt-4">
            <h1 class="title has-text-white is-4 mb-0">
              {{ esEdicion ? editForm.titulo : 'Definir Nueva Etapa / US' }}
            </h1>
          </div>
        </div>

        <transition name="fade">
          <div v-if="mensajeExito" class="notification is-success is-light mb-5">
            <span class="icon mr-2"><i class="fas fa-check-circle"></i></span>
            <strong>¡Excelente!</strong> {{ mensajeExito }}
          </div>
        </transition>

        <transition name="fade">
          <div v-if="errorMsg" class="notification is-danger is-light mb-5">
            <span class="icon mr-2"><i class="fas fa-exclamation-circle"></i></span>
            <strong>Error:</strong> {{ errorMsg }}
          </div>
        </transition>

        <div class="columns is-multiline mb-5">
          <div class="column is-8">
            <div class="glass-panel p-5" style="height: 100%;">
              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Título de la US</label>
                <textarea 
                  class="textarea is-medium custom-input" 
                  rows="2" 
                  v-model="editForm.titulo" 
                  :disabled="!puedeGestionarEstructura" 
                  placeholder="Ej: Como usuario quiero que el sistema..."
                ></textarea>
              </div>
              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Descripción Detallada</label>
                <textarea 
                  class="textarea is-medium custom-input" 
                  v-model="editForm.descripcion" 
                  rows="4" 
                  :disabled="!puedeGestionarEstructura" 
                  placeholder="Explique el valor de este avance..."
                ></textarea>
              </div>
              <div class="field">
                <label class="label has-text-white is-size-5">Criterios de Aceptación</label>
                <textarea 
                  class="textarea is-medium custom-input" 
                  v-model="editForm.condiciones" 
                  rows="3" 
                  :disabled="!puedeGestionarEstructura" 
                  placeholder="Condiciones para dar por terminada esta US..."
                ></textarea>
              </div>
            </div>
          </div>
          
          <div class="column is-4">
            <div class="glass-panel p-5" style="height: 100%;">
              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Prioridad</label>
                <div class="select is-fullwidth is-medium custom-select">
                  <select v-model="editForm.prioridad_id" :disabled="!puedeGestionarEstructura">
                    <option v-for="p in prioridades" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                  </select>
                </div>
              </div>
              <div class="field mb-5">
                <label class="label has-text-link is-size-5">Estado</label>
                <div class="select is-fullwidth is-medium custom-select">
                  <select v-model="editForm.estado_id" :disabled="!puedeGestionarEstructura">
                    <option v-for="e in estados" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                  </select>
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Fecha de Entrega</label>
                <div class="control has-icons-left">
                  <input type="date" class="input is-medium custom-input" v-model="editForm.fecha_entrega" :disabled="!puedeGestionarEstructura">
                  <span class="icon is-small is-left"><i class="fas fa-calendar"></i></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="esEdicion" class="columns">
          <div class="column is-12">
            <div class="glass-panel p-5">
              <div class="level mb-4">
                <div class="level-left">
                  <h3 class="title is-4 has-text-white mb-0">Tareas Técnicas</h3>
                </div>
                <div class="level-right">
                  <button v-if="puedeGestionarEstructura" class="button is-primary is-small" @click="nuevaTarea">
                    <span class="icon is-small"><i class="fas fa-plus"></i></span>
                    <span>Nueva Tarea</span>
                  </button>
                </div>
              </div>

              <div class="table-container">
                <table class="table is-fullwidth glass-table">
                  <thead>
                    <tr>
                      <th class="has-text-info">Tarea</th>
                      <th class="has-text-info">Responsable</th>
                      <th class="has-text-info has-text-centered">Estado</th>
                      <th class="has-text-info has-text-centered">Estimado</th>
                      <th v-if="puedeGestionarEstructura" class="has-text-info has-text-centered">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tarea in tareas" :key="tarea.id" class="custom-row-hover clickable-row" @click="editarTarea(tarea)">
                      <td class="data-text-bright">{{ tarea.titulo }}</td>
                      <td class="data-text-bright">
                        {{ tarea.responsable ? `${tarea.responsable.apellido.toUpperCase()}, ${tarea.responsable.nombre}` : 'SIN ASIGNAR' }}
                      </td>
                      <td class="has-text-centered">
                        <span :class="['tag is-rounded', obtenerClaseEstadoTag(tarea)]" style="font-weight: 700;">
                          {{ tarea.estado_detalle?.nombre || 'TO DO' }}
                        </span>
                      </td>
                      <td class="has-text-centered data-text-bright">{{ tarea.horas_estimadas || 0 }}h</td>
                      <td v-if="puedeGestionarEstructura" class="has-text-centered" @click.stop>
                        <button class="button is-danger is-inverted is-small" @click="confirmarEliminarTarea(tarea)">
                          <span class="icon"><i class="fas fa-trash"></i></span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <ConfirmarModal 
      :isActive="isConfirmTareaActive" 
      :mensaje="`¿Estás seguro de eliminar la tarea?`" 
      @confirmar="ejecutarEliminacionTarea" 
      @cancelar="isConfirmTareaActive = false" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import userStoryService from '../services/userStory.service';
import tareaService from '../services/tarea.service';
import { projectService } from '../services/project.services';
import ConfirmarModal from '../components/modals/ConfirmarModal.vue';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const enviando = ref(false);
const mensajeExito = ref('');
const errorMsg = ref('');
const prioridades = ref([]);
const estados = ref([]);
const tareas = ref([]);
const integrantesProyecto = ref([]);
const isConfirmTareaActive = ref(false);
const tareaAEliminar = ref(null);

const editForm = reactive({
  id: null, proyecto_id: route.params.id, titulo: '', descripcion: '', condiciones: '',
  prioridad_id: 2, estado_id: 1, fecha_entrega: ''
});

const esEdicion = computed(() => !!route.params.usId && route.params.usId !== 'nueva');

const puedeGestionarEstructura = computed(() => {
  const u = authStore.usuario;
  if (!u) return false;
  if (Number(u.rol_id) === 1 || Number(u.rol_id) === 2) return true;
  return integrantesProyecto.value.some(m => Number(m.id) === Number(u.id));
});

const cargarDatos = async () => {
  try {
    const [resP, resE] = await Promise.all([
      api.get('/common/prioridades-us'), 
      api.get('/common/estados-us')
    ]);
    prioridades.value = resP.data;
    estados.value = resE.data;
    
    const resProj = await projectService.getById(route.params.id);
    if (resProj.success) {
      integrantesProyecto.value = resProj.data.integrantes || resProj.data.Usuarios || [];
    }

    if (esEdicion.value) {
      const resUS = await userStoryService.getById(route.params.usId);
      const us = resUS.data; 
      if (us) {
        Object.assign(editForm, us);
        if (us.fecha_entrega) editForm.fecha_entrega = us.fecha_entrega.split('T')[0];
        tareas.value = us.tareas || [];
      }
    }
  } catch (error) { console.error(error); }
};

const guardarCambios = async () => {
  if (!editForm.titulo?.trim()) {
    errorMsg.value = "El título es obligatorio.";
    return;
  }
  enviando.value = true;
  try {
    const payload = { ...editForm };
    if (!payload.fecha_entrega || String(payload.fecha_entrega).toLowerCase().includes('invalid')) {
      payload.fecha_entrega = null;
    }
    if (esEdicion.value) {
      await userStoryService.update(editForm.id, payload);
    } else {
      await userStoryService.create(payload);
    }
    router.back();
  } catch (error) {
    errorMsg.value = error.response?.data?.mensaje || "Error al conectar con el servidor.";
  } finally {
    enviando.value = false;
  }
};

const nuevaTarea = () => router.push(`/proyectos/${route.params.id}/backlog/${route.params.usId}/tarea/nueva`);
const editarTarea = (tarea) => router.push(`/proyectos/${route.params.id}/backlog/${route.params.usId}/tarea/${tarea.id}`);
const confirmarEliminarTarea = (t) => { tareaAEliminar.value = t; isConfirmTareaActive.value = true; };
const ejecutarEliminacionTarea = async () => {
  await tareaService.delete(tareaAEliminar.value.id);
  isConfirmTareaActive.value = false;
  cargarDatos();
};
const obtenerClaseEstadoTag = (tarea) => {
  const nombre = String(tarea.estado_detalle?.nombre || '').toUpperCase();
  return nombre === 'DONE' ? 'is-success' : (nombre === 'BACKLOG' || nombre === 'TO DO' ? 'is-danger' : 'is-warning');
};

onMounted(cargarDatos);
</script>

<style scoped>
.dashboard-bg { 
  min-height: 100vh; 
  background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('../assets/fondo.jpg'); 
  background-size: cover; 
  background-attachment: fixed; 
}
.glass-panel { 
  background: rgba(255, 255, 255, 0.05) !important; 
  backdrop-filter: blur(12px); 
  border: 1px solid rgba(255,255,255,0.1); 
  border-radius: 12px; 
}
.custom-input { 
  background: rgba(0,0,0,0.3) !important; 
  color: white !important; 
  border: 1px solid rgba(255,255,255,0.2) !important; 
}
.custom-input::placeholder { color: rgba(255, 255, 255, 0.7) !important; opacity: 1; }
.data-text-bright { color: #ffffff !important; font-size: 1.15rem !important; font-weight: 700; text-shadow: 0px 0px 8px rgba(255, 255, 255, 0.2); }
.glass-table { background: transparent !important; }
.glass-table td { padding: 1.2rem 0.75rem !important; vertical-align: middle; }
.clickable-row { cursor: pointer; }
.clickable-row:hover { background-color: rgba(52, 152, 219, 0.15) !important; }
.letter-spacing-1 { letter-spacing: 1px; }
.border-top-glass { border-top: 1px solid rgba(255, 255, 255, 0.1); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>