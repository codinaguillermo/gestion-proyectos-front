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
          <label class="label has-text-grey">Desempeño / Calificación</label>
          <div class="control">
            <p class="has-text-grey-light is-size-6 is-italic">
              [Espacio reservado para componente de calificación numérica del 1 al 10]
            </p>
          </div>
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
          :disabled="!form.materia_id || enviando"
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
 * @propósito Formulario modal para registrar un nuevo informe actitudinal/pedagógico individual asignado a una materia específica.
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
        materia_id: null, 
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
     * @invocaA seguimientoService.obtenerMateriasPorEspecialidad
     */
    async cargarMateriasCurriculares() {
      this.cargandoMaterias = true;
      try {
        const especialidadId = this.alumno.especialidad_id;
        if (especialidadId) {
          const response = await seguimientoService.obtenerMateriasPorEspecialidad(especialidadId);
          // CORRECCIÓN: Axios encapsula la respuesta en '.data'
          if (response.data && response.data.success) {
            this.materias = response.data.data;
          }
        }
      } catch (err) {
        console.error("Error al poblar el maestro de materias en el modal:", err);
      } finally {
        this.cargandoMaterias = false;
      }
    },

    /**
     * @función guardar
     * @propósito Validar y despachar el payload del nuevo seguimiento hacia el backend.
     * @invocaA seguimientoService.crear
     */
    async guardar() {
      if (!this.form.materia_id) return;
      
      this.enviando = true;
      try {
        await seguimientoService.crear({
          proyecto_id: Number(this.proyectoId),
          alumno_id: Number(this.alumno.id),
          materia_id: Number(this.form.materia_id),
          observacion: this.form.observacion
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