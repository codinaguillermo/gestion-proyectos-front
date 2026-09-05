<template>
  <div class="container mt-5 px-2-mobile" style="padding-bottom: 80px;">
    
    <!-- ENCABEZADO DE LA VISTA -->
    <div class="mb-4">
      <button class="button is-small is-light mb-3" @click="$router.back()">
        <span class="icon is-small"><i class="fas fa-arrow-left"></i></span>
        <span>Volver al menú</span>
      </button>
      <h1 class="title is-size-4-mobile is-size-2-tablet mb-0">Informe y Estadísticas de Asistencia</h1>
    </div>

    <!-- SISTEMA DE NOTIFICACIONES BULMA -->
    <div v-if="notificacion.mensaje" class="notification is-light mb-4" :class="notificacion.tipo">
      <button class="delete" @click="notificacion.mensaje = ''"></button>
      {{ notificacion.mensaje }}
    </div>

    <!-- TARJETA FIJA DE FILTROS Y RANGO DE FECHAS (Estándar GEPRES Box) -->
    <div class="box p-3-mobile p-4-tablet mb-4" style="position: sticky; top: 10px; z-index: 10;">
      <div class="columns is-multiline is-mobile is-vcentered">
        
        <!-- Fecha Desde -->
        <div class="column is-6-mobile is-3-tablet">
          <label class="label is-small">Fecha Desde</label>
          <input class="input" type="date" v-model="filtros.fecha_desde">
        </div>

        <!-- Fecha Hasta -->
        <div class="column is-6-mobile is-3-tablet">
          <label class="label is-small">Fecha Hasta</label>
          <input class="input" type="date" v-model="filtros.fecha_hasta">
        </div>

        <!-- Escuela -->
        <div class="column is-12-mobile is-6-tablet">
          <label class="label is-small">Escuela</label>
          <div class="select is-fullwidth">
            <select v-model="filtros.escuela_id" @change="limpiarEspecialidad">
              <option value="">Seleccione Escuela</option>
              <option v-for="esc in escuelas" :key="esc.id" :value="esc.id">
                {{ esc.nombre_corto }}
              </option>
            </select>
          </div>
        </div>

        <!-- Especialidad -->
        <div class="column is-12-mobile is-4-tablet">
          <label class="label is-small">Especialidad</label>
          <div class="select is-fullwidth">
            <select v-model="filtros.especialidad_id" :disabled="!filtros.escuela_id" @change="limpiarYcargarMaterias">
              <option value="">Seleccione Especialidad</option>
              <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">
                {{ esp.nombre }}
              </option>
            </select>
          </div>
        </div>

        <!-- Curso y División -->
        <div class="column is-6-mobile is-2-tablet">
          <label class="label is-small">Curso</label>
          <div class="select is-fullwidth">
            <select v-model="filtros.curso" :disabled="!filtros.especialidad_id" @change="limpiarYcargarMaterias">
              <option value="">Curso</option>
              <option v-for="n in 6" :key="n" :value="n + 'to'">{{ n }}to</option>
            </select>
          </div>
        </div>

        <div class="column is-6-mobile is-2-tablet">
          <label class="label is-small">División</label>
          <div class="select is-fullwidth">
            <select v-model="filtros.division" :disabled="!filtros.curso" @change="verificarFiltrosYBuscar">
              <option value="">División</option>
              <option value="1ra">1ra</option>
              <option value="2da">2da</option>
              <option value="3ra">3ra</option>
              <option value="4ta">4ta</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
        </div>

        <!-- Materia -->
        <div class="column is-12-mobile is-4-tablet">
          <label class="label is-small">Materia</label>
          <div class="select is-fullwidth">
            <select v-model="filtros.materia_id" :disabled="!filtros.division" @change="verificarFiltrosYBuscar">
              <option value="">Seleccione Materia</option>
              <option v-for="mat in materias" :key="mat.id" :value="mat.id">
                {{ mat.nombre }}
              </option>
            </select>
          </div>
        </div>

      </div>
    </div>

    <!-- ÁREA DE CARGA Y AVISOS -->
    <div v-if="cargando" class="has-text-centered py-5">
      <div class="loader is-inline-block" style="width: 3rem; height: 3rem; border-width: 4px;"></div>
      <p class="mt-3 has-text-grey">Generando informe de asistencia...</p>
    </div>

    <div v-else-if="reporteAlumnos.length === 0 && filtros.materia_id" class="box has-text-centered py-6 has-background-white-ter">
      <span class="icon is-large has-text-grey-light mb-2"><i class="fas fa-folder-open fa-2x"></i></span>
      <p class="has-text-grey">No se registraron asistencias para los filtros y fechas seleccionados.</p>
    </div>

    <div v-else-if="!filtros.materia_id" class="has-text-centered py-5 has-text-grey-light">
      <span class="icon is-large"><i class="fas fa-chart-bar fa-2x"></i></span>
      <p>Complete todos los filtros para visualizar el informe consolidado.</p>
    </div>

    <!-- TABLA RESUMEN GENERAL -->
    <div v-if="reporteAlumnos.length > 0 && !cargando" class="box p-3 mb-5">
      <div class="is-flex is-justify-content-space-between is-align-items-center mb-3 px-2">
        <span class="has-text-weight-bold has-text-grey">Total Alumnos: {{ reporteAlumnos.length }}</span>
        <span class="is-size-7 has-text-grey">Haga clic en un alumno para ver su historial detallado</span>
      </div>

      <div class="table-container">
        <table class="table is-fullwidth is-hoverable is-striped is-vcentered">
          <thead>
            <tr>
              <th>Alumno</th>
              <th class="has-text-centered">Clases Dictadas</th>
              <th class="has-text-centered" title="Presentes">P</th>
              <th class="has-text-centered" title="Ausentes">A</th>
              <th class="has-text-centered" title="Porcentaje de Asistencia">%</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reporteAlumnos" :key="item.alumno_id" @click="verHistorialAlumno(item)" style="cursor: pointer;">
              <td>
                <strong class="is-size-6">{{ item.apellido }}</strong>, 
                <span class="is-size-6 has-text-grey-dark">{{ item.nombre }}</span>
                <br><small class="has-text-grey">DNI: {{ item.dni || 'S/D' }}</small>
              </td>
              <td class="has-text-centered has-text-weight-semibold">{{ item.total_clases }}</td>
              <td class="has-text-centered has-text-success has-text-weight-semibold">{{ item.presentes }}</td>
              <td class="has-text-centered has-text-danger has-text-weight-semibold">{{ item.ausentes }}</td>
              <td class="has-text-centered">
                <span class="tag is-medium has-text-weight-bold" :class="obtenerClasePorcentaje(item.porcentaje_asistencia)">
                  {{ item.porcentaje_asistencia }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL DE HISTORIAL DETALLADO POR ALUMNO -->
    <div class="modal" :class="{ 'is-active': modalHistorialActivo }">
      <div class="modal-background" @click="cerrarModalHistorial"></div>
      <div class="modal-card" style="width: 90%; max-width: 600px;">
        <header class="modal-card-head">
          <p class="modal-card-title is-size-5">
            Historial de Asistencia: <strong>{{ alumnoSeleccionado?.apellido }}, {{ alumnoSeleccionado?.nombre }}</strong>
          </p>
          <button class="delete" aria-label="close" @click="cerrarModalHistorial"></button>
        </header>
        <section class="modal-card-body">
          <div v-if="cargandoHistorial" class="has-text-centered py-4">
            <div class="loader is-inline-block"></div>
            <p class="is-size-7 mt-2">Cargando historial...</p>
          </div>
          <div v-else-if="historialDetalle.length === 0" class="has-text-centered py-4 has-text-grey">
            No hay registros para este alumno en el período seleccionado.
          </div>
          <div v-else class="table-container">
            <table class="table is-fullwidth is-striped is-size-7">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th class="has-text-centered">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="h in historialDetalle" :key="h.id">
                  <td>{{ h.fecha }}</td>
                  <td class="has-text-centered">
                    <span class="tag is-small has-text-weight-bold" :class="h.presente ? 'is-success' : 'is-danger'">
                      {{ h.presente ? 'Presente' : 'Ausente' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <footer class="modal-card-foot is-justify-content-end">
          <button class="button" @click="cerrarModalHistorial">Cerrar</button>
        </footer>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();

// Fechas por defecto (Mes actual o año en curso)
const fechaHoy = new Date().toISOString().split('T')[0];
const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

const filtros = reactive({
  fecha_desde: primerDiaMes,
  fecha_hasta: fechaHoy,
  escuela_id: '',
  especialidad_id: '',
  curso: '',
  division: '',
  materia_id: ''
});

// Listas maestras y de datos
const escuelas = ref([]);
const especialidades = ref([]);
const materias = ref([]);
const reporteAlumnos = ref([]);

// Estados del modal individual
const modalHistorialActivo = ref(false);
const alumnoSeleccionado = ref(null);
const historialDetalle = ref([]);
const cargandoHistorial = ref(false);

// Banderas y notificaciones
const cargando = ref(false);
const notificacion = reactive({
  mensaje: '',
  tipo: ''
});

/**
 * Propósito: Mostrar un mensaje temporal en la interfaz (notificación flotante).
 * A quién alimenta: Métodos de carga y validación de este componente (ReporteAsistenciaView.vue).
 * Qué datos retorna: Void. Modifica directamente el objeto reactivo 'notificacion'.
 */
const mostrarNotificacion = (mensaje, tipo = 'is-danger') => {
  notificacion.mensaje = mensaje;
  notificacion.tipo = tipo;
  setTimeout(() => {
    notificacion.mensaje = '';
  }, 4000);
};

/**
 * Propósito: Retornar la clase de color para el tag de porcentaje según el rendimiento del alumno.
 * A quién alimenta: Template de ReporteAsistenciaView.vue (coloreado de porcentajes).
 * Qué retorna: {String} Clase CSS de Bulma (is-success, is-warning o is-danger).
 */
const obtenerClasePorcentaje = (porcentaje) => {
  if (porcentaje >= 80) return 'is-success is-light';
  if (porcentaje >= 60) return 'is-warning is-light';
  return 'is-danger is-light';
};

/**
 * Propósito: Obtener los catálogos de escuelas y especialidades para popular los filtros maestros.
 * A quién alimenta: Hook onMounted al inicializar la vista de ReporteAsistenciaView.vue.
 * Qué datos retorna: Promise<void> tras poblar las referencias reactivas escuelas y especialidades.
 */
const cargarMaestras = async () => {
  try {
    const [resEsc, resEsp] = await Promise.all([
      api.get('/common/escuelas'),
      api.get('/common/especialidades')
    ]);
    escuelas.value = resEsc.data;
    especialidades.value = resEsp.data;
  } catch (error) {
    console.error("Error al cargar maestras:", error);
  }
};

/**
 * Propósito: Resetear selectores dependientes al cambiar la escuela seleccionada.
 * A quién alimenta: Evento @change del selector de Escuela en ReporteAsistenciaView.vue.
 * Qué retorna: Void. Modifica el objeto reactivo filtros.
 */
const limpiarEspecialidad = () => {
  filtros.especialidad_id = '';
  limpiarYcargarMaterias();
};

/**
 * Propósito: Resetear materias y el listado general al cambiar especialidad o curso.
 * A quién alimenta: Eventos @change de Especialidad y Curso en ReporteAsistenciaView.vue.
 * Qué retorna: Void. Modifica las referencias reactivas de materias y reporteAlumnos.
 */
const limpiarYcargarMaterias = () => {
  filtros.materia_id = '';
  reporteAlumnos.value = [];
  materias.value = [];
  
  if (filtros.especialidad_id) {
    cargarMaterias();
  }
};

/**
 * Propósito: Consultar el listado de materias correspondientes a la especialidad y curso seleccionados.
 * A quién alimenta: Función limpiarYcargarMaterias de este componente ReporteAsistenciaView.vue.
 * Qué retorna: Promise<void> tras poblar la variable reactiva materias.
 */
const cargarMaterias = async () => {
  try {
    const params = filtros.curso ? { curso: filtros.curso } : {};
    const res = await api.get(`/common/materias/especialidad/${filtros.especialidad_id}`, { params });
    if (res.data && res.data.success) {
      materias.value = res.data.data;
    }
  } catch (error) {
    console.error("Error al cargar materias:", error);
  }
};

/**
 * Propósito: Verificar que todos los filtros obligatorios estén completos y disparar la consulta al endpoint general de reportes.
 * A quién alimenta: Eventos @change de División y Materia en ReporteAsistenciaView.vue.
 * Qué datos retorna: Promise<void> tras poblar el array reporteAlumnos con los datos obtenidos de la API.
 */
const verificarFiltrosYBuscar = async () => {
  if (!filtros.escuela_id || !filtros.curso || !filtros.division || !filtros.materia_id || !filtros.fecha_desde || !filtros.fecha_hasta) {
    reporteAlumnos.value = [];
    return;
  }

  cargando.value = true;
  notificacion.mensaje = '';
  try {
    const res = await api.get('/asistencia/reporteasistencia/general', {
      params: {
        escuela_id: filtros.escuela_id,
        curso: filtros.curso,
        division: filtros.division,
        materia_id: filtros.materia_id,
        fecha_desde: filtros.fecha_desde,
        fecha_hasta: filtros.fecha_hasta
      }
    });

    if (res.data && res.data.success) {
      reporteAlumnos.value = res.data.data;
    }
  } catch (error) {
    console.error("Error al obtener reporte general:", error);
    mostrarNotificacion("Error al generar el informe de asistencia desde el servidor.", "is-danger");
  } finally {
    cargando.value = false;
  }
};

/**
 * Propósito: Consultar el historial cronológico detallado de un alumno al hacer clic sobre su fila en la tabla general.
 * A quién alimenta: Evento @click en las filas de la tabla de resumen en ReporteAsistenciaView.vue.
 * Qué retorna: Promise<void> tras abrir el modal y poblar el array historialDetalle con los registros del estudiante.
 */
const verHistorialAlumno = async (alumnoItem) => {
  alumnoSeleccionado.value = alumnoItem;
  modalHistorialActivo.value = true;
  cargandoHistorial.value = true;
  historialDetalle.value = [];

  try {
    const res = await api.get('/asistencia/reporteasistencia/alumno', {
      params: {
        alumno_id: alumnoItem.alumno_id,
        materia_id: filtros.materia_id,
        fecha_desde: filtros.fecha_desde,
        fecha_hasta: filtros.fecha_hasta
      }
    });

    if (res.data && res.data.success) {
      historialDetalle.value = res.data.data;
    }
  } catch (error) {
    console.error("Error al obtener historial del alumno:", error);
    mostrarNotificacion("No se pudo cargar el historial individual del alumno.", "is-danger");
  } finally {
    cargandoHistorial.value = false;
  }
};

/**
 * Propósito: Cerrar el modal flotante de detalle individual de asistencia y limpiar la selección.
 * A quién alimenta: Eventos de cierre (botón X, fondo oscuro o botón inferior) en el modal de historial de ReporteAsistenciaView.vue.
 * Qué retorna: Void. Modifica el estado reactivo modalHistorialActivo a false y reinicia alumnoSeleccionado e historialDetalle.
 */
const cerrarModalHistorial = () => {
  modalHistorialActivo.value = false;
  alumnoSeleccionado.value = null;
  historialDetalle.value = [];
};

/**
 * Propósito: Cargar los catálogos maestros iniciales al montarse el componente en el DOM.
 * A quién alimenta: Hook onMounted del ciclo de vida de Vue para ReporteAsistenciaView.vue.
 * Qué retorna: Void. Ejecuta la función cargarMaestras().
 */
onMounted(() => {
  cargarMaestras();
});
</script>

<style scoped>
.table tr:hover {
  background-color: #f9f9f9;
}
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3273dc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>