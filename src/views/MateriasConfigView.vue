<template>
  <div class="container mt-5">
    <div class="box">
      <h1 class="title is-4 has-text-link">
        <span class="icon mr-2"><i class="fas fa-book"></i></span>
        Gestión de Especialidades y Materias
      </h1>
      <hr>

      <div class="field is-horizontal is-align-items-center mb-5">
        <div class="field-label is-normal mr-3" style="flex-grow: 0;">
          <label class="label">Especialidad Técnica:</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control is-expanded">
              <div class="select is-info is-fullwidth">
                <select v-model="especialidadSeleccionada" @change="cargarMaterias">
                  <option :value="null" disabled>Seleccione una especialidad para ver sus materias...</option>
                  <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">
                    {{ esp.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="especialidadSeleccionada">
        <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
          <h2 class="subtitle is-5 mb-0">Materias Curriculares Registradas</h2>
          <button class="button is-success" @click="abrirModalAlta">
            <span class="icon is-small"><i class="fas fa-plus"></i></span>
            <span>Nueva Materia</span>
          </button>
        </div>

        <div v-if="cargandoMaterias" class="has-text-centered py-5">
          <span class="icon is-large has-text-info"><i class="fas fa-spinner fa-pulse fa-2x"></i></span>
        </div>

        <div v-else-if="materias.length === 0" class="notification is-warning is-light has-text-centered">
          <i class="fas fa-info-circle mr-2"></i> No hay materias cargadas para esta especialidad en la base de datos.
        </div>

        <table class="table is-fullwidth is-striped is-hoverable is-bordered">
          <thead class="has-background-dark">
            <tr>
              <th class="has-text-white has-text-centered" style="width: 100px;">AÑO</th>
              <th class="has-text-white">NOMBRE DE LA MATERIA</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="materia in materiasOrdenadas" :key="materia.id">
              <td class="has-text-centered has-text-weight-bold">{{ materia.anio }}º</td>
              <td class="is-uppercase">{{ materia.nombre }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal" :class="{ 'is-active': modalActivo }">
      <div class="modal-background" @click="cerrarModalAlta"></div>
      <div class="modal-card">
        <header class="modal-card-head has-background-success">
          <p class="modal-card-title has-text-white">Agregar Nueva Materia</p>
          <button class="delete" aria-label="close" @click="cerrarModalAlta"></button>
        </header>
        <section class="modal-card-body">
          <div class="notification is-info is-light">
            <i class="fas fa-info-circle mr-2"></i>
            La materia se asociará directamente a la especialidad seleccionada en la vista principal.
          </div>
          <div class="field">
            <label class="label">Año del Curso</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="nuevoAnio">
                  <option value="" disabled>Seleccione el año...</option>
                  <option v-for="n in 6" :key="n" :value="n">{{ n }}° AÑO</option>
                </select>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label">Nombre de la Materia</label>
            <div class="control has-icons-left">
              <input 
                class="input is-uppercase" 
                type="text" 
                v-model="nuevaMateriaNombre" 
                placeholder="Ej: LENGUAJE DE PROGRAMACIÓN III"
                @keyup.enter="guardarMateria"
              >
              <span class="icon is-small is-left">
                <i class="fas fa-book"></i>
              </span>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end">
          <button class="button" @click="cerrarModalAlta">Cancelar</button>
          <button 
            class="button is-success" 
            :class="{'is-loading': guardando}"
            :disabled="!nuevaMateriaNombre.trim() || guardando"
            @click="guardarMateria"
          >
            Guardar Materia
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

/**
 * @componente MateriasConfigView.vue
 * @propósito Vista administrativa para listar y dar de alta materias curriculares asociadas a especialidades técnicas.
 * @interactúa Alimenta el ruteo de /gestion-curricular. Consume endpoints de common.controller.js.
 */
export default {
  name: 'MateriasConfigView',
  data() {
    return {
      especialidades: [],
      especialidadSeleccionada: null,
      materias: [],
      cargandoMaterias: false,
      modalActivo: false,
      nuevaMateriaNombre: '',
      nuevoAnio: '',
      guardando: false
    };
  },
  computed: {
    materiasOrdenadas() {
      // Usamos slice() o spread para no mutar el array original
      return [...this.materias].sort((a, b) => {
        // 1. Ordenar por año
        if (a.anio !== b.anio) {
          return (a.anio || 0) - (b.anio || 0);
        }
        // 2. Si el año es igual, ordenar alfabéticamente por nombre
        return (a.nombre || '').localeCompare(b.nombre || '');
      });
    }
  },
  mounted() {
    this.cargarEspecialidades();
  },
  methods: {
    /**
     * @función cargarEspecialidades
     * @propósito Recuperar del backend el catálogo de especialidades técnicas disponibles.
     * @quien_la_llama Hook mounted() al inicializar el componente visual.
     * @retorna Void. Asigna el array recibido a la variable reactiva this.especialidades.
     */
    async cargarEspecialidades() {
      try {
        const response = await api.get('/common/especialidades');
        // Soporte dual por si el endpoint base devuelve array directo o envuelto en objeto data
        this.especialidades = response.data.data || response.data;
      } catch (error) {
        console.error('Error crítico al cargar catálogo de especialidades:', error);
      }
    },

    /**
     * @función cargarMaterias
     * @propósito Consultar el listado estricto de materias asociadas a la especialidad elegida en el combo.
     * @quien_la_llama Evento @change del combo select y función guardarMateria() tras confirmar una inserción.
     * @retorna Void. Pobla el array reactivo this.materias con la respuesta del backend.
     */
    async cargarMaterias() {
      if (!this.especialidadSeleccionada) return;
      
      this.cargandoMaterias = true;
      try {
        const response = await api.get(`/common/materias/especialidad/${this.especialidadSeleccionada}`);
        if (response.data && response.data.success) {
          this.materias = response.data.data;
        }
      } catch (error) {
        console.error('Error al recuperar las materias de la especialidad:', error);
      } finally {
        this.cargandoMaterias = false;
      }
    },

    /**
     * @función abrirModalAlta
     * @propósito Desplegar la ventana modal limpiando ingresos previos para registrar una nueva materia.
     * @quien_la_llama Evento @click del botón "Nueva Materia".
     * @retorna Void. Cambia el flag reactivo this.modalActivo a true.
     */
    abrirModalAlta() {
      this.nuevaMateriaNombre = '';
      this.nuevoAnio = '';
      this.modalActivo = true;
    },

    /**
     * @función cerrarModalAlta
     * @propósito Ocultar la ventana modal destruyendo el estado del formulario de carga temporal.
     * @quien_la_llama Botón Cancelar, cruz de cierre, fondo atenuado y función guardarMateria().
     * @retorna Void. Cambia el flag this.modalActivo a false y vacía la variable de texto.
     */
    cerrarModalAlta() {
      this.modalActivo = false;
      this.nuevoAnio = '';
      this.nuevaMateriaNombre = '';
    },

    /**
     * @función guardarMateria
     * @propósito Transmitir el payload con el nombre de la materia y el ID de especialidad para su inserción en DB.
     * @quien_la_llama Evento @click del botón "Guardar Materia" o validación @keyup.enter del input de texto.
     * @retorna Void. En caso de éxito HTTP 201, invoca cierre del modal y dispara recarga de la tabla.
     */
    async guardarMateria() {
      if (!this.nuevaMateriaNombre.trim() || !this.nuevoAnio || !this.especialidadSeleccionada) return;

      this.guardando = true;
      try {
        const response = await api.post('/common/materias', {
          nombre: this.nuevaMateriaNombre,
          anio: this.nuevoAnio,
          especialidad_id: this.especialidadSeleccionada
        });

        if (response.data && response.data.success) {
          this.cerrarModalAlta();
          this.cargarMaterias();
        }
      } catch (error) {
        console.error('Error en transacción de guardado curricular:', error);
      } finally {
        this.guardando = false;
      }
    }
  }
};
</script>

<style scoped>
.table th {
  vertical-align: middle;
}
.table td {
  vertical-align: middle;
}
</style>