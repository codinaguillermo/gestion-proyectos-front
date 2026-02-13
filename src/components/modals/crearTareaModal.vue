<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
// Usamos llaves {} porque en tu config.service.js exportamos 'const configService'
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
const nombreResponsable = ref('');
const maestras = ref({ estados: [], prioridades: [], tipos: [] });
const mostrandoConfirmacionSalida = ref(false);
const errorValidacion = ref('');
const horasNuevasDeHoy = ref(0);

const form = reactive({
  id: null,
  titulo: '',
  descripcion: '',
  tipo_id: null,      // Cambiado de '' a null para evitar error MySQL
  prioridad_id: null, // Cambiado de '' a null para evitar error MySQL
  estado_id: null,    // Cambiado de '' a null para evitar error MySQL
  responsable_id: null,
  horas_estimadas: 0,
  horas_reales: 0,
  cumpleAceptacion: false,
  testeado: false,
  documentado: false,
  utilizable: false,
  criterios_aceptacion: '',
  comentario_cierre: '',
  link_evidencia: ''
});

// --- LÓGICA DE PERMISOS ---
const usuarioLogueado = computed(() => authStore.usuario || JSON.parse(localStorage.getItem('user')));

const esJefe = computed(() => {
  const u = usuarioLogueado.value;
  return u && (String(u.rol_id) === '1' || String(u.rol_id) === '2');
});

const esMiTarea = computed(() => {
  return String(usuarioLogueado.value?.id) === String(form.responsable_id);
});

const puedeGuardar = computed(() => {
  if (!form.id) return esJefe.value;
  return esJefe.value || esMiTarea.value;
});

const mostrarRegistroHoras = computed(() => {
  return form.id && puedeGuardar.value && Number(form.estado_id) !== 1;
});

// --- FUNCIONES ---
const intentarCerrar = () => {
  if ((form.titulo !== (props.tareaEdit?.titulo || '') || horasNuevasDeHoy.value > 0) && !enviando.value) {
    mostrandoConfirmacionSalida.value = true;
  } else {
    emit('close');
  }
};

const resetForm = () => {
  form.id = null;
  form.titulo = '';
  form.descripcion = '';
  form.responsable_id = null;
  form.horas_estimadas = 0;
  form.horas_reales = 0;
  form.cumpleAceptacion = false;
  form.testeado = false;
  form.documentado = false;
  form.utilizable = false;
  form.criterios_aceptacion = '';
  form.comentario_cierre = '';
  form.link_evidencia = '';
  nombreResponsable.value = '';
  
  // Seteamos por defecto la primera opción de las tablas maestras
  if (maestras.value.estados?.length) form.estado_id = maestras.value.estados[0].id;
  if (maestras.value.prioridades?.length) form.prioridad_id = maestras.value.prioridades[0].id;
  if (maestras.value.tipos?.length) form.tipo_id = maestras.value.tipos[0].id;
};

watch(() => props.isActive, (val) => {
  if (val) {
    mostrandoConfirmacionSalida.value = false;
    errorValidacion.value = '';
    horasNuevasDeHoy.value = 0;
    
    if (props.tareaEdit && props.tareaEdit.id) {     
      form.id = props.tareaEdit.id;
      form.titulo = props.tareaEdit.titulo || '';
      form.descripcion = props.tareaEdit.descripcion || '';
      form.tipo_id = props.tareaEdit.tipo_id;
      form.prioridad_id = props.tareaEdit.prioridad_id;
      form.estado_id = props.tareaEdit.estado_id;
      form.responsable_id = props.tareaEdit.responsable_id;      
      form.horas_estimadas = props.tareaEdit.horas_estimadas || props.tareaEdit.horasEstimadas || 0; 
      form.horas_reales = Number(props.tareaEdit.horasReales || props.tareaEdit.horas_reales || 0);

      form.cumpleAceptacion = !!props.tareaEdit.cumpleAceptacion;
      form.testeado = !!props.tareaEdit.testeado;
      form.documentado = !!props.tareaEdit.documentado;
      form.utilizable = !!props.tareaEdit.utilizable;
      form.criterios_aceptacion = props.tareaEdit.criterios_aceptacion || '';
      form.comentario_cierre = props.tareaEdit.comentario_cierre || '';
      form.link_evidencia = props.tareaEdit.linkEvidencia || props.tareaEdit.link_evidencia || '';
    } else {
      resetForm();
    }
  }
}, { immediate: true });

