<script setup>
import { ref, reactive, onMounted } from 'vue';
import configService from '../../services/config.service';
import tareaService from '../../services/tarea.service';

const props = defineProps({
  isActive: Boolean,
  userStory: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'tarea-creada']);

const enviando = ref(false);
const maestras = ref({
  estados: [],
  prioridades: [],
  tipos: []
});

const form = reactive({
  titulo: '',
  descripcion: '',
  tipo_tarea_id: '',
  prioridad_id: '',
  estado_id: '',
  horas_estimadas: 0
});

// 1. Cargar las tablas maestras al montar el modal
onMounted(async () => {
  try {
    const data = await configService.getTablasMaestras();
    maestras.value = data;
    
    // Valores por defecto (opcional)
    if (data.estados.length) form.estado_id = data.estados[0].id;
    if (data.prioridades.length) form.prioridad_id = data.prioridades[0].id;
  } catch (error) {
    console.error("Error al cargar configuraciones:", error);
  }
});

const cerrar = () => {
  // Limpiar formulario antes de cerrar
  form.titulo = '';
  form.descripcion = '';
  emit('close');
};

const guardarTarea = async () => {
  if (!form.titulo || !form.tipo_tarea_id) {
    return alert("El título y el tipo de tarea son obligatorios");
  }

  enviando.value = true;
  try {
    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      tipo_id: form.tipo_tarea_id,
      prioridad_id: form.prioridad_id,
      estado_id: form.estado_id,
      horas_estimadas: Number(form.horas_estimadas),
      
      // VÍNCULOS CLAVE:
      proyecto_id: props.userStory.proyecto_id, // El proyecto viene de la US
      usId: props.userStory.id                  // La clave que espera tu controller
    };

    await tareaService.create(payload);
    emit('tarea-creada');
    cerrar();
  } catch (error) {
    console.error("Error al crear tarea:", error);
    alert("No se pudo crear la tarea técnica");
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <div :class="['modal', { 'is-active': isActive }]">
    <div class="modal-background" @click="cerrar"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Desglosar Tarea: US #{{ userStory.id }}</p>
        <button class="delete" aria-label="close" @click="cerrar"></button>
      </header>
      <section class="modal-card-body">
        
        <div class="field">
          <label class="label">Título de la Tarea Técnica</label>
          <div class="control">
            <input v-model="form.titulo" class="input" type="text" placeholder="Ej: Crear endpoint de validación">
          </div>
        </div>

        <div class="columns">
          <div class="column">
            <div class="field">
              <label class="label">Tipo</label>
              <div class="control is-expanded">
                <div class="select is-fullwidth">
                  <select v-model="form.tipo_tarea_id">
                    <option v-for="t in maestras.tipos" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field">
              <label class="label">Prioridad</label>
              <div class="control is-expanded">
                <div class="select is-fullwidth">
                  <select v-model="form.prioridad_id">
                    <option v-for="p in maestras.prioridades" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Horas Estimadas</label>
          <div class="control">
            <input v-model="form.horas_estimadas" class="input" type="number" min="0">
          </div>
        </div>

      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" :class="{'is-loading': enviando}" @click="guardarTarea">Guardar Tarea</button>
        <button class="button" @click="cerrar">Cancelar</button>
      </footer>
    </div>
  </div>
</template>