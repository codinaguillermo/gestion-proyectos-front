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
            <button v-if="esAdminODocente" class="button is-info is-light has-text-weight-bold" @click="isModalActive = true">
              <span class="icon"><i class="fas fa-plus"></i></span>
              <span>Nuevo Proyecto</span>
            </button>
          </div>
        </div>

        <div v-if="cargando" class="notification glass-notification is-info">
          <span class="icon"><i class="fas fa-spinner fa-pulse"></i></span> Cargando proyectos...
        </div>
        
        <div v-if="errorMsg" class="notification glass-notification is-danger"> 
          {{ errorMsg }}
        </div>

        <div class="box glass-panel p-0" v-if="!cargando && !errorMsg">
          <table class="table is-fullwidth glass-table">
            <thead>
              <tr>
                <th class="has-text-info">Escuela</th> 
                <th class="has-text-info has-text-centered">Cierre 1</th>
                <th class="has-text-info has-text-centered">Cierre 2</th>
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
                <td class="has-text-centered">
                  <span class="semaforo-led" 
                        :style="{ backgroundColor: calcularSemaforo(proyecto.fecha_cierre_1).color }"
                        :title="calcularSemaforo(proyecto.fecha_cierre_1).mensaje">
                  </span>
                </td>
                <td class="has-text-centered">
                  <span class="semaforo-led" 
                        :style="{ backgroundColor: calcularSemaforo(proyecto.fecha_cierre_2).color }"
                        :title="calcularSemaforo(proyecto.fecha_cierre_2).mensaje">
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
                  <div class="buttons is-right">
                    <button class="button is-small is-warning is-inverted" @click.stop="prepararEdicion(proyecto)">
                      <span class="icon is-small">
                        <i class="fas" :class="puedeGestionar(proyecto) ? 'fa-edit' : 'fa-eye'"></i>
                      </span>
                    </button>
                    <button 
                      v-if="esAdminODocente" 
                      class="button is-small is-danger is-inverted" 
                      @click.stop="prepararEliminacion(proyecto)"
                    >
                      <span class="icon is-small"><i class="fas fa-trash"></i></span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="proyectosVisibles.length === 0">
                <td colspan="8" class="has-text-centered has-text-grey-light py-6">
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
                Gestión de Proyectos Estudiantiles <span class="version-badge">v2.1.2</span>
            </div>
            <div class="footer-credits">
                &copy; {{ anioActual }} | Creado por Ing. Guillermo Codina.
            </div>
            <div class="footer-contact">
                <span class="icon"><i class="fas fa-envelope"></i></span>
                <a href="mailto:codinaguillermo@gmail.com">Soporte</a>
            </div>
        </div>
    </footer>

    <div class="modal" :class="{ 'is-active': isModalActive }">
      <div class="modal-background" @click="isModalActive = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Nuevo Proyecto</p>
          <button class="delete" @click="isModalActive = false"></button>
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
          <button class="button is-success" @click="guardarProyecto" :class="{ 'is-loading': enviando }" :disabled="!formProyecto.escuela_id || !formProyecto.nombre">
            Guardar Proyecto
          </button>
          <button class="button" @click="isModalActive = false">Cancelar</button>
        </footer>
      </div>
    </div>

    <ConfirmarModal 
      :isActive="isConfirmActive"
      :mensaje="`¿Estás seguro de eliminar '${proyectoAEliminar?.nombre}'? Se perderá todo el progreso.`"
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
import ConfirmarModal from '../components/modals/ConfirmarModal.vue';

const authStore = useAuthStore();
const router = useRouter();

const proyectos = ref([]);
const escuelasMaestras = ref([]); 
const cargando = ref(false);
const errorMsg = ref('');
const isModalActive = ref(false);
const enviando = ref(false);
const isConfirmActive = ref(false);
const proyectoAEliminar = ref(null);

const formProyecto = reactive({ nombre: '', descripcion: '', escuela_id: null });

const anioActual = computed(() => new Date().getFullYear());

// Getter de rol centralizado
const miRol = computed(() => Number(authStore.usuario?.rol_id || authStore.usuario?.rolId));

