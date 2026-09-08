<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card">
      <header class="modal-card-head has-background-success">
        <p class="modal-card-title has-text-white">
          <i class="fas fa-file-excel mr-2"></i> Exportar Planilla de Notas
        </p>
        <button class="delete" @click="$emit('close')"></button>
      </header>
      
      <section class="modal-card-body">
        <p class="mb-4 has-text-grey">Seleccione los criterios para generar la planilla consolidada de promedios de GEPRES.</p>

        <div class="field">
          <label class="label">Institución (Escuela)</label>
          <div class="control is-expanded">
            <div class="select is-fullwidth" :class="{ 'is-loading': cargandoFiltros }">
              <select v-model="form.escuela_id" :disabled="cargandoFiltros">
                <option :value="null" disabled>Seleccione una escuela...</option>
                <option v-for="escuela in filtros.escuelas" :key="escuela.id" :value="escuela.id">
                  {{ escuela.nombre_corto }} - {{ escuela.nombre_largo }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Curso y División</label>
          <div class="control is-expanded">
            <div class="select is-fullwidth" :class="{ 'is-loading': cargandoFiltros }">
              <select v-model="cursoDivisionSeleccionado" :disabled="cargandoFiltros">
                <option :value="null" disabled>Seleccione año y división...</option>
                <option v-for="(combo, index) in filtros.cursosDivisiones" :key="index" :value="combo">
                  {{ combo.curso }} - {{ combo.division }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Materia / Asignatura</label>
          <div class="control is-expanded">
            <div class="select is-fullwidth" :class="{ 'is-loading': cargandoFiltros }">
              <select v-model="form.materia_id" :disabled="cargandoFiltros">
                <option :value="null" disabled>Seleccione la materia...</option>
                <option v-for="mat in filtros.materias" :key="mat.id" :value="mat.id">
                  {{ mat.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Nuevo: Año Lectivo -->
        <div class="field">
          <label class="label">Año Lectivo</label>
          <div class="control is-expanded">
            <div class="select is-fullwidth">
              <select v-model="form.anio_lectivo">
                <option v-for="anio in opcionesAniosFiltro" :key="anio" :value="anio">
                  {{ anio }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Nuevo: Período / Cuatrimestre -->
        <div class="field">
          <label class="label">Período</label>
          <div class="control is-expanded">
            <div class="select is-fullwidth">
              <select v-model="form.cuatrimestre">
                <option :value="null">Todo el año</option>
                <option value="1">1er Cuatrimestre</option>
                <option value="2">2do Cuatrimestre</option>
              </select>
            </div>
          </div>
        </div>
        
        <div v-if="errorMsg" class="notification is-danger is-light mt-4">
          <button class="delete" @click="errorMsg = ''"></button>
          {{ errorMsg }}
        </div>

      </section>

      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="$emit('close')" :disabled="procesando">Cancelar</button>
        <button 
          class="button is-success" 
          :class="{ 'is-loading': procesando }" 
          @click="descargarExcel" 
          :disabled="!formularioValido || procesando"
        >
          <span class="icon"><i class="fas fa-download"></i></span>
          <span>Generar Excel</span>
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import reporteService from '../../services/reporte.service'; 

export default {
  data() {
    const anioActualStr = String(new Date().getFullYear());
    return {
      cargandoFiltros: true,
      procesando: false,
      errorMsg: '',
      filtros: {
        escuelas: [],
        cursosDivisiones: [],
        materias: []
      },
      form: {
        escuela_id: null,
        materia_id: null,
        anio_lectivo: anioActualStr, // Por defecto año en curso
        cuatrimestre: null            // Por defecto todo el año
      },
      cursoDivisionSeleccionado: null
    }
  },
  computed: {
    opcionesAniosFiltro() {
      const anioActual = new Date().getFullYear();
      const anios = [];
      // Rango coherente para reportes históricos recientes
      for (let i = anioActual - 2; i <= anioActual + 1; i++) {
        anios.push(String(i));
      }
      return anios;
    },
    formularioValido() {
      return this.form.escuela_id !== null && 
             this.cursoDivisionSeleccionado !== null && 
             this.form.materia_id !== null &&
             this.form.anio_lectivo !== null;
    }
  },
  methods: {
    async cargarFiltrosDisponibles() {
      this.cargandoFiltros = true;
      try {
        const res = await reporteService.getFiltrosPlanilla();
        if (res.data && res.data.success) {
          this.filtros = res.data.data;
        }
      } catch (error) {
        console.error("Error al cargar filtros:", error);
        this.errorMsg = "Ocurrió un error al cargar las opciones disponibles.";
      } finally {
        this.cargandoFiltros = false;
      }
    },

    async descargarExcel() {
      this.procesando = true;
      this.errorMsg = '';
      
      try {
        const payload = {
          escuela_id: this.form.escuela_id,
          curso: this.cursoDivisionSeleccionado.curso,
          division: this.cursoDivisionSeleccionado.division,
          materia_id: this.form.materia_id,
          anio_lectivo: this.form.anio_lectivo,
          cuatrimestre: this.form.cuatrimestre
        };

        const res = await reporteService.generarPlanillaExcel(payload);
        
        if (res.data && res.data.success) {
          const datos = res.data.data;
          
          if (datos.length === 0) {
            this.errorMsg = "No se encontraron alumnos para los criterios y el período seleccionado.";
            this.procesando = false;
            return;
          }

          const hoja = XLSX.utils.json_to_sheet(datos);
          const libro = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(libro, hoja, "Promedios");

          // Nombre dinámico con curso, división, año y cuatrimestre
          const sufijoCuatrimestre = this.form.cuatrimestre ? `C${this.form.cuatrimestre}` : 'Todo_Anio';
          const nombreArchivo = `Notas_${this.cursoDivisionSeleccionado.curso}_${this.cursoDivisionSeleccionado.division}_${this.form.anio_lectivo}_${sufijoCuatrimestre}_GEPRES.xlsx`;
          
          XLSX.writeFile(libro, nombreArchivo);
          this.$emit('close');
        }
      } catch (error) {
        console.error("Error al generar Excel:", error);
        this.errorMsg = "Ocurrió un error al generar la planilla. Intente nuevamente.";
      } finally {
        this.procesando = false;
      }
    }
  },
  mounted() {
    this.cargarFiltrosDisponibles();
  }
}
</script>