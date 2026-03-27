<template>
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-6 px-4 pb-6">
        
        <div class="glass-panel p-5 mb-5">
          <div class="level mb-4">
            <div class="level-left">
              <button class="button is-ghost has-text-white p-0 mr-4" @click="$router.back()">
                <span class="icon"><i class="fas fa-arrow-left"></i></span>
              </button>
              <div>
                <h2 class="subtitle is-6 has-text-info has-text-weight-bold is-uppercase mb-0">
                  {{ esEdicion ? 'Gestionar Tarea Técnica' : 'Nueva Tarea' }}
                </h2>
                <h1 class="title has-text-white is-4 mb-0">
                  {{ esEdicion ? form.titulo : 'Nueva Tarea para la US' }}
                </h1>
              </div>
            </div>
            <div class="level-right">
              <div class="buttons">
                <button class="button is-light is-medium px-5" @click="$router.back()">Cancelar</button>
                <button 
                  class="button is-success is-medium has-text-weight-bold px-5" 
                  :class="{'is-loading': enviando}" 
                  :disabled="!puedeGuardar"
                  @click="guardarTarea"
                >
                  <span class="icon"><i class="fas fa-save"></i></span>
                  <span>{{ textoBotonGuardar }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="errorValidacion" class="notification is-danger is-light mb-5">
          <button class="delete" @click="errorValidacion = ''"></button>
          <span class="icon mr-2"><i class="fas fa-exclamation-triangle"></i></span>
          {{ errorValidacion }}
        </div>

        <div class="columns is-multiline">
          <div class="column is-8">
            <div class="glass-panel p-5 mb-5">
              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Título de la Tarea</label>
                <div class="control">
                  <input v-model="form.titulo" class="input is-medium custom-input" type="text" :disabled="!tienePermisoEstructura" placeholder="Ej: Desarrollar API">
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Descripción General</label>
                <div class="control">
                  <textarea v-model="form.descripcion" class="textarea custom-input" rows="4" :disabled="!tienePermisoEstructura"></textarea>
                </div>
              </div>

              <div v-if="esEstadoRevision || esEstadoFinalizado" class="box has-background-black-ter p-4 mb-5 border-info">
                <label class="label is-size-6 has-text-info">Comentarios de Cierre/Revisión</label>
                <textarea v-model="form.comentario_cierre" class="textarea custom-input is-small" rows="2"></textarea>
              </div>

              <div class="field">
                <label class="label has-text-info is-size-5">Criterios de Aceptación</label>
                <div class="control">
                  <textarea v-model="form.criterios_aceptacion" class="textarea is-small custom-input" rows="3" :disabled="!tienePermisoEstructura"></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="column is-4">
            <div class="glass-panel p-5 mb-5">
              <div class="field mb-5">
                <label class="label has-text-white">Responsable</label>
                <div class="select is-fullwidth is-medium custom-select">
                  <select v-model.number="form.responsable_id" :disabled="!puedeGuardar">
                    <option :value="null">Sin asignar</option>
                    <option v-for="u in integrantes" :key="u.id" :value="Number(u.id)">
                      {{ u.apellido?.toUpperCase() }}, {{ u.nombre }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-white">Tipo de Tarea</label>
                <div class="select is-fullwidth is-medium custom-select">
                  <select v-model.number="form.tipo_id" :disabled="!puedeGuardar">
                    <option v-for="t in maestras.tipos" :key="t.id" :value="Number(t.id)">{{ t.nombre }}</option>
                  </select>
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-white">Prioridad</label>
                <div class="select is-fullwidth is-medium custom-select">
                  <select v-model.number="form.prioridad_id" :disabled="!puedeGuardar">
                    <option v-for="p in maestras.prioridades" :key="p.id" :value="Number(p.id)">{{ p.nombre }}</option>
                  </select>
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-link">Estado Actual</label>
                <div class="select is-fullwidth is-medium custom-select">
                  <select v-model="form.estado_id" :disabled="!puedeGuardar">
                    <option v-for="e in estadosOrdenados" :key="e.id" :value="Number(e.id)">{{ e.nombre }}</option>
                  </select>
                </div>
              </div>

              <div class="columns is-mobile">
                <div class="column">
                  <label class="label has-text-white">Hs Est.</label>
                  <input v-model="form.horas_estimadas" class="input custom-input" type="number" step="0.5" :disabled="!tienePermisoEstructura">
                </div>
              </div>
            </div>

            <div class="glass-panel p-5 mb-5">
              <label class="label has-text-info is-size-6 mb-3">Checklist de Calidad</label>
              
              <div class="field">
                <label class="checkbox has-text-white is-size-7">
                  <input type="checkbox" v-model="form.cumpleAceptacion" :disabled="!tienePermisoEstructura" class="mr-2">
                  CUMPLE ACEPTACIÓN
                </label>
              </div>

              <div class="field">
                <label class="checkbox has-text-white is-size-7">
                  <input type="checkbox" v-model="form.testeado" :disabled="!tienePermisoEstructura" class="mr-2">
                  TESTEADO
                </label>
              </div>

              <div class="field">
                <label class="checkbox has-text-white is-size-7">
                  <input type="checkbox" v-model="form.documentado" :disabled="!tienePermisoEstructura" class="mr-2">
                  DOCUMENTADO
                </label>
              </div>

              <div v-if="form.documentado" class="field mt-3 mb-4 animate__animated animate__fadeIn">
                <label class="label is-size-7 has-text-info">Enlace de Evidencia</label>
                <div class="field has-addons">
                  <div class="control is-expanded has-icons-left">
                    <input 
                      v-model="form.link_evidencia" 
                      class="input is-small custom-input" 
                      type="url" 
                      placeholder="https://drive.google.com/..."
                    >
                    <span class="icon is-small is-left">
                      <i class="fas fa-link"></i>
                    </span>
                  </div>
                  <div class="control">
                    <button 
                      class="button is-small is-info" 
                      title="Abrir en nueva pestaña"
                      :disabled="!esUrlValida"
                      @click="abrirEnlace"
                    >
                      <span class="icon is-small">
                        <i class="fas fa-external-link-alt"></i>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="field">
                <label class="checkbox has-text-white is-size-7">
                  <input type="checkbox" v-model="form.utilizable" :disabled="!tienePermisoEstructura" class="mr-2">
                  UTILIZABLE
                </label>
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
import { configService } from '../services/config.service';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
import { projectService } from '../services/project.services';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const proyectoId = route.params.id;
const usId = route.params.usId;
const tareaIdParam = route.params.tareaId;

const esEdicion = computed(() => tareaIdParam && tareaIdParam !== 'nueva');
const enviando = ref(false);
const errorValidacion = ref('');
const maestras = ref({ estados: [], prioridades: [], tipos: [] });
const integrantes = ref([]);

/**
 * Propósito: Estado reactivo del formulario de tarea técnica.
 */
const form = reactive({
  id: null, 
  titulo: '', 
  descripcion: '', 
  responsable_id: null,
  tipo_id: 1, 
  prioridad_id: 1, 
  estado_id: 1, 
  horas_estimadas: 0, 
  horas_reales: 0,
  cumpleAceptacion: false, 
  testeado: false, 
  documentado: false, 
  utilizable: false,
  link_evidencia: '',
  criterios_aceptacion: '', 
  comentario_cierre: '',
  usId: usId 
});

const tienePermisoEstructura = computed(() => {
  const u = authStore.usuario;
  if (!u) return false;
  if (Number(u.rol_id) === 1 || Number(u.rol_id) === 2) return true;
  return integrantes.value?.some(m => Number(m.id) === Number(u.id));
});

const puedeGuardar = computed(() => tienePermisoEstructura.value);
const esEstadoRevision = computed(() => Number(form.estado_id) === 4);
const esEstadoFinalizado = computed(() => Number(form.estado_id) === 5);
const estadosOrdenados = computed(() => [...maestras.value.estados].sort((a, b) => Number(a.id) - Number(b.id)));

const textoBotonGuardar = computed(() => {
  if (!esEdicion.value) return 'Crear Tarea';
  return 'Guardar Cambios';
});

// Validación simple de URL para habilitar el botoncito
const esUrlValida = computed(() => {
  return form.link_evidencia && form.link_evidencia.startsWith('http');
});

/**
 * Propósito: Abrir la URL escrita en el textbox en una pestaña nueva.
 */
const abrirEnlace = () => {
  if (form.link_evidencia) {
    window.open(form.link_evidencia, '_blank');
  }
};

/**
 * Propósito: Cargar tablas maestras, integrantes y datos de la tarea.
 */
const cargarDatos = async () => {
  try {
    const [resM, resProy] = await Promise.all([
      configService.getTablasMaestras(),
      projectService.getById(proyectoId)
    ]);
    
    maestras.value.prioridades = resM.prioridades || []; 
    maestras.value.tipos = resM.tipos || [];
    maestras.value.estados = resM.estados || [];
    integrantes.value = resProy.data?.integrantes || resProy.data?.Usuarios || [];

    if (esEdicion.value) {
      const resT = await api.get(`/tareas/${tareaIdParam}`);
      const t = resT.data;
      
      if (t) {
        form.id = t.id;
        form.titulo = t.titulo;
        form.descripcion = t.descripcion || '';
        form.responsable_id = t.responsable_id ? Number(t.responsable_id) : null;
        form.tipo_id = Number(t.tipo_id) || 1;
        form.prioridad_id = Number(t.prioridad_id) || 1;
        form.estado_id = Number(t.estado_id) || 1;
        form.horas_estimadas = t.horas_estimadas || 0;
        form.horas_reales = t.horasReales || t.horas_reales || 0;
        
        form.cumpleAceptacion = !!t.cumpleAceptacion;
        form.testeado = !!t.testeado;
        form.documentado = !!t.documentado;
        form.utilizable = !!t.utilizable;

        form.link_evidencia = t.linkEvidencia || t.link_evidencia || '';
        form.criterios_aceptacion = t.criteriosAceptacion || t.criterios_aceptacion || '';
        form.comentario_cierre = t.comentarioCierre || t.comentario_cierre || '';
      }
    }
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
};

/**
 * Propósito: Guardar o actualizar la tarea.
 */
const guardarTarea = async () => {
  errorValidacion.value = '';
  if (!form.titulo?.trim()) {
    errorValidacion.value = "El título es obligatorio.";
    return;
  }
  enviando.value = true;
  try {
    const payload = { 
        ...form,
        proyecto_id: Number(proyectoId), 
        usId: Number(usId) 
    };
    if (esEdicion.value) {
      await api.put(`/tareas/${tareaIdParam}`, payload);
    } else {
      await api.post('/tareas', payload);
    }
    router.back();
  } catch (error) {
    errorValidacion.value = error.response?.data?.mensaje || "Error al guardar";
  } finally {
    enviando.value = false;
  }
};

onMounted(cargarDatos);
</script>

<style scoped>
.dashboard-bg { min-height: 100vh; background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('../assets/fondo.jpg'); background-size: cover; background-attachment: fixed; }
.glass-panel { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
.custom-input, .custom-select select { background-color: #fff9e6 !important; color: #000 !important; border: 2px solid #dcd6c0 !important; font-weight: 600 !important; }
/* Estilo para que el campo link parezca un addon integrado */
.field.has-addons .control .button { height: 100%; }
.animate__animated { animation-duration: 0.4s; }
</style>