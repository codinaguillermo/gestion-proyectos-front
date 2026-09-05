<template>
  <div class="container mt-5 px-2-mobile" style="padding-bottom: 80px;">
    
    <!-- ENCABEZADO DE LA VISTA -->
    <div class="mb-4">
      <button class="button is-small is-light mb-3" @click="$router.back()">
        <span class="icon is-small"><i class="fas fa-arrow-left"></i></span>
        <span>Volver al menú</span>
      </button>
      <h1 class="title is-size-4-mobile is-size-2-tablet mb-0">Toma de Asistencia</h1>
    </div>

    <!-- SISTEMA DE NOTIFICACIONES BULMA -->
    <div v-if="notificacion.mensaje" class="notification is-light mb-4" :class="notificacion.tipo">
      <button class="delete" @click="notificacion.mensaje = ''"></button>
      {{ notificacion.mensaje }}
    </div>

    <!-- TARJETA FIJA DE FILTROS (Estándar GEPRES Box) -->
    <div class="box p-3-mobile p-4-tablet mb-4" style="position: sticky; top: 10px; z-index: 10;">
      <div class="columns is-multiline is-mobile is-vcentered">
        
        <!-- Fecha (Máximo hoy) -->
        <div class="column is-12-mobile is-4-tablet">
          <label class="label is-small">Fecha</label>
          <input class="input" type="date" v-model="filtros.fecha" :max="hoy" @change="cargarListaAlumnos">
        </div>

        <!-- Escuela -->
        <div class="column is-12-mobile is-4-tablet">
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
        <div class="column is-6-mobile is-3-tablet">
          <label class="label is-small">Curso</label>
          <div class="select is-fullwidth">
            <select v-model="filtros.curso" :disabled="!filtros.especialidad_id" @change="limpiarYcargarMaterias">
              <option value="">Curso</option>
              <option v-for="n in 6" :key="n" :value="n + 'to'">{{ n }}to</option>
            </select>
          </div>
        </div>

        <div class="column is-6-mobile is-3-tablet">
          <label class="label is-small">División</label>
          <div class="select is-fullwidth">
            <select v-model="filtros.division" :disabled="!filtros.curso" @change="cargarListaAlumnos">
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
        <div class="column is-12-mobile is-6-tablet">
          <label class="label is-small">Materia</label>
          <div class="select is-fullwidth">
            <select v-model="filtros.materia_id" :disabled="!filtros.division" @change="cargarListaAlumnos">
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
      <p class="mt-3 has-text-grey">Cargando lista de alumnos...</p>
    </div>

    <div v-else-if="alumnos.length === 0 && filtros.materia_id" class="box has-text-centered py-6 has-background-white-ter">
      <span class="icon is-large has-text-grey-light mb-2"><i class="fas fa-users-slash fa-2x"></i></span>
      <p class="has-text-grey">No se encontraron alumnos para este curso y división.</p>
    </div>

    <div v-else-if="!filtros.materia_id" class="has-text-centered py-5 has-text-grey-light">
      <span class="icon is-large"><i class="fas fa-clipboard-list fa-2x"></i></span>
      <p>Complete los filtros arriba para cargar la lista de alumnos.</p>
    </div>

    <!-- LISTADO DE ALUMNOS (Tarjetas con separación y etiquetas legibles) -->
    <div v-if="alumnos.length > 0 && !cargando" class="mb-5">
      <div class="is-flex is-justify-content-space-between is-align-items-center mb-3 px-2">
        <span class="has-text-weight-bold has-text-grey">Alumnos: {{ alumnos.length }}</span>
        <span class="has-text-weight-bold" :class="cantidadPresentes === alumnos.length ? 'texto-gepres-azul' : 'has-text-warning'">
          Presentes: {{ cantidadPresentes }}
        </span>
      </div>

      <div v-for="(alumno, index) in alumnos" :key="alumno.alumno_id" class="box p-3 mb-3 is-flex is-align-items-center is-justify-content-space-between">
        
        <!-- Info del alumno (tipografía grande y legible) -->
        <div class="is-flex is-align-items-center pr-2" style="width: 55%; overflow: hidden;">
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <strong class="is-size-5">{{ alumno.apellido }}</strong>, 
            <span class="is-size-6 has-text-grey-dark">{{ alumno.nombre }}</span>
          </div>
        </div>

        <!-- Botonera Toggle con separación y textos visibles (Presente / Ausente) -->
        <div class="buttons has-addons mb-0" style="gap: 6px;">
          <button 
            class="button is-small px-3" 
            :class="alumno.presente ? 'color-gepres-azul is-selected' : 'is-light'" 
            @click="alumno.presente = true"
          >
            <span class="icon is-small"><i class="fas fa-check"></i></span>
            <span>Presente</span>
          </button>
          <button 
            class="button is-small px-3" 
            :class="!alumno.presente ? 'is-danger is-selected' : 'is-light'" 
            @click="alumno.presente = false"
          >
            <span class="icon is-small"><i class="fas fa-times"></i></span>
            <span>Ausente</span>
          </button>
        </div>
      </div>
    </div>

    <!-- BOTÓN INFERIOR FIJO PARA GUARDAR -->
    <div v-if="alumnos.length > 0" class="guardar-bar is-flex is-justify-content-center has-background-white box m-0 p-3 shadow-top">
      <button 
        class="button color-gepres-azul is-medium is-fullwidth-mobile has-text-weight-bold" 
        style="max-width: 400px; width: 100%;"
        :class="{ 'is-loading': guardando }"
        @click="confirmarAsistencia"
      >
        <span class="icon"><i class="fas fa-save"></i></span>
        <span>Guardar Asistencia ({{ alumnos.length }})</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import asistenciaService from '../services/asistencia.services';

