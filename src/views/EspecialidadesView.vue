<template>
  <div class="container pb-6">
    <div class="mb-4 mt-5">
      <button class="button is-small is-light mb-3" @click="$router.back()">
        <span class="icon is-small"><i class="fas fa-arrow-left"></i></span>
        <span>Volver</span>
      </button>
    </div>

    <div class="box">
      <!-- Encabezado con Botón para Agregar -->
      <div class="columns is-vcentered mb-4">
        <div class="column">
          <h1 class="title is-4 has-text-info mb-1">
            <i class="fas fa-graduation-cap mr-2"></i> Gestión de Especialidades Técnicas
          </h1>
          <p class="subtitle is-6 has-text-grey">
            Administre el catálogo institucional de especialidades (crear nuevas o modificar las existentes).
          </p>
        </div>
        <div class="column is-narrow">
          <button class="button is-primary" @click="abrirModalCrear">
            <span class="icon"><i class="fas fa-plus"></i></span>
            <span>Nueva Especialidad</span>
          </button>
        </div>
      </div>

      <hr>

      <!-- Mensajes de Carga y Alertas -->
      <div v-if="cargando" class="has-text-centered py-6">
        <span class="icon is-large has-text-info">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
        </span>
        <p class="mt-2 has-text-grey">Cargando especialidades...</p>
      </div>

      <div v-else>
        <div v-if="errorMsg" class="notification is-danger is-light">
          <button class="delete" @click="errorMsg = ''"></button>
          {{ errorMsg }}
        </div>

        <div v-if="successMsg" class="notification is-success is-light">
          <button class="delete" @click="successMsg = ''"></button>
          {{ successMsg }}
        </div>

        <!-- Tabla de Especialidades -->
        <div class="table-container">
          <table class="table is-fullwidth is-striped is-hoverable is-vertical-centered">
            <thead>
              <tr class="has-background-info-light">
                <th style="width: 80px;">ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th class="has-text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="especialidades.length === 0">
                <td colspan="4" class="has-text-centered py-4 has-text-grey">
                  No hay especialidades registradas.
                </td>
              </tr>
              <tr v-for="esp in especialidades" :key="esp.id">
                <td>
                  <span class="tag is-dark is-light font-weight-bold">
                    #{{ esp.id }}
                  </span>
                </td>
                <td>
                  <input 
                    class="input is-small is-info" 
                    type="text" 
                    v-model="esp.nombre"
                    :disabled="guardandoId === esp.id"
                  >
                </td>
                <td>
                  <input 
                    class="input is-small" 
                    type="text" 
                    v-model="esp.descripcion" 
                    placeholder="Sin descripción"
                    :disabled="guardandoId === esp.id"
                  >
                </td>
                <td class="has-text-right">
                  <button 
                    class="button is-small is-success" 
                    :class="{ 'is-loading': guardandoId === esp.id }"
                    @click="guardarCambios(esp)"
                  >
                    <span class="icon"><i class="fas fa-save"></i></span>
                    <span>Guardar</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL PARA CREAR NUEVA ESPECIALIDAD -->
    <div class="modal" :class="{ 'is-active': modalActivo }">
      <div class="modal-background" @click="cerrarModal"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Nueva Especialidad</p>
          <button class="delete" @click="cerrarModal"></button>
        </header>
        <section class="modal-card-body">
          <div v-if="modalError" class="notification is-danger is-light py-2">
            {{ modalError }}
          </div>
          <div class="field">
            <label class="label">Nombre</label>
            <div class="control">
              <input 
                class="input" 
                type="text" 
                v-model="nuevaEspecialidad.nombre" 
                placeholder="Ej: Programación, Electromecánica..."
              >
            </div>
          </div>
          <div class="field">
            <label class="label">Descripción (Opcional)</label>
            <div class="control">
              <input 
                class="input" 
                type="text" 
                v-model="nuevaEspecialidad.descripcion" 
                placeholder="Detalle o bajada institucional"
              >
            </div>
          </div>
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end">
          <button class="button" @click="cerrarModal">Cancelar</button>
          <button 
            class="button is-success" 
            :class="{ 'is-loading': guardandoNuevo }"
            @click="crearEspecialidad"
          >
            Crear Especialidad
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @componente EspecialidadesView.vue
 * @propósito Vista de administración para listar, editar y crear nuevas especialidades técnicas desde la interfaz.
 */
import api from '../services/api';

export default {
  data() {
    return {
      cargando: true,
      guardandoId: null,
      guardandoNuevo: false,
      errorMsg: '',
      successMsg: '',
      modalError: '',
      especialidades: [],
      modalActivo: false,
      nuevaEspecialidad: {
        nombre: '',
        descripcion: ''
      }
    }
  },
  mounted() {
    this.cargarEspecialidades();
  },
  methods: {
    async cargarEspecialidades() {
      this.cargando = true;
      this.errorMsg = '';
      try {
        const response = await api.get('/common/especialidades');
        this.especialidades = Array.isArray(response.data) ? response.data : (response.data.data || []);
      } catch (err) {
        console.error("Error al cargar especialidades:", err);
        this.errorMsg = "No se pudieron recuperar las especialidades del sistema.";
      } finally {
        this.cargando = false;
      }
    },

    async guardarCambios(esp) {
      this.guardandoId = esp.id;
      this.errorMsg = '';
      this.successMsg = '';

      try {
        const response = await api.put(`/common/especialidades/${esp.id}`, {
          nombre: esp.nombre,
          descripcion: esp.descripcion
        });

        if (response.data && response.data.success) {
          this.successMsg = `Especialidad "${esp.nombre}" actualizada correctamente.`;
        }
      } catch (err) {
        console.error("Error al actualizar especialidad:", err);
        this.errorMsg = err.response?.data?.error || "Ocurrió un error al intentar actualizar.";
      } finally {
        this.guardandoId = null;
      }
    },

    abrirModalCrear() {
      this.nuevaEspecialidad.nombre = '';
      this.nuevaEspecialidad.descripcion = '';
      this.modalError = '';
      this.modalActivo = true;
    },

    cerrarModal() {
      this.modalActivo = false;
    },

    async crearEspecialidad() {
      if (!this.nuevaEspecialidad.nombre.trim()) {
        this.modalError = "El nombre de la especialidad es obligatorio.";
        return;
      }

      this.guardandoNuevo = true;
      this.modalError = '';

      try {
        const response = await api.post('/common/especialidades', {
          nombre: this.nuevaEspecialidad.nombre.trim(),
          descripcion: this.nuevaEspecialidad.descripcion.trim()
        });

        if (response.status === 201 || response.data?.success) {
          this.successMsg = "Especialidad creada con éxito.";
          this.modalActivo = false;
          await this.cargarEspecialidades();
        }
      } catch (err) {
        console.error("Error al crear especialidad:", err);
        this.modalError = err.response?.data?.error || "Ocurrió un error al crear la especialidad.";
      } finally {
        this.guardandoNuevo = false;
      }
    }
  }
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
}
</style>