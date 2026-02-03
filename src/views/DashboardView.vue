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
            <tr v-for="proyecto in proyectos" :key="proyecto.id">
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
                  <button class="button is-small is-link is-light" @click="irAbacklog(proyecto.id)" title="Ver Backlog">
                      <span class="icon is-small"><i class="fas fa-list-ul"></i></span> 
                  </button>

                  <button class="button is-small is-warning is-light" @click="prepararEdicion(proyecto)">
                    <span class="icon is-small"><i class="fas fa-edit"></i></span>
                  </button>
                  <button class="button is-small is-danger is-light" @click="confirmarEliminar(proyecto)">
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
      v-if="isEditModalActive" 
      :proyectoOriginal="proyectoAEditar"
      :miembrosActuales="proyectoAEditar.integrantes || []"
      @close="isEditModalActive = false"
      @save="actualizarProyecto"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { projectService } from '../services/project.services'; 

// Importación del componente especializado en CamelCase
import EditarProyectoModal from '../components/modals/EditarProyectoModal.vue';

const authStore = useAuthStore();
const router = useRouter();

// --- 1. Variables de Estado de la Tabla ---
const proyectos = ref([]);
const cargando = ref(false);
const errorMsg = ref('');

// --- 2. Variables del Modal Nuevo y Formulario ---
const isModalActive = ref(false);
const enviando = ref(false);
const formProyecto = reactive({
    nombre: '',
    descripcion: ''
});

// --- VARIABLES NUEVAS PARA EL CARGÓMETRO ---
const isEditModalActive = ref(false);
const proyectoAEditar = ref(null);
const miembrosAEditar = ref([]);

// --- 3. Funciones de Lógica ---

const handleLogout = () => {
    authStore.logout();
    router.push('/login');
};

const irAbacklog = (id) => {
    router.push(`/proyectos/${id}/backlog`); // Cambiamos 'tareas' por 'backlog'
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

const esEdicion = ref(false);
const idEnEdicion = ref(null);

const abrirModal = () => {
    esEdicion.value = false; 
    idEnEdicion.value = null;
    formProyecto.nombre = '';
    formProyecto.descripcion = '';
    isModalActive.value = true;
};

const prepararEdicion = (proyecto) => {
    proyectoAEditar.value = proyecto;
    miembrosAEditar.value = proyecto.Usuarios || []; 
    isEditModalActive.value = true;
};

const actualizarProyecto = async (datos) => {
    try {
        const { form, miembros } = datos; 
        const payload = {
            ...form,
            usuariosIds: miembros.map(m => m.id)
        };

        const res = await projectService.update(form.id, payload);
        
        if (res) { 
            isEditModalActive.value = false;
            await cargarProyectos();
        }
    } catch (error) {
        console.error("Error en la comunicación con la API:", error);
        alert("No se pudo conectar con el servidor para actualizar.");
    }
};

const guardarProyecto = async () => {
    if (!formProyecto.nombre) return alert("El nombre es obligatorio");
    
    enviando.value = true;
    const res = await projectService.create(formProyecto);
    
    if (res.success) {
        isModalActive.value = false;
        await cargarProyectos(); 
    } else {
        alert(res.error);
    }
    enviando.value = false;
};

const confirmarEliminar = async (proyecto) => {
  if (typeof Swal === 'undefined') {
    if (confirm(`¿Eliminar ${proyecto.nombre}?`)) {
       const res = await projectService.delete(proyecto.id);
       if (res.success) await cargarProyectos();
    }
    return;
  }

  if (!proyecto || !proyecto.id) return; 

  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Vas a eliminar el proyecto "${proyecto.nombre}"`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff3860',
    confirmButtonText: 'Sí, borrar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      const res = await projectService.delete(proyecto.id);
      if (res.success) {
        Swal.fire('¡Eliminado!', 'El proyecto desapareció.', 'success');
        await cargarProyectos();
      } else {
        Swal.fire('Error', res.error, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Error de red', 'error');
    }
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

<script>
/* Este archivo orquestación la vista principal.
Se vincula con projectService para CRUD de proyectos.
*/
</script>