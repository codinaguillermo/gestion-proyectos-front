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
                <span class="tag is-light is-large has-text-grey-light score-value" style="font-size: 1.5rem !important;">(Próximamente)</span>
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
                  <th class="th-cal has-text-centered" style="width: 200px;">CALIFICACIÓN NUMÉRICA</th>
                  <th class="th-obs">OBSERVACIÓN / ANOTACIONES PEDAGÓGICAS</th>
                  <th class="th-doc" style="width: 200px;">DOCENTE</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="seg in historialFiltrado" :key="seg.id" class="table-data-row">
                  <td class="is-size-6 has-text-weight-semibold data-fecha">{{ formatearFecha(seg.created_at) }}</td>
                  <td class="is-size-6 has-text-weight-bold data-materia has-text-link">{{ seg.materia?.nombre || 'LENGUAJE DE PROGRAMACION III' }}</td>
                  <td class="has-text-centered has-text-grey-light is-italic">
                    N/A
                  </td>
                  <td class="is-size-6 data-obs"><em>{{ seg.observacion || '(Sin anotaciones)' }}</em></td>
                  <td class="is-size-6 data-doc">{{ seg.docente?.apellido || 'N/C' }}</td>
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
  </div>
</template>

<script>
import html2pdf from 'html2pdf.js';
import seguimientoService from '../../services/seguimiento.service';

/**
 * @componente DetalleSeguimientoModal.vue
 * @propósito Mostrar el historial cualitativo indexado por materia de un alumno (Preparado para migración a calificaciones numéricas).
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
      fechaHoy: new Date().toLocaleDateString('es-AR')
    }
  },
  computed: {
    /**
     * @propiedad materiasDisponibles
     * @propósito Extraer el listado único de materias que poseen registros reales asignados en el historial cargado.
     * @retorna {Array} Arreglo purificado de objetos { id, nombre } sin duplicados.
     */
    materiasDisponibles() {
      const mapeo = {};
      this.historial.forEach(seg => {
        if (seg.materia && !mapeo[seg.materia.id]) {
          mapeo[seg.materia.id] = { id: seg.materia.id, nombre: seg.materia.nombre };
        }
      });
      return Object.values(mapeo).sort((a, b) => a.nombre.localeCompare(b.nombre));
    },

    /**
     * @propiedad historialFiltrado
     * @propósito Segmentar el historial de calificaciones en base a la materia seleccionada en el combo del frontend.
     * @retorna {Array} Subconjunto filtrado de registros.
     */
    historialFiltrado() {
      if (!this.materiaSeleccionadaId) return this.historial;
      return this.historial.filter(seg => seg.materia_id === Number(this.materiaSeleccionadaId));
    },

    /**
     * @propiedad nombreEspecialidad
     * @propósito Resolver de manera blindada el nombre de la especialidad técnica del alumno evaluado.
     */
    nombreEspecialidad() {
      if (this.historial.length > 0 && this.historial[0].alumno?.especialidad_detalle) {
        return this.historial[0].alumno.especialidad_detalle.nombre;
      }
      return this.alumno.especialidad || 'TEP'; 
    }
  },
  methods: {
    /**
     * @función cargarHistorial
     * @propósito Consumir el servicio de backend y mapear el contexto institucional blindado.
     */
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
     * @función exportarPDF
     * @propósito Renderizar el estado actual en pantalla (con o sin filtros aplicados) en formato físico PDF.
     */
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
    
    formatearFecha(f) { return new Date(f).toLocaleDateString('es-AR'); }
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

/* Estructura del Filtro Curricular */
.border-materia-filter { border-left: 6px solid #209cee; background-color: #f5f5f5; }

/* Tabla Fija con Scroll */
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

/* Personalización de la Scrollbar */
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