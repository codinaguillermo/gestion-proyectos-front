<template>
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-4 px-2-mobile px-4-tablet pb-6">
        
        <!-- ENCABEZADO -->
        <div class="glass-panel p-4 mb-4">
          <div class="columns is-mobile is-multiline is-align-items-center">
            <div class="column is-12-mobile is-8-tablet">
              <div class="is-flex is-align-items-center">
                <button class="button is-ghost has-text-white p-0 mr-3" @click="volver">
                  <span class="icon is-medium"><i class="fas fa-arrow-left fa-lg"></i></span>
                </button>
                <div>
                  <h1 class="title has-text-white is-size-4-mobile is-size-2-tablet mb-0">Control de Cronograma</h1>
                  <p class="subtitle is-size-7-mobile is-size-6-tablet has-text-grey-light uppercase-label mb-0">
                    Avances del Proyecto por Materia
                  </p>
                </div>
              </div>
            </div>
            <div class="column is-12-mobile is-4-tablet is-flex is-justify-content-flex-end-tablet">
              <button class="button is-light is-outlined is-fullwidth-mobile" @click="volver">Volver a Configuración</button>
            </div>
          </div>
        </div>

        <!-- FORMULARIO DE CARGA (SOLO DOCENTE) -->
        <div class="box glass-panel p-4 mb-4" v-if="esDocente">
          <h3 class="title is-6 has-text-info uppercase-label mb-3">
            <i class="fas fa-plus-circle mr-2"></i> Nuevo Control de Avance
          </h3>
          <form @submit.prevent="guardarNuevoControl">
            <div class="columns is-multiline is-variable is-2">
              
              <!-- FILTRO EN CASCADA: Especialidad -->
              <div class="column is-12-mobile is-4-tablet">
                <div class="field">
                  <label class="label has-text-grey-light is-small uppercase-label">Especialidad</label>
                  <div class="control">
                    <div class="select is-fullwidth is-dark is-small">
                      <select v-model.number="filtroForm.especialidad_id" @change="alCambiarEspecialidad" required>
                        <option :value="null" disabled>Seleccione Especialidad...</option>
                        <option v-for="esp in listaEspecialidades" :key="esp.id" :value="esp.id">{{ esp.nombre }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- FILTRO EN CASCADA: Año -->
              <div class="column is-6-mobile is-2-tablet">
                <div class="field">
                  <label class="label has-text-grey-light is-small uppercase-label">Año</label>
                  <div class="control">
                    <div class="select is-fullwidth is-dark is-small">
                      <select v-model.number="filtroForm.anio" @change="alCambiarAnio" :disabled="!filtroForm.especialidad_id" required>
                        <option :value="null" disabled>Año...</option>
                        <option v-for="a in listaAniosDisponibles" :key="a" :value="a">{{ a }}° Año</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- FILTRO EN CASCADA: Materia -->
              <div class="column is-6-mobile is-4-tablet">
                <div class="field">
                  <label class="label has-text-grey-light is-small uppercase-label">Materia</label>
                  <div class="control">
                    <div class="select is-fullwidth is-dark is-small">
                      <select v-model.number="nuevoForm.materia_id" :disabled="!filtroForm.anio || materiasFiltradas.length === 0" required>
                        <option :value="null" disabled>Seleccione Materia...</option>
                        <option v-for="mat in materiasFiltradas" :key="mat.id" :value="mat.id">{{ mat.nombre }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- FECHA -->
              <div class="column is-12-mobile is-2-tablet">
                <div class="field">
                  <label class="label has-text-grey-light is-small uppercase-label">Fecha</label>
                  <div class="control">
                    <input class="input is-dark is-small" type="date" v-model="nuevoForm.fecha" required>
                  </div>
                </div>
              </div>

              <!-- DESCRIPCIÓN DEL ÍTEM -->
              <div class="column is-12-mobile is-6-tablet">
                <div class="field">
                  <label class="label has-text-grey-light is-small uppercase-label">Ítem / Tarea del Cronograma</label>
                  <div class="control">
                    <textarea class="textarea is-dark is-small" rows="2" v-model="nuevoForm.descripcion" placeholder="Ej: Implementación de pantalla de Login..." required></textarea>
                  </div>
                </div>
              </div>

              <!-- DEVOLUCIÓN DOCENTE -->
              <div class="column is-12-mobile is-6-tablet">
                <div class="field">
                  <label class="label has-text-grey-light is-small uppercase-label">Devolución Docente / Observaciones</label>
                  <div class="control">
                    <textarea class="textarea is-dark is-small" rows="2" v-model="nuevoForm.devolucion_docente" placeholder="Observaciones o correcciones..."></textarea>
                  </div>
                </div>
              </div>

              <!-- ESTADO INICIAL Y BOTÓN -->
              <div class="column is-12 is-flex is-justify-content-space-between is-align-items-center">
                <label class="checkbox has-text-white is-size-7 uppercase-label">
                  <input type="checkbox" v-model="nuevoForm.realizado" class="mr-2"> ¿Hito Completado / Realizado?
                </label>
                <button class="button is-info is-small has-text-weight-bold uppercase-label" :class="{'is-loading': guardando}" type="submit">
                  <span class="icon is-small"><i class="fas fa-save"></i></span>
                  <span>Registrar Control</span>
                </button>
              </div>

            </div>
          </form>
        </div>

        <!-- PANEL DE FILTROS Y BÚSQUEDA -->
        <div class="box glass-panel p-3 mb-4">
          <div class="columns is-mobile is-multiline is-align-items-center">
            <div class="column is-12-mobile is-6-tablet">
              <div class="control has-icons-left">
                <input class="input is-dark is-small is-rounded" type="text" v-model="busquedaTexto" placeholder="Buscar por palabra en descripción o devolución...">
                <span class="icon is-left is-small has-text-info"><i class="fas fa-search"></i></span>
              </div>
            </div>
            <div class="column is-12-mobile is-6-tablet is-flex is-justify-content-flex-end-tablet">
              <div class="buttons has-addons mb-0 is-fullwidth-mobile">
                <button class="button is-small" :class="filtroEstado === 'todos' ? 'is-info' : 'is-dark'" @click="filtroEstado = 'todos'">Todos ({{ items.length }})</button>
                <button class="button is-small" :class="filtroEstado === 'pendientes' ? 'is-warning' : 'is-dark'" @click="filtroEstado = 'pendientes'">Pendientes ({{ totalPendientes }})</button>
                <button class="button is-small" :class="filtroEstado === 'realizados' ? 'is-success' : 'is-dark'" @click="filtroEstado = 'realizados'">Realizados ({{ totalRealizados }})</button>
              </div>
            </div>
          </div>
        </div>

        <!-- INDICADOR DE CARGA -->
        <div v-if="cargando" class="notification glass-notification is-info has-text-centered py-4">
          <span class="icon"><i class="fas fa-spinner fa-pulse"></i></span> Cargando controles de cronograma...
        </div>

        <!-- SIN REGISTROS -->
        <div v-else-if="itemsFiltrados.length === 0" class="notification is-dark has-text-centered py-5">
          <p class="is-size-6 has-text-grey-light">No hay registros de control de cronograma que coincidan con la búsqueda.</p>
        </div>

        <!-- LISTADO: TABLA EN ESCRITORIO / CARDS EN MÓVIL -->
        <div v-else>
          <!-- TABLA PARA TABLET / DESKTOP -->
          <div class="table-container is-hidden-mobile box glass-panel p-0 mb-0">
            <table class="table is-fullwidth glass-table delivery-table-v2 mb-0">
              <thead>
                <tr>
                  <th class="has-text-info is-size-7 uppercase-label th-fecha">FECHA</th>
                  <th class="has-text-info is-size-7 uppercase-label">MATERIA</th>
                  <th class="has-text-info is-size-7 uppercase-label">TAREA / CONTROL</th>
                  <th class="has-text-info is-size-7 uppercase-label">ESTADO</th>
                  <th class="has-text-info is-size-7 uppercase-label">DEVOLUCIÓN</th>
                  <th class="has-text-info is-size-7 uppercase-label th-docente">DOCENTE</th>
                  <th class="has-text-info is-size-7 uppercase-label has-text-centered" v-if="esDocente">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in itemsFiltrados" :key="item.id">
                  <td class="is-size-7 custom-date-font">{{ formatearFecha(item.fecha) }}</td>
                  <td>
                    <span class="tag is-dark is-small has-text-weight-semibold">
                      {{ item.materia?.nombre || '-' }}
                    </span>
                  </td>
                  <td class="is-size-7">{{ item.descripcion }}</td>
                  <td>
                    <span class="tag is-small has-text-weight-bold" :class="item.realizado ? 'is-success' : 'is-warning'">
                      {{ item.realizado ? 'REALIZADO' : 'PENDIENTE' }}
                    </span>
                  </td>
                  <td class="is-size-7 has-text-grey-lighter">{{ item.devolucion_docente || '-' }}</td>
                  <td class="is-size-7">{{ item.docente ? `${item.docente.apellido}, ${item.docente.nombre}` : '-' }}</td>
                  <td class="has-text-centered" v-if="esDocente">
                    <div class="buttons is-centered is-flex-wrap-nowrap mb-0">
                      <button class="button is-small is-ghost has-text-info p-1" @click="abrirModalEdicion(item)" title="Editar">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="button is-small is-ghost has-text-danger p-1" @click="abrirModalEliminar(item)" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CARDS PARA MÓVILES -->
          <div class="is-hidden-tablet">
            <div class="box is-dark-box p-3 mb-3" v-for="item in itemsFiltrados" :key="'m-' + item.id">
              <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
                <span class="tag is-dark is-small">{{ item.materia?.nombre || '-' }}</span>
                <span class="tag is-small has-text-weight-bold" :class="item.realizado ? 'is-success' : 'is-warning'">
                  {{ item.realizado ? 'REALIZADO' : 'PENDIENTE' }}
                </span>
              </div>
              <p class="has-text-white is-size-6 mb-2">{{ item.descripcion }}</p>
              
              <!-- BLOQUE DE DEVOLUCIÓN MEJORADO (UI/UX) -->
              <div v-if="item.devolucion_docente" class="p-3 mb-2 has-background-black-ter custom-feedback-box">
                <p class="is-size-6 has-text-white mb-0">
                  <strong class="has-text-info-light">Devolución:</strong> {{ item.devolucion_docente }}
                </p>
              </div>
              
              <div class="is-flex is-justify-content-space-between is-align-items-center mt-2 pt-2 border-top-dark">
                <span class="is-size-7 custom-date-font">{{ formatearFecha(item.fecha) }}</span>
                <div class="buttons is-flex-wrap-nowrap mb-0" v-if="esDocente">
                  <button class="button is-small is-ghost has-text-info p-1" @click="abrirModalEdicion(item)"><i class="fas fa-edit"></i></button>
                  <button class="button is-small is-ghost has-text-danger p-1" @click="abrirModalEliminar(item)"><i class="fas fa-trash-alt"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL DE EDICIÓN (DOCENTE) -->
    <div class="modal" :class="{'is-active': mostrarModalEdit}">
      <div class="modal-background" @click="mostrarModalEdit = false"></div>
      <div class="modal-card">
        <header class="modal-card-head has-background-info">
          <p class="modal-card-title has-text-white"><i class="fas fa-edit mr-2"></i> Editar Control de Cronograma</p>
        </header>
        <section class="modal-card-body" v-if="itemEdicion">
          <div class="field">
            <label class="label is-small">Fecha</label>
            <div class="control"><input class="input is-small" type="date" v-model="itemEdicion.fecha" required></div>
          </div>
          <div class="field">
            <label class="label is-small">Descripción / Hito</label>
            <div class="control"><textarea class="textarea is-small" rows="3" v-model="itemEdicion.descripcion" required></textarea></div>
          </div>
          <div class="field">
            <label class="label is-small">Devolución Docente</label>
            <div class="control"><textarea class="textarea is-small" rows="3" v-model="itemEdicion.devolucion_docente"></textarea></div>
          </div>
          <div class="field">
            <label class="checkbox is-size-7 has-text-weight-bold">
              <input type="checkbox" v-model="itemEdicion.realizado" class="mr-2"> Ítem Realizado / Cumplido
            </label>
          </div>
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end">
          <button class="button is-small" @click="mostrarModalEdit = false">Cancelar</button>
          <button class="button is-info is-small" :class="{'is-loading': procesandoOperacion}" @click="confirmarEdicion">Guardar Cambios</button>
        </footer>
      </div>
    </div>

    <!-- MODAL DE ELIMINACIÓN -->
    <div class="modal" :class="{'is-active': mostrarModalDel}">
      <div class="modal-background" @click="mostrarModalDel = false"></div>
      <div class="modal-card">
        <header class="modal-card-head has-background-danger">
          <p class="modal-card-title has-text-white"><i class="fas fa-trash-alt mr-2"></i> Confirmar Eliminación</p>
        </header>
        <section class="modal-card-body">
          <p>¿Estás seguro de que deseas eliminar este control de avance? Esta acción no se puede deshacer.</p>
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end">
          <button class="button is-small" @click="mostrarModalDel = false">Cancelar</button>
          <button class="button is-danger is-small" :class="{'is-loading': procesandoOperacion}" @click="confirmarEliminacion">Sí, Eliminar</button>
        </footer>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

export default {
  name: 'ControlCronogramaView',
  data() {
    return {
      cargando: true,
      guardando: false,
      procesandoOperacion: false,
      items: [],
      listaEspecialidades: [],
      todasLasMaterias: [],
      filtroForm: { especialidad_id: null, anio: null },
      nuevoForm: {
        materia_id: null,
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        devolucion_docente: '',
        realizado: false
      },
      busquedaTexto: '',
      filtroEstado: 'todos',
      mostrarModalEdit: false,
      mostrarModalDel: false,
      itemEdicion: null,
      itemAEliminar: null
    };
  },
  computed: {
    usuarioLogueado() {
      const authStore = useAuthStore();
      return authStore.usuario || { id: null };
    },
    esDocente() {
      const rol = Number(this.usuarioLogueado.rol_id || this.usuarioLogueado.rolId);
      return rol === 1 || rol === 2;
    },
    listaAniosDisponibles() {
      if (!this.filtroForm.especialidad_id) return [];
      const anios = this.todasLasMaterias
        .filter(m => Number(m.especialidad_id) === Number(this.filtroForm.especialidad_id))
        .map(m => m.anio);
      return [...new Set(anios)].sort((a, b) => a - b);
    },
    materiasFiltradas() {
      if (!this.filtroForm.especialidad_id || !this.filtroForm.anio) return [];
      return this.todasLasMaterias.filter(
        m => Number(m.especialidad_id) === Number(this.filtroForm.especialidad_id) && Number(m.anio) === Number(this.filtroForm.anio)
      );
    },
    totalPendientes() {
      return this.items.filter(i => !i.realizado).length;
    },
    totalRealizados() {
      return this.items.filter(i => i.realizado).length;
    },
    itemsFiltrados() {
      return this.items.filter(i => {
        const coincideEstado =
          this.filtroEstado === 'todos' ||
          (this.filtroEstado === 'pendientes' && !i.realizado) ||
          (this.filtroEstado === 'realizados' && i.realizado);

        const q = this.busquedaTexto.toLowerCase().trim();
        const coincideTexto =
          !q ||
          (i.descripcion && i.descripcion.toLowerCase().includes(q)) ||
          (i.devolucion_docente && i.devolucion_docente.toLowerCase().includes(q)) ||
          (i.materia && i.materia.nombre.toLowerCase().includes(q));

        return coincideEstado && coincideTexto;
      });
    }
  },
  methods: {
    alCambiarEspecialidad() {
      this.filtroForm.anio = null;
      this.nuevoForm.materia_id = null;
    },
    alCambiarAnio() {
      this.nuevoForm.materia_id = null;
    },
    formatearFecha(f) {
      if (!f) return '-';
      return new Date(f + 'T12:00:00').toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    },
    /**
     * Propósito: Cargar los datos iniciales de la vista apuntando a las nuevas rutas aisladas de cronograma.
     * A quién alimenta: A las listas desplegables y la tabla principal.
     * Qué datos retorna: Array de seguimientos, especialidades y materias.
     */
    async cargarDatosIniciales() {
      this.cargando = true;
      try {
        const idProyecto = this.$route.params.id;
        const config = { headers: { 'Authorization': `Bearer ${useAuthStore().token}` } };
        
        // Apuntamos a las URL seguras que no chocan con proyectoRoutes
        const [resSeg, resEsp, resMat] = await Promise.all([
          axios.get(`/api/cronograma/proyecto/${idProyecto}`, config),
          axios.get('/api/cronograma/especialidades', config),
          axios.get('/api/cronograma/materias', config)
        ]);

        this.items = resSeg.data.data || [];
        this.listaEspecialidades = resEsp.data.data || [];
        this.todasLasMaterias = resMat.data.data || [];
      } catch (error) {
        console.error('Error al inicializar control de cronograma:', error);
      } finally {
        this.cargando = false;
      }
    },
    async guardarNuevoControl() {
      if (!this.nuevoForm.materia_id || !this.nuevoForm.descripcion) return;
      this.guardando = true;
      try {
        const idProyecto = this.$route.params.id;
        const config = { headers: { 'Authorization': `Bearer ${useAuthStore().token}` } };
        
        const res = await axios.post(`/api/cronograma/proyecto/${idProyecto}`, this.nuevoForm, config);
        if (res.data.success) {
          this.items.unshift(res.data.data);
          this.nuevoForm.descripcion = '';
          this.nuevoForm.devolucion_docente = '';
          this.nuevoForm.realizado = false;
        }
      } catch (error) {
        console.error('Error al guardar control:', error);
      } finally {
        this.guardando = false;
      }
    },
    abrirModalEdicion(item) {
      this.itemEdicion = { ...item };
      this.mostrarModalEdit = true;
    },
    async confirmarEdicion() {
      if (!this.itemEdicion) return;
      this.procesandoOperacion = true;
      try {
        const config = { headers: { 'Authorization': `Bearer ${useAuthStore().token}` } };
        const res = await axios.put(`/api/cronograma/${this.itemEdicion.id}`, this.itemEdicion, config);
        
        if (res.data.success) {
          const idx = this.items.findIndex(i => i.id === this.itemEdicion.id);
          if (idx !== -1) this.items.splice(idx, 1, res.data.data);
          this.mostrarModalEdit = false;
          this.itemEdicion = null;
        }
      } catch (error) {
        console.error('Error al actualizar ítem:', error);
      } finally {
        this.procesandoOperacion = false;
      }
    },
    abrirModalEliminar(item) {
      this.itemAEliminar = item;
      this.mostrarModalDel = true;
    },
    async confirmarEliminacion() {
      if (!this.itemAEliminar) return;
      this.procesandoOperacion = true;
      try {
        const config = { headers: { 'Authorization': `Bearer ${useAuthStore().token}` } };
        const res = await axios.delete(`/api/cronograma/${this.itemAEliminar.id}`, config);
        
        if (res.data.success) {
          this.items = this.items.filter(i => i.id !== this.itemAEliminar.id);
          this.mostrarModalDel = false;
          this.itemAEliminar = null;
        }
      } catch (error) {
        console.error('Error al eliminar ítem:', error);
      } finally {
        this.procesandoOperacion = false;
      }
    },
    volver() {
      this.$router.push(`/proyectos/${this.$route.params.id}/configuracion`);
    }
  },
  mounted() {
    this.cargarDatosIniciales();
  }
};
</script>

<style scoped>
.dashboard-bg { 
  min-height: 100vh; 
  background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('../assets/fondo.jpg'); 
  background-size: cover; 
  background-position: center;
  background-attachment: fixed; 
}
.glass-panel { 
  background: rgba(255, 255, 255, 0.05) !important; 
  backdrop-filter: blur(10px); 
  border: 1px solid rgba(255,255,255,0.1); 
  border-radius: 12px; 
}
.uppercase-label { 
  text-transform: uppercase; 
  font-size: 0.75rem; 
  letter-spacing: 1px; 
  font-weight: bold; 
}
.is-dark-box { 
  background: rgba(0,0,0,0.4); 
  border: 1px solid rgba(255,255,255,0.1); 
  border-radius: 10px; 
}
.glass-table { background-color: transparent !important; }
.delivery-table-v2 td, .delivery-table-v2 th { 
  background-color: transparent !important; 
  border-bottom: 1px solid rgba(255,255,255,0.05) !important; 
  color: white; 
  vertical-align: middle; 
}
.custom-date-font { font-family: monospace; color: #a4b0be !important; }
.border-top-dark { border-top: 1px solid rgba(255, 255, 255, 0.1); }
.th-fecha { width: 100px; text-align: center; }
.th-docente { width: 140px; }
.custom-feedback-box {
  border-radius: 6px;
  border-left: 3px solid #3498db;
}
</style>