<template>
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-6 px-4 pb-6">
        
        <div class="glass-panel p-5 mb-5">
          <div class="level mb-4">
            <div class="level-left">
              <div class="is-flex is-align-items-center">
                <button class="button is-ghost has-text-white p-0 mr-4" @click="$router.back()">
                  <span class="icon"><i class="fas fa-arrow-left"></i></span>
                </button>
                <h2 class="subtitle is-6 has-text-info has-text-weight-bold is-uppercase letter-spacing-1 mb-0">
                  {{ esEdicion ? 'Editando Entregable' : 'Nueva User Story' }}
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
            <h1 class="title has-text-white is-4 mb-0">{{ esEdicion ? editForm.titulo : 'Definir Nueva Etapa' }}</h1>
          </div>
        </div>

        <div class="columns is-multiline mb-5">
          <div class="column is-8">
            <div class="glass-panel p-5" style="height: 100%;">
              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Título del Entregable</label>
                <textarea class="textarea is-medium custom-input" rows="2" v-model="editForm.titulo" :disabled="!puedeGestionarEstructura" placeholder="Ej: Como usuario quiero..."></textarea>
              </div>
              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Descripción Detallada</label>
                <textarea class="textarea is-medium custom-input" v-model="editForm.descripcion" rows="4" :disabled="!puedeGestionarEstructura" placeholder="Valor de negocio..."></textarea>
              </div>
              <div class="field">
                <label class="label has-text-white is-size-5">Criterios de Aceptación</label>
                <textarea class="textarea is-medium custom-input" v-model="editForm.condiciones" rows="3" :disabled="!puedeGestionarEstructura" placeholder="Condiciones para aprobar..."></textarea>
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
                  <span class="icon is-small is-left">
                    <i class="fas fa-calendar" :class="colorSemaforo"></i>
                  </span>
                </div>
                <p v-if="editForm.fecha_entrega" class="help mt-2 is-size-6 has-text-weight-bold" :class="colorSemaforo">
                  <span class="icon is-small"><i class="fas fa-circle"></i></span>
                  <span class="ml-1 is-uppercase">{{ textoSemaforo }}</span>
                </p>
              </div>

              <div class="notification is-info is-light p-5 mt-5">
                <p class="is-size-5 has-text-dark has-text-weight-medium">
                  <span class="icon is-medium has-text-info mr-2">
                    <i class="fas fa-lightbulb"></i>
                  </span>
                  <strong>Tip Docente:</strong> Divida la US en tareas pequeñas para reportes diarios.
                </p>
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
                  <button v-if="puedeGestionarEstructura" class="button is-primary is-small" @click="nuevaTarea">Nueva Tarea</button>
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
                      <th class="has-text-info has-text-centered">Trabajado</th>
                      <th class="has-text-info has-text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tarea in tareas" :key="tarea.id" 
                        :class="['custom-row-hover', obtenerClaseFilaTarea(tarea)]">
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
                      <td class="has-text-centered data-text-bright">{{ tarea.horasReales || 0 }}h</td>
                      <td class="has-text-right">
                        <button class="button is-small is-info is-inverted" @click="editarTarea(tarea)">
                          <i class="fas fa-edit"></i>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import userStoryService from '../services/userStory.service';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const enviando = ref(false);
const prioridades = ref([]);
const estados = ref([]);
const tareas = ref([]);

const editForm = reactive({
  id: null, proyecto_id: route.params.id, titulo: '', descripcion: '', condiciones: '',
  prioridad_id: 2, estado_id: 1, fecha_entrega: ''
});

const esEdicion = computed(() => !!route.params.usId && route.params.usId !== 'nueva');

const colorSemaforo = computed(() => {
  if (!editForm.fecha_entrega) return 'has-text-grey';
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const entrega = new Date(editForm.fecha_entrega); entrega.setHours(0,0,0,0);
  const diffDays = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'has-text-danger';
  if (diffDays <= 3) return 'has-text-warning';
  return 'has-text-success';
});

const textoSemaforo = computed(() => {
  if (!editForm.fecha_entrega) return '';
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const entrega = new Date(editForm.fecha_entrega); entrega.setHours(0,0,0,0);
  const diffDays = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'ENTREGA VENCIDA';
  if (diffDays === 0) return 'ENTREGA HOY';
  if (diffDays <= 3) return `CIERRA EN ${diffDays} DÍAS`;
  return 'A TIEMPO';
});

const obtenerClaseFilaTarea = (tarea) => {
  if (String(tarea.estado_detalle?.nombre).toUpperCase() === 'DONE') return '';
  if (!editForm.fecha_entrega) return '';
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const entrega = new Date(editForm.fecha_entrega); entrega.setHours(0,0,0,0);
  const diffDays = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'row-critical'; 
  if (diffDays <= 2) return 'row-warning-blink'; 
  return '';
};

const puedeGestionarEstructura = computed(() => {
  const u = authStore.usuario;
  return u && (Number(u.rol_id) === 1 || Number(u.rol_id) === 2);
});

const cargarDatos = async () => {
  try {
    const [resP, resE] = await Promise.all([api.get('/common/prioridades-us'), api.get('/common/estados-us')]);
    prioridades.value = resP.data;
    estados.value = resE.data;
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
  enviando.value = true;
  try {
    if (esEdicion.value) {
      await userStoryService.update(editForm.id, editForm);
      router.back();
    } else {
      const res = await userStoryService.create(editForm);
      router.replace(`/proyectos/${editForm.proyecto_id}/backlog/${res.data.id}`);
    }
  } catch (error) { console.error(error); } finally { enviando.value = false; }
};

const nuevaTarea = () => router.push(`/proyectos/${route.params.id}/backlog/${route.params.usId}/tarea/nueva`);
const editarTarea = (tarea) => router.push(`/proyectos/${route.params.id}/backlog/${route.params.usId}/tarea/${tarea.id}`);

const obtenerClaseEstadoTag = (tarea) => {
  const nombre = String(tarea.estado_detalle?.nombre || '').toUpperCase();
  if (nombre === 'DONE') return 'is-success';
  if (nombre === 'TO DO' || nombre === 'PENDIENTE') return 'is-danger';
  return 'is-warning';
};

onMounted(cargarDatos);
</script>

<style scoped>
.dashboard-bg { min-height: 100vh; background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('../assets/fondo.jpg'); background-size: cover; background-attachment: fixed; }
.glass-panel { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
.custom-input { background: rgba(0,0,0,0.3) !important; color: white !important; border: 1px solid rgba(255,255,255,0.2) !important; }

/* ESTILO UNIFICADO DE ALTO BRILLO: Letras blancas brillantes para todos los campos */
.data-text-bright {
  color: #ffffff !important;
  font-size: 1.15rem !important;
  font-weight: 700 !important;
  text-shadow: 0px 0px 8px rgba(255, 255, 255, 0.2);
}

/* FONDOS ELIMINADOS: Las filas ahora son transparentes */
.row-critical { background-color: transparent !important; }
.row-warning-blink { background-color: transparent !important; }

.glass-table { background: transparent !important; }
.glass-table td { padding: 1.2rem 0.75rem !important; vertical-align: middle; }
.custom-row-hover:hover { background-color: rgba(255, 255, 255, 0.1) !important; }
.letter-spacing-1 { letter-spacing: 1px; }
.border-top-glass { border-top: 1px solid rgba(255, 255, 255, 0.1); }
</style>