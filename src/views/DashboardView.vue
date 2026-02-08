<template>
  <div>   
    <div class="container mt-5 px-4">
      <div class="level">
        <div class="level-left">
          <h1 class="title">Mis Proyectos</h1>
        </div>
        <div class="level-right">
          <button class="button is-primary" @click="abrirModal">
            <span class="icon"><i class="fas fa-plus"></i></span>
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      <div v-if="cargando" class="notification is-info is-light">Cargando proyectos...</div>
      <div v-if="errorMsg && errorMsg.length > 0" class="notification is-danger is-light"> {{ errorMsg }}</div>

      <div class="box" v-if="!cargando && !errorMsg">
        <table class="table is-fullwidth is-hoverable is-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Creado</th>
              <th class="has-text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="proyecto in proyectos" 
              :key="proyecto.id" 
              @click="irAbacklog(proyecto.id)" 
              style="cursor: pointer;"
            >
              <td><strong>{{ proyecto.nombre }}</strong></td>
              <td>{{ proyecto.descripcion }}</td>
              <td>
                <span class="tag is-primary is-light">
                  {{ proyecto.estado_proyecto?.nombre || 'Sin estado' }}
                </span>
              </td>
              <td>{{ formatearFecha(proyecto.created_at) }}</td>
              
              <td class="has-text-right">
                <div class="buttons is-right">
                  <button class="button is-small is-warning is-light" @click.stop="prepararEdicion(proyecto)">
                    <span class="icon is-small"><i class="fas fa-edit"></i></span>
                  </button>
                  <button class="button is-small is-danger is-light" @click.stop="prepararEliminacion(proyecto)">
                    <span class="icon is-small"><i class="fas fa-trash"></i></span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal" :class="{ 'is-active': isModalActive }">
      <div class="modal-background" @click="isModalActive = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Nuevo Proyecto</p>
          <button class="delete" aria-label="close" @click="isModalActive = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Nombre del Proyecto</label>
            <div class="control">
              <input class="input" type="text" v-model="formProyecto.nombre" placeholder="Ej: App de Asistencia">
            </div>
          </div>
          <div class="field">
            <label class="label">Descripción</label>
            <div class="control">
              <textarea class="textarea" v-model="formProyecto.descripcion" placeholder="¿De qué se trata el proyecto?"></textarea>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click="guardarProyecto" :class="{ 'is-loading': enviando }">
            Guardar Proyecto
          </button>
          <button class="button" @click="isModalActive = false">Cancelar</button>
        </footer>
      </div>
    </div>

    <EditarProyectoModal 
      v-if="mostrarModalEditar"
      :key="proyectoSeleccionado.id"
      :proyectoOriginal="proyectoSeleccionado"
      :miembrosActuales="proyectoSeleccionado.integrantes || proyectoSeleccionado.Usuarios || []"
      @close="mostrarModalEditar = false"
      @actualizado="cargarProyectos" 
    />

    <ConfirmarModal 
      :isActive="isConfirmActive"
      :mensaje="`¿Estás seguro de eliminar el proyecto '${proyectoAEliminar?.nombre}'? Se borrará todo el backlog asociado.`"
      @confirmar="ejecutarEliminacion"
      @cancelar="isConfirmActive = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { projectService } from '../services/project.services'; 
import EditarProyectoModal from '../components/modals/EditarProyectoModal.vue';
import ConfirmarModal from '../components/modals/ConfirmarModal.vue'; // <-- Importado

const authStore = useAuthStore();
const router = useRouter();

// --- VARIABLES DE ESTADO ---
const proyectos = ref([]);
const cargando = ref(false);
const errorMsg = ref('');

// --- VARIABLES MODAL NUEVO ---
const isModalActive = ref(false);
const enviando = ref(false);
const formProyecto = reactive({
    nombre: '',
    descripcion: ''
});

// --- VARIABLES MODAL EDICIÓN ---
const mostrarModalEditar = ref(false);
const proyectoSeleccionado = ref(null);

// --- VARIABLES ELIMINACIÓN ---
const isConfirmActive = ref(false);
const proyectoAEliminar = ref(null);

// --- FUNCIONES ---

const irAbacklog = (id) => {
    router.push(`/proyectos/${id}/backlog`);
};

const cargarProyectos = async () => {
    cargando.value = true;
    errorMsg.value = ''; 
    const res = await projectService.getAll();
    if (res.success) {
        proyectos.value = res.data;
    } else {
        errorMsg.value = res.error;
    }
    cargando.value = false;
};

const abrirModal = () => {
    formProyecto.nombre = '';
    formProyecto.descripcion = '';
    isModalActive.value = true;
};

const prepararEdicion = (proyecto) => {
    proyectoSeleccionado.value = proyecto;
    mostrarModalEditar.value = true;
};

const guardarProyecto = async () => {
    if (!formProyecto.nombre) return; 
    
    enviando.value = true;
    const res = await projectService.create(formProyecto);
    
    if (res.success) {
        isModalActive.value = false;
        await cargarProyectos(); 
    }
    enviando.value = false;
};

// --- NUEVA LÓGICA DE ELIMINACIÓN ---
const prepararEliminacion = (proyecto) => {
    proyectoAEliminar.value = proyecto;
    isConfirmActive.value = true;
};

const ejecutarEliminacion = async () => {
    if (!proyectoAEliminar.value) return;
    
    const res = await projectService.delete(proyectoAEliminar.value.id);
    if (res.success) {
        isConfirmActive.value = false;
        proyectoAEliminar.value = null;
        await cargarProyectos();
    } else {
        alert(res.error); // Opcional: podrías mostrarlo en el mismo modal
    }
};

const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return '-';
    return new Date(fechaRaw).toLocaleDateString('es-AR');
};




onMounted(() => {
    cargarProyectos();
});
</script>