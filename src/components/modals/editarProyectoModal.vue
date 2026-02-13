<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card modal-grande">
      
      <header class="modal-card-head has-background-primary">
        <p class="modal-card-title has-text-white is-size-5-mobile">Gestionar Proyecto: {{ proyectoOriginal.nombre }}</p>
        <button class="delete" aria-label="close" @click="$emit('close')"></button>
      </header>

      <section class="modal-card-body p-5">
        <div class="columns is-multiline">
          
          <div class="column is-12-mobile is-4-tablet border-right-tablet">
            <h3 class="title is-6 border-bottom has-text-grey uppercase-label">Información General</h3>
            
            <div class="field mb-4">
              <label class="label is-small">Escuela</label>
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag is-dark is-medium"><i class="fas fa-school"></i></span>
                  <span class="tag is-info is-light is-medium has-text-weight-bold">
                    {{ proyectoOriginal.escuela?.nombre_corto || 'Global' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="field mb-4">
              <label class="label is-small">Nombre del Proyecto</label>
              <input class="input" type="text" v-model="form.nombre" :disabled="!esAdminOOwner">
            </div>
            
            <div class="field mb-4">
              <label class="label is-small">Estado Global</label>
              <div class="select is-fullwidth">
                <select v-model="form.estado_id" :disabled="!esAdminOOwner">
                  <option v-for="est in estadosProyecto" :key="est.id" :value="est.id">
                    {{ est.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="column is-12-mobile is-8-tablet">
            <div class="is-flex is-justify-content-between is-align-items-center border-bottom mb-2">
              <h3 class="title is-6 has-text-grey uppercase-label mb-0">
                Integrantes ({{ miembrosAsignados.length }})
              </h3>
              <span class="icon has-text-info is-clickable help-tooltip-down" :data-tooltip="leyendaPrioridades">
                <i class="fas fa-info-circle"></i>
              </span>
            </div>
            
            <div class="miembros-scroll-area mb-4">
              <div class="columns is-multiline is-mobile px-2">
                <div class="column is-12 p-1" v-for="miembro in miembrosAsignados" :key="miembro.id">
                  <div class="box p-3 mb-0 is-shadowless border-slack">
                    <article class="media is-align-items-center">
                      <figure class="media-left mr-3">
                        <div :class="['avatar-circle-lg', obtenerColorAvatar(miembro.rol_id)]">
                          {{ obtenerIniciales(miembro.nombre) }}
                        </div>
                      </figure>
                      
                      <div class="media-content">
                        <p class="is-size-6 mb-0 has-text-weight-bold">
                          {{ miembro.apellido ? miembro.apellido.toUpperCase() + ', ' : '' }}{{ miembro.nombre }}
                        </p>
                        <p class="is-size-7 has-text-grey">
                          <span :class="['tag is-small is-light', Number(miembro.rol_id) === 3 ? 'is-info' : 'is-warning']">
                            {{ Number(miembro.rol_id) === 3 ? 'Alumno' : 'Docente/Admin' }}
                          </span>
                        </p>
                      </div>

                      <div class="media-right is-flex is-align-items-center">
                        <div v-if="calcularPuntos(miembro.id) > 0" 
                             class="workload-badge mr-3" 
                             :class="getColorCarga(calcularPuntos(miembro.id))">
                          {{ calcularPuntos(miembro.id) }}
                        </div>

                        <button v-if="esAdminOOwner" class="button is-white is-small" @click="quitarMiembro(miembro.id)">
                          <span class="icon has-text-danger"><i class="fas fa-user-minus"></i></span>
                        </button>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="esAdminOOwner" class="field mt-2 buscador-relativo">
              <label class="label is-small">Asignar nuevo integrante</label>
              <div class="control has-icons-left">
                <input 
                  class="input is-rounded" 
                  type="text" 
                  v-model="busqueda" 
                  @input="buscarUsuarios" 
                  placeholder="Buscar por Apellido o Nombre..."
                >
                <span class="icon is-left"><i class="fas fa-search"></i></span>
                
                <div v-if="resultadosBusqueda.length > 0" class="box is-paddingless mt-1 search-results-down">
                  <aside class="menu">
                    <ul class="menu-list">
                      <li v-for="u in resultadosBusqueda" :key="u.id">
                        <a @click="seleccionarUsuario(u)" class="p-3 border-bottom-light">
                          <div class="is-flex is-justify-content-between is-align-items-center">
                            <div>
                              <strong class="has-text-link">
                                {{ u.apellido ? u.apellido.toUpperCase() + ', ' : '' }}{{ u.nombre }}
                              </strong>
                            </div>
                            <span :class="['tag is-small', Number(u.rol_id) === 3 ? 'is-info is-light' : 'is-warning is-light']">
                              {{ Number(u.rol_id) === 3 ? 'Alumno' : 'Docente/Admin' }}
                            </span>
                          </div>
                        </a>
                      </li>
                    </ul>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-flex-end p-4">
        <button class="button" @click="$emit('close')">Cerrar</button>
        <button v-if="esAdminOOwner" class="button is-success" @click="confirmarCambios">
          <span>Guardar Cambios</span>
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import { configService } from '../../services/config.service';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';

export default {
  props: {
    proyectoOriginal: { type: Object, required: true },
    todasLasTareas: { type: Array, default: () => [] } 
  },
  data() {
    return {
      form: { ...this.proyectoOriginal, escuela_id: this.proyectoOriginal.escuela_id },
      estadosProyecto: [],
      prioridades: [], 
      miembrosAsignados: [],
      busqueda: '',
      resultadosBusqueda: []
    }
  },
  computed: {
    esAdminOOwner() {
      const authStore = useAuthStore();
      const user = authStore.usuario;
      return user && (Number(user.rol_id) === 1 || Number(user.id) === Number(this.proyectoOriginal?.docente_owner_id));
    },
    /**
     * Genera dinámicamente el texto del tooltip basado en las prioridades/importancias 
     * cargadas desde la base de datos.
     */
    leyendaPrioridades() {
      if (!this.prioridades || this.prioridades.length === 0) {
        return "Cargando escala de puntos...";
      }
      const escala = this.prioridades
        .map(p => `• ${p.nombre}: ${p.peso} pts`)
        .join('\n');

      return `Puntos por tarea (según importancia):\n${escala}\n\n(Solo suma tareas en 'In Progress' o 'Testing')`;
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
        this.estadosProyecto = data.estadosProyecto || [];
        this.prioridades = data.prioridades || [];
      } catch (e) { console.error("Error cargando configuraciones en modal:", e); }
    },

    prepararMiembros() {
      const lista = this.proyectoOriginal?.integrantes || this.proyectoOriginal?.Usuarios || [];
      this.miembrosAsignados = lista.map(m => ({ ...m }));
    },

    calcularPuntos(usuarioId) {
      if (!this.todasLasTareas.length) return 0;
      
      return this.todasLasTareas
        .filter(t => 
          Number(t.responsable_id) === Number(usuarioId) && 
          (Number(t.estado_id) === 2 || Number(t.estado_id) === 3) 
        )
        .reduce((acc, tarea) => {
          const prio = this.prioridades.find(p => p.id === tarea.prioridad_id);
          return acc + (prio ? Number(prio.peso) : 0);
        }, 0);
    },

    getColorCarga(puntos) {
      if (puntos >= 100) return 'is-danger-badge'; 
      if (puntos >= 50) return 'is-warning-badge'; 
      return 'is-success-badge'; 
    },

    obtenerColorAvatar(rolId) {
      return Number(rolId) === 3 ? 'has-background-success-light has-text-success' : 'has-background-link-light has-text-link';
    },

    obtenerIniciales(n) {
      return n ? n.split(' ').map(x => x[0]).join('').toUpperCase().substring(0, 2) : '?';
    },

    quitarMiembro(id) {
      this.miembrosAsignados = this.miembrosAsignados.filter(m => m.id !== id);
    },

    async buscarUsuarios() {
        if (this.busqueda.length < 2) {
            this.resultadosBusqueda = [];
            return;
        }
        try {
            const authStore = useAuthStore();
            const res = await axios.get(`http://localhost:3000/api/usuarios?q=${this.busqueda}`, {
                headers: { 'Authorization': `Bearer ${authStore.token}` }
            });
            const idEscuelaProyecto = Number(this.proyectoOriginal.escuela_id);
            this.resultadosBusqueda = res.data.filter(u => {
                const rolId = Number(u.rol_id);
                if (rolId !== 3) return true;
                const arrayEscuelas = u.usuario_escuelas || u.UsuarioEscuelas || u.Escuelas || u.escuelas || [];
                const coincideEnRelacion = arrayEscuelas.some(rel => Number(rel.escuela_id || rel.id) === idEscuelaProyecto);
                const coincideDirecto = Number(u.escuela_id || u.escuelaId) === idEscuelaProyecto;
                return coincideEnRelacion || coincideDirecto;
            });
        } catch (e) { console.error("Error en la búsqueda:", e); }
    },

    seleccionarUsuario(u) {
      if (this.miembrosAsignados.some(m => m.id === u.id)) return;
      this.miembrosAsignados.push({ ...u });
      this.busqueda = '';
      this.resultadosBusqueda = [];
    },

    async confirmarCambios() {
      try {
        const authStore = useAuthStore();
        await axios.put(`http://localhost:3000/api/proyectos/${this.form.id}`, {
          ...this.form,
          usuariosIds: this.miembrosAsignados.map(m => m.id)
        }, { headers: { 'Authorization': `Bearer ${authStore.token}` } });
        this.$emit('actualizado');
        this.$emit('close');
      } catch (e) { alert("Error al guardar."); }
    }
  }
}
</script>

<style scoped>
.modal-grande { width: 95%; max-width: 1000px; height: 90vh; }
.modal-card-body { overflow-y: visible !important; }
.miembros-scroll-area { max-height: 350px; overflow-y: auto; background: #fafafa; border-radius: 8px; border: 1px solid #eee; }
.avatar-circle-lg { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.buscador-relativo { position: relative; }
.border-right-tablet { border-right: 1px solid #dbdbdb; }
.border-slack { border: 1px solid #e1e4e8; border-radius: 10px; background: white; }
.uppercase-label { text-transform: uppercase; font-size: 0.7rem; font-weight: 700; }

/* Estilos para el Globito de Carga */
.workload-badge {
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.is-success-badge { background-color: #48c78e; }
.is-warning-badge { background-color: #ffe08a; color: #947600; }
.is-danger-badge { background-color: #f14668; }

/* Tooltip dinámico hacia abajo */
.help-tooltip-down { position: relative; }

.help-tooltip-down:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  top: 130%; /* Desplazamiento hacia abajo */
  right: 0;
  background: #2c3e50;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  white-space: pre;
  z-index: 1000;
  width: 250px;
  line-height: 1.4;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  text-align: left;
}

/* Tooltip dinámico hacia abajo REFORZADO */
.help-tooltip-down { 
  position: relative; 
}

.help-tooltip-down:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  top: 130%; 
  right: 0;
  background: #2c3e50;
  color: white;
  padding: 14px; /* Un poco más de aire interno */
  border-radius: 8px;
  font-size: 0.85rem;
  white-space: pre-wrap; /* CAMBIO CLAVE: permite que el texto baje y el fondo crezca */
  z-index: 1000;
  width: 280px; /* Un poco más ancho para que respire */
  line-height: 1.5;
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  text-align: left;
  display: block; /* Asegura comportamiento de bloque */
}

/* Triangulito del tooltip */
.help-tooltip-down:hover::before {
  content: '';
  position: absolute;
  top: 110%;
  right: 6px;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #2c3e50;
  z-index: 1001;
}

.search-results-down { 
  position: absolute; 
  top: 100%; 
  left: 0; 
  width: 100%; 
  max-height: 250px; 
  overflow-y: auto; 
  z-index: 9999; 
  background: white;
  border: 1px solid #dbdbdb;
  box-shadow: 0 8px 15px rgba(0,0,0,0.2);
}
</style>