<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import configService from '../../services/config.service';
import tareaService from '../../services/tarea.service';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  isActive: Boolean,
  userStory: { type: Object, default: () => ({}) },
  tareaEdit: { type: Object, default: null },
  integrantes: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'tarea-creada', 'tarea-actualizada']);

const authStore = useAuthStore();
const enviando = ref(false);
const nombreResponsable = ref('');
const maestras = ref({ estados: [], prioridades: [], tipos: [] });
const mostrandoConfirmacionSalida = ref(false);

const form = reactive({
  id: null,
  titulo: '',
  descripcion: '',
  tipo_id: '',
  prioridad_id: '',
  estado_id: '',
  responsable_id: null,
  horas_estimadas: 0
});

const responsableActualLabel = computed(() => {
  if (!form.responsable_id) return 'Sin asignar';
  const usuario = props.integrantes.find(u => u.id === form.responsable_id);
  return usuario ? usuario.nombre : 'Sin asignar';
});

const tieneCambios = () => {
  if (props.tareaEdit) {
    return form.titulo !== props.tareaEdit.titulo || 
           form.responsable_id !== props.tareaEdit.responsable_id ||
           form.tipo_id !== props.tareaEdit.tipo_id ||
           form.prioridad_id !== props.tareaEdit.prioridad_id ||
           form.descripcion !== (props.tareaEdit.descripcion || '');
  }
  return form.titulo.trim() !== '' || form.responsable_id !== null || form.descripcion.trim() !== '';
};

const intentarCerrar = () => {
  if (tieneCambios()) {
    mostrandoConfirmacionSalida.value = true;
  } else {
    emit('close');
  }
};

const confirmarSalida = () => {
  mostrandoConfirmacionSalida.value = false;
  emit('close');
};

const vincularUsuario = () => {
  const encontrado = props.integrantes.find(u => u.nombre === nombreResponsable.value);
  form.responsable_id = encontrado ? encontrado.id : null;
};

watch(() => props.isActive, (val) => {
  if (val) {
    mostrandoConfirmacionSalida.value = false;
    if (props.tareaEdit) {
      Object.assign(form, {
        id: props.tareaEdit.id,
        titulo: props.tareaEdit.titulo,
        descripcion: props.tareaEdit.descripcion || '',
        tipo_id: props.tareaEdit.tipo_id,
        prioridad_id: props.tareaEdit.prioridad_id,
        estado_id: props.tareaEdit.estado_id,
        responsable_id: props.tareaEdit.responsable_id || null,
        horas_estimadas: props.tareaEdit.horas_estimadas || 0
      });
      const resp = props.integrantes.find(u => u.id === props.tareaEdit.responsable_id);
      nombreResponsable.value = resp ? resp.nombre : '';
    } else {
      resetForm();
    }
  }
});

const resetForm = () => {
  form.id = null;
  form.titulo = '';
  form.descripcion = '';
  form.responsable_id = null;
  nombreResponsable.value = '';
  form.horas_estimadas = 0;
  if (maestras.value.estados.length) form.estado_id = maestras.value.estados[0].id;
  if (maestras.value.prioridades.length) form.prioridad_id = maestras.value.prioridades[0].id;
  if (maestras.value.tipos.length) form.tipo_id = maestras.value.tipos[0].id;
};

onMounted(async () => {
  try {
    const data = await configService.getTablasMaestras();
    maestras.value = data;
    if (!props.tareaEdit) resetForm();
  } catch (error) {
    console.error("Error cargando maestros:", error);
  }
});

const guardarTarea = async () => {
  if (!form.titulo || !form.tipo_id) return alert("Título y Tipo son obligatorios");
  enviando.value = true;
  try {
    const payload = { ...form, proyecto_id: props.userStory.proyecto_id, usId: props.userStory.id };
    if (form.id) {
      await tareaService.update(form.id, payload);
      emit('tarea-actualizada');
    } else {
      await tareaService.create(payload);
      emit('tarea-creada');
    }
    emit('close');
  } catch (error) {
    alert("Error al procesar la tarea");
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <div :class="['modal', { 'is-active': isActive }]">
    <div class="modal-background" @click="intentarCerrar"></div>
    <div class="modal-card" style="position: relative; overflow: visible;">
      
      <div v-if="mostrandoConfirmacionSalida" 
           class="notification is-warning" 
           style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 6px;">
        <span class="icon is-large"><i class="fas fa-exclamation-triangle fa-2x"></i></span>
        <h3 class="title is-5 has-text-centered mt-3">¿Descartar cambios?</h3>
        <p class="has-text-centered mb-5">Si salís ahora, perderás lo que hayas escrito.</p>
        <div class="buttons is-centered">
          <button class="button is-danger is-dark" @click="confirmarSalida">Sí, descartar</button>
          <button class="button is-white" @click="mostrandoConfirmacionSalida = false">Seguir editando</button>
        </div>
      </div>

      <header class="modal-card-head has-background-light">
        <div>
          <p class="modal-card-title is-size-5">{{ form.id ? 'Actualizar Tarea' : 'Nueva Tarea' }}</p>
          <h1 class="subtitle is-7 has-text-black has-text-weight-bold mt-2">
            Responsable: <span class="has-text-link">{{ responsableActualLabel }}</span>
          </h1>
        </div>
        <button class="delete" @click="intentarCerrar"></button>
      </header>
      
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Título</label>
          <div class="control">
            <input v-model="form.titulo" class="input" type="text" placeholder="Ej: Diseñar Base de Datos">
          </div>
        </div>

        <div class="field">
          <label class="label">Asignar Integrante</label>
          <div class="control has-icons-left">
            <input list="usuarios-modal" v-model="nombreResponsable" class="input" type="text" placeholder="Buscar..." @input="vincularUsuario">
            <span class="icon is-small is-left"><i class="fas fa-search"></i></span>
            <datalist id="usuarios-modal">
              <option v-for="u in integrantes" :key="u.id" :value="u.nombre"></option>
            </datalist>
          </div>
        </div>

        <div class="columns">
          <div class="column">
            <div class="field">
              <label class="label">Tipo</label>
              <div class="select is-fullwidth">
                <select v-model="form.tipo_id">
                  <option v-for="t in maestras.tipos" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field">
              <label class="label">Estado</label>
              <div class="select is-fullwidth">
                <select v-model="form.estado_id">
                  <option v-for="e in maestras.estados" :key="e.id" :value="e.id">{{ e.nombre }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column">
            <div class="field">
              <label class="label">Prioridad</label>
              <div class="select is-fullwidth">
                <select v-model="form.prioridad_id">
                  <option v-for="p in maestras.prioridades" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field">
              <label class="label">Horas Estimadas</label>
              <div class="control">
                <input v-model="form.horas_estimadas" class="input" type="number" step="0.5">
              </div>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Descripción</label>
          <div class="control">
            <textarea v-model="form.descripcion" class="textarea" rows="2"></textarea>
          </div>
        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-flex-end">
        <div class="buttons">
          <button class="button is-success is-small" :class="{'is-loading': enviando}" @click="guardarTarea">
            {{ form.id ? 'Guardar Cambios' : 'Crear Tarea' }}
          </button>
          <button class="button is-small" @click="intentarCerrar">Cancelar</button>
        </div>
      </footer>
    </div>
  </div>
</template>