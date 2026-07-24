<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card is-large glass-modal-v3">
      <header class="modal-card-head has-background-dark py-4">
        <p class="modal-card-title has-text-white is-size-5 header-title">
          <i class="fas fa-file-invoice mr-2"></i> Informe pedagógico
        </p>
        <button class="delete" @click="$emit('close')"></button>
      </header>
      
      <section class="modal-card-body has-background-light p-4 p-md-5">
        
        <div class="box mb-5 main-header-box border-info-v2 p-4 p-md-5">
          <div class="columns is-vcentered">
            <div class="column is-8">
              <h2 class="title is-4 has-text-link mb-2 institution-name">{{ contexto.escuela || 'Cargando institución...' }}</h2>
              <p class="is-size-5 proj-line"><strong>Proyecto:</strong> {{ contexto.proyecto || 'Cargando...' }}</p>
              <p class="is-size-5 alum-line"><strong>Alumno:</strong> {{ alumno.apellido?.toUpperCase() }}, {{ alumno.nombre }}</p>
              <p class="is-size-6 has-text-grey uppercase-label academic-details mt-2">
                CURSO: {{ alumno.curso }} {{ alumno.division }} - ESPECIALIDAD: {{ nombreEspecialidad }}
              </p>
            </div>
            <div class="column is-4 has-text-right-tablet has-text-left mt-3 mt-tablet-0">
              <div class="tags has-addons is-justify-content-flex-start is-justify-content-flex-end-tablet score-badge">
                <span class="tag is-dark is-large">PROMEDIO</span>
                <span class="tag is-large has-text-weight-bold score-value" :class="obtenerColorNota(promedioCalculado)">
                  {{ promedioCalculado }} / 10
                </span>
              </div>
              <p class="is-size-7 mt-3 has-text-grey date-stamp">Fecha emisión: {{ fechaHoy }}</p>
            </div>
          </div>
        </div>

        <!-- FILTROS DE ASIGNATURA Y AÑO LECTIVO + BOTÓN EXPORTAR A PDF -->
        <div v-if="historial.length > 0" class="box p-3 p-md-4 mb-5 border-materia-filter data-filter-box">
          <div class="columns is-multiline is-vcentered">
            
            <div class="column is-12-mobile is-5-tablet">
              <div class="field mb-0">
                <label class="label is-small mb-1"><i class="fas fa-filter mr-1 has-text-grey"></i> Asignatura:</label>
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

            <div class="column is-12-mobile is-4-tablet">
              <div class="field mb-0">
                <label class="label is-small mb-1"><i class="fas fa-calendar-alt mr-1 has-text-grey"></i> Año Lectivo:</label>
                <div class="control is-expanded">
                  <div class="select is-info is-fullwidth" :class="{ 'is-loading': cargandoAniosGlobales }">
                    <select v-model="anioSeleccionado">
                      <option :value="null">Todos los años...</option>
                      <option v-for="anio in opcionesAniosFiltro" :key="anio" :value="anio">
                        {{ anio }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="column is-12-mobile is-3-tablet has-text-right-tablet">
              <div class="field mb-0 mt-4 mt-tablet-0">
                <label class="label is-small mb-1 is-invisible-mobile">&nbsp;</label>
                <div class="control">
                  <button class="button is-danger is-fullwidth btn-export" @click="exportarPDF" :disabled="historialFiltrado.length === 0">
                    <span class="icon"><i class="fas fa-file-pdf"></i></span>
                    <span>Exportar a PDF</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div v-if="historialFiltrado.length > 0" class="table-section-vertical">
          <h3 class="subtitle is-6 uppercase-label mb-3"><i class="fas fa-list-ul mr-2"></i>Historial Detallado de Evaluaciones</h3>
          
          <!-- VISTA PANTALLA: TABLA EN PC / TABLET -->
          <div class="table-container history-scroll-container is-hidden-mobile">
            <table class="table is-fullwidth is-striped is-hoverable is-bordered detailed-table">
              <thead>
                <tr class="table-header-row">
                  <th class="th-fecha" style="width: 120px;">FECHA</th>
                  <th class="th-anio" style="width: 90px;">AÑO</th>
                  <th class="th-mat">MATERIA / ASIGNATURA</th>
                  <th class="th-cal has-text-centered" style="width: 160px;">CALIFICACIÓN</th>
                  <th class="th-obs">OBSERVACIÓN</th>
                  <th class="th-doc" style="width: 130px;">DOCENTE</th>
                  <th v-if="esDocente" class="has-text-centered" style="width: 90px;">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="seg in historialFiltrado" :key="seg.id" class="table-data-row">
                  <td class="is-size-6 has-text-weight-semibold data-fecha">{{ formatearFecha(seg.fecha_evaluacion || seg.created_at) }}</td>
                  <td class="is-size-6 has-text-weight-bold data-anio has-text-centered">{{ seg.anio_lectivo || '2026' }}</td>
                  <td class="is-size-6 has-text-weight-bold data-materia has-text-link">{{ seg.materia?.nombre || 'LENGUAJE DE PROGRAMACION III' }}</td>
                  <td class="has-text-centered">
                    <span class="tag is-medium has-text-weight-bold" :class="obtenerColorNota(seg.desempeno)">
                      {{ formatearNota(seg.desempeno) }}
                    </span>
                  </td>
                  <td class="is-size-6 data-obs"><em>{{ seg.observacion || '(Sin anotaciones)' }}</em></td>
                  <td class="is-size-6 data-doc">{{ seg.docente?.apellido || 'N/C' }}</td>
                  <td v-if="esDocente" class="has-text-centered">
                    <div class="buttons is-centered mb-0">
                      <button class="button is-small is-ghost has-text-info p-1" @click="prepararEdicion(seg)" title="Editar nota">
                        <i class="fas fa-edit fa-lg"></i>
                      </button>
                      <button class="button is-small is-ghost has-text-danger p-1" @click="prepararEliminacion(seg)" title="Eliminar nota">
                        <i class="fas fa-trash-alt fa-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- VISTA PANTALLA: TARJETAS EN CELULARES -->
          <div class="is-hidden-tablet mobile-cards-container">
            <div v-for="seg in historialFiltrado" :key="'mob-'+seg.id" class="box mb-3 p-3 mobile-evaluation-card">
              <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
                <span class="is-size-7 has-text-grey has-text-weight-semibold">
                  <i class="far fa-calendar-alt mr-1"></i> {{ formatearFecha(seg.fecha_evaluacion || seg.created_at) }}
                </span>
                <span class="tag is-medium has-text-weight-bold" :class="obtenerColorNota(seg.desempeno)">
                  {{ formatearNota(seg.desempeno) }} / 10
                </span>
              </div>
              
              <div class="mb-2">
                <p class="is-size-6 has-text-weight-bold has-text-link">
                  {{ seg.materia?.nombre || 'LENGUAJE DE PROGRAMACION III' }}
                </p>
              </div>

              <div v-if="esDocente" class="is-flex is-justify-content-flex-end pt-2 border-top-light">
                <button class="button is-small is-info is-light mr-2" @click="prepararEdicion(seg)">
                  <span class="icon is-small"><i class="fas fa-edit"></i></span>
                  <span>Editar</span>
                </button>
                <button class="button is-small is-danger is-light" @click="prepararEliminacion(seg)">
                  <span class="icon is-small"><i class="fas fa-trash-alt"></i></span>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
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

    <!-- SECCIÓN OCULTA EXCLUSIVA PARA EL PDF -->
    <div id="pdf-template" style="display: none; padding: 20px; font-family: 'Montserrat', sans-serif; background: #ffffff; color: #333;">
      <div style="border-bottom: 4px solid #209cee; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="font-size: 20px; color: #209cee; margin: 0 0 5px 0; font-weight: 700;">{{ contexto.escuela || 'Institución Educativa' }}</h2>
        <p style="margin: 3px 0; font-size: 14px;"><strong>Proyecto:</strong> {{ contexto.proyecto }}</p>
        <p style="margin: 3px 0; font-size: 14px;"><strong>Alumno:</strong> {{ alumno.apellido?.toUpperCase() }}, {{ alumno.nombre }}</p>
        <p style="margin: 3px 0; font-size: 12px; color: #666; text-transform: uppercase;">CURSO: {{ alumno.curso }} {{ alumno.division }} - ESPECIALIDAD: {{ nombreEspecialidad }}</p>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 20px;">
        <span style="font-size: 14px; font-weight: bold;">PROMEDIO GENERAL:</span>
        <span style="font-size: 18px; font-weight: bold; color: #209cee;">{{ promedioCalculado }} / 10</span>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;">
        <thead>
          <tr style="background-color: #363636; color: #ffffff;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left; width: 20%;">FECHA</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: center; width: 15%;">AÑO</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left; width: 45%;">MATERIA / ASIGNATURA</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: center; width: 20%;">CALIFICACIÓN</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="seg in historialFiltrado" :key="'pdf-'+seg.id">
            <td style="padding: 8px 10px; border: 1px solid #ddd;">{{ formatearFecha(seg.fecha_evaluacion || seg.created_at) }}</td>
            <td style="padding: 8px 10px; border: 1px solid #ddd; text-align: center;">{{ seg.anio_lectivo || '2026' }}</td>
            <td style="padding: 8px 10px; border: 1px solid #ddd; font-weight: bold;">{{ seg.materia?.nombre || 'LENGUAJE DE PROGRAMACION III' }}</td>
            <td style="padding: 8px 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">{{ formatearNota(seg.desempeno) }}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 30px; text-align: right; font-size: 11px; color: #777;">
        Fecha de emisión: {{ fechaHoy }} - GEPRES Digital
      </div>
    </div>

    <!-- MODAL DE EDICIÓN ADAPTADO A CELULARES -->
    <div class="modal" :class="{'is-active': mostrarModalEdicion}">
      <div class="modal-background" @click="mostrarModalEdicion = false"></div>
      <div class="modal-card modal-card-responsive">
        <header class="modal-card-head has-background-info py-3">
          <p class="modal-card-title has-text-white is-size-6"><i class="fas fa-edit mr-2"></i> Editar Calificación</p>
          <button class="delete" @click="mostrarModalEdicion = false"></button>
        </header>
        <section class="modal-card-body p-4">
          <div class="columns is-multiline">
            
            <div class="column is-12-mobile is-6-tablet">
              <div class="field mb-3">
                <label class="label is-small">Fecha Evaluada</label>
                <div class="control">
                  <input class="input is-info" type="date" v-model="formEdicion.fecha_evaluacion" required>
                </div>
              </div>
            </div>

            <div class="column is-12-mobile is-6-tablet">
              <div class="field mb-3">
                <label class="label is-small">Año Lectivo</label>
                <div class="control">
                  <div class="select is-fullwidth is-info">
                    <select v-model="formEdicion.anio_lectivo">
                      <option v-for="anio in opcionesAnios" :key="anio" :value="anio">
                        {{ anio }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="column is-12">
              <div class="field mb-3">
                <label class="label is-small">Calificación Numérica (1 a 10)</label>
                <div class="control">
                  <input class="input has-text-weight-bold has-text-info" type="number" step="0.01" min="1" max="10" v-model.number="formEdicion.desempeno" required>
                </div>
              </div>
            </div>

            <div class="column is-12">
              <div class="field mb-0">
                <label class="label is-small">Observación</label>
                <div class="control">
                  <textarea class="textarea" rows="3" v-model="formEdicion.observacion"></textarea>
                </div>
              </div>
            </div>

          </div>
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end py-3">
          <button class="button is-small" @click="mostrarModalEdicion = false">Cancelar</button>
          <button class="button is-small is-info" :class="{'is-loading': procesandoOperacion}" :disabled="!formEdicion.fecha_evaluacion || !formEdicion.anio_lectivo || !formEdicion.desempeno || formEdicion.desempeno < 1 || formEdicion.desempeno > 10" @click="guardarEdicion">Guardar Cambios</button>
        </footer>
      </div>
    </div>

    <!-- MODAL DE ELIMINACIÓN -->
    <div class="modal" :class="{'is-active': mostrarModalEliminar}">
      <div class="modal-background" @click="mostrarModalEliminar = false"></div>
      <div class="modal-card modal-card-responsive">
        <header class="modal-card-head has-background-danger py-3">
          <p class="modal-card-title has-text-white is-size-6"><i class="fas fa-exclamation-triangle mr-2"></i> Confirmar Eliminación</p>
          <button class="delete" @click="mostrarModalEliminar = false"></button>
        </header>
        <section class="modal-card-body p-4">
          ¿Estás seguro que deseás eliminar la calificación de <strong>{{ segSeleccionado?.desempeno }}</strong> en la materia <strong>{{ segSeleccionado?.materia?.nombre }}</strong>? Esta acción no se puede deshacer.
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end py-3">
          <button class="button is-small" @click="mostrarModalEliminar = false">Cancelar</button>
          <button class="button is-small is-danger" :class="{'is-loading': procesandoOperacion}" @click="confirmarEliminacion">Sí, Eliminar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import html2pdf from 'html2pdf.js';
import seguimientoService from '../../services/seguimiento.service';
import { useAuthStore } from '../../stores/auth';
import axios from 'axios';

/**
 * @componente DetalleSeguimientoModal.vue
 * @propósito Mostrar el historial cuantitativo indexado por materia de un alumno, calculando sus promedios en escala 1-10.
 * @alimenta Monitor de Desempeño en ProyectoConfigView.vue. Permite emitir e imprimir reportes PDF.
 */
export default {
  props: ['alumno', 'proyectoId'],
  data() {
    return {
      historial: [],
      cargando: true,
      cargandoAniosGlobales: false,
      contexto: { escuela: '', proyecto: '' },
      materiaSeleccionadaId: null,
      anioSeleccionado: null,
      fechaHoy: new Date().toLocaleDateString('es-AR'),
      mostrarModalEdicion: false,
      mostrarModalEliminar: false,
      procesandoOperacion: false,
      segSeleccionado: null,
      opcionesAnios: [],
      formEdicion: { id: null, fecha_evaluacion: '', anio_lectivo: '2026', desempeno: null, observacion: '' }
    }
  },
  computed: {
    esDocente() {
      const authStore = useAuthStore();
      const rolId = Number(authStore.usuario?.rol_id || authStore.usuario?.rolId);
      return rolId === 1 || rolId === 2;
    },
    materiasDisponibles() {
      const mapeo = {};
      this.historial.forEach(seg => {
        if (seg.materia && !mapeo[seg.materia.id]) {
          mapeo[seg.materia.id] = { id: seg.materia.id, nombre: seg.materia.nombre };
        }
      });
      return Object.values(mapeo).sort((a, b) => a.nombre.localeCompare(b.nombre));
    },
    opcionesAniosFiltro() {
      const aniosSet = new Set();
      this.historial.forEach(seg => {
        if (seg.anio_lectivo) aniosSet.add(String(seg.anio_lectivo));
      });
      aniosSet.add(String(new Date().getFullYear()));
      return Array.from(aniosSet).sort((a, b) => b.localeCompare(a));
    },
    historialFiltrado() {
      return this.historial.filter(seg => {
        const cumpleMateria = this.materiaSeleccionadaId === null || seg.materia_id === Number(this.materiaSeleccionadaId);
        const cumpleAnio = this.anioSeleccionado === null || String(seg.anio_lectivo) === String(this.anioSeleccionado);
        return cumpleMateria && cumpleAnio;
      });
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
            const res = await seguimientoService.getHistorial('todos', this.alumno.id);
            
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
    async cargarAnioLectivoGlobal() {
      this.cargandoAniosGlobales = true;
      try {
        const response = await axios.get('/api/configuraciones/anio-lectivo');
        if (response.data && response.data.success && response.data.data) {
          this.anioSeleccionado = String(response.data.data.valor);
        } else {
          this.anioSeleccionado = String(new Date().getFullYear());
        }
      } catch (err) {
        console.error("Error al obtener el año lectivo global para el filtro:", err);
        this.anioSeleccionado = String(new Date().getFullYear());
      } finally {
        this.cargandoAniosGlobales = false;
      }
    },
    generarOpcionesAnios() {
      const anioActual = new Date().getFullYear();
      const anios = [];
      for (let i = anioActual - 3; i <= anioActual + 2; i++) {
        anios.push(String(i));
      }
      this.opcionesAnios = anios;
    },
    prepararEdicion(seg) {
      this.segSeleccionado = seg;
      this.formEdicion = {
        id: seg.id,
        fecha_evaluacion: seg.fecha_evaluacion ? seg.fecha_evaluacion : (seg.created_at ? seg.created_at.split('T')[0] : ''),
        anio_lectivo: seg.anio_lectivo ? String(seg.anio_lectivo) : String(new Date().getFullYear()),
        desempeno: seg.desempeno,
        observacion: seg.observacion || ''
      };
      this.mostrarModalEdicion = true;
    },
    async guardarEdicion() {
      this.procesandoOperacion = true;
      try {
        await seguimientoService.actualizar(this.formEdicion.id, {
          fecha_evaluacion: this.formEdicion.fecha_evaluacion,
          anio_lectivo: Number(this.formEdicion.anio_lectivo),
          desempeno: this.formEdicion.desempeno,
          observacion: this.formEdicion.observacion
        });
        this.mostrarModalEdicion = false;
        await this.cargarHistorial();
      } catch (err) {
        console.error("Error al actualizar seguimiento:", err);
      } finally {
        this.procesandoOperacion = false;
      }
    },
    prepararEliminacion(seg) {
      this.segSeleccionado = seg;
      this.mostrarModalEliminar = true;
    },
    async confirmarEliminacion() {
      this.procesandoOperacion = true;
      try {
        await seguimientoService.eliminar(this.segSeleccionado.id);
        this.mostrarModalEliminar = false;
        await this.cargarHistorial();
      } catch (err) {
        console.error("Error al eliminar seguimiento:", err);
      } finally {
        this.procesandoOperacion = false;
      }
    },
    exportarPDF() {
      const element = document.getElementById('pdf-template');
      element.style.display = 'block';

      const opt = {
        margin: [0.4, 0.4],
        filename: `Informe_${this.alumno.apellido}_General.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().from(element).set(opt).save().then(() => {
        element.style.display = 'none';
      });
    },
    formatearFecha(f) { 
      if (!f) return '-';
      if (typeof f === 'string' && f.length === 10) {
        return new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
      return new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }); 
    },
    formatearNota(n) {
      return Number(n).toFixed(2);
    },
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
    this.generarOpcionesAnios();
    this.cargarAnioLectivoGlobal();
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
  width: 100%;
  max-height: 350px; 
  overflow-x: auto;
  overflow-y: auto;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 6px;
  -webkit-overflow-scrolling: touch;
}

.table-header-row th {
  background-color: #363636 !important;
  color: #fff !important;
  font-size: 0.85rem !important;
  position: sticky; 
  top: 0;
  z-index: 10;
  white-space: nowrap;
}
.detailed-table td { font-size: 0.95rem !important; vertical-align: middle; white-space: nowrap; }

.mobile-evaluation-card {
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-left: 4px solid #209cee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.border-top-light {
  border-top: 1px solid #f5f5f5;
}

.glass-modal-v3 { 
  border-radius: 12px; 
  overflow: hidden; 
  border: 1px solid rgba(0,0,0,0.1); 
  width: 95vw !important; 
  max-width: 1200px !important;
  margin: 0 auto;
}

.border-info-v2 { border-top: 8px solid #209cee; }
.uppercase-label { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; font-weight: bold; }

/* Estilo responsivo específico para que los sub-modales (Edición/Eliminación) se ajusten en celulares */
.modal-card-responsive {
  width: 92vw !important;
  max-width: 500px !important;
  margin: 0 auto !important;
}

@media screen and (max-width: 768px) {
  .glass-modal-v3 {
    width: 100vw !important;
    max-height: 100vh !important;
    border-radius: 0 !important;
  }
  .modal-card {
    margin: 0 !important;
    max-height: 100vh !important;
  }
  .modal-card-responsive {
    width: 95vw !important;
    max-height: 90vh !important;
  }
}
</style>