onMounted(async () => {
  const data = await configService.getTablasMaestras();
  maestras.value = {
    estados: data.estados || data.estadosProyecto || [],
    prioridades: data.prioridades || [],
    tipos: data.tipos || []
  };

  // Aseguramos carga inicial si es nueva tarea y las maestras ya llegaron
  if (!form.id && props.isActive) {
    if (maestras.value.estados?.length) form.estado_id = maestras.value.estados[0].id;
    if (maestras.value.prioridades?.length) form.prioridad_id = maestras.value.prioridades[0].id;
    if (maestras.value.tipos?.length) form.tipo_id = maestras.value.tipos[0].id;
  }
});

const guardarTarea = async () => {
  errorValidacion.value = '';

  if (form.documentado && (!form.link_evidencia || form.link_evidencia.trim() === '')) {
    errorValidacion.value = "Para marcar la tarea como 'Documentada', es obligatorio proveer el link de evidencia.";
    return;
  }
  
  if (props.tareaEdit) {
    const estadoAnterior = Number(props.tareaEdit.estado_id);
    const estadoNuevo = Number(form.estado_id);

    if (estadoAnterior === 1 && estadoNuevo === 4) {
      errorValidacion.value = "No puedes pasar de To Do a Done directamente. La tarea debe ser procesada.";
      return;
    }

    const esCambioSinEsfuerzo = (estadoAnterior === 1 || estadoAnterior === 4 || estadoNuevo === 1);

    if (!esCambioSinEsfuerzo && estadoAnterior !== estadoNuevo && Number(horasNuevasDeHoy.value) <= 0) {
      errorValidacion.value = "Debes registrar las horas trabajadas antes de cambiar el estado.";
      return;
    }
    
    if (esCambioSinEsfuerzo) {
      horasNuevasDeHoy.value = 0;
    }
  }

  if (!form.titulo) return;
  enviando.value = true;

  try {
    const acumuladoFinal = Number(form.horas_reales) + Number(horasNuevasDeHoy.value);

    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      estado_id: form.estado_id || null,
      prioridad_id: form.prioridad_id || null,
      responsable_id: form.responsable_id || null,
      tipo_id: form.tipo_id || null,      
      horas_estimadas: Number(form.horas_estimadas),
      proyecto_id: props.userStory.proyecto_id || props.userStory.Proyecto?.id,
      horasReales: acumuladoFinal, 
      usId: props.userStory.id,
      cumpleAceptacion: form.cumpleAceptacion,
      testeado: form.testeado,
      documentado: form.documentado,
      utilizable: form.utilizable,
      criterios_aceptacion: form.criterios_aceptacion,
      comentario_cierre: form.comentario_cierre,
      link_evidencia: form.link_evidencia
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
    <div class="modal-background" @click="intentarCerrar"></div>
    <div class="modal-card">
      
      <div v-if="mostrandoConfirmacionSalida" class="confirm-overlay notification is-warning">
        <h3 class="title is-5">¿Descartar cambios?</h3>
        <div class="buttons">
          <button class="button is-danger" @click="emit('close')">Sí, descartar</button>
          <button class="button is-white" @click="mostrandoConfirmacionSalida = false">Seguir</button>
        </div>
      </div>

      <header class="modal-card-head">
        <p class="modal-card-title is-size-5">{{ form.id ? 'Gestionar Tarea' : 'Nueva Tarea' }}</p>
        <button class="delete" @click="intentarCerrar"></button>
      </header>
      
      <section class="modal-card-body">
        <div v-if="errorValidacion" class="notification is-danger is-light py-2 mb-4">
          <strong>Atención:</strong> {{ errorValidacion }}
        </div>

        <div class="field">
          <label class="label">Título</label>
          <div class="control">
            <input v-model="form.titulo" class="input" type="text" :disabled="form.id && !esJefe">
          </div>
        </div>

        <div class="columns">
          <div class="column">
            <label class="label">Responsable</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="form.responsable_id" :disabled="form.id && !esJefe">
                  <option :value="null">Seleccionar integrante...</option>
                  <option v-for="u in integrantes" :key="u.id" :value="u.id">
                    {{ u.apellido ? u.apellido.toUpperCase() + ', ' : '' }}{{ u.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="column">
            <label class="label">Estado</label>
            <div class="select is-fullwidth">
              <select v-model="form.estado_id" :disabled="!puedeGuardar">
                <option v-for="e in maestras.estados" :key="e.id" :value="e.id">
                  {{ e.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column">
            <label class="label">Tipo</label>
            <div class="select is-fullwidth">
              <select v-model="form.tipo_id" :disabled="form.id && !esJefe">
                <option v-for="t in maestras.tipos" :key="t.id" :value="t.id">
                  {{ t.nombre }}
                </option>
              </select>
            </div>
          </div>
          <div class="column">
            <label class="label">Prioridad</label>
            <div class="select is-fullwidth">
              <select v-model="form.prioridad_id" :disabled="form.id && !esJefe">
                <option v-for="p in maestras.prioridades" :key="p.id" :value="p.id">
                  {{ p.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="field mt-2" v-if="form.id || esJefe">
          <label class="label is-size-7 has-text-info">Criterios de Aceptación (Definidos por Docente)</label>
          <div class="control">
            <textarea v-model="form.criterios_aceptacion" class="textarea is-small has-background-white-bis" rows="2" :disabled="!esJefe"></textarea>
          </div>
        </div>

        <div class="columns mt-1">
          <div class="column">
            <label class="label">Horas Estimadas</label>
            <div class="control">
              <input v-model="form.horas_estimadas" class="input" type="number" :disabled="form.id && !esJefe">
            </div>
          </div>
          <div class="column" v-if="form.id && mostrarRegistroHoras">
            <label class="label has-text-link">Cargar horas hoy</label>
            <div class="control">
              <input v-model="horasNuevasDeHoy" class="input is-link is-light" type="number" step="0.5">
            </div>
            <p class="help">Horas acumuladas: <strong>{{ form.horas_reales }}h</strong></p>
          </div>
        </div>

        <div class="box has-background-light p-3 mt-2" v-if="form.id">
          <label class="label is-size-7 mb-2">Checklist de Calidad (DoD)</label>
          <div class="columns is-multiline is-mobile">
            <div class="column is-half-mobile">
              <label class="checkbox is-size-7">
                <input type="checkbox" v-model="form.cumpleAceptacion" :disabled="!puedeGuardar"> Cumple Aceptación
              </label>
            </div>
            <div class="column is-half-mobile">
              <label class="checkbox is-size-7">
                <input type="checkbox" v-model="form.testeado" :disabled="!puedeGuardar"> Testeado
              </label>
            </div>
            <div class="column is-half-mobile">
              <label class="checkbox is-size-7">
                <input type="checkbox" v-model="form.documentado" :disabled="!puedeGuardar"> Documentado
              </label>
            </div>
            <div class="column is-half-mobile">
              <label class="checkbox is-size-7">
                <input type="checkbox" v-model="form.utilizable" :disabled="!puedeGuardar"> Utilizable
              </label>
            </div>
          </div>
        </div>

        <div class="box is-info is-light p-3 mt-2" v-if="form.documentado">
          <div class="field">
            <label class="label is-size-7">Link de Evidencia <span class="has-text-danger">*</span></label>
            <div class="control">
              <input v-model="form.link_evidencia" class="input is-small" type="url" :disabled="!puedeGuardar">
            </div>
          </div>
          <div class="field mt-2">
            <label class="label is-size-7">Comentario de Cierre</label>
            <div class="control">
              <textarea v-model="form.comentario_cierre" class="textarea is-small" rows="2" :disabled="!puedeGuardar"></textarea>
            </div>
          </div>
        </div>

        <div class="field mt-3">
          <label class="label">Descripción General</label>
          <div class="control">
            <textarea v-model="form.descripcion" class="textarea" rows="2" :disabled="!puedeGuardar"></textarea>
          </div>
        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button is-success" :class="{'is-loading': enviando}" :disabled="!puedeGuardar" @click="guardarTarea">
          {{ form.id ? 'Guardar Cambios' : 'Crear Tarea' }}
        </button>
        <button class="button" @click="intentarCerrar">Cancelar</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.confirm-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 221, 87, 0.95);
  border-radius: 6px;
}
</style>