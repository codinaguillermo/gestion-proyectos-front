<template>
  <div class="container mt-5 px-2-mobile">
    <div class="box p-3-mobile p-4-tablet">
      <h1 class="title is-size-5-mobile is-size-4-tablet has-text-link">
        <span class="icon mr-2"><i class="fas fa-book"></i></span>
        Gestión de Especialidades y Materias
      </h1>
      <hr class="my-3">

      <!-- SELECTOR DE ESPECIALIDADES (Apilado automáticamente en celular) -->
      <div class="field is-horizontal is-align-items-center mb-5">
        <div class="field-label is-normal mr-3 mb-2-mobile" style="flex-grow: 0;">
          <label class="label mb-0">Especialidad Técnica:</label>
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
        <!-- BARRA DE ACCIÓN ADAPTATIVA -->
        <div class="columns is-mobile is-multiline is-align-items-center mb-3">
          <div class="column is-12-mobile is-8-tablet pb-1-mobile">
            <h2 class="subtitle is-size-6-mobile is-size-5-tablet mb-0">Materias Curriculares Registradas</h2>
          </div>
          <div class="column is-12-mobile is-4-tablet pt-1-mobile is-flex is-justify-content-flex-end-tablet">
            <button class="button is-success is-fullwidth-mobile" @click="abrirModalAlta">
              <span class="icon is-small"><i class="fas fa-plus"></i></span>
              <span>Nueva Materia</span>
            </button>
          </div>
        </div>

        <div v-if="cargandoMaterias" class="has-text-centered py-5">
          <span class="icon is-large has-text-info"><i class="fas fa-spinner fa-pulse fa-2x"></i></span>
        </div>

        <div v-else-if="materias.length === 0" class="notification is-warning is-light has-text-centered is-size-7-mobile">
          <i class="fas fa-info-circle mr-2"></i> No hay materias cargadas para esta especialidad en la base de datos.
        </div>

        <!-- TABLA CURRICULAR OPTIMIZADA -->
        <div class="table-container mb-0" v-else>
          <table class="table is-fullwidth is-striped is-hoverable is-bordered mb-0">
            <thead class="has-background-dark">
              <tr>
                <th class="has-text-white has-text-centered is-size-7-mobile" style="width: 70px;">AÑO</th>
                <th class="has-text-white is-size-7-mobile">NOMBRE DE LA MATERIA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="materia in materiasOrdenadas" :key="materia.id">
                <td class="has-text-centered has-text-weight-bold is-size-7-mobile">{{ materia.anio }}º</td>
                <td class="is-uppercase is-size-7-mobile text-truncate-mobile">{{ materia.nombre }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL DE ALTA DE MATERIA (Blindado contra desbordamientos) -->
    <div class="modal" :class="{ 'is-active': modalActivo }">
      <div class="modal-background" @click="cerrarModalAlta"></div>
      <div class="modal-card">
        <header class="modal-card-head has-background-success">
          <p class="modal-card-title has-text-white text-truncate-mobile">Agregar Nueva Materia</p>
          <button class="delete" aria-label="close" @click="cerrarModalAlta"></button>
        </header>
        <section class="modal-card-body">
          <div class="notification is-info is-light is-size-7-mobile py-2 px-3">
            <i class="fas fa-info-circle mr-1"></i>
            La materia se asociará directamente a la especialidad seleccionada.
          </div>
          <div class="field">
            <label class="label is-size-7-mobile">Año del Curso</label>
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
            <label class="label is-size-7-mobile">Nombre de la Materia</label>
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
      return [...this.materias].sort((a, b) => {
        if (a.anio !== b.anio) {
          return (a.anio || 0) - (b.anio || 0);
        }
        return (a.nombre || '').localeCompare(b.nombre || '');
      });
    }
  },
  mounted() {
    this.cargarEspecialidades();
  },
  methods: {
    async cargarEspecialidades() {
      try {
        const response = await api.get('/common/especialidades');
        this.especialidades = response.data.data || response.data;
      } catch (error) {
        console.error('Error crítico al cargar catálogo de especialidades:', error);
      }
    },

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

    abrirModalAlta() {
      this.nuevaMateriaNombre = '';
      this.nuevoAnio = '';
      this.modalActivo = true;
    },

    cerrarModalAlta() {
      this.modalActivo = false;
      this.nuevoAnio = '';
      this.nuevaMateriaNombre = '';
    },

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
.table th, .table td {
  vertical-align: middle;
}

/* Control de desbordamiento de texto */
.text-truncate-mobile {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Blindaje anti-desbordamiento y ergonomía táctil para móviles */
@media (max-width: 768px) {
  .field.is-horizontal {
    display: block !important;
  }
  
  .field-label {
    text-align: left !important;
    margin-right: 0 !important;
  }

  .table td, .table th {
    padding: 0.75rem 0.4rem !important;
  }
  
  .text-truncate-mobile {
    max-width: 220px;
  }
  
  .modal-card {
    margin: 0 12px !important;
    width: calc(100vw - 24px) !important;
    max-width: 500px !important;
  }

  .modal-card-head,
  .modal-card-body,
  .modal-card-foot {
    padding: 12px 16px !important;
  }

  .modal-card-title {
    font-size: 1rem !important;
  }

  /* Apilamiento de botones y prioridad con el pulgar (botón verde de guardar arriba) */
  .modal-card-foot {
    flex-wrap: wrap !important;
    gap: 8px !important;
    justify-content: stretch !important;
  }
  
  .modal-card-foot .button {
    width: 100% !important;
    margin: 0 !important;
  }
  
  .modal-card-foot .button.is-success {
    order: 1;
  }
  
  .modal-card-foot .button:not(.is-success) {
    order: 2;
  }
}
</style>