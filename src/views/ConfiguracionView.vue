<template>
  <div class="container pb-6">
    <div class="mb-4 mt-5">
      <button class="button is-small is-light mb-3" @click="$router.back()">
        <span class="icon is-small"><i class="fas fa-arrow-left"></i></span>
        <span>Volver</span>
      </button>
    </div>

    <div class="box">
      <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
        <h1 class="title is-4 has-text-info mb-0">
          <i class="fas fa-cogs mr-2"></i> Configuración General del Sistema
        </h1>
        <router-link to="/especialidades" class="button is-link is-light is-small">
          <span class="icon"><i class="fas fa-graduation-cap"></i></span>
          <span>Ver Especialidades</span>
        </router-link>
      </div>
      <p class="subtitle is-6 has-text-grey">
        Administre los parámetros institucionales, año lectivo activo y rangos de fechas para los cuatrimestres[cite: 9].
      </p>

      <hr>

      <!-- Mensaje de Carga -->
      <div v-if="cargando" class="has-text-centered py-6">
        <span class="icon is-large has-text-info">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
        </span>
        <p class="mt-2 has-text-grey">Cargando parámetros de configuración...</p>
      </div>

      <!-- Tabla de Configuraciones -->
      <div v-else>
        <div v-if="errorMsg" class="notification is-danger is-light">
          <button class="delete" @click="errorMsg = ''"></button>
          {{ errorMsg }}
        </div>

        <div v-if="successMsg" class="notification is-success is-light">
          <button class="delete" @click="successMsg = ''"></button>
          {{ successMsg }}
        </div>

        <!-- Aviso general para orientar al usuario en campos de fecha -->
        <div class="notification is-info is-light py-3 mb-4">
          <p class="is-size-7">
            <i class="fas fa-info-circle mr-1"></i> 
            <strong>Aviso importante para fechas:</strong> Cuando modifique parámetros que correspondan a fechas (como inicios o cierres de cuatrimestre), ingréselas estrictamente en el formato <strong>AAAA-MM-DD</strong> (ejemplo: <em>2026-03-01</em>) o utilice el selector desplegable del calendario. No utilice formato de barras invertidas (dd-mm-aaaa) para evitar errores en el sistema[cite: 9].
          </p>
        </div>

        <div class="table-container">
          <table class="table is-fullwidth is-striped is-hoverable is-vertical-centered">
            <thead>
              <tr class="has-background-info-light">
                <th>Parámetro (Nombre)</th>
                <th>Valor Actual</th>
                <th>Descripción Institucional</th>
                <th class="has-text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="config in configuraciones" :key="config.id">
                <td>
                  <span class="tag is-info is-light has-text-weight-bold">
                    {{ config.nombre }}
                  </span>
                </td>
                <td>
                  <input 
                    class="input is-small is-info" 
                    type="text" 
                    v-model="config.valor"
                    :disabled="guardandoId === config.id"
                  >
                  <!-- Leyenda específica debajo de la celda si el parámetro es de fecha -->
                  <p v-if="esCampoFecha(config.nombre)" class="help has-text-danger-dark is-size-7 mt-1 font-weight-bold">
                    Formato: AAAA-MM-DD
                  </p>
                </td>
                <td>
                  <span class="is-size-7 has-text-grey-dark">
                    {{ config.descripcion || 'Sin descripción detallada.' }}
                  </span>
                </td>
                <td class="has-text-right">
                  <button 
                    class="button is-small is-success" 
                    :class="{ 'is-loading': guardandoId === config.id }"
                    @click="guardarCambios(config)"
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
  </div>
</template>

<script>
import api from '../services/api';

/**
 * @componente ConfiguracionView.vue
 * @propósito Vista exclusiva para administradores para listar y modificar los parámetros de la tabla configuraciones.
 * @interactúa Alimenta a: Sistema general GEPRES (Año lectivo, cuatrimestres, etc.).
 */
export default {
  data() {
    return {
      cargando: true,
      guardandoId: null,
      errorMsg: '',
      successMsg: '',
      configuraciones: []
    }
  },
  mounted() {
    this.cargarConfiguraciones();
  },
  methods: {
    /**
     * Propósito: Identificar si el parámetro corresponde a una fecha analizando su nombre clave.
     * A quién alimenta: Template de la tabla para desplegar la leyenda de advertencia debajo del input.
     * Qué datos retorna: Boolean (true si contiene palabras clave de fecha).
     */
    esCampoFecha(nombre) {
      if (!nombre) return false;
      const lower = nombre.toLowerCase();
      return lower.includes('fecha') || lower.includes('inicio') || lower.includes('cierre') || lower.includes('limite');
    },

    /**
     * Propósito: Consultar el endpoint GET /configuraciones para obtener todas las filas de parámetros institucionales.
     * A quién alimenta (quién la llama): Hook mounted() al inicializar el componente de la vista.
     * Qué datos retorna: Void. Actualiza la variable reactiva configuraciones con el array obtenido o genera un mensaje de error.
     */
    async cargarConfiguraciones() {
      this.cargando = true;
      this.errorMsg = '';
      try {
        const response = await api.get('/configuraciones');
        if (response.data && response.data.success) {
          this.configuraciones = response.data.data;
        }
      } catch (err) {
        console.error("Error al cargar las configuraciones:", err);
        this.errorMsg = "No se pudieron recuperar las configuraciones del sistema.";
      } finally {
        this.cargando = false;
      }
    },

    /**
     * Propósito: Enviar el valor modificado de un parámetro específico al backend mediante PUT /configuraciones/:id.
     * A quién alimenta (quién la llama): Evento click del botón "Guardar" en cada fila de la tabla.
     * Qué datos retorna: Void. Actualiza el estado visual de éxito o muestra un aviso de error detallado.
     */
    async guardarCambios(config) {
      this.guardandoId = config.id;
      this.errorMsg = '';
      this.successMsg = '';

      try {
        const response = await api.put(`/configuraciones/${config.id}`, {
          valor: config.valor
        });

        if (response.data && response.data.success) {
          this.successMsg = `Parámetro "${config.nombre}" actualizado correctamente.`;
        }
      } catch (err) {
        console.error("Error al actualizar configuración:", err);
        this.errorMsg = err.response?.data?.mensaje || "Ocurrió un error al intentar guardar los cambios.";
      } finally {
        this.guardandoId = null;
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