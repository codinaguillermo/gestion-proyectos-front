<script setup>
/**
 * COMPONENTE: crearTareaModal.vue
 * DESCRIPCIÓN: Modal para la gestión (creación/edición) de tareas técnicas.
 * Mantiene la lógica de permisos, estados iniciales y trazabilidad temporal.
 * REGLA DE CIERRE: Solo exige Link de Evidencia (si está marcado Documentado) 
 * y Comentario de Cierre al intentar guardar en estado DONE (ID 4).
 */
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { configService } from '../../services/config.service';
import tareaService from '../../services/tarea.service';
import { useAuthStore } from '../../stores/auth';

// --- PROPIEDADES RECIBIDAS ---
const props = defineProps({
  isActive: Boolean,
  userStory: { type: Object, default: () => ({}) },
  tareaEdit: { type: Object, default: null },
  integrantes: { type: Array, default: () => [] },
  proyecto: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['close', 'tarea-creada', 'tarea-actualizada']);

// --- ESTADOS REACTIVOS ---
const authStore = useAuthStore();
const enviando = ref(false);
const maestras = ref({ estados: [], prioridades: [], tipos: [] });
const mostrandoConfirmacionSalida = ref(false);
const errorValidacion = ref('');
const horasNuevasDeHoy = ref(0);

// --- ESTADO INICIAL DEL FORMULARIO ---
const form = reactive({
  id: null,
  titulo: '',
  descripcion: '',
  tipo_id: null,
  prioridad_id: null,
  estado_id: null,
  responsable_id: null,
  horas_estimadas: 0,
  horas_reales: 0,
  fechaInicioReal: null,
  fechaFinReal: null,
  cumpleAceptacion: false,
  testeado: false,
  documentado: false, // Flag que indica si la tarea requiere documentación
  utilizable: false,
  criterios_aceptacion: '',
  comentario_cierre: '', // Campo vinculado a comentario_cierre en DB
  link_evidencia: ''    // Campo vinculado a link_evidencia en DB
});

// --- LÓGICA DE ESTADO INICIAL ---
/**
 * Al crear una tarea nueva, pre-selecciona 'TO DO' o 'PENDIENTE' para agilizar la carga.
 */
const setEstadoPorDefecto = () => {
  if (maestras.value.estados?.length) {
    const estadoTodo = maestras.value.estados.find(e => 
      e.nombre.toUpperCase() === 'TO DO' || e.nombre.toUpperCase() === 'PENDIENTE'
    );
    form.estado_id = estadoTodo ? estadoTodo.id : maestras.value.estados[0].id;
  }
};

/**
 * Limpia el objeto reactivo para iniciar una creación de tarea desde cero.
 */
const resetForm = () => {
  form.id = null;
  form.titulo = '';
  form.descripcion = '';
  form.responsable_id = null;
  form.horas_estimadas = 0;
  form.horas_reales = 0;
  form.fechaInicioReal = null;
  form.fechaFinReal = null;
  form.cumpleAceptacion = false;
  form.testeado = false;
  form.documentado = false;
  form.utilizable = false;
  form.criterios_aceptacion = '';
  form.comentario_cierre = '';
  form.link_evidencia = '';
  
  if (maestras.value.prioridades?.length) form.prioridad_id = maestras.value.prioridades[0].id;
  if (maestras.value.tipos?.length) form.tipo_id = maestras.value.tipos[0].id;
  
  setEstadoPorDefecto();
};

// --- LÓGICA DE TIEMPOS (SELLOS DE TRAZABILIDAD) ---
/**
 * Convierte un string ISO de fecha a formato local legible (Día, Mes, Año, Hora).
 */
const formatearFecha = (fecha) => {
  if (!fecha) return '';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(fecha));
};

/**
 * Calcula la diferencia en días desde el inicio real hasta hoy.
 */
const calcularAntiguedad = (fecha) => {
  if (!fecha) return '';
  const inicio = new Date(fecha);
  const ahora = new Date();
  const diffTime = Math.abs(ahora - inicio);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'hoy';
  if (diffDays === 1) return 'ayer';
  return `hace ${diffDays} días`;
};

// --- LÓGICA DE PERMISOS (RBAC) ---
const usuarioLogueado = computed(() => authStore.usuario || JSON.parse(localStorage.getItem('user')));

/**
 * Determina si el usuario tiene privilegios de Docente o Administrador.
 */
const esJefe = computed(() => {
  const u = usuarioLogueado.value;
  return u && (String(u.rol_id) === '1' || String(u.rol_id) === '2');
});

/**
 * Verifica si el usuario actual es el responsable de la tarea que se está editando.
 */
const esMiTarea = computed(() => String(usuarioLogueado.value?.id) === String(form.responsable_id));

/**
 * Define si el usuario tiene permiso para guardar cambios.
 */
const puedeGuardar = computed(() => form.id ? (esJefe.value || esMiTarea.value) : esJefe.value);

/**
 * Define si se habilita la carga incremental de horas (no disponible en TO DO).
 */
const mostrarRegistroHoras = computed(() => form.id && puedeGuardar.value && Number(form.estado_id) !== 1);

/**
 * Detecta si el estado seleccionado actualmente es DONE (ID 4).
 */
const esEstadoFinalizado = computed(() => {
    return Number(form.estado_id) === 4; 
});

