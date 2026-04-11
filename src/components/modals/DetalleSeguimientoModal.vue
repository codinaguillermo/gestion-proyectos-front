<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card is-large glass-modal-v3">
      <header class="modal-card-head has-background-dark py-4">
        <p class="modal-card-title has-text-white is-size-5 header-title">
          <i class="fas fa-file-invoice mr-2"></i> INFORME PEDAGÓGICO DIGITAL
        </p>
        <div class="buttons">
          <button class="button is-danger is-inverted is-small btn-export" @click="exportarPDF" :disabled="historial.length === 0">
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
                <span class="tag is-info is-large has-text-weight-bold score-value">{{ promedioCalculado }} / 3</span>
              </div>
              <p class="is-size-7 mt-3 has-text-grey date-stamp">Fecha emisión: {{ fechaHoy }}</p>
            </div>
          </div>
        </div>

        <div v-if="historial.length > 0" class="box p-5 mb-5 has-background-white-ter chart-section-vertical">
          <h3 class="subtitle is-6 has-text-centered mb-4 uppercase-label chart-title">Distribución de Desempeño (%)</h3>
          <div class="canvas-wrapper-vertical">
            <canvas id="chartTorta"></canvas>
          </div>
        </div>

        <div v-if="historial.length > 0" class="table-section-vertical">
          <h3 class="subtitle is-6 uppercase-label mb-3"><i class="fas fa-list-ul mr-2"></i>Historial Detallado de Evaluaciones</h3>
          <div class="table-container history-scroll-container">
            <table class="table is-fullwidth is-striped is-hoverable is-bordered detailed-table">
              <thead>
                <tr class="table-header-row">
                  <th class="th-fecha">FECHA</th>
                  <th class="th-cal">CAL.</th>
                  <th class="th-obs">OBSERVACIÓN / ANOTACIONES PEDAGÓGICAS</th>
                  <th class="th-doc">DOCENTE</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="seg in historial" :key="seg.id" class="table-data-row">
                  <td class="is-size-6 has-text-weight-semibold data-fecha">{{ formatearFecha(seg.created_at) }}</td>
                  <td class="has-text-centered">
                    <span :class="['tag score-tag', colorTag(seg.desempeno)]">
                      {{ textoCalificacion(seg.desempeno) }}
                    </span>
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

        <div v-else-if="historial.length === 0" class="notification is-warning is-light has-text-centered empty-state">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          No se encontraron registros para este alumno.
        </div>

      </section>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import html2pdf from 'html2pdf.js';
import seguimientoService from '../../services/seguimiento.service';

export default {
  props: ['alumno', 'proyectoId'],
  data() {
    return {
      historial: [],
      cargando: true,
      contexto: { escuela: '', proyecto: '' },
      chart: null,
      fechaHoy: new Date().toLocaleDateString('es-AR')
    }
  },
  computed: {
    promedioCalculado() {
      if (!this.historial.length) return 0;
      const suma = this.historial.reduce((acc, curr) => acc + Number(curr.desempeno), 0);
      return (suma / this.historial.length).toFixed(2);
    },
    // NUEVA COMPUTED para la especialidad
    nombreEspecialidad() {
      // Primero checkeamos si viene en el historial (más preciso)
      if (this.historial.length > 0 && this.historial[0].alumno?.especialidad_detalle) {
        return this.historial[0].alumno.especialidad_detalle.nombre;
      }
      // Si no, usamos la prop alumno como fallback
      return this.alumno.especialidad || 'TEP'; 
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

            // BLINDAJE TOTAL DE LECTURA
            if (registro.proyecto) {
                this.contexto.proyecto = registro.proyecto.nombre || 'Proyecto sin nombre';
                // Probamos todas las variantes posibles de alias de escuela
                const esc = registro.proyecto.Escuela || registro.proyecto.escuela;
                this.contexto.escuela = esc?.nombre_largo || 'Institución No Definida';
            }

            this.$nextTick(() => this.renderGrafico());
        } else {
            // Si llega un array vacío, cortamos la carga para mostrar el mensaje de "No hay registros"
            this.historial = [];
        }
    } catch (err) {
        console.error("Error al cargar:", err);
    } finally {
        this.cargando = false;
    }
},
    renderGrafico() {
      const ctx = document.getElementById('chartTorta');
      if (!ctx) return;
      const counts = { bueno: 0, regular: 0, malo: 0 };
      this.historial.forEach(s => {
        if (Number(s.desempeno) === 3) counts.bueno++;
        else if (Number(s.desempeno) === 2) counts.regular++;
        else counts.malo++;
      });
      if (this.chart) this.chart.destroy();
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Bueno', 'Regular', 'Malo'],
          datasets: [{
            data: [counts.bueno, counts.regular, counts.malo],
            backgroundColor: ['#48c78e', '#ffe08a', '#f14668'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              position: 'right', // Cambiado a la derecha para este layout vertical
              labels: { 
                color: '#4a4a4a', 
                font: { size: 14, family: "'Montserrat', sans-serif", weight: 'bold' } 
              }
            } 
          }
        }
      });
    },
    exportarPDF() {
      const element = document.getElementById('informe-pedagogico');
      const opt = {
        margin: [0.3, 0.3],
        filename: `Informe_${this.alumno.apellido}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().from(element).set(opt).save();
    },
    formatearFecha(f) { return new Date(f).toLocaleDateString('es-AR'); },
    colorTag(d) { return d === 3 ? 'is-success' : d === 2 ? 'is-warning' : 'is-danger'; },
    textoCalificacion(d) { return d === 3 ? 'BUENO' : d === 2 ? 'REGULAR' : 'MALO'; }
  },
  mounted() { this.cargarHistorial(); }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');

#informe-pedagogico, .modal-card-title, .tag { font-family: 'Montserrat', sans-serif; }

/* Sección 1: Cabecera */
.institution-name { font-size: 1.6rem !important; font-weight: 700; color: #209cee !important; }
.proj-line, .alum-line { font-size: 1.15rem !important; }
.score-value { font-size: 2.2rem !important; }

/* Sección 2: Gráfico (Centrado y contenido) */
.canvas-wrapper-vertical { position: relative; height: 200px; max-width: 500px; margin: 0 auto; }

/* Sección 3: Tabla con Scroll */
.history-scroll-container {
  max-height: 350px; /* Ajusta este valor según necesites */
  overflow-y: auto;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 6px;
}

/* Estilos de tabla */
.table-header-row th {
  background-color: #363636 !important;
  color: #fff !important;
  font-size: 0.85rem !important;
  position: sticky; /* Los títulos se quedan fijos al hacer scroll */
  top: 0;
  z-index: 10;
}
.detailed-table td { font-size: 1rem !important; vertical-align: middle; }

/* Scrollbar personalizada */
.history-scroll-container::-webkit-scrollbar { width: 8px; }
.history-scroll-container::-webkit-scrollbar-track { background: #f1f1f1; }
.history-scroll-container::-webkit-scrollbar-thumb { background: #209cee; border-radius: 10px; }

.glass-modal-v3 { border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,0,0,0.1); }
.border-info-v2 { border-top: 8px solid #209cee; }
.uppercase-label { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; font-weight: bold; }
</style>