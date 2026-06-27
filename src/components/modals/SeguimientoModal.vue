<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card">
      <header class="modal-card-head has-background-info">
        <p class="modal-card-title has-text-white">Nuevo Seguimiento: {{ alumno.nombre }} {{ alumno.apellido }}</p>
        <button class="delete" @click="$emit('close')"></button>
      </header>
      <section class="modal-card-body">
        
        <div class="field">
          <label class="label">Fecha de Evaluación</label>
          <div class="control">
            <input 
              class="input is-info" 
              type="date" 
              v-model="form.fecha_evaluacion" 
              required
            >
          </div>
        </div>

        <div class="field">
          <label class="label">Materia / Asignatura</label>
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

        <div class="field my-5 border-info-v2 p-4 box is-shadowless" style="background-color: #f8f9fa;">
          <label class="label has-text-grey">Desempeño / Calificación Numérica</label>
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

        <div class="field">
          <label class="label">Observaciones Pedagógicas</label>
          <div class="control">
            <textarea class="textarea" v-model="form.observacion" placeholder="Escribe aquí el avance o dificultades del alumno en esta materia..."></textarea>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="$emit('close')">Cancelar</button>
        <button 
          class="button is-info" 
          :class="{'is-loading': enviando}" 
          @click="guardar" 
          :disabled="!form.materia_id || !form.fecha_evaluacion || form.desempeno === null || form.desempeno < 1 || form.desempeno > 10 || enviando"
        >
          Guardar Seguimiento
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import seguimientoService from '../../services/seguimiento.service';

/**
 * @componente SeguimientoModal.vue
 * @propósito Formulario modal para registrar un nuevo informe actitudinal/pedagógico cuantitativo individual asignado a una materia específica y con fecha seleccionable.
 * @interactúa Alimenta a: ProyectoConfigView.vue (Monitor de desempeño por integrantes)
 * @emite 'success' al impactar la API con éxito, 'close' para destruir la instancia visual.
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
      materias: [],
      form: { 
        fecha_evaluacion: new Date().toISOString().split('T')[0], // Se inicializa con la fecha actual (YYYY-MM-DD)
        materia_id: null, 
        desempeno: null, 
        observacion: '' 
      }
    }
  },
  mounted() {
    this.cargarMateriasCurriculares();
  },
  methods: {
    /**
     * @función cargarMateriasCurriculares
     * @propósito Recuperar las materias asociadas a la especialidad técnica del alumno en pantalla, parseando correctamente el empaquetado de Axios.
     * @quien_la_llama Hook mounted() al inicializar el componente.
     * @retorna Void. Asigna datos al array reactivo `materias`.
     */
    async cargarMateriasCurriculares() {
      this.cargandoMaterias = true;
      try {
        const { especialidad_id, curso } = this.alumno;
        // Pasamos ambos para que el backend filtre por especialidad Y año
        const response = await seguimientoService.obtenerMateriasPorAlumno(especialidad_id, curso);
        
        if (response.data && response.data.success) {
          this.materias = response.data.data;
        }
      } catch (err) {
        console.error("Error al poblar materias:", err);
      } finally {
        this.cargandoMaterias = false;
      }
    },

    /**
     * @función guardar
     * @propósito Validar y despachar el payload del nuevo seguimiento numérico hacia el backend, incluyendo la fecha manual de evaluación.
     * @quien_la_llama Evento click del botón "Guardar Seguimiento".
     * @retorna Void. Emite eventos de cierre y éxito en caso de respuesta 201.
     */
    async guardar() {
      if (!this.form.materia_id || !this.form.fecha_evaluacion || this.form.desempeno === null || this.form.desempeno < 1 || this.form.desempeno > 10) return;
      
      this.enviando = true;
      try {
        await seguimientoService.crear({
          proyecto_id: Number(this.proyectoId),
          alumno_id: Number(this.alumno.id),
          materia_id: Number(this.form.materia_id),
          desempeno: Number(this.form.desempeno),
          observacion: this.form.observacion,
          fecha_evaluacion: this.form.fecha_evaluacion // Se anexa la nueva fecha al payload
        });
        this.$emit('success');
        this.$emit('close');
      } catch (err) { 
        console.error("Error al persistir el nuevo registro de seguimiento:", err); 
      } finally { 
        this.enviando = false; 
      }
    }
  }
}
</script>

<style scoped>
.border-info-v2 { border-left: 4px solid #209cee; }
</style>