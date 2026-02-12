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
              <th>Nombre</th>
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
              <td colspan="5" class="has-text-centered has-text-grey py-5">
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { projectService } from '../services/project.services'; 
import EditarProyectoModal from '../components/modals/EditarProyectoModal.vue';
import ConfirmarModal from '../components/modals/ConfirmarModal.vue';

const authStore = useAuthStore();
const router = useRouter();

const proyectos = ref([]);
const cargando = ref(false);
const errorMsg = ref('');

const isModalActive = ref(false);
const enviando = ref(false);
const formProyecto = reactive({
    nombre: '',
    descripcion: ''
});

const mostrarModalEditar = ref(false);
const proyectoSeleccionado = ref(null);

const isConfirmActive = ref(false);
const proyectoAEliminar = ref(null);

// --- LÓGICA DE PERMISOS Y VISIBILIDAD ---

const esAdminODocente = computed(() => {
    const rol = Number(authStore.usuario?.rol_id);
    return rol === 1 || rol === 2;
});

// REGLA DE NEGOCIO: Filtrado estricto de visibilidad
const proyectosVisibles = computed(() => {
    const user = authStore.usuario;
    if (!user) return [];

    const miId = Number(user.id);
    const miRol = Number(user.rol_id);

    // 1. Admin ve todo
    if (miRol === 1) return proyectos.value;

    // 2. Filtrado para Docentes (Alejandra) y Alumnos
    return proyectos.value.filter(p => {
        // ¿Soy el dueño?
        const esDuenio = Number(p.docente_owner_id) === miId;
        
        // ¿Soy un integrante? (Chequeamos todos los posibles alias de la relación)
        const listaIntegrantes = p.Usuarios || p.integrantes || p.usuarios || [];
        const esParticipante = listaIntegrantes.some(i => Number(i.id) === miId);
        
        // Solo incluimos si cumple alguna de las dos
        return esDuenio || esParticipante;
    });
});

const puedeGestionar = (proyecto) => {
    const user = authStore.usuario;
    if (!user) return false;

    const miId = Number(user.id);
    const miRol = Number(user.rol_id);

    // 1. El Admin (Rol 1) gestiona todo lo que ve.
    if (miRol === 1) return true;

    // 2. REGLA PARA DOCENTES: 
    // Si es Docente (Rol 2) Y es miembro del proyecto, puede gestionarlo.
    if (miRol === 2) {
        const integrantes = proyecto.Usuarios || proyecto.integrantes || [];
        const esMiembro = integrantes.some(i => Number(i.id) === miId);
        return esMiembro;
    }

    // 3. PARA ALUMNOS (u otros): 
    // No gestionan proyectos (solo entran al backlog), devolvemos false.
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
            const user = authStore.usuario;
            const miId = Number(user.id);
            const miRol = Number(user.rol_id);

            // 1. El Admin sigue viendo todo por ser Dios en el sistema.
            if (miRol === 1) {
                proyectos.value = res.data;
            } else {
                // 2. REGLA DE ORO: La verdad está en la membresía.
                // Filtramos para quedarnos SOLO con proyectos donde el ID 
                // del usuario esté en la lista de integrantes.
                proyectos.value = res.data.filter(p => {
                    // Buscamos en 'Usuarios' o 'integrantes' (según cómo lo mande tu Sequelize)
                    const integrantes = p.Usuarios || p.integrantes || [];
                    
                    // Si el ID del usuario está en esa lista, el proyecto es suyo.
                    return integrantes.some(i => Number(i.id) === miId);
                });
            }
        } else {
            errorMsg.value = res.error;
        }
    } catch (e) {
        errorMsg.value = "Error al conectar con el servidor";
    } finally {
        cargando.value = false;
    }
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
});
</script>