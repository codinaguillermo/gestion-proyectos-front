<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card" style="width: 80%; max-width: 950px;">
      
      <header class="modal-card-head has-background-primary">
        <p class="modal-card-title has-text-white">Gestionar Proyecto: {{ proyectoOriginal.nombre }}</p>
        <button class="delete" aria-label="close" @click="$emit('close')"></button>
      </header>

      <section class="modal-card-body">
        <div class="columns">
          
          <div class="column is-5">
            <h3 class="title is-5 border-bottom">Información General</h3>
            <div class="field">
              <label class="label">Nombre del Proyecto</label>
              <input class="input" type="text" v-model="form.nombre">
            </div>
            
            <div class="field">
              <label class="label">Estado Global</label>
              <div class="select is-fullwidth">
                <select v-model="form.estado_id">
                  <option v-for="est in estadosProyecto" :key="est.id" :value="est.id">
                    {{ est.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="column is-7">
            <h3 class="title is-5">Equipo y Carga (Scrum/Kanban)</h3>
            
            <div class="miembros-container" style="max-height: 400px; overflow-y: auto;">
              <div class="box p-3 mb-2" v-for="miembro in miembrosAsignados" :key="miembro.id">
                <div class="level is-mobile">
                  <div class="level-left">
                    <div>
                      <p class="is-size-6"><strong>{{ miembro.nombre }}</strong></p>
                      <p class="is-size-7 has-text-grey">{{ miembro.email }}</p>
                    </div>
                  </div>
                  
                  <div class="level-right">
                    <div class="has-text-right mr-4">
                      <p class="heading mb-0">Carga Actual</p>
                      <span :class="['tag is-medium', obtenerColorCarga(miembro.cargaTotal)]">
                        {{ miembro.cargaTotal }} pts
                      </span>
                    </div>
                    <button class="button is-small is-danger is-light" @click="quitarMiembro(miembro.id)">
                      <i class="fas fa-user-minus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="field mt-4">
              [cite_start]<label class="label">Asignar nuevo integrante [cite: 214]</label>
              <div class="control has-icons-left">
                <input class="input" type="text" placeholder="Buscar por nombre o email..." v-model="busqueda">
                <span class="icon is-small is-left"><i class="fas fa-search"></i></span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="$emit('close')">Cancelar</button>
        [cite_start]<button class="button is-success" @click="confirmarCambios">Guardar Cambios [cite: 221]</button>
      </footer>

    </div>
  </div>
</template>

<script>
import configService from '@/services/config.service';

export default {
  props: {
    proyectoOriginal: { type: Object, required: true },
    miembrosActuales: { type: Array, default: () => [] }
  },
  data() {
    return {
      form: { ...this.proyectoOriginal },
      estadosProyecto: [],
      [cite_start]prioridadesMaster: [], // Para saber cuánto vale cada tarea [cite: 202]
      miembrosAsignados: [],
      busqueda: ''
    }
  },
  async mounted() {
    await this.cargarConfiguraciones();
    this.prepararMiembros();
  },
  methods: {
    async cargarConfiguraciones() {
      try {
        const data = await configService.getTablasMaestras();
        [cite_start]this.estadosProyecto = data.estadosProyecto; [cite: 88]
        [cite_start]this.prioridadesMaster = data.prioridades; [cite: 202]
      } catch (e) {
        console.error("Error cargando maestros", e);
      }
    },
    prepararMiembros() {
      [cite_start]// Mapeamos los miembros y calculamos su carga inicial basada en los pesos [cite: 205, 206]
      this.miembrosAsignados = this.miembrosActuales.map(m => ({
        ...m,
        [cite_start]cargaTotal: this.calcularCargaAlumno(m.tareas) // [cite: 206]
      }));
    },
    calcularCargaAlumno(tareas) {
      if (!tareas) return 0;
      [cite_start]// Sumamos el peso de cada tarea buscando su valor en prioridadesMaster [cite: 206]
      return tareas.reduce((total, tarea) => {
        const prioridad = this.prioridadesMaster.find(p => p.id === tarea.prioridad_id);
        return total + (prioridad ? prioridad.peso : 0);
      }, 0);
    },
    obtenerColorCarga(puntos) {
      [cite_start]// Lógica de semáforo pedagógico [cite: 212, 219]
      if (puntos >= 60) return 'is-danger';    // Saturado (Rojo)
      if (puntos >= 30) return 'is-warning';   // Carga Media (Amarillo)
      return 'is-success';                     // Disponible (Verde)
    },
    quitarMiembro(id) {
      [cite_start]this.miembrosAsignados = this.miembrosAsignados.filter(m => m.id !== id); [cite: 213]
    },
    confirmarCambios() {
      this.$emit('save', { form: this.form, miembros: this.miembrosAsignados });
    }
  }
}
</script>

<style scoped>
.border-bottom { border-bottom: 1px solid #dbdbdb; margin-bottom: 1rem; padding-bottom: 0.5rem; }
.miembros-container::-webkit-scrollbar { width: 5px; }
.miembros-container::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
</style>