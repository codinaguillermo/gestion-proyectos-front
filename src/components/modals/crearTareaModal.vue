<script setup>
/**
 * COMPONENTE: crearTareaModal.vue (v3.7 - Validación de Link en Review)
 * LÓGICA: Link obligatorio para entrar a READY FOR REVIEW (4) si requiere documentación.
 */
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { configService } from '../../services/config.service';
import tareaService from '../../services/tarea.service';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  isActive: Boolean,
  userStory: { type: Object, default: () => ({}) },
  tareaEdit: { type: Object, default: null },
  integrantes: { type: Array, default: () => [] },
  proyecto: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['close', 'tarea-creada', 'tarea-actualizada']);

const authStore = useAuthStore();
const enviando = ref(false);
const maestras = ref({ estados: [], prioridades: [], tipos: [] });
const errorValidacion = ref('');
const horasNuevasDeHoy = ref(0);

const form = reactive({
  id: null, titulo: '', descripcion: '', tipo_id: null, prioridad_id: null,
  estado_id: null, responsable_id: null, horas_estimadas: 0, horas_reales: 0,
  fechaInicioReal: null, fechaFinReal: null, cumpleAceptacion: false,
  testeado: false, documentado: false, utilizable: false,
  criterios_aceptacion: '', comentario_cierre: '', link_evidencia: ''
});

// --- CONSTANTES DE ESTADO ---
const ID_REVIEW = 4; 
const ID_DONE = 5;

// --- LÓGICA DE PERMISOS ---
const usuarioLogueado = computed(() => authStore.usuario || JSON.parse(localStorage.getItem('user')));
const esJefe = computed(() => {
  const u = usuarioLogueado.value;
  return u && (String(u.rol_id) === '1' || String(u.rol_id) === '2');
});
const esMiTarea = computed(() => String(usuarioLogueado.value?.id) === String(form.responsable_id));
const puedeGuardar = computed(() => form.id ? (esJefe.value || esMiTarea.value) : esJefe.value);

const mostrarRegistroHoras = computed(() => 
  form.id && puedeGuardar.value && Number(form.estado_id) !== 1 && Number(form.estado_id) !== ID_DONE
);

const esEstadoRevision = computed(() => Number(form.estado_id) === ID_REVIEW);
const esEstadoFinalizado = computed(() => Number(form.estado_id) === ID_DONE);

const estadosOrdenados = computed(() => {
  return [...maestras.value.estados].sort((a, b) => Number(a.id) - Number(b.id));
});

// --- UTILIDADES ---
const formatearFecha = (fecha) => {
  if (!fecha) return '';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(fecha));
};

const setDefaultsNuevasTareas = () => {
  if (maestras.value.estados?.length) {
    const estadoTodo = maestras.value.estados.find(e => Number(e.id) === 1);
    form.estado_id = estadoTodo ? estadoTodo.id : maestras.value.estados[0].id;
  }
};

const resetForm = () => {
  Object.assign(form, {
    id: null, titulo: '', descripcion: '', responsable_id: null,
    horas_estimadas: 0, horas_reales: 0, fechaInicioReal: null, fechaFinReal: null,
    cumpleAceptacion: false, testeado: false, documentado: false, utilizable: false,
    criterios_aceptacion: '', comentario_cierre: '', link_evidencia: ''
  });
  setDefaultsNuevasTareas();
};

watch(() => props.isActive, (val) => {
  if (val) {
    errorValidacion.value = '';
    horasNuevasDeHoy.value = 0;
    if (props.tareaEdit) {
      Object.assign(form, {
        ...props.tareaEdit,
        criterios_aceptacion: props.tareaEdit.criterios_aceptacion || props.tareaEdit.criteriosAceptacion || '',
        horas_estimadas: props.tareaEdit.horas_estimadas || props.tareaEdit.horasEstimadas || 0,
        horas_reales: Number(props.tareaEdit.horasReales || props.tareaEdit.horas_reales || 0),
        comentario_cierre: props.tareaEdit.comentarioCierre || props.tareaEdit.comentario_cierre || '',
        link_evidencia: props.tareaEdit.linkEvidencia || props.tareaEdit.link_evidencia || ''
      });
    } else {
      resetForm();
    }
  }
}, { immediate: true });

onMounted(async () => {
  const data = await configService.getTablasMaestras();
  maestras.value = {
    estados: data.estados || [],
    prioridades: data.prioridades || [],
    tipos: data.tipos || []
  };
  if (!form.id) setDefaultsNuevasTareas();
});

