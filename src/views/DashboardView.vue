<template>
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-4-mobile pt-6-tablet px-3-mobile px-4-tablet pb-6">
        
        <!-- Cabecera principal adaptada con flex horizontal en móvil y título reducido a is-size-4-mobile -->
        <div class="level mb-4-mobile mb-6-tablet is-mobile">
          <div class="level-left">
            <h1 class="title has-text-white is-size-4-mobile is-2 mb-0">
              <span class="icon mr-3 is-hidden-mobile"><i class="fas fa-chalkboard"></i></span>
              Mis Proyectos
            </h1>
          </div>
          <div class="level-right">
            <button v-if="esAdminODocente" class="button is-info is-light has-text-weight-bold is-rounded shadow-sm" @click="isModalActive = true">
              <span class="icon"><i class="fas fa-plus"></i></span>
              <span class="is-hidden-mobile">Nuevo Proyecto</span>
              <span class="is-hidden-tablet">Nuevo</span>
            </button>
          </div>
        </div>

        <div v-if="cargando" class="notification glass-notification is-info">
          <span class="icon"><i class="fas fa-spinner fa-pulse"></i></span> Cargando proyectos...
        </div>
        
        <div v-if="errorMsg" class="notification glass-notification is-danger"> 
          {{ errorMsg }}
        </div>

        <!-- VISTA DE ESCRITORIO / TABLET: Tabla tradicional (Oculta en móviles) -->
        <div class="box glass-panel p-0 is-hidden-mobile" v-if="!cargando && !errorMsg">
          <table class="table is-fullwidth glass-table">
            <thead>
              <tr>
                <th class="has-text-info">Escuela</th> 
                <th class="has-text-info has-text-centered">Viable</th>
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
                  <span v-if="proyecto.viable" class="icon has-text-success" title="Proyecto Avalado Técnicamente">
                    <i class="fas fa-check-circle fa-lg"></i>
                  </span>
                  <span v-else class="icon has-text-grey-dark" title="Pendiente de aprobación técnica">
                    <i class="fas fa-hourglass-half"></i>
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
                <td colspan="9" class="has-text-centered has-text-grey-light py-6">
                  <i class="fas fa-folder-open fa-3x mb-3"></i><br>
                  No tienes proyectos asignados actualmente.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VISTA MÓVIL: Tarjetas oscuras independientes (Oculta en Tablet/Escritorio) -->
        <div class="project-cards-mobile is-hidden-tablet" v-if="!cargando && !errorMsg">
          <div 
            v-for="proyecto in proyectosVisibles" 
            :key="`mobile-${proyecto.id}`" 
            @click="irAbacklog(proyecto.id)" 
            class="box mobile-project-card mb-4"
          >
            <!-- Cabecera de la tarjeta: Escuela y Estado -->
            <div class="card-header-row mb-2">
              <span class="tag school-badge">
                {{ proyecto.escuela?.nombre_corto || 'Global' }}
              </span>
              <span class="tag status-badge">
                {{ proyecto.estado_proyecto?.nombre || 'Sin estado' }}
              </span>
            </div>

            <!-- Título del proyecto -->
            <h3 class="project-title mb-2">
              {{ proyecto.nombre }}
            </h3>

            <!-- Descripción del proyecto -->
            <p class="project-desc mb-3">
              {{ proyecto.descripcion || 'Sin descripción disponible actualmente para este registro de proyecto estudiantil.' }}
            </p>

            <!-- Fila de Indicadores: Viabilidad y Semáforos de Cierre -->
            <div class="card-indicators-row py-2 mb-3">
              <div class="indicator-item">
                <span v-if="proyecto.viable" class="icon has-text-success mr-1">
                  <i class="fas fa-check-circle"></i>
                </span>
                <span v-else class="icon has-text-grey-dark mr-1">
                  <i class="fas fa-hourglass-half"></i>
                </span>
                <span class="indicator-label">VIABLE</span>
              </div>

              <div class="indicator-item">
                <span class="semaforo-led mr-1" 
                      :style="{ backgroundColor: calcularSemaforo(proyecto.fecha_cierre_1).color }"
                      :title="calcularSemaforo(proyecto.fecha_cierre_1).mensaje">
                </span>
                <span class="indicator-label">CIERRE 1</span>
              </div>

              <div class="indicator-item">
                <span class="semaforo-led mr-1" 
                      :style="{ backgroundColor: calcularSemaforo(proyecto.fecha_cierre_2).color }"
                      :title="calcularSemaforo(proyecto.fecha_cierre_2).mensaje">
                </span>
                <span class="indicator-label">CIERRE 2</span>
              </div>
            </div>

            <!-- Pie de la tarjeta: Fecha de creación y Botones de Acción -->
            <div class="card-footer-row">
              <div class="project-date has-text-grey-light is-size-7">
                <i class="far fa-calendar-alt mr-1"></i>
                {{ formatearFecha(proyecto.created_at) }}
              </div>

              <div class="buttons mb-0">
                <button 
                  v-if="esAdminODocente" 
                  class="button is-small dark-action-btn delete-action-btn" 
                  @click.stop="prepararEliminacion(proyecto)"
                >
                  <span class="icon is-small"><i class="fas fa-trash"></i></span>
                </button>
              </div>
            </div>
          </div>

          <!-- Estado vacío versión móvil -->
          <div v-if="proyectosVisibles.length === 0" class="box mobile-project-card has-text-centered py-6">
            <i class="fas fa-folder-open fa-3x mb-3 has-text-grey-light"></i>
            <p class="has-text-grey-light">No tienes proyectos asignados actualmente.</p>
          </div>
        </div>

      </div>
    </div>

    <footer class="footer-dashboard">
        <div class="footer-container">
            <div class="footer-info">
                Gestión de Proyectos Estudiantiles <span class="version-badge">v3.0.0</span>
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

