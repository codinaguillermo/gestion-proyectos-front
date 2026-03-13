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
                  <input v-model="form.titulo" class="input is-medium custom-input" type="text" :disabled="form.id && !esJefe" placeholder="Ej: Desarrollar API de Login">
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Descripción General</label>
                <div class="control">
                  <textarea v-model="form.descripcion" class="textarea custom-input" rows="3" :disabled="form.id && !esJefe" placeholder="Describa el alcance técnico de esta tarea..."></textarea>
                </div>
              </div>

              <div v-if="esEstadoRevision || esEstadoFinalizado" class="box has-background-black-ter p-4 mb-5 border-info">
                <label class="label is-size-6 has-text-info">
                  {{ esEstadoRevision ? 'Comentario de Entrega (Obligatorio)' : 'Notas de Cierre Auditoría' }}
                </label>
                <textarea v-model="form.comentario_cierre" class="textarea custom-input is-small" rows="2" placeholder="Describa qué se hizo o notas del docente..."></textarea>
              </div>

              <div class="field">
                <label class="label has-text-info is-size-5">Criterios de Aceptación (Docente)</label>
                <div class="control">
                  <textarea v-model="form.criterios_aceptacion" class="textarea is-small custom-input" rows="2" :disabled="!esJefe" placeholder="Condiciones técnicas para aprobar..."></textarea>
                </div>
              </div>
            </div>

            <div class="glass-panel p-5 mb-5">
              <h3 class="title is-5 has-text-white mb-4">
                <span class="icon mr-2"><i class="fas fa-project-diagram"></i></span>
                Dependencias (Requisitos)
              </h3>
              <div class="columns is-multiline">
                <div v-for="t in tareasHermanas" :key="t.id" class="column is-6 py-1">
                  <label class="checkbox has-text-white">
                    <input type="checkbox" :value="t.id" v-model="form.dependenciasIds" :disabled="form.id && !esJefe" class="mr-2">
                    {{ t.titulo }}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="column is-4">
            <div class="glass-panel p-5 mb-5">
              <div class="field mb-5">
                <label class="label has-text-white">Responsable</label>
                <div class="select is-fullwidth is-medium custom-select">
                  <select v-model="form.responsable_id" :disabled="form.id && !esJefe">
                    <option :value="null">Sin asignar</option>
                    <option v-for="u in integrantes" :key="u.id" :value="u.id">{{ u.apellido?.toUpperCase() }}, {{ u.nombre }}</option>
                  </select>
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-link">Estado Actual</label>
                <div class="select is-fullwidth is-medium custom-select">
                  <select v-model="form.estado_id" :disabled="!puedeGuardar">
                    <option v-for="e in estadosOrdenados" :key="e.id" :value="e.id" 
                      :disabled="(!esJefe && Number(e.id) === ID_DONE) || (!esJefe && Number(e.id) === 1)">
                      {{ e.nombre }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="columns">
                <div class="column">
                  <label class="label has-text-white">Hs Estimadas</label>
                  <input v-model="form.horas_estimadas" class="input custom-input" type="number" step="0.5" :disabled="form.id && !esJefe" placeholder="0.0">
                </div>
                <div class="column" v-if="mostrarRegistroHoras">
                  <label class="label has-text-link-light">Hs hoy</label>
                  <input v-model="horasNuevasDeHoy" class="input custom-input-hs" type="number" step="0.5" placeholder="0">
                </div>
              </div>
            </div>

            <div class="glass-panel p-5 mb-5">
              <label class="label has-text-info is-size-6 mb-3">Checklist de Calidad</label>
              <div class="field" v-for="chk in ['cumpleAceptacion', 'testeado', 'documentado', 'utilizable']" :key="chk">
                <label class="checkbox has-text-white is-size-7">
                  <input type="checkbox" v-model="form[chk]" :disabled="!esJefe" class="mr-2">
                  {{ chk.toUpperCase() }}
                </label>
              </div>
            </div>

            <div v-if="form.documentado" class="glass-panel p-5 animate__animated animate__fadeIn">
              <label class="label has-text-info is-size-7">Link de Documentación</label>
              <input v-model="form.link_evidencia" class="input is-small custom-input" type="url" placeholder="https://docs.google.com/...">
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

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const proyectoId = route.params.id;
const usId = route.params.usId;
const tareaId = route.params.tareaId;

const ID_REVIEW = 4;
const ID_DONE = 5;

const esEdicion = computed(() => tareaId && tareaId !== 'nueva');
const enviando = ref(false);
const errorValidacion = ref('');
const horasNuevasDeHoy = ref(0);
const maestras = ref({ estados: [], prioridades: [], tipos: [] });
const integrantes = ref([]);
const tareasHermanas = ref([]);

const form = reactive({
  id: null, titulo: '', descripcion: '', responsable_id: null,
  tipo_id: null, prioridad_id: null,
  estado_id: 1, horas_estimadas: 0, horas_reales: 0,
  cumpleAceptacion: false, testeado: false, documentado: false, utilizable: false,
  criterios_aceptacion: '', comentario_cierre: '', link_evidencia: '',
  dependenciasIds: []
});

const esJefe = computed(() => {
  const u = authStore.usuario;
  return u && (Number(u.rol_id) === 1 || Number(u.rol_id) === 2);
});
const esMiTarea = computed(() => String(authStore.usuario?.id) === String(form.responsable_id));
const puedeGuardar = computed(() => esEdicion.value ? (esJefe.value || esMiTarea.value) : esJefe.value);
const mostrarRegistroHoras = computed(() => esEdicion.value && puedeGuardar.value && Number(form.estado_id) !== 1 && Number(form.estado_id) !== ID_DONE);
const esEstadoRevision = computed(() => Number(form.estado_id) === ID_REVIEW);
const esEstadoFinalizado = computed(() => Number(form.estado_id) === ID_DONE);
const estadosOrdenados = computed(() => [...maestras.value.estados].sort((a, b) => Number(a.id) - Number(b.id)));

const textoBotonGuardar = computed(() => {
  if (!esEdicion.value) return 'Crear Tarea';
  if (esEstadoFinalizado.value) return 'Finalizar Auditoría';
  if (esEstadoRevision.value) return 'Enviar a Revisión';
  return 'Guardar Cambios';
});

const cargarDatos = async () => {
  try {
    const [resM, resUS, resProy] = await Promise.all([
      configService.getTablasMaestras(),
      api.get(`/user-stories/${usId}`),
      api.get(`/proyectos/${proyectoId}`)
    ]);
    
    maestras.value.prioridades = resM.prioridades || []; 
    maestras.value.tipos = resM.tipos || [];
    maestras.value.estados = resM.estados || [];
    integrantes.value = resProy.data?.integrantes || resProy.data?.Usuarios || [];
    tareasHermanas.value = (resUS.data?.tareas || []).filter(t => String(t.id) !== String(tareaId));

    if (!esEdicion.value) {
      if (maestras.value.prioridades.length > 0) form.prioridad_id = maestras.value.prioridades[0].id;
      if (maestras.value.tipos.length > 0) form.tipo_id = maestras.value.tipos[0].id;
    }

    if (esEdicion.value) {
      const resT = await api.get(`/tareas/${tareaId}`);
      const t = resT.data;
      if (t) {
        Object.assign(form, {
          id: t.id, titulo: t.titulo, descripcion: t.descripcion,
          responsable_id: t.responsable_id ? Number(t.responsable_id) : null,
          tipo_id: t.tipo_id, prioridad_id: t.prioridad_id,
          estado_id: Number(t.estado_id), horas_estimadas: t.horas_estimadas,
          horas_reales: Number(t.horasReales || 0),
          criterios_aceptacion: t.criteriosAceptacion || '',
          comentario_cierre: t.comentarioCierre || '',
          link_evidencia: t.linkEvidencia || '',
          cumpleAceptacion: !!t.cumpleAceptacion, testeado: !!t.testeado,
          documentado: !!t.documentado, utilizable: !!t.utilizable,
          dependenciasIds: t.requisitos ? t.requisitos.map(d => d.id) : []
        });
      }
    }
  } catch (error) { console.error(error); }
};

const guardarTarea = async () => {
  errorValidacion.value = '';
  const estadoActual = Number(form.estado_id);
  const hsIngresadas = Number(horasNuevasDeHoy.value);

  if (Number(form.horas_estimadas) <= 0) {
    errorValidacion.value = "Las horas estimadas deben ser mayores a 0.";
    return;
  }

  if (estadoActual !== 1 && estadoActual !== ID_DONE && esEdicion.value && hsIngresadas <= 0) {
    errorValidacion.value = "Debes ingresar las horas trabajadas hoy.";
    return;
  }

  if (estadoActual === ID_DONE && form.dependenciasIds.length > 0) {
    const dependenciasPendientes = tareasHermanas.value.filter(t => 
      form.dependenciasIds.includes(t.id) && 
      String(t.estado_detalle?.nombre).toUpperCase() !== 'DONE'
    );

    if (dependenciasPendientes.length > 0) {
      const nombres = dependenciasPendientes.map(t => t.titulo).join(', ');
      errorValidacion.value = `No puedes finalizar esta tarea porque depende de: [${nombres}] que aún no están en DONE.`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  }

  enviando.value = true;
  try {
    const payload = { 
        ...form, 
        horasReales: Number(form.horas_reales) + hsIngresadas,
        proyecto_id: proyectoId,
        usId: usId
    };
    if (esEdicion.value) await api.put(`/tareas/${form.id}`, payload);
    else await api.post('/tareas', payload);
    router.back();
  } catch (error) {
    errorValidacion.value = error.response?.data?.detalle || error.response?.data?.mensaje || "Error al guardar";
  } finally {
    enviando.value = false;
  }
};

onMounted(cargarDatos);
</script>

<style scoped>
.dashboard-bg { min-height: 100vh; background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('../assets/fondo.jpg'); background-size: cover; background-attachment: fixed; }
.glass-panel { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }

.custom-input, .custom-input-hs {
  background-color: #fff9e6 !important;
  color: #000000 !important;
  border: 2px solid #dcd6c0 !important;
  font-weight: 600 !important;
}

.custom-input::placeholder, .custom-input-hs::placeholder {
  color: #000000 !important;
  opacity: 0.6 !important;
}

.custom-select select {
  background-color: #fff9e6 !important;
  color: #000000 !important;
  font-weight: 600 !important;
}

.custom-input-hs { background-color: #ebf5ff !important; border-color: #3273dc !important; }
.border-info { border: 1px solid #3273dc !important; }
</style>