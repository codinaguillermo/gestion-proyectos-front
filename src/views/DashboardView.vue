<template>  
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-6 px-4 pb-6">
        <div class="level mb-6">
          <div class="level-left">
            <h1 class="title has-text-white is-2">
              <span class="icon mr-3"><i class="fas fa-chalkboard"></i></span>
              Mis Proyectos
            </h1>
          </div>
          <div class="level-right">
            <button v-if="esAdminODocente" class="button is-info is-light has-text-weight-bold" @click="abrirModal">
              <span class="icon"><i class="fas fa-plus"></i></span>
              <span>Nuevo Proyecto</span>
            </button>
          </div>
        </div>

        <div v-if="cargando" class="notification glass-notification is-info">
          <span class="icon"><i class="fas fa-spinner fa-pulse"></i></span> Cargando proyectos...
        </div>
        <div v-if="errorMsg && errorMsg.length > 0" class="notification glass-notification is-danger"> 
          {{ errorMsg }}
        </div>

        <div class="box glass-panel p-0" v-if="!cargando && !errorMsg">
          <table class="table is-fullwidth glass-table">
            <thead>
              <tr>
                <th class="has-text-info">Escuela</th> 
                <th class="has-text-info">Nombre</th>
                <th class="has-text-info">Descripción</th>
                <th class="has-text-info">Estado</th>
                <th class="has-text-info">Creado</th>
                <th class="has-text-right has-text-info">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="proyecto in proyectosVisibles" 
                :key="proyecto.id" 
                @click="irAbacklog(proyecto.id)" 
                class="clickable-row"
              >
                <td>
                  <span class="tag is-info post-it-tag">
                    {{ proyecto.escuela?.nombre_corto || 'Global' }}
                  </span>
                </td>
                <td><strong class="has-text-white">{{ proyecto.nombre }}</strong></td>
                <td class="has-text-grey-lighter">{{ proyecto.descripcion }}</td>
                <td>
                  <span class="tag is-success is-light is-rounded has-text-weight-bold">
                    {{ proyecto.estado_proyecto?.nombre || 'Sin estado' }}
                  </span>
                </td>
                <td class="has-text-grey-light">{{ formatearFecha(proyecto.created_at) }}</td>
                
                <td class="has-text-right">
                  <div v-if="puedeGestionar(proyecto)" class="buttons is-right">
                    <button class="button is-small is-warning is-inverted" @click.stop="prepararEdicion(proyecto)">
                      <span class="icon is-small"><i class="fas fa-edit"></i></span>
                    </button>
                    <button class="button is-small is-danger is-inverted" @click.stop="prepararEliminacion(proyecto)">
                      <span class="icon is-small"><i class="fas fa-trash"></i></span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="proyectosVisibles.length === 0">
                <td colspan="6" class="has-text-centered has-text-grey-light py-6">
                  <i class="fas fa-folder-open fa-3x mb-3"></i><br>
                  No tienes proyectos asignados actualmente.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <footer class="footer-dashboard">
        <div class="footer-container">
            <div class="footer-info">
                Gestión de Proyectos Estudiantiles
                <span class="version-badge">v1.0.3-stable</span>
            </div>

            <div class="footer-credits">
                &copy; {{ anioActual }} | Creado por Ing. Guillermo Codina. Todos los derechos reservados.
            </div>

            <div class="footer-contact">
                <span class="icon"><i class="fas fa-envelope"></i></span>
                <a href="mailto:codinaguillermo@gmail.com">Contacto de Soporte</a>
            </div>
        </div>
    </footer>

    <div class="modal" :class="{ 'is-active': isModalActive }">
      <div class="modal-background" @click="isModalActive = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Nuevo Proyecto</p>
          <button class="delete" aria-label="close" @click="isModalActive = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Escuela Perteneciente</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="formProyecto.escuela_id">
                  <option :value="null">Seleccionar Escuela...</option>
                  <option v-for="esc in escuelasMaestras" :key="esc.id" :value="esc.id">
                      {{ esc.nombre_corto }} - {{ esc.nombre_largo }}
                  </option>
              </select>
              </div>
            </div>
          </div>

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
        <footer class="modal-card-foot is-justify-content-flex-end">
          <button class="button is-success" @click="guardarProyecto" :class="{ 'is-loading': enviando }" :disabled="!formProyecto.escuela_id">
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
      :todasLasTareas="todasLasTareas"
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { projectService } from '../services/project.services'; 
import { configService } from '../services/config.service'; 
import { tareaService } from '../services/tarea.service'; 
import EditarProyectoModal from '../components/modals/editarProyectoModal.vue';
import ConfirmarModal from '../components/modals/ConfirmarModal.vue';

const authStore = useAuthStore();
const router = useRouter();

const proyectos = ref([]);
const escuelasMaestras = ref([]); 
const cargando = ref(false);
const errorMsg = ref('');

const isModalActive = ref(false);
const enviando = ref(false);
const formProyecto = reactive({
    nombre: '',
    descripcion: '',
    escuela_id: null 
});

const mostrarModalEditar = ref(false);
const proyectoSeleccionado = ref(null);
const todasLasTareas = ref([]); 

const isConfirmActive = ref(false);
const proyectoAEliminar = ref(null);

