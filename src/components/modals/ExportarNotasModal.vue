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
    return {
      cargandoFiltros: true,
      procesando: false,
      errorMsg: '',
      filtros: {
        escuelas: [],
        cursosDivisiones: [],
        materias: [] // <-- Agregado al estado
      },
      form: {
        escuela_id: null,
        materia_id: null // <-- Agregado al formulario
      },
      cursoDivisionSeleccionado: null
    }
  },
  computed: {
    formularioValido() {
      // Exigimos que también se haya elegido la materia
      return this.form.escuela_id !== null && 
             this.cursoDivisionSeleccionado !== null && 
             this.form.materia_id !== null;
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
          materia_id: this.form.materia_id // <-- Lo sumamos al payload
        };

        const res = await reporteService.generarPlanillaExcel(payload);
        
        if (res.data && res.data.success) {
          const datos = res.data.data;
          
          if (datos.length === 0) {
            this.errorMsg = "No se encontraron alumnos para los criterios seleccionados.";
            this.procesando = false;
            return;
          }

          const hoja = XLSX.utils.json_to_sheet(datos);
          const libro = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(libro, hoja, "Promedios");

          // Nombre dinámico más completo
          const nombreArchivo = `Notas_${this.cursoDivisionSeleccionado.curso}_${this.cursoDivisionSeleccionado.division}_GEPRES.xlsx`;
          
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