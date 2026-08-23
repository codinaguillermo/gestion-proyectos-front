<template>
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-4 px-2-mobile px-4-tablet pb-6">
        
        <!-- BARRA DE ACCIÓN COMPACTA -->
        <div class="glass-panel p-4 mb-5">
          <div class="columns is-mobile is-multiline is-align-items-center mb-0">
            <div class="column is-12-mobile is-7-tablet pb-2-mobile">
              <div class="is-flex is-align-items-center">
                <button class="button is-ghost has-text-white p-0 mr-3" @click="$router.back()">
                  <span class="icon is-medium"><i class="fas fa-arrow-left fa-lg"></i></span>
                </button>
                <h2 class="subtitle is-size-7-mobile is-size-6-tablet has-text-info has-text-weight-bold is-uppercase letter-spacing-1 mb-0">
                  {{ esEdicion ? 'Editando User Story' : 'Nueva User Story' }}
                </h2>
              </div>
            </div>
            <div class="column is-12-mobile is-5-tablet pt-1-mobile is-flex is-justify-content-flex-end-tablet">
              <div class="buttons is-fullwidth-mobile mt-2-mobile">
                <button class="button is-light is-medium-tablet is-small-mobile px-5 is-flex-grow-1-mobile mb-0" @click="$router.back()">Cancelar</button>
                <button 
                  v-if="puedeGestionarEstructura"
                  class="button is-info is-medium-tablet is-small-mobile has-text-weight-bold px-5 is-flex-grow-1-mobile mb-0" 
                  :class="{'is-loading': enviando}"
                  @click="guardarCambios"
                >
                  <span class="icon"><i class="fas fa-save"></i></span>
                  <span>{{ esEdicion ? 'Guardar Cambios' : 'Crear User Story' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <transition name="fade">
          <div v-if="mensajeExito" class="notification is-success is-light mb-4 is-size-6-mobile">
            <span class="icon mr-2"><i class="fas fa-check-circle"></i></span>
            <strong>¡Excelente!</strong> {{ mensajeExito }}
          </div>
        </transition>

        <transition name="fade">
          <div v-if="errorMsg" class="notification is-danger is-light mb-4 is-size-6-mobile">
            <span class="icon mr-2"><i class="fas fa-exclamation-circle"></i></span>
            <strong>Error:</strong> {{ errorMsg }}
          </div>
        </transition>

        <!-- ESTRUCTURA PRINCIPAL -->
        <div class="columns is-multiline is-variable is-4 mb-4">
          <div class="column is-12-mobile is-8-desktop">
            <div class="glass-panel p-4-mobile p-5-tablet" style="height: 100%;">
              <div class="field mb-4">
                <label class="label has-text-white is-size-6-mobile is-size-5-tablet">Título de la US</label>
                <textarea 
                  class="textarea is-medium-tablet is-small-mobile custom-input" 
                  rows="2" 
                  v-model="editForm.titulo" 
                  :disabled="!puedeGestionarEstructura" 
                  placeholder="Ej: Como usuario quiero que el sistema..."
                ></textarea>
              </div>
              <div class="field mb-4">
                <label class="label has-text-white is-size-6-mobile is-size-5-tablet">Descripción Detallada</label>
                <textarea 
                  class="textarea is-medium-tablet is-small-mobile custom-input" 
                  v-model="editForm.descripcion" 
                  rows="4" 
                  :disabled="!puedeGestionarEstructura" 
                  placeholder="Explique el valor de este avance..."
                ></textarea>
              </div>
              <div class="field mb-0">
                <label class="label has-text-white is-size-6-mobile is-size-5-tablet">Criterios de Aceptación</label>
                <textarea 
                  class="textarea is-medium-tablet is-small-mobile custom-input" 
                  v-model="editForm.condiciones" 
                  rows="3" 
                  :disabled="!puedeGestionarEstructura" 
                  placeholder="Condiciones para dar por terminada esta US..."
                ></textarea>
              </div>
            </div>
          </div>
          
          <div class="column is-12-mobile is-4-desktop">
            <div class="glass-panel p-4-mobile p-5-tablet" style="height: 100%;">
              <div class="columns is-mobile is-multiline mb-0">
                <div class="column is-12-mobile is-12-tablet pb-3">
                  <div class="field">
                    <label class="label has-text-white is-size-6-mobile is-size-5-tablet">Tipo de US</label>
                    <div class="select is-fullwidth is-medium-tablet is-small-mobile custom-select">
                      <select v-model="editForm.tipo_us_id" :disabled="!puedeGestionarEstructura">
                        <option v-for="t in tipos" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="column is-6-mobile is-12-tablet pb-3">
                  <div class="field">
                    <label class="label has-text-white is-size-6-mobile is-size-5-tablet">Prioridad</label>
                    <div class="select is-fullwidth is-medium-tablet is-small-mobile custom-select">
                      <select v-model="editForm.prioridad_id" :disabled="!puedeGestionarEstructura">
                        <option v-for="p in prioridades" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="column is-6-mobile is-12-tablet pb-3">
                  <div class="field">
                    <label class="label has-text-link is-size-6-mobile is-size-5-tablet">Estado</label>
                    <div class="select is-fullwidth is-medium-tablet is-small-mobile custom-select">
                      <select v-model="editForm.estado_id" :disabled="!puedeGestionarEstructura">
                        <option v-for="e in estados" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="column is-12-mobile is-12-tablet pb-0">
                  <div class="field mb-0">
                    <label class="label has-text-white is-size-6-mobile is-size-5-tablet">Fecha de Entrega</label>
                    <div class="control has-icons-left">
                      <input type="date" class="input is-medium-tablet is-small-mobile custom-input" v-model="editForm.fecha_entrega" :disabled="!puedeGestionarEstructura">
                      <span class="icon is-small is-left"><i class="fas fa-calendar"></i></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TABLA DE TAREAS OPTIMIZADA PARA MÓVIL (Ocultando Estimado y Responsable en columna) -->
        <div v-if="esEdicion" class="columns">
          <div class="column is-12">
            <div class="glass-panel p-4-mobile p-5-tablet">
              <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">
                <h3 class="title is-size-5-mobile is-size-4-tablet has-text-white mb-0">Tareas Técnicas</h3>
                <button class="button is-primary is-small" @click="nuevaTarea">
                  <span class="icon is-small"><i class="fas fa-plus"></i></span>
                  <span class="is-hidden-mobile">Nueva Tarea</span>
                  <span class="is-hidden-tablet">Nueva</span>
                </button>
              </div>

              <div class="table-container mb-0">
                <table class="table is-fullwidth glass-table mb-0">
                  <thead>
                    <tr>
                      <th class="has-text-info is-size-7-mobile">Tarea</th>
                      <th class="has-text-info is-size-7-mobile is-hidden-mobile">Responsable</th>
                      <th class="has-text-info has-text-centered is-size-7-mobile">Estado</th>
                      <!-- Oculto en móvil usando is-hidden-mobile -->
                      <th class="has-text-info has-text-centered is-size-7-mobile is-hidden-mobile">Estimado</th>
                      <th class="has-text-info has-text-centered is-size-7-mobile" style="width: 45px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tarea in tareas" :key="tarea.id" class="custom-row-hover clickable-row" @click="editarTarea(tarea)">
                      <td class="data-text-bright is-size-6-mobile text-truncate-mobile" style="max-width: 160px;">
                        {{ tarea.titulo }}
                        <!-- Subtítulo con responsable solo visible en móviles para ahorrar columnas -->
                        <div class="is-hidden-tablet is-size-7 has-text-grey-light mt-1 text-truncate-mobile">
                          <i class="fas fa-user mr-1"></i> {{ tarea.responsable ? `${tarea.responsable.apellido.toUpperCase()}, ${tarea.responsable.nombre}` : 'SIN ASIGNAR' }}
                        </div>
                      </td>
                      <td class="data-text-bright is-hidden-mobile">
                        {{ tarea.responsable ? `${tarea.responsable.apellido.toUpperCase()}, ${tarea.responsable.nombre}` : 'SIN ASIGNAR' }}
                      </td>
                      <td class="has-text-centered">
                        <span :class="['tag is-rounded is-small-mobile', obtenerClaseEstadoTag(tarea)]" style="font-weight: 700;">
                          {{ tarea.estado_detalle?.nombre || 'TO DO' }}
                        </span>
                      </td>
                      <!-- Oculto en móvil usando is-hidden-mobile -->
                      <td class="has-text-centered data-text-bright is-hidden-mobile">{{ tarea.horas_estimadas || 0 }}h</td>
                      <td class="has-text-centered" @click.stop>
                        <button class="button is-danger is-inverted is-small p-2" @click="confirmarEliminarTarea(tarea)">
                          <span class="icon is-small"><i class="fas fa-trash"></i></span>
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
const tipos = ref([]);
const tareas = ref([]);
const integrantesProyecto = ref([]);
const isConfirmTareaActive = ref(false);
const tareaAEliminar = ref(null);

const editForm = reactive({
  id: null, proyecto_id: route.params.id, titulo: '', descripcion: '', condiciones: '',
  prioridad_id: 2, estado_id: 1, tipo_us_id: 1, fecha_entrega: ''
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
    const [resP, resE, resT] = await Promise.all([
      api.get('/common/prioridades-us'), 
      api.get('/common/estados-us'),
      api.get('/user-stories/categorias')
    ]);
    prioridades.value = resP.data;
    estados.value = resE.data;
    tipos.value = resT.data;
    
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
const confirmarEliminarTarea = (t) => {
  tareaAEliminar.value = t;
  isConfirmTareaActive.value = true;
};

const ejecutarEliminacionTarea = async () => {
  if (!tareaAEliminar.value?.id) return;
  try {
    await tareaService.delete(tareaAEliminar.value.id);
    mensajeExito.value = "Tarea eliminada correctamente.";
  } catch (error) {
    errorMsg.value = error.response?.data?.mensaje || "Error al eliminar.";
  } finally {
    isConfirmTareaActive.value = false;
    tareaAEliminar.value = null;
    cargarDatos();
  }
};
const obtenerClaseEstadoTag = (tarea) => {
  const nombre = String(tarea.estado_detalle?.nombre || '').toUpperCase();
  return nombre === 'DONE' ? 'is-success' : (nombre === 'BACKLOG' || nombre === 'TO DO' ? 'is-danger' : 'is-warning');
};

onMounted(cargarDatos);
</script>

<style scoped>
/* Fondo general con corrección para móviles (evita repainted lag en iOS/Android) */
.dashboard-bg { 
  min-height: 100vh; 
  background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('../assets/fondo.jpg'); 
  background-size: cover; 
  background-position: center;
  background-attachment: fixed; 
}

@media (max-width: 768px) {
  .dashboard-bg {
    background-attachment: scroll; 
  }
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
  width: 100% !important;
  max-width: 100% !important;
}
.custom-input::placeholder { color: rgba(255, 255, 255, 0.7) !important; opacity: 1; }

.data-text-bright { 
  color: #ffffff !important; 
  font-size: 1.15rem !important; 
  font-weight: 700; 
  text-shadow: 0px 0px 8px rgba(255, 255, 255, 0.2); 
}

.glass-table { background: transparent !important; }
.glass-table td { padding: 1.2rem 0.75rem !important; vertical-align: middle; }
.clickable-row { cursor: pointer; }
.clickable-row:hover { background-color: rgba(52, 152, 219, 0.15) !important; }

.letter-spacing-1 { letter-spacing: 1px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Control de desbordamiento y optimización táctil en móviles */
.text-truncate-mobile {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .text-truncate-mobile {
    max-width: 180px;
  }
  .is-flex-grow-1-mobile {
    flex-grow: 1 !important;
  }
  
  /* Ajuste de tipografía en tablas para no ensanchar la pantalla de 360px */
  .data-text-bright {
    font-size: 0.95rem !important;
  }
  .glass-table td, .glass-table th {
    padding: 0.75rem 0.4rem !important;
  }
}

/* ==========================================
   ADAPTACIÓN MODO CLARO: FORMULARIO US
   ================================---------- */

/* 1. Etiquetas (labels) de los campos */
body.theme-light .label {
    color: #2c3e50 !important;
}

/* 2. Inputs, textareas y selects en modo claro */
body.theme-light .custom-input,
body.theme-light textarea.textarea,
body.theme-light input[type="date"].input {
    background: #ffffff !important;
    color: #2c3e50 !important;
    border: 1px solid #cbd5e1 !important;
}

body.theme-light .custom-input::placeholder,
body.theme-light textarea::placeholder {
    color: #94a3b8 !important;
}

/* 3. Botón de retroceso y textos del encabezado */
body.theme-light .button.is-ghost {
    color: #1d6fa5 !important;
}


/* ==========================================
   ADAPTACIÓN MODO CLARO: TABLA DE TAREAS (US DETAIL)
   ================================---------- */

/* 1. Título "Tareas Técnicas" */
body.theme-light h3.title {
    color: #1a252f !important;
    background: transparent !important;
}

/* 2. Textos de las filas de tareas en la tabla */
body.theme-light .glass-table .data-text-bright {
    color: #2c3e50 !important;
    text-shadow: none !important;
}

body.theme-light .glass-table th {
    color: #1d6fa5 !important;
}

/* 3. Hover sobre las filas de tareas en modo claro */
body.theme-light .glass-table .clickable-row:hover {
    background-color: #f1f5f8 !important;
}
</style>