/**
 * Propósito: Instanciar el store de autenticación para consultar datos y rol del usuario logueado.
 * Alimentado por: Pinia Store (auth.js).
 * Datos que retorna: Object (Instancia reactiva del store de autenticación).
 */
const authStore = useAuthStore();

/**
 * Propósito: Instanciar el enrutador de Vue para gestionar la navegación programática entre vistas.
 * Alimentado por: Vue Router.
 * Datos que retorna: Object (Instancia del router).
 */
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

/**
 * Propósito: Calcular el año en curso para mostrar en los créditos del pie de página.
 * Alimentado por: Renderizado del template (footer).
 * Datos que retorna: Number (Año actual de 4 dígitos).
 */
const anioActual = computed(() => new Date().getFullYear());

/**
 * Propósito: Extraer y normalizar en formato numérico el identificador de rol del usuario actual.
 * Alimentado por: authStore.usuario (propiedades rol_id o rolId).
 * Datos que retorna: Number (ID del rol o 99 por defecto si no existe).
 */
const miRol = computed(() => {
    const rol = authStore.usuario?.rol_id || authStore.usuario?.rolId;
    return rol ? Number(rol) : 99;
});

/**
 * Propósito: Determinar si el usuario tiene privilegios de Administración (1) o Docencia (2).
 * Alimentado por: Propiedad computada miRol.
 * Datos que retorna: Boolean (true si es Admin o Docente, false en caso contrario).
 */
const esAdminODocente = computed(() => {
    return miRol.value === 1 || miRol.value === 2;
});

/**
 * Propósito: Filtrar la lista total de proyectos para retornar únicamente aquellos que el usuario tiene permiso de ver (todos para Admin, propios/asignados para el resto).
 * Alimentado por: authStore.usuario, miRol y el arreglo reactivo proyectos.
 * Datos que retorna: Array (Lista filtrada de objetos de proyectos).
 */
const proyectosVisibles = computed(() => {
    const user = authStore.usuario;
    if (!user) return [];
    const miId = Number(user.id);

    if (miRol.value === 1) return proyectos.value;

    return proyectos.value.filter(p => {
        const integrantes = p.integrantes || p.Usuarios || p.usuarios || [];
        const esDuenio = Number(p.docente_owner_id) === miId;
        const esIntegrante = integrantes.some(i => Number(i.id) === miId);
        return esDuenio || esIntegrante;
    });
});

/**
 * Propósito: Evaluar si el usuario logueado tiene permisos de edición o borrado sobre un proyecto específico.
 * Alimentado por: Template (en directiva :class y renderizado condicional de iconos de acción).
 * Datos que retorna: Boolean (true si es Administrador, dueño del proyecto o integrante del equipo).
 */
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

/**
 * Propósito: Solicitar al backend el listado completo de proyectos y actualizar el estado reactivo del componente.
 * Alimentado por: Hook onMounted y función guardarProyecto tras una inserción exitosa.
 * Datos que retorna: Promise<void> (Actualiza proyectos.value o errorMsg.value).
 */
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

/**
 * Propósito: Obtener las tablas maestras de configuración (escuelas) para alimentar el selector del formulario modal.
 * Alimentado por: Hook onMounted al inicializar la vista.
 * Datos que retorna: Promise<void> (Actualiza el arreglo reactivo escuelasMaestras.value).
 */
const cargarMaestras = async () => {
    try {
        const data = await configService.getTablasMaestras();
        escuelasMaestras.value = data.escuelas || [];
    } catch (e) { console.error(e); }
};

/**
 * Propósito: Validar y enviar al backend los datos del formulario modal para registrar un nuevo proyecto estudiantil.
 * Alimentado por: Evento @click en el botón "Guardar Proyecto" del modal.
 * Datos que retorna: Promise<void> (Cierra modal, limpia formulario y recarga listado de proyectos).
 */
