<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card modal-card-responsive">
      <header class="modal-card-head has-background-info py-3">
        <p class="modal-card-title has-text-white is-size-6">Nuevo Seguimiento</p>
        <button class="delete" @click="$emit('close')"></button>
      </header>
      <section class="modal-card-body p-4">
        
        <!-- Nombre del alumno colocado arriba del formulario -->
        <div class="notification is-info is-light py-2 px-3 mb-4">
          <p class="is-size-6 has-text-weight-bold has-text-info-dark">
            <i class="fas fa-user-graduate mr-1"></i> Para: {{ alumno.nombre }} {{ alumno.apellido }}
          </p>
        </div>

        <div class="columns is-multiline">
          <!-- Campo Fecha de Evaluación -->
          <div class="column is-12-mobile is-6-tablet">
            <div class="field mb-3">
              <label class="label is-small">Fecha de Evaluación</label>
              <div class="control">
                <input 
                  class="input is-info" 
                  type="date" 
                  v-model="form.fecha_evaluacion" 
                  required
                >
              </div>
            </div>
          </div>

          <!-- Selector de Año Lectivo (Por defecto GEPRES, editable) -->
          <div class="column is-12-mobile is-6-tablet">
            <div class="field mb-3">
              <label class="label is-small">Año Lectivo</label>
              <div class="control">
                <div class="select is-fullwidth is-info" :class="{ 'is-loading': cargandoAnios }">
                  <select v-model="form.anio_lectivo" :disabled="cargandoAnios">
                    <option v-for="anio in opcionesAnios" :key="anio" :value="anio">
                      {{ anio }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="field mb-3">
          <label class="label is-small">Materia / Asignatura</label>
          <div class="control is-expanded">
            <div class="select is-fullwidth" :class="{ 'is-loading': cargandoMaterias }">
              <select v-model="form.materia_id" :disabled="cargandoMaterias">
                <option :value="null" disabled>Seleccione la materia correspondiente...</option>
                <option v-for="materia in materias" :key="materia.id" :value="materia.id">
                  {{ materia.nombre }}
                </option>
              </select>
            </div>
          </div>
          <p v-if="materias.length === 0 && !cargandoMaterias" class="help is-danger">
            No se encontraron materias cargadas para la especialidad del alumno.
          </p>
        </div>

        <div class="field my-4 border-info-v2 p-3 box is-shadowless" style="background-color: #f8f9fa;">
          <label class="label has-text-grey is-small">Desempeño / Calificación Numérica</label>
          <div class="control has-icons-left">
            <input 
              class="input is-medium is-info has-text-weight-bold" 
              type="number" 
              step="0.01" 
              min="1" 
              max="10" 
              v-model.number="form.desempeno" 
              placeholder="Ej: 7.50 o 8"
            >
            <span class="icon is-left has-text-info">
              <i class="fas fa-star-half-alt"></i>
            </span>
          </div>
          <p class="help is-info mt-2"><i class="fas fa-info-circle"></i> Ingrese un valor numérico entre 1.00 y 10.00</p>
          <p v-if="form.desempeno !== null && (form.desempeno < 1 || form.desempeno > 10)" class="help is-danger has-text-weight-bold mt-1">
            <i class="fas fa-exclamation-triangle"></i> La nota debe estar comprendida estrictamente entre 1 y 10.
          </p>
        </div>

        <div class="field mb-0">
          <label class="label is-small">Observaciones Pedagógicas</label>
          <div class="control">
            <textarea class="textarea" rows="3" v-model="form.observacion" placeholder="Escribe aquí el avance o dificultades del alumno en esta materia..."></textarea>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end py-3">
        <button class="button is-small" @click="$emit('close')">Cancelar</button>
        <button 
          class="button is-small is-info" 
          :class="{'is-loading': enviando}" 
          @click="guardar" 
          :disabled="!form.materia_id || !form.fecha_evaluacion || !form.anio_lectivo || form.desempeno === null || form.desempeno < 1 || form.desempeno > 10 || enviando"
        >
          Guardar Seguimiento
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import seguimientoService from '../../services/seguimiento.service';
import axios from 'axios';

/**
 * @componente SeguimientoModal.vue
 * @propósito Formulario modal para registrar un nuevo informe actitudinal/pedagógico cuantitativo individual asignado a una materia específica, año lectivo y con fecha seleccionable[cite: 8].
 * @interactúa Alimenta a: ProyectoConfigView.vue (Monitor de desempeño por integrantes)[cite: 8]
 * @emite 'success' al impactar la API con éxito, 'close' para destruir la instancia visual[cite: 8].
 */
export default {
  props: {
    alumno: {
      type: Object,
      required: true
    },
    proyectoId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      enviando: false,
      cargandoMaterias: false,
      cargandoAnios: false,
      materias: [],
      opcionesAnios: [],
      form: { 
        fecha_evaluacion: new Date().toISOString().split('T')[0],
        anio_lectivo: '2026',
        materia_id: null, 
        desempeno: null, 
        observacion: '' 
      }
    }
  },
  mounted() {
    this.cargarAnioLectivoGlobal();
    this.cargarMateriasCurriculares();
    this.generarOpcionesAnios();
  },
  methods: {
    /**
     * @función cargarAnioLectivoGlobal
     * @propósito Consultar el endpoint GET /api/configuraciones/anio-lectivo para preseleccionar el año activo en GEPRES[cite: 8].
     * @quien_la_llama Hook mounted() al inicializar el componente[cite: 8].
     * @retorna Void. Asigna datos al campo `anio_lectivo`[cite: 8].
     */
    async cargarAnioLectivoGlobal() {
      this.cargandoAnios = true;
      try {
        const response = await axios.get('/api/configuraciones/anio-lectivo');
        if (response.data && response.data.success && response.data.data) {
          this.form.anio_lectivo = String(response.data.data.valor);
        }
      } catch (err) {
        console.error("Error al obtener el año lectivo global[cite: 8]:", err);
      } finally {
        this.cargandoAnios = false;
      }
    },

    /**
     * @función generarOpcionesAnios
     * @propósito Crear un rango razonable de años lectivos para el selector (ej: desde 3 años atrás hasta 2 años adelante)[cite: 8].
     * @quien_la_llama Hook mounted() al inicializar el componente[cite: 8].
     * @retorna Void. Pobla el array `opcionesAnios`[cite: 8].
     */
    generarOpcionesAnios() {
      const anioActual = new Date().getFullYear();
      const anios = [];
      for (let i = anioActual - 3; i <= anioActual + 2; i++) {
        anios.push(String(i));
      }
      this.opcionesAnios = anios;
    },

    /**
     * @función cargarMateriasCurriculares
     * @propósito Recuperar las materias asociadas a la especialidad técnica del alumno en pantalla[cite: 8].
     * @quien_la_llama Hook mounted() al inicializar el componente[cite: 8].
     * @retorna Void. Asigna datos al array reactivo `materias`[cite: 8].
     */
    async cargarMateriasCurriculares() {
      this.cargandoMaterias = true;
      try {
        const { especialidad_id, curso } = this.alumno;
        const response = await seguimientoService.obtenerMateriasPorAlumno(especialidad_id, curso);
        
        if (response.data && response.data.success) {
          this.materias = response.data.data;
        }
      } catch (err) {
        console.error("Error al poblar materias[cite: 8]:", err);
      } finally {
        this.cargandoMaterias = false;
      }
    },

    /**
     * @función guardar
     * @propósito Validar y despachar el payload del nuevo seguimiento numérico hacia el backend, incluyendo la fecha y el año lectivo seleccionado[cite: 8].
     * @quien_la_llama Evento click del botón "Guardar Seguimiento"[cite: 8].
     * @retorna Void. Emite eventos de éxito y cierre en caso de respuesta 201[cite: 8].
     */
    async guardar() {
      if (!this.form.materia_id || !this.form.fecha_evaluacion || !this.form.anio_lectivo || this.form.desempeno === null || this.form.desempeno < 1 || this.form.desempeno > 10) return;
      
      this.enviando = true;
      try {
        await seguimientoService.crear({
          proyecto_id: Number(this.proyectoId),
          alumno_id: Number(this.alumno.id),
          materia_id: Number(this.form.materia_id),
          desempeno: Number(this.form.desempeno),
          observacion: this.form.observacion,
          fecha_evaluacion: this.form.fecha_evaluacion,
          anio_lectivo: String(this.form.anio_lectivo)
        });
        this.$emit('success');
        this.$emit('close');
      } catch (err) { 
        console.error("Error al persistir el nuevo registro de seguimiento[cite: 8]:", err); 
      } finally { 
        this.enviando = false; 
      }
    }
  }
}
</script>

<style scoped>
.border-info-v2 { border-left: 4px solid #209cee; }

.modal-card-responsive {
  width: 92vw !important;
  max-width: 600px !important;
  margin: 0 auto !important;
}

@media screen and (max-width: 768px) {
  .modal-card-responsive {
    width: 95vw !important;
    max-height: 90vh !important;
  }
}
</style>