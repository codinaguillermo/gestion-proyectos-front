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
          <h2 class="subtitle is-6 has-text-grey">
            Proyecto: {{ proyectoData?.nombre || 'Cargando...' }}
          </h2>
        </div>
      </div>
      <div class="level-right">
        <button v-if="puedeGestionarProyecto" class="button is-primary" @click="isModalActive = true">
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
        :showDelete="puedeGestionarProyecto" 
        :class="{ 'can-delete': puedeGestionarProyecto }"
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
            <label class="label">Condiciones</label>
            <div class="control">
              <textarea class="textarea" v-model="formUS.condiciones" placeholder="Criterios de aceptación"></textarea>
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
      @editar-tarea="prepararEdicionTarea($event, usSeleccionada)"
      @eliminar-tarea="eliminarTareaDeBD" 
    />

    <CrearTareaModal 
      v-if="usSeleccionada"
      :isActive="isTareaModalActive"
      :userStory="usSeleccionada"
      :tareaEdit="tareaParaEditar" 
      :integrantes="proyectoData?.integrantes || []" 
      :proyectoOwnerId="proyectoData?.docente_owner_id"
      @tarea-creada="refrescarTodo"
      @tarea-actualizada="refrescarTodo"
      @close="isTareaModalActive = false; isDetalleModalActive = true;"
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
import { ref, reactive, onMounted, computed} from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import userStoryService from '../services/userStory.service';
import UserStoryCard from '../components/userStoryCard.vue';
import DetalleUserStoryModal from '../components/modals/DetalleUserStoryModal.vue';
import CrearTareaModal from '../components/modals/crearTareaModal.vue'; 
import ConfirmarModal from '../components/modals/ConfirmarModal.vue';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const proyectoId = ref(null);
const userStories = ref([]);
const cargando = ref(true);
const enviando = ref(false);

const isModalActive = ref(false);
const isDetalleModalActive = ref(false);
const isTareaModalActive = ref(false);
const isConfirmActive = ref(false);

const usSeleccionada = ref(null);
const tareaParaEditar = ref(null);
const usAEliminar = ref(null);
const prioridades = ref([]);
const estados = ref([]);
const proyectoData = ref(null);
const authStore = useAuthStore();

const mensajeError = ref(''); // Guardará el texto del error
const mostrarError = ref(false); // Controlará la visibilidad

const formUS = reactive({
  titulo: '',
  descripcion: '',
  condiciones: '',
  prioridad_id: 2
});

/**
 * LÓGICA DE PERMISOS BLINDADA
 */
const puedeGestionarProyecto = computed(() => {
  const user = authStore.usuario;
  if (!user || !proyectoData.value) return false;

  // 1. REGLA DE ORO: El Admin (Rol 1) puede todo.
  if (Number(user.rol_id) === 1) return true;

  // 2. REGLA DOCENTE: Solo si es el dueño del proyecto.
  return Number(proyectoData.value.docente_owner_id) === Number(user.id);
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

const crearUserStory = async () => {
  if (!formUS.titulo) return;
  enviando.value = true;
  try {
    const payload = {
      proyecto_id: Number(proyectoId.value),
      titulo: formUS.titulo.trim(),
      descripcion: formUS.descripcion.trim(),
      condiciones: formUS.condiciones.trim(),
      prioridad_id: formUS.prioridad_id,
      estado_id: 1 
    };
    await userStoryService.create(payload);
    isModalActive.value = false;
    formUS.titulo = '';
    formUS.descripcion = '';
    formUS.condiciones = '';
    await cargarUserStories();
  } catch (error) {
    console.error("Error al crear US");
  } finally {
    enviando.value = false;
  }
};

const abrirDetalleUS = (us) => {
  const usFresca = userStories.value.find(item => item.id === us.id);
  usSeleccionada.value = { ...usFresca }; 
  isDetalleModalActive.value = true;
};

const prepararNuevaTarea = (us) => {
  tareaParaEditar.value = null; 
  usSeleccionada.value = us;
  isDetalleModalActive.value = false; 
  isTareaModalActive.value = true;
};

const prepararEdicionTarea = (tarea, us) => {
  tareaParaEditar.value = tarea;
  usSeleccionada.value = us;
  isDetalleModalActive.value = false; 
  isTareaModalActive.value = true;
};

const actualizarUS = async (datos) => {
  mensajeError.value = '';
  mostrarError.value = false;

  try {
    await userStoryService.update(datos.id, datos);
    isDetalleModalActive.value = false;
    await cargarUserStories();
  } catch (error) {
    // Capturamos el mensaje que viene del Backend
    mensajeError.value = error.response?.data?.detalle || error.response?.data?.mensaje || "Error inesperado";
    mostrarError.value = true;

    // Opcional: Desaparecer el error después de 5 segundos
    setTimeout(() => {
      mostrarError.value = false;
    }, 5000);
  }
};

const prepararEliminacion = (usId) => {
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

const eliminarTareaDeBD = async (tareaId) => {
  try {
    await api.delete(`/tareas/${tareaId}`);
    await refrescarTodo();
  } catch (error) {
    console.error("Error al borrar tarea:", error);
  }
};

const refrescarTodo = async () => {
  await cargarUserStories(); 
  isTareaModalActive.value = false; 
  const usActualizada = userStories.value.find(u => u.id === usSeleccionada.value.id);
  if (usActualizada) {
    usSeleccionada.value = { ...usActualizada };
    isDetalleModalActive.value = true; 
  }
};

const cargarDatosProyecto = async () => {
  try {
    const res = await api.get(`/proyectos/${proyectoId.value}`);
    proyectoData.value = res.data; 
  } catch (error) {
    console.error("Error al obtener datos del proyecto:", error);
  }
};

onMounted(() => {
  proyectoId.value = route.params.id;
  cargarMaestros();
  cargarUserStories();
  cargarDatosProyecto();
});
</script>