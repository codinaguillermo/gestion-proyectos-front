<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card is-large glass-modal-v3">
      <header class="modal-card-head has-background-dark py-4">
        <p class="modal-card-title has-text-white is-size-5 header-title">
          <i class="fas fa-file-invoice mr-2"></i> INFORME PEDAGÓGICO DIGITAL
        </p>
        <div class="buttons">
          <button class="button is-danger is-inverted is-small btn-export" @click="exportarPDF" :disabled="historialFiltrado.length === 0">
            <span class="icon is-small"><i class="fas fa-file-pdf"></i></span>
            <span>PDF</span>
          </button>
          <button class="delete" @click="$emit('close')"></button>
        </div>
      </header>
      
      <section class="modal-card-body has-background-light p-5" id="informe-pedagogico">
        
        <div class="box mb-5 main-header-box border-info-v2 p-5">
          <div class="columns is-vcentered">
            <div class="column is-8">
              <h2 class="title is-4 has-text-link mb-2 institution-name">{{ contexto.escuela || 'Cargando institución...' }}</h2>
              <p class="is-size-5 proj-line"><strong>Proyecto:</strong> {{ contexto.proyecto || 'Cargando...' }}</p>
              <p class="is-size-5 alum-line"><strong>Alumno:</strong> {{ alumno.apellido?.toUpperCase() }}, {{ alumno.nombre }}</p>
              <p class="is-size-6 has-text-grey uppercase-label academic-details mt-2">
                CURSO: {{ alumno.curso }} {{ alumno.division }} - ESPECIALIDAD: {{ nombreEspecialidad }}
              </p>
            </div>
            <div class="column is-4 has-text-right">
              <div class="tags has-addons is-justify-content-flex-end score-badge">
                <span class="tag is-dark is-large">PROMEDIO</span>
                <span class="tag is-large has-text-weight-bold score-value" :class="obtenerColorNota(promedioCalculado)">
                  {{ promedioCalculado }} / 10
                </span>
              </div>
              <p class="is-size-7 mt-3 has-text-grey date-stamp">Fecha emisión: {{ fechaHoy }}</p>
            </div>
          </div>
        </div>

        <div v-if="historial.length > 0" class="box p-4 mb-5 border-materia-filter data-filter-box">
          <div class="field is-grouped is-align-items-center">
            <div class="control">
              <label class="label mb-0"><i class="fas fa-filter mr-1 has-text-grey"></i> Filtrar por Asignatura:</label>
            </div>
            <div class="control is-expanded">
              <div class="select is-info is-fullwidth">
                <select v-model="materiaSeleccionadaId">
                  <option :value="null">Ver todas las materias...</option>
                  <option v-for="mat in materiasDisponibles" :key="mat.id" :value="mat.id">
                    {{ mat.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div v-if="historialFiltrado.length > 0" class="table-section-vertical">
          <h3 class="subtitle is-6 uppercase-label mb-3"><i class="fas fa-list-ul mr-2"></i>Historial Detallado de Evaluaciones</h3>
          <div class="table-container history-scroll-container">
            <table class="table is-fullwidth is-striped is-hoverable is-bordered detailed-table">
              <thead>
                <tr class="table-header-row">
                  <th class="th-fecha" style="width: 120px;">FECHA</th>
                  <th class="th-mat">MATERIA / ASIGNATURA</th>
                  <th class="th-cal has-text-centered" style="width: 180px;">CALIFICACIÓN</th>
                  <th class="th-obs">OBSERVACIÓN PEDAGÓGICA</th>
                  <th class="th-doc" style="width: 150px;">DOCENTE</th>
                  <th class="has-text-centered" style="width: 100px;">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="seg in historialFiltrado" :key="seg.id" class="table-data-row">
                  <td class="is-size-6 has-text-weight-semibold data-fecha">{{ formatearFecha(seg.fecha_evaluacion || seg.created_at) }}</td>
                  <td class="is-size-6 has-text-weight-bold data-materia has-text-link">{{ seg.materia?.nombre || 'LENGUAJE DE PROGRAMACION III' }}</td>
                  <td class="has-text-centered">
                    <span class="tag is-medium has-text-weight-bold" :class="obtenerColorNota(seg.desempeno)">
                      {{ formatearNota(seg.desempeno) }}
                    </span>
                  </td>
                  <td class="is-size-6 data-obs"><em>{{ seg.observacion || '(Sin anotaciones)' }}</em></td>
                  <td class="is-size-6 data-doc">{{ seg.docente?.apellido || 'N/C' }}</td>
                  <td class="has-text-centered">
                    <div class="buttons is-centered mb-0">
                      <button class="button is-small is-ghost has-text-info p-1" @click="prepararEdicion(seg)" title="Editar nota">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="button is-small is-ghost has-text-danger p-1" @click="prepararEliminacion(seg)" title="Eliminar nota">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="cargando" class="has-text-centered p-6 loading-state">
          <span class="icon is-large has-text-grey-light"><i class="fas fa-spinner fa-pulse fa-3x"></i></span>
          <p class="mt-3 is-size-5 has-text-grey">Sincronizando registros...</p>
        </div>

        <div v-else-if="historialFiltrado.length === 0" class="notification is-warning is-light has-text-centered empty-state">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          No se encontraron registros de evaluaciones para el criterio seleccionado.
        </div>

      </section>
    </div>

    <div class="modal" :class="{'is-active': mostrarModalEdicion}">
      <div class="modal-background" @click="mostrarModalEdicion = false"></div>
      <div class="modal-card">
        <header class="modal-card-head has-background-info">
          <p class="modal-card-title has-text-white"><i class="fas fa-edit mr-2"></i> Editar Calificación</p>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Fecha Evaluada</label>
            <div class="control">
              <input class="input" type="date" v-model="formEdicion.fecha_evaluacion" required>
            </div>
          </div>
          <div class="field">
            <label class="label">Calificación Numérica (1 a 10)</label>
            <div class="control">
              <input class="input has-text-weight-bold has-text-info" type="number" step="0.01" min="1" max="10" v-model.number="formEdicion.desempeno" required>
            </div>
          </div>
          <div class="field">
            <label class="label">Observación</label>
            <div class="control">
              <textarea class="textarea" v-model="formEdicion.observacion"></textarea>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end">
          <button class="button" @click="mostrarModalEdicion = false">Cancelar</button>
          <button class="button is-info" :class="{'is-loading': procesandoOperacion}" :disabled="!formEdicion.fecha_evaluacion || !formEdicion.desempeno || formEdicion.desempeno < 1 || formEdicion.desempeno > 10" @click="guardarEdicion">Guardar Cambios</button>
        </footer>
      </div>
    </div>

    <div class="modal" :class="{'is-active': mostrarModalEliminar}">
      <div class="modal-background" @click="mostrarModalEliminar = false"></div>
      <div class="modal-card">
        <header class="modal-card-head has-background-danger">
          <p class="modal-card-title has-text-white"><i class="fas fa-exclamation-triangle mr-2"></i> Confirmar Eliminación</p>
        </header>
        <section class="modal-card-body">
          ¿Estás seguro que deseás eliminar la calificación de <strong>{{ segSeleccionado?.desempeno }}</strong> en la materia <strong>{{ segSeleccionado?.materia?.nombre }}</strong>? Esta acción no se puede deshacer.
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end">
          <button class="button" @click="mostrarModalEliminar = false">Cancelar</button>
          <button class="button is-danger" :class="{'is-loading': procesandoOperacion}" @click="confirmarEliminacion">Sí, Eliminar</button>
        </footer>
      </div>
    </div>

  </div>
</template>

<script>
import html2pdf from 'html2pdf.js';
import seguimientoService from '../../services/seguimiento.service';

/**
 * @componente DetalleSeguimientoModal.vue
 * @propósito Mostrar el historial cuantitativo indexado por materia de un alumno, calculando sus promedios en escala 1-10, y permitiendo edición y borrado (v2.9.1).
 * @alimenta Monitor de Desempeño en ProyectoConfigView.vue. Permite emitir e imprimir reportes PDF.
 */
export default {
  props: ['alumno', 'proyectoId'],
  data() {
    return {
      historial: [],
      cargando: true,
      contexto: { escuela: '', proyecto: '' },
      materiaSeleccionadaId: null,
      fechaHoy: new Date().toLocaleDateString('es-AR'),
      
      // Control de Modales de Edición/Eliminación
      mostrarModalEdicion: false,
      mostrarModalEliminar: false,
      procesandoOperacion: false,
      segSeleccionado: null,
      formEdicion: {
        id: null,
        fecha_evaluacion: '',
        desempeno: null,
        observacion: ''
      }
    }
  },
  computed: {
    materiasDisponibles() {
      const mapeo = {};
      this.historial.forEach(seg => {
        if (seg.materia && !mapeo[seg.materia.id]) {
          mapeo[seg.materia.id] = { id: seg.materia.id, nombre: seg.materia.nombre };
        }
      });
      return Object.values(mapeo).sort((a, b) => a.nombre.localeCompare(b.nombre));
    },
    historialFiltrado() {
      if (!this.materiaSeleccionadaId) return this.historial;
      return this.historial.filter(seg => seg.materia_id === Number(this.materiaSeleccionadaId));
    },
    nombreEspecialidad() {
      if (this.historial.length > 0 && this.historial[0].alumno?.especialidad_detalle) {
        return this.historial[0].alumno.especialidad_detalle.nombre;
      }
      return this.alumno.especialidad || 'TEP'; 
    },
    promedioCalculado() {
      if (!this.historialFiltrado.length) return "0.00";
      const suma = this.historialFiltrado.reduce((acc, curr) => acc + Number(curr.desempeno), 0);
      return (suma / this.historialFiltrado.length).toFixed(2);
    }
  },
  methods: {
    async cargarHistorial() {
      this.cargando = true;
      try {
        const res = await seguimientoService.getHistorial(this.proyectoId, this.alumno.id);
        if (res.data.success && res.data.data.length > 0) {
          this.historial = res.data.data;
          const registro = this.historial[0];
          if (registro.proyecto) {
            this.contexto.proyecto = registro.proyecto.nombre || 'Proyecto sin nombre';
            const esc = registro.proyecto.Escuela || registro.proyecto.escuela;
            this.contexto.escuela = esc?.nombre_largo || 'Institución No Definida';
          }
        } else {
          this.historial = [];
        }
      } catch (err) {
        console.error("Error crítico al recuperar historial del alumno:", err);
      } finally {
        this.cargando = false;
      }
    },

    /**
     * @función prepararEdicion
     * @propósito Poblar el formulario reactivo con los datos del registro a corregir y desplegar el modal.
     * @quien_la_llama Evento click del botón "Editar" en la tabla.
     * @retorna Void.
     */
    prepararEdicion(seg) {
      this.segSeleccionado = seg;
      this.formEdicion = {
        id: seg.id,
        // Extrae solo la parte "YYYY-MM-DD" si es un DATETIME completo o usa la fecha manual.
        fecha_evaluacion: seg.fecha_evaluacion ? seg.fecha_evaluacion : (seg.created_at ? seg.created_at.split('T')[0] : ''),
        desempeno: seg.desempeno,
        observacion: seg.observacion || ''
      };
      this.mostrarModalEdicion = true;
    },

    /**
     * @función guardarEdicion
     * @propósito Despachar la petición de actualización al backend y recargar el historial si tiene éxito.
     * @quien_la_llama Evento click del botón "Guardar Cambios" del modal de edición.
     * @retorna Void.
     */
    async guardarEdicion() {
      this.procesandoOperacion = true;
      try {
        await seguimientoService.actualizar(this.formEdicion.id, this.formEdicion);
        this.mostrarModalEdicion = false;
        await this.cargarHistorial(); // Refresca la tabla
      } catch (err) {
        console.error("Error al actualizar seguimiento:", err);
      } finally {
        this.procesandoOperacion = false;
      }
    },

    /**
     * @función prepararEliminacion
     * @propósito Identificar el registro a eliminar y solicitar confirmación humana mediante un modal.
     * @quien_la_llama Evento click del botón "Eliminar" en la tabla.
     * @retorna Void.
     */
    prepararEliminacion(seg) {
      this.segSeleccionado = seg;
      this.mostrarModalEliminar = true;
    },

    /**
     * @función confirmarEliminacion
     * @propósito Ejecutar el borrado definitivo en el servidor y limpiar el historial local.
     * @quien_la_llama Evento click del botón "Sí, Eliminar" del modal de confirmación.
     * @retorna Void.
     */
    async confirmarEliminacion() {
      this.procesandoOperacion = true;
      try {
        await seguimientoService.eliminar(this.segSeleccionado.id);
        this.mostrarModalEliminar = false;
        await this.cargarHistorial(); // Refresca la tabla
      } catch (err) {
        console.error("Error al eliminar seguimiento:", err);
      } finally {
        this.procesandoOperacion = false;
      }
    },

    exportarPDF() {
      const element = document.getElementById('informe-pedagogico');
      const opt = {
        margin: [0.3, 0.3],
        filename: `Informe_${this.alumno.apellido}_${this.materiaSeleccionadaId ? 'Filtrado' : 'General'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().from(element).set(opt).save();
    },
    formatearFecha(f) { 
      if (!f) return '-';
      if (typeof f === 'string' && f.length === 10) {
        return new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
      return new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }); 
    },
    formatearNota(n) { return Number(n).toFixed(2); },
    obtenerColorNota(n) { 
      const num = Number(n);
      if (num === 0) return 'is-info'; 
      if (num < 4) return 'is-danger'; 
      if (num < 6) return 'is-warning'; 
      return 'is-success'; 
    }
  },
  mounted() { 
    this.cargarHistorial(); 
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');

#informe-pedagogico, .modal-card-title, .tag { font-family: 'Montserrat', sans-serif; }

.institution-name { font-size: 1.6rem !important; font-weight: 700; color: #209cee !important; }
.proj-line, .alum-line { font-size: 1.15rem !important; }
.score-value { font-size: 2.2rem !important; }
.border-materia-filter { border-left: 6px solid #209cee; background-color: #f5f5f5; }

.history-scroll-container {
  max-height: 350px; 
  overflow-y: auto;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 6px;
}

.table-header-row th {
  background-color: #363636 !important;
  color: #fff !important;
  font-size: 0.85rem !important;
  position: sticky; 
  top: 0;
  z-index: 10;
}
.detailed-table td { font-size: 1rem !important; vertical-align: middle; }

.history-scroll-container::-webkit-scrollbar { width: 8px; }
.history-scroll-container::-webkit-scrollbar-track { background: #f1f1f1; }
.history-scroll-container::-webkit-scrollbar-thumb { background: #209cee; border-radius: 10px; }

.glass-modal-v3 { 
  border-radius: 12px; 
  overflow: hidden; 
  border: 1px solid rgba(0,0,0,0.1); 
  width: 90vw !important; 
  max-width: 1200px !important;
}

.border-info-v2 { border-top: 8px solid #209cee; }
.uppercase-label { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; font-weight: bold; }
</style>