const router = useRouter();

// Estado inicial
const hoy = new Date().toISOString().split('T')[0];
const filtros = reactive({
  fecha: hoy,
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
const alumnos = ref([]);

// Banderas y notificaciones
const cargando = ref(false);
const guardando = ref(false);
const notificacion = reactive({
  mensaje: '',
  tipo: ''
});

/**
 * Propósito: Mostrar un mensaje temporal en la interfaz (reemplazo estético de alert).
 * A quién alimenta: Métodos cargarListaAlumnos y confirmarAsistencia de este componente.
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
 * Propósito: Retornar reactivamente la cantidad total de alumnos marcados como "Presente" en la lista actual.
 * A quién alimenta: Template de AsistenciaView.vue (para los contadores visuales superiores).
 * Qué datos retorna: {Number} Entero con el recuento de alumnos presentes.
 */
const cantidadPresentes = computed(() => {
  return alumnos.value.filter(a => a.presente === true).length;
});

/**
 * Propósito: Obtener los catálogos de escuelas y especialidades para popular los primeros selectores del filtro.
 * A quién alimenta: Hook onMounted del ciclo de vida del componente.
 * Qué datos retorna: Promise<void> tras asignar los datos a las referencias reactivas escuelas y especialidades.
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
 * Propósito: Resetear los selectores dependientes (especialidad, curso, división, materia y lista) al cambiar la escuela.
 * A quién alimenta: Evento @change del selector de Escuela en el template.
 * Qué datos retorna: Void. Modifica el estado del objeto reactivo filtros.
 */
const limpiarEspecialidad = () => {
  filtros.especialidad_id = '';
  limpiarYcargarMaterias();
};

/**
 * Propósito: Resetear el selector de materia y el listado de alumnos, e invocar la búsqueda de materias filtradas.
 * A quién alimenta: Eventos @change de los selectores de Especialidad y Curso.
 * Qué datos retorna: Void.
 */
const limpiarYcargarMaterias = () => {
  filtros.materia_id = '';
  alumnos.value = [];
  materias.value = [];
  
  if (filtros.especialidad_id) {
    cargarMaterias();
  }
};

/**
 * Propósito: Consultar al backend el listado de materias correspondientes a la especialidad seleccionada, aplicando opcionalmente el filtro de curso.
 * A quién alimenta: Función limpiarYcargarMaterias de este componente.
 * Qué datos retorna: Promise<void> tras poblar la variable reactiva materias.
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
 * Propósito: Validar que los filtros requeridos estén completos y disparar la petición al servicio para traer los alumnos.
 * A quién alimenta: Eventos @change de los selectores de Fecha, División y Materia.
 * Qué datos retorna: Promise<void> tras poblar el array reactivo alumnos o disparar una notificación de error visual.
 */
const cargarListaAlumnos = async () => {
  if (!filtros.escuela_id || !filtros.curso || !filtros.division || !filtros.materia_id || !filtros.fecha) {
    alumnos.value = [];
    return;
  }

  cargando.value = true;
  notificacion.mensaje = ''; 
  try {
    const res = await asistenciaService.obtenerAlumnos({
      escuela_id: filtros.escuela_id,
      curso: filtros.curso,
      division: filtros.division,
      materia_id: filtros.materia_id,
      fecha: filtros.fecha
    });
    
    if (res.data && res.data.success) {
      alumnos.value = res.data.data;
    }
  } catch (error) {
    console.error("Error al cargar alumnos:", error);
    mostrarNotificacion("Hubo un error al intentar cargar la lista de alumnos desde el servidor.", "is-danger");
  } finally {
    cargando.value = false;
  }
};

/**
 * Propósito: Ensamblar el payload con el contexto y la lista de estados, enviarlos al backend para persistencia y emitir confirmación visual.
 * A quién alimenta: Evento @click del botón inferior fijo "Guardar Asistencia".
 * Qué datos retorna: Promise<void> tras confirmar el guardado exitoso (notificación verde) o avisar error (notificación roja).
 */
const confirmarAsistencia = async () => {
  guardando.value = true;
  notificacion.mensaje = '';
  
  const payload = {
    escuela_id: filtros.escuela_id,
    curso: filtros.curso,
    division: filtros.division,
    materia_id: filtros.materia_id,
    fecha: filtros.fecha,
    lista_asistencia: alumnos.value.map(a => ({
      alumno_id: a.alumno_id,
      presente: a.presente
    }))
  };

  try {
    const res = await asistenciaService.guardarAsistencia(payload);
    if (res.data && res.data.success) {
      mostrarNotificacion("¡Asistencia guardada exitosamente!", "is-success");
    }
  } catch (error) {
    console.error("Error guardando asistencia:", error);
    mostrarNotificacion("Hubo un error al guardar la asistencia en el servidor.", "is-danger");
  } finally {
    guardando.value = false;
  }
};

/**
 * Propósito: Disparar la carga inicial de catálogos maestros al montarse el componente en el DOM.
 * A quién alimenta: Hook onMounted del ciclo de vida de Vue para AsistenciaView.vue.
 * Qué datos retorna: Void.
 */
onMounted(() => {
  cargarMaestras();
});
</script>

<style scoped>
/* Colores exactos de la identidad visual azul/celeste de GEPRES */
.color-gepres-azul {
  background-color: #3273dc !important;
  color: #ffffff !important;
  border-color: transparent !important;
}

.texto-gepres-azul {
  color: #3273dc !important;
}

/* Fijar el botón de guardado abajo en dispositivos móviles */
.guardar-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  border-radius: 0 !important;
}

.shadow-top {
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
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