// --- WATCHERS Y LIFECYCLE ---
/**
 * Sincroniza los datos del formulario al abrir el modal (Edición vs Creación).
 */
watch(() => props.isActive, (val) => {
  if (val) {
    mostrandoConfirmacionSalida.value = false;
    errorValidacion.value = '';
    horasNuevasDeHoy.value = 0;
    
    // FIX: Limpiamos los campos de cierre para evitar que se muestre el texto de la tarea anterior (Caché visual)
    form.comentario_cierre = '';
    form.link_evidencia = '';
    
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
      form.fechaInicioReal = props.tareaEdit.fechaInicioReal || null;
      form.fechaFinReal = props.tareaEdit.fechaFinReal || null;
      form.cumpleAceptacion = !!props.tareaEdit.cumpleAceptacion;
      form.testeado = !!props.tareaEdit.testeado;
      form.documentado = !!props.tareaEdit.documentado;
      form.utilizable = !!props.tareaEdit.utilizable;
      form.criterios_aceptacion = props.tareaEdit.criterios_aceptacion || '';
      form.comentario_cierre = props.tareaEdit.comentarioCierre || props.tareaEdit.comentario_cierre || '';
      form.link_evidencia = props.tareaEdit.linkEvidencia || props.tareaEdit.link_evidencia || '';
    } else {
      resetForm();
    }
  }
}, { immediate: true });

/**
 * Carga los diccionarios (tablas maestras) desde el servidor al montar.
 */
onMounted(async () => {
  const data = await configService.getTablasMaestras();
  maestras.value = {
    estados: data.estados || data.estadosProyecto || [],
    prioridades: data.prioridades || [],
    tipos: data.tipos || []
  };
  if (!form.id && props.isActive) {
    setEstadoPorDefecto();
  }
});

/**
 * Procesa la validación lógica y el envío de datos al backend.
 */
const guardarTarea = async () => {
  errorValidacion.value = '';

  /**
   * REGLA DE CIERRE:
   * Si el estado es DONE (finalizado), se exige el Comentario. 
   * Si además está tildado 'Documentado', se exige el Link.
   */
  if (esEstadoFinalizado.value) {
      if (!form.comentario_cierre || form.comentario_cierre.trim().length < 5) {
          errorValidacion.value = "Al finalizar la tarea (DONE), debes ingresar un comentario de cierre descriptivo.";
          return;
      }
      if (form.documentado && (!form.link_evidencia || form.link_evidencia.trim() === '')) {
          errorValidacion.value = "Para pasar a DONE una tarea con documentación, debes proveer el link de evidencia.";
          return;
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
const intentarCerrar = () => emit('close');
</script>

<template>  
  <div :class="['modal', { 'is-active': isActive }]">
    <div class="modal-background" @click="intentarCerrar"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-size-5">{{ form.id ? 'Gestionar Tarea' : 'Nueva Tarea' }}</p>
        <button class="delete" @click="intentarCerrar"></button>
      </header>
      
      <section class="modal-card-body">
        <div v-if="errorValidacion" class="notification is-danger is-light py-2 mb-4">
          <strong>Atención:</strong> {{ errorValidacion }}
        </div>

        <div v-if="form.id && form.fechaInicioReal" class="notification is-info is-light py-2 mb-4">
          <div class="is-flex is-align-items-center">
            <span class="icon mr-2"><i class="fas fa-history"></i></span>
            <div class="is-size-7">
              <p><strong>Inicio real:</strong> {{ formatearFecha(form.fechaInicioReal) }} ({{ calcularAntiguedad(form.fechaInicioReal) }})</p>
              <p v-if="form.fechaFinReal"><strong>Finalización:</strong> {{ formatearFecha(form.fechaFinReal) }}</p>
            </div>
          </div>
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

        <div v-if="esEstadoFinalizado" class="box has-background-warning-light p-3 mt-2" style="border: 1px solid #ffdd57">
            <div class="field">
                <label class="label is-size-7 has-text-warning-dark">Comentario de Cierre (Obligatorio)</label>
                <textarea v-model="form.comentario_cierre" class="textarea is-small" placeholder="Contanos qué hiciste para terminar la tarea..." rows="2"></textarea>
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
            <div class="column is-half-mobile"><label class="checkbox is-size-7"><input type="checkbox" v-model="form.cumpleAceptacion" :disabled="!puedeGuardar"> Cumple Aceptación</label></div>
            <div class="column is-half-mobile"><label class="checkbox is-size-7"><input type="checkbox" v-model="form.testeado" :disabled="!puedeGuardar"> Testeado</label></div>
            <div class="column is-half-mobile"><label class="checkbox is-size-7"><input type="checkbox" v-model="form.documentado" :disabled="!puedeGuardar"> Documentado</label></div>
            <div class="column is-half-mobile"><label class="checkbox is-size-7"><input type="checkbox" v-model="form.utilizable" :disabled="!puedeGuardar"> Utilizable</label></div>
          </div>
        </div>

        <div v-if="form.documentado" class="box has-background-info-light p-3 mt-2">
            <div class="field">
                <label class="label is-size-7 has-text-info">Link de Evidencia</label>
                <input v-model="form.link_evidencia" class="input is-small" type="url" placeholder="URL de Google Drive, Repo, etc.">
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
/* Sin cambios en estilos */
</style>