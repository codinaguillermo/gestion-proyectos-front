<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card">
      <header class="modal-card-head has-background-info">
        <p class="modal-card-title has-text-white">Nuevo Seguimiento: {{ alumno.nombre }}</p>
        <button class="delete" @click="$emit('close')"></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Desempeño / Calificación</label>
          <div class="control">
            <div class="buttons has-addons is-centered">
              <button class="button is-danger" :class="{'is-outlined': form.desempeno !== 1}" @click="form.desempeno = 1">MALO</button>
              <button class="button is-warning" :class="{'is-outlined': form.desempeno !== 2}" @click="form.desempeno = 2">REGULAR</button>
              <button class="button is-success" :class="{'is-outlined': form.desempeno !== 3}" @click="form.desempeno = 3">BUENO</button>
            </div>
          </div>
        </div>
        <div class="field">
          <label class="label">Observaciones Pedagógicas</label>
          <div class="control">
            <textarea class="textarea" v-model="form.observacion" placeholder="Escribe aquí el avance o dificultades..."></textarea>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="$emit('close')">Cancelar</button>
        <button class="button is-info" :class="{'is-loading': enviando}" @click="guardar" :disabled="!form.desempeno">Guardar Seguimiento</button>
      </footer>
    </div>
  </div>
</template>

<script>
import seguimientoService from '../../services/seguimiento.service';

/**
 * SeguimientoModal.vue
 * Propósito: Crear un registro nuevo.
 */
export default {
  props: ['alumno', 'proyectoId'],
  data() {
    return {
      enviando: false,
      form: { desempeno: null, observacion: '' }
    }
  },
  methods: {
    async guardar() {
      this.enviando = true;
      try {
        await seguimientoService.crear({
          proyecto_id: this.proyectoId,
          alumno_id: this.alumno.id,
          desempeno: this.form.desempeno,
          observacion: this.form.observacion
        });
        this.$emit('success');
        this.$emit('close');
      } catch (err) { console.error(err); } finally { this.enviando = false; }
    }
  }
}
</script>