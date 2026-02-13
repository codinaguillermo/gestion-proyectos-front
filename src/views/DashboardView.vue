<template>  


  <div>   
    <div class="container mt-5 px-4">
      <div class="level">
        <div class="level-left">
          <h1 class="title">Mis Proyectos</h1>
        </div>
        <div class="level-right">
          <button v-if="esAdminODocente" class="button is-primary" @click="abrirModal">
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
              <th>Escuela</th> <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Creado</th>
              <th class="has-text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="proyecto in proyectosVisibles" 
              :key="proyecto.id" 
              @click="irAbacklog(proyecto.id)" 
              style="cursor: pointer;"
            >
              <td>
                <span class="tag is-info is-light has-text-weight-bold">
                  {{ proyecto.escuela?.nombre_corto || 'Global' }}
                </span>
              </td>
              <td><strong>{{ proyecto.nombre }}</strong></td>
              <td>{{ proyecto.descripcion }}</td>
              <td>
                <span class="tag is-primary is-light">
                  {{ proyecto.estado_proyecto?.nombre || 'Sin estado' }}
                </span>
              </td>
              <td>{{ formatearFecha(proyecto.created_at) }}</td>
              
              <td class="has-text-right">
                <div v-if="puedeGestionar(proyecto)" class="buttons is-right">
                  <button class="button is-small is-warning is-light" @click.stop="prepararEdicion(proyecto)">
                    <span class="icon is-small"><i class="fas fa-edit"></i></span>
                  </button>
                  <button class="button is-small is-danger is-light" @click.stop="prepararEliminacion(proyecto)">
                    <span class="icon is-small"><i class="fas fa-trash"></i></span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="proyectosVisibles.length === 0">
              <td colspan="6" class="has-text-centered has-text-grey py-5">
                No tienes proyectos asignados actualmente.
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
        <footer class="modal-card-foot">
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { projectService } from '../services/project.services'; 
// CORREGIDO: Import named para evitar que configService sea undefined
import { configService } from '../services/config.service'; 
import EditarProyectoModal from '../components/modals/EditarProyectoModal.vue';
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

const isConfirmActive = ref(false);
const proyectoAEliminar = ref(null);

// --- PERMISOS ---
const esAdminODocente = computed(() => {
    // Aseguramos que tomamos el rol_id correcto del authStore
    const rol = Number(authStore.usuario?.rol_id || authStore.usuario?.rolId);
    return rol === 1 || rol === 2;
});

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

const puedeGestionar = (proyecto) => {
    const user = authStore.usuario;
    if (!user) return false;
    const miId = Number(user.id);
    const miRol = Number(user.rol_id || user.rolId);

    if (miRol === 1) return true;
    if (miRol === 2) {
        // CORREGIDO: Un docente gestiona si es el DUEÑO o si es integrante con rol docente
        const esDuenio = Number(proyecto.docente_owner_id) === miId;
        const integrantes = proyecto.Usuarios || proyecto.integrantes || [];
        const esMiembroDocente = integrantes.some(i => Number(i.id) === miId);
        return esDuenio || esMiembroDocente;
    }
    return false;
};

// --- FUNCIONES ---
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
        // Ahora 'data' ya tiene la propiedad 'escuelas' unificada por el servicio
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

const prepararEdicion = (proyecto) => {
    proyectoSeleccionado.value = proyecto;
    mostrarModalEditar.value = true;
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