const guardarProyecto = async () => {
    if (!formProyecto.nombre || !formProyecto.escuela_id) return; 
    if (!esAdminODocente.value) return;

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

/**
 * Propósito: Asignar el proyecto seleccionado y activar el modal de confirmación antes de proceder con el borrado.
 * Alimentado por: Evento @click en el botón de eliminación (ícono de basurero) en tabla o tarjeta.
 * Datos que retorna: Void (Modifica estado reactivo de proyectoAEliminar e isConfirmActive).
 */
const prepararEliminacion = (proyecto) => {
    if (!esAdminODocente.value) return; 
    proyectoAEliminar.value = proyecto;
    isConfirmActive.value = true;
};

/**
 * Propósito: Ejecutar la eliminación definitiva de un proyecto consumiendo la API y actualizar el listado local.
 * Alimentado por: Evento @confirmar emitido por el componente hijo <ConfirmarModal>.
 * Datos que retorna: Promise<void> (Elimina registro, cierra modal de confirmación y recarga proyectos).
 */
const ejecutarEliminacion = async () => {
    if (!proyectoAEliminar.value || !esAdminODocente.value) return;
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

/**
 * Propósito: Navegar programáticamente hacia la vista del Backlog (tablero de tareas) del proyecto seleccionado.
 * Alimentado por: Evento @click sobre la fila de la tabla (<tr>) o sobre el contenedor de tarjeta móvil (<div.mobile-project-card>).
 * Datos que retorna: Void (Ejecuta router.push hacia la URI del backlog).
 */
const irAbacklog = (id) => router.push(`/proyectos/${id}/backlog`);

/**
 * Propósito: Convertir una cadena de fecha ISO o timestamp en una fecha legible formateada bajo el estándar argentino.
 * Alimentado por: Renderizado del template (columnas y pies de tarjeta de fecha de creación).
 * Datos que retorna: String (Fecha en formato dd/mm/yyyy o guión '-' si es nula).
 */
const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-AR') : '-';

/**
 * Propósito: Calcular la proximidad de una fecha de cierre para retornar un color LED de alerta (rojo, amarillo o verde) y su mensaje descriptivo.
 * Alimentado por: Renderizado del template en directivas de estilo (:style) y atributo title de los semáforos.
 * Datos que retorna: Object (Objeto con propiedades string 'color' en formato HEX y string 'mensaje').
 */
const calcularSemaforo = (fecha) => {
  if (!fecha) return { color: '#444', mensaje: 'Sin fecha' };
  const difDias = Math.ceil((new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24));
  if (difDias < 0) return { color: '#f14668', mensaje: `Atrasado: ${Math.abs(difDias)} días` };
  if (difDias <= 7) return { color: '#f14668', mensaje: `URGENTE: ${difDias} días` };
  if (difDias <= 21) return { color: '#ffdd57', mensaje: `Alerta: ${difDias} días` };
  return { color: '#48c78e', mensaje: `${difDias} días restantes` };
};

/**
 * Propósito: Disparar la carga inicial de datos de proyectos y tablas maestras al montarse el componente en el DOM.
 * Alimentado por: Ciclo de vida del componente Vue (onMounted).
 * Datos que retorna: Void.
 */
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

/* 
  ==========================================================================
  ESTILOS ESPECÍFICOS PARA VISTA MÓVIL (TARJETAS OSCURAS Y PIE RESPONSIVO)
  ==========================================================================
*/
.mobile-project-card {
  background: rgba(20, 25, 35, 0.85) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 1.25rem;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.mobile-project-card:hover {
  border-color: rgba(52, 152, 219, 0.6);
  transform: translateY(-2px);
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.school-badge {
  background: rgba(52, 152, 219, 0.2) !important;
  color: #7ce7fe !important;
  border: 1px solid rgba(52, 152, 219, 0.4);
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.75rem;
}

.status-badge {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 0 0.75rem;
}

.project-title {
  color: #7ce7fe;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
}

.project-desc {
  color: #94a3b8;
  font-size: 0.85rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-indicators-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.indicator-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #94a3b8;
}

.indicator-label {
  font-weight: 600;
  letter-spacing: 0.5px;
  font-size: 0.68rem;
}

.card-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.25rem;
}

.dark-action-btn {
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #cbd5e1 !important;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.dark-action-btn:hover {
  background: rgba(255, 255, 255, 0.18) !important;
  color: #ffffff !important;
}

.delete-action-btn {
  color: #f87171 !important;
}

.delete-action-btn:hover {
  background: rgba(248, 113, 113, 0.2) !important;
  border-color: #f87171 !important;
}

/* Ajustes de apilamiento y espaciado en móviles menores a 768px */
@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
    font-size: 0.75rem;
  }
  
  .pt-4-mobile {
    padding-top: 1.25rem !important;
  }
  
  .px-3-mobile {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
  }
  
  .mb-4-mobile {
    margin-bottom: 1.25rem !important;
  }
}
</style>