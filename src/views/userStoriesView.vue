<template>
  <div class="container mt-5 px-4">
    <div class="level">
      <div class="level-left">
        <div>
          <button class="button is-small is-light mb-3" @click="$router.back()">
            <span class="icon is-small"><i class="fas fa-arrow-left"></i></span>
            <span>Volver</span>
          </button>
          <h1 class="title">Product Backlog</h1>
          <h2 class="subtitle is-6 has-text-grey">Proyecto ID: {{ proyectoId }}</h2>
        </div>
      </div>
      <div class="level-right">
        <button class="button is-primary" @click="isModalActive = true">
          <span class="icon"><i class="fas fa-plus"></i></span>
          <span>Nueva User Story (US)</span>
        </button>
      </div>
    </div>

    <hr>

    <div v-if="cargando" class="notification is-info is-light">
      Refrescando Backlog...
    </div>

    <div v-else-if="userStories && userStories.length > 0">
      <UserStoryCard 
        v-for="us in userStories" 
        :key="us.id" 
        :userStory="us" 
        @click="abrirDetalleUS(us)" 
        @eliminar="prepararEliminacion" 
      />
    </div>

    <div v-else class="box has-text-centered py-6">
      <span class="icon is-large has-text-grey-light mb-3">
        <i class="fas fa-list-ul fa-3x"></i>
      </span>
      <p class="is-size-5 has-text-grey">El Product Backlog está vacío.</p>
    </div>

    <div class="modal" :class="{ 'is-active': isModalActive }">
      <div class="modal-background" @click="isModalActive = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Definir Nueva User Story</p>
          <button class="delete" @click="isModalActive = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Título de la US</label>
            <div class="control">
              <input class="input" type="text" v-model="formUS.titulo" placeholder="Ej: Registro de Usuarios">
            </div>
          </div>
          <div class="field">
            <label class="label">Descripción</label>
            <div class="control">
              <textarea class="textarea" v-model="formUS.descripcion" placeholder="Como... quiero... para..."></textarea>
            </div>
          </div>
          <div class="field">
            <label class="label">Prioridad Inicial</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="formUS.prioridad_id">
                  <option v-for="p in prioridades" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button @click="crearUserStory" :disabled="enviando" class="button is-primary" :class="{'is-loading': enviando}">
            Añadir al Backlog
          </button>
          <button class="button" @click="isModalActive = false">Cancelar</button>
        </footer>
      </div>
    </div>

    <DetalleUserStoryModal 
      v-if="usSeleccionada"
      :isActive="isDetalleModalActive"
      :userStory="usSeleccionada"
      :prioridades="prioridades"
      :estados="estados"
      @close="isDetalleModalActive = false"
      @actualizar="actualizarUS"
      @agregar-tarea="prepararNuevaTarea"
    />

    <CrearTareaModal 
      v-if="usSeleccionada"
      :isActive="isTareaModalActive"
      :userStory="usSeleccionada"
      @close="isTareaModalActive = false"
      @tarea-creada="refrescarTodo"
    />

    <ConfirmarModal 
      :isActive="isConfirmActive"
      :mensaje="`¿Estás seguro de eliminar la US '${usAEliminar?.titulo}'?`"
      @confirmar="ejecutarEliminacion"
      @cancelar="isConfirmActive = false"
    />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import userStoryService from '../services/userStory.service';
import UserStoryCard from '../components/userStoryCard.vue';
import DetalleUserStoryModal from '../components/modals/DetalleUserStoryModal.vue';
import CrearTareaModal from '../components/modals/crearTareaModal.vue'; 
import ConfirmarModal from '../components/modals/ConfirmarModal.vue'; // <-- Importar

const route = useRoute();
const proyectoId = ref(null);
const userStories = ref([]);
const cargando = ref(true);
const enviando = ref(false);

// Control de Modales
const isModalActive = ref(false);
const isDetalleModalActive = ref(false);
const isTareaModalActive = ref(false);
const isConfirmActive = ref(false); // <-- Estado para el confirm

// Datos Maestros y Selección
const usSeleccionada = ref(null);
const usAEliminar = ref(null); // <-- Referencia para borrar
const prioridades = ref([]);
const estados = ref([]);

const formUS = reactive({
  titulo: '',
  descripcion: '',
  prioridad_id: 2
});

const cargarMaestros = async () => {
  try {
    const [resP, resE] = await Promise.all([
      api.get('/common/prioridades-us'), 
      api.get('/common/estados-us')
    ]);
    prioridades.value = resP.data;
    estados.value = resE.data;
  } catch (error) {
    console.error("Error cargando maestros:", error);
  }
};

const cargarUserStories = async () => {
  cargando.value = true;
  try {
    const res = await userStoryService.getByProyecto(proyectoId.value);
    userStories.value = res.data;
  } catch (error) {
    console.error("Error al cargar US:", error);
  } finally {
    cargando.value = false;
  }
};

const abrirDetalleUS = (us) => {
  usSeleccionada.value = us;
  isDetalleModalActive.value = true;
};

const prepararNuevaTarea = (us) => {
  isDetalleModalActive.value = false;
  isTareaModalActive.value = true;
};

const crearUserStory = async () => {
  if (!formUS.titulo) return;
  enviando.value = true;
  try {
    const payload = {
      proyecto_id: Number(proyectoId.value),
      titulo: formUS.titulo.trim(),
      descripcion: formUS.descripcion.trim(),
      prioridad_id: formUS.prioridad_id,
      estado_id: 1 
    };
    await userStoryService.create(payload);
    isModalActive.value = false;
    formUS.titulo = '';
    formUS.descripcion = '';
    await cargarUserStories();
  } catch (error) {
    console.error("Error al crear US");
  } finally {
    enviando.value = false;
  }
};

const actualizarUS = async (datos) => {
  try {
    await userStoryService.update(datos.id, datos);
    isDetalleModalActive.value = false;
    await cargarUserStories();
  } catch (error) {
    console.error("Error al actualizar");
  }
};

// --- LÓGICA DE ELIMINACIÓN SIN ALERTS ---
const prepararEliminacion = (usId) => {
  // Buscamos la US en el array para mostrar el título en el modal
  usAEliminar.value = userStories.value.find(u => u.id === usId);
  isConfirmActive.value = true;
};

const ejecutarEliminacion = async () => {
  if (!usAEliminar.value) return;
  try {
    await userStoryService.delete(usAEliminar.value.id);
    isConfirmActive.value = false;
    usAEliminar.value = null;
    await cargarUserStories(); 
  } catch (error) {
    console.error("Error al eliminar:", error);
  }
};

const refrescarTodo = async () => {
  await cargarUserStories();
  isTareaModalActive.value = false;
};

onMounted(() => {
  proyectoId.value = route.params.id;
  cargarMaestros();
  cargarUserStories();
});
</script>