const esAdminODocente = computed(() => {
    return miRol.value === 1 || miRol.value === 2;
});

const proyectosVisibles = computed(() => {
    const user = authStore.usuario;
    if (!user) return [];
    const miId = Number(user.id);

    // Admin (1) ve todo
    if (miRol.value === 1) return proyectos.value;

    // Docente o Alumno: Ven si son dueños o integrantes
    return proyectos.value.filter(p => {
        const integrantes = p.integrantes || p.Usuarios || p.usuarios || [];
        const esDuenio = Number(p.docente_owner_id) === miId;
        const esIntegrante = integrantes.some(i => Number(i.id) === miId);
        return esDuenio || esIntegrante;
    });
});

const puedeGestionar = (proyecto) => {
    const user = authStore.usuario;
    if (!user) return false;
    const miId = Number(user.id);

    if (miRol.value === 1) return true;

    const integrantes = proyecto.integrantes || proyecto.Usuarios || [];
    const esDuenio = Number(proyecto.docente_owner_id) === miId;
    const esIntegrante = integrantes.some(i => Number(i.id) === miId);

    return esDuenio || esIntegrante;
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
    } catch (e) { console.error(e); }
};

const prepararEdicion = (proyecto) => {
    router.push({ name: 'configurar-proyecto', params: { id: proyecto.id } });
};

const guardarProyecto = async () => {
    if (!formProyecto.nombre || !formProyecto.escuela_id) return; 
    enviando.value = true;
    try {
        const res = await projectService.create(formProyecto);
        if (res.success) {
            isModalActive.value = false;
            formProyecto.nombre = '';
            formProyecto.descripcion = '';
            formProyecto.escuela_id = null;
            await cargarProyectos(); 
        }
    } finally { enviando.value = false; }
};

const prepararEliminacion = (proyecto) => {
    // Doble check de seguridad en interfaz
    if (!esAdminODocente.value) return; 
    proyectoAEliminar.value = proyecto;
    isConfirmActive.value = true;
};

const ejecutarEliminacion = async () => {
    if (!proyectoAEliminar.value) return;
    try {
        const res = await projectService.delete(proyectoAEliminar.value.id);
        if (res.success) {
            await cargarProyectos();
        } else {
            alert(res.error || "No se pudo eliminar el proyecto");
        }
    } catch (e) {
        console.error(e);
    } finally {
        isConfirmActive.value = false;
        proyectoAEliminar.value = null;
    }
};

const irAbacklog = (id) => router.push(`/proyectos/${id}/backlog`);

const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-AR') : '-';

const calcularSemaforo = (fecha) => {
  if (!fecha) return { color: '#444', mensaje: 'Sin fecha' };
  const difDias = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
  if (difDias < 0) return { color: '#f14668', mensaje: `Atrasado: ${Math.abs(difDias)} días` };
  if (difDias <= 7) return { color: '#f14668', mensaje: `URGENTE: ${difDias} días` };
  if (difDias <= 21) return { color: '#ffdd57', mensaje: `Alerta: ${difDias} días` };
  return { color: '#48c78e', mensaje: `${difDias} días restantes` };
};

onMounted(() => {
    cargarProyectos();
    cargarMaestras(); 
});
</script>

<style scoped>
.dashboard-bg {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)), url('../assets/fondo.jpg');
  background-size: cover;
  background-attachment: fixed;
}
.main-content-wrapper { flex: 1 0 auto; }
.footer-dashboard {
  flex-shrink: 0;
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
  max-width: 1200px;
  margin: 0 auto;
}
.version-badge {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: monospace;
}
.glass-panel {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.glass-table { background: transparent !important; color: white !important; }
.clickable-row { transition: background 0.3s ease; cursor: pointer; }
.clickable-row:hover { background: rgba(255, 255, 255, 0.1) !important; }
.post-it-tag {
  background-color: #ffd966 !important; 
  color: #333 !important;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
  transform: rotate(-1deg);
}
.semaforo-led {
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s;
}
.semaforo-led:hover { transform: scale(1.3); }
</style>