/**
 * Propósito: Obtener el año actual para el copyright.
 * Alimenta a: Template del footer.
 * Datos que retorna: Number (Año actual).
 */
const anioActual = computed(() => new Date().getFullYear());

/**
 * Propósito: Determinar si el usuario tiene rol administrativo o docente.
 * Alimentado por: authStore.usuario.
 * Retorna: Boolean.
 */
const esAdminODocente = computed(() => {
    const rol = Number(authStore.usuario?.rol_id || authStore.usuario?.rolId);
    return rol === 1 || rol === 2;
});

/**
 * Propósito: Filtrar proyectos según pertenencia y rol del usuario.
 * Alimentado por: proyectos (ref).
 * Retorna: Array de objetos proyecto.
 */
const proyectosVisibles = computed(() => {
    const user = authStore.usuario;
    if (!user) return [];
    const miId = Number(user.id);
    const miRol = Number(user.rol_id || user.rolId);

    if (miRol === 1) return proyectos.value;

    return proyectos.value.filter(p => {
        const esDuenio = Number(p.docente_owner_id) === miId;
        const integrantes = p.Usuarios || p.integrantes || p.usuarios || [];
        const esParticipante = integrantes.some(i => Number(i.id) === miId);
        return esDuenio || esParticipante;
    });
});

/**
 * Propósito: Validar si el usuario puede editar o borrar un proyecto específico.
 * Alimentado por: Objeto proyecto.
 * Retorna: Boolean.
 */
const puedeGestionar = (proyecto) => {
    const user = authStore.usuario;
    if (!user) return false;
    const miId = Number(user.id);
    const miRol = Number(user.rol_id || user.rolId);

    if (miRol === 1) return true;
    if (miRol === 2) {
        const esDuenio = Number(proyecto.docente_owner_id) === miId;
        const integrantes = proyecto.Usuarios || proyecto.integrantes || [];
        const esMiembroDocente = integrantes.some(i => Number(i.id) === miId);
        return esDuenio || esMiembroDocente;
    }
    return false;
};

const irAbacklog = (id) => {
    router.push(`/proyectos/${id}/backlog`);
};

const cargarProyectos = async () => {
    cargando.value = true;
    errorMsg.value = ''; 
    try {
        const res = await projectService.getAll();
        if (res.success) {
            proyectos.value = res.data;
        } else {
            errorMsg.value = res.error;
        }
    } catch (e) {
        errorMsg.value = "Error al conectar con el servidor";
    } finally {
        cargando.value = false;
    }
};

const cargarMaestras = async () => {
    try {
        const data = await configService.getTablasMaestras();
        escuelasMaestras.value = data.escuelas || [];
    } catch (e) {
        console.error("Error al cargar escuelas:", e);
    }
};

const abrirModal = () => {
    formProyecto.nombre = '';
    formProyecto.descripcion = '';
    formProyecto.escuela_id = null; 
    isModalActive.value = true;
};

const prepararEdicion = async (proyecto) => {
    proyectoSeleccionado.value = proyecto;
    try {
        const res = await tareaService.getAll();
        todasLasTareas.value = res.data || res;
    } catch (error) {
        console.error("Error cargando tareas globales:", error);
        todasLasTareas.value = [];
    } finally {
        mostrarModalEditar.value = true;
    }
};

const guardarProyecto = async () => {
    if (!formProyecto.nombre || !formProyecto.escuela_id) return; 
    enviando.value = true;
    try {
        const res = await projectService.create(formProyecto);
        if (res.success) {
            isModalActive.value = false;
            await cargarProyectos(); 
        }
    } catch (e) {
        console.error("Error guardando proyecto", e);
    } finally {
        enviando.value = false;
    }
};

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
        alert(res.error);
    }
};

const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return '-';
    return new Date(fechaRaw).toLocaleDateString('es-AR');
};

onMounted(() => {
    cargarProyectos();
    cargarMaestras(); 
});
</script>

<style scoped>
/* Estructura para el Sticky Footer */
.dashboard-bg {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), 
              url('../src/assets/fondo.jpg');
  background-size: cover;
  background-attachment: fixed;
}

.main-content-wrapper {
  flex: 1 0 auto; /* Ocupa todo el espacio para empujar el footer */
}

/* Estilos del Footer Arreglado */
.footer-dashboard {
  flex-shrink: 0; /* No permite que el footer se achique */
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 1rem;
  color: #bdc3c7;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
  font-size: 0.9rem;
}

.footer-info, .footer-credits, .footer-contact {
  margin: 5px 15px;
}

.version-badge {
  background-color: rgba(52, 152, 219, 0.2);
  color: #3498db;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  margin-left: 8px;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.footer-contact a {
  color: #3498db;
  text-decoration: none;
  margin-left: 5px;
}

.footer-contact a:hover {
  text-decoration: underline;
}

/* Panel de vidrio esmerilado y tabla */
.glass-panel {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.glass-table {
  background: transparent !important;
  color: white !important;
}

.glass-table thead th {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1) !important;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.clickable-row {
  transition: background 0.3s ease;
  cursor: pointer;
}

.clickable-row:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.glass-table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  vertical-align: middle !important;
}

/* Etiquetas estilo post-it */
.post-it-tag {
  background-color: #ffd966 !important; 
  color: #333 !important;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
  transform: rotate(-1deg);
}

.glass-notification {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(5px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>