// --- ACCIÓN: GUARDAR ---
const guardarTarea = async () => {
  errorValidacion.value = '';
  const estadoOriginal = props.tareaEdit ? Number(props.tareaEdit.estado_id) : 1;
  const estadoActual = Number(form.estado_id);
  const horasIngresadas = Number(horasNuevasDeHoy.value);

  // 1. CANDADO ALUMNO -> DONE (ID 5)
  if (!esJefe.value && estadoActual === ID_DONE) {
    errorValidacion.value = "Solo el docente puede pasar la tarea a DONE tras la auditoría.";
    return;
  }

  // 2. REGLA DE ESFUERZO (No DONE, no TODO)
  if (estadoActual !== 1 && estadoActual !== ID_DONE && estadoOriginal !== ID_DONE) {
    if (horasIngresadas <= 0) {
      errorValidacion.value = "Debes ingresar las horas trabajadas hoy para registrar el progreso.";
      return;
    }
  }

  // 3. REGLA DE REVISIÓN (Ready for Review - ID 4)
  if (estadoActual === ID_REVIEW) {
    // Comentario obligatorio
    if (!form.comentario_cierre || form.comentario_cierre.trim().length < 5) {
      errorValidacion.value = "Para enviar a revisión, debes ingresar un comentario sobre el trabajo realizado.";
      return;
    }
    // Link de Documentación obligatorio AQUÍ (Si está tildado documentado)
    if (form.documentado && (!form.link_evidencia || form.link_evidencia.trim() === '')) {
      errorValidacion.value = "Esta tarea requiere documentación. Por favor, ingresa el Link de Documentación para enviar a revisión.";
      return;
    }
  }

  // 4. REGLA DE CIERRE FINAL (DONE - ID 5)
  if (estadoActual === ID_DONE) {
    if (form.criterios_aceptacion?.trim() && !form.cumpleAceptacion) {
        errorValidacion.value = "La tarea no puede cerrarse sin cumplir los criterios de aceptación.";
        return;
    }
  }

  enviando.value = true;
  try {
    const payload = {
      ...form,
      horasReales: Number(form.horas_reales) + horasIngresadas,
      proyecto_id: props.userStory.proyecto_id || props.userStory.Proyecto?.id,
      usId: props.userStory.id,
      estado_id: estadoActual
    };

    if (form.id) {
      await tareaService.update(form.id, payload);
      emit('tarea-actualizada');
    } else {
      await tareaService.create(payload);
      emit('tarea-creada');
    }
    emit('close');
  } catch (error) {
    errorValidacion.value = error.response?.data?.mensaje || "Error al procesar.";
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <div :class="['modal', { 'is-active': isActive }]">
    <div class="modal-background" @click="emit('close')"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-size-5">{{ form.id ? 'Gestionar Tarea' : 'Nueva Tarea' }}</p>
        <button class="delete" @click="emit('close')"></button>
      </header>
      
      <section class="modal-card-body">
        <div v-if="errorValidacion" class="notification is-danger is-light py-2 mb-4">
          {{ errorValidacion }}
        </div>

        <div class="field">
          <label class="label">Título</label>
          <input v-model="form.titulo" class="input" type="text" :disabled="form.id && !esJefe">
        </div>

        <div class="columns">
          <div class="column">
            <label class="label">Responsable</label>
            <div class="select is-fullwidth">
              <select v-model="form.responsable_id" :disabled="form.id && !esJefe">
                <option :value="null">Sin asignar</option>
                <option v-for="u in integrantes" :key="u.id" :value="u.id">{{ u.apellido?.toUpperCase() }}, {{ u.nombre }}</option>
              </select>
            </div>
          </div>
          <div class="column">
            <label class="label">Estado</label>
            <div class="select is-fullwidth">
              <select v-model="form.estado_id" :disabled="!puedeGuardar">
                <option v-for="e in estadosOrdenados" :key="e.id" :value="e.id" 
                  :disabled="(!esJefe && Number(e.id) === ID_DONE) || (!esJefe && Number(e.id) === 1)">
                  {{ e.id }} - {{ e.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="esEstadoRevision || esEstadoFinalizado" 
             :class="['box', esEstadoRevision ? 'has-background-link-light' : 'has-background-warning-light', 'p-3 mt-2']">
          <label class="label is-size-7">
            {{ esEstadoRevision ? 'Comentario de Entrega (Obligatorio)' : 'Notas de Cierre' }}
          </label>
          <textarea v-model="form.comentario_cierre" class="textarea is-small" rows="2" 
            :placeholder="esEstadoRevision ? 'Qué se hizo para enviar a revisión...' : 'Notas finales del docente...'"></textarea>
        </div>

        <div class="field mt-2">
          <label class="label is-size-7 has-text-info">Criterios de Aceptación (Docente)</label>
          <textarea v-model="form.criterios_aceptacion" class="textarea is-small" rows="2" :disabled="!esJefe"></textarea>
        </div>

        <div class="columns mt-1">
          <div class="column">
            <label class="label">Hs Estimadas</label>
            <input v-model="form.horas_estimadas" class="input" type="number" :disabled="form.id && !esJefe">
          </div>
          <div class="column" v-if="mostrarRegistroHoras">
            <label class="label has-text-link">Cargar horas hoy</label>
            <input v-model="horasNuevasDeHoy" class="input is-link is-light" type="number" step="0.5">
          </div>
        </div>

        <div class="box has-background-light p-3 mt-2" v-if="form.id">
          <label class="label is-size-7 mb-2">Checklist de Calidad (Solo Docentes)</label>
          <div class="columns is-multiline is-mobile">
            <div class="column is-half-mobile" v-for="chk in ['cumpleAceptacion', 'testeado', 'documentado', 'utilizable']" :key="chk">
              <label class="checkbox is-size-7">
                <input type="checkbox" v-model="form[chk]" :disabled="!esJefe"> {{ chk.toUpperCase() }}
              </label>
            </div>
          </div>
        </div>

        <div v-if="form.documentado" class="box has-background-info-light p-3 mt-2">
          <label class="label is-size-7 has-text-info">Link de Documentación {{ esEstadoRevision ? '(Obligatorio para Revisión)' : '' }}</label>
          <input v-model="form.link_evidencia" class="input is-small" type="url" placeholder="https://..." :disabled="!puedeGuardar">
        </div>

        <div class="field">
          <label class="label">Descripción General</label>
          <textarea v-model="form.descripcion" class="textarea" rows="2" :disabled="form.id && !esJefe"></textarea>
        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button is-success" :class="{'is-loading': enviando}" :disabled="!puedeGuardar" @click="guardarTarea">
          {{ form.id ? (esEstadoFinalizado ? 'Finalizar Auditoría' : (esEstadoRevision ? 'Enviar a Revisión' : 'Guardar Cambios')) : 'Crear Tarea' }}
        </button>
        <button class="button" @click="emit('close')">Cancelar</button>
      </footer>
    </div>
  </div>
</template>