<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card" style="width: 95%; max-width: 900px;">
      
      <header class="modal-card-head has-background-primary">
        <p class="modal-card-title has-text-white is-size-5-mobile">Gestionar Proyecto: {{ proyectoOriginal.nombre }}</p>
        <button class="delete" aria-label="close" @click="$emit('close')"></button>
      </header>

      <section class="modal-card-body p-4">
        <div class="columns is-multiline">
          
          <div class="column is-12-mobile is-4-tablet">
            <h3 class="title is-6 border-bottom has-text-grey">Información General</h3>
            <div class="field">
              <label class="label is-small">Nombre del Proyecto</label>
              <input class="input is-small" type="text" v-model="form.nombre">
            </div>
            
            <div class="field">
              <label class="label is-small">Estado Global</label>
              <div class="select is-fullwidth is-small">
                <select v-model="form.estado_id">
                  <option v-for="est in estadosProyecto" :key="est.id" :value="est.id">
                    {{ est.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="column is-12-mobile is-8-tablet">
            <h3 class="title is-6 border-bottom has-text-grey">Integrantes del proyecto ({{ miembrosAsignados.length }})</h3>
            
            <div class="miembros-grid mb-4">
              <div class="columns is-multiline is-mobile">
                <div class="column is-12-mobile is-6-tablet p-1" v-for="miembro in miembrosAsignados" :key="miembro.id">
                  <div class="box p-2 mb-0 is-shadowless border-slack">
                    <article class="media is-align-items-center">
                      <figure class="media-left mr-2">
                        <div :class="['avatar-circle', obtenerColorAvatar(miembro.rol)]">
                          {{ obtenerIniciales(miembro.nombre) }}
                        </div>
                      </figure>
                      
                      <div class="media-content" style="overflow: hidden;">
                        <p class="is-size-7 mb-0 has-text-weight-bold is-truncated">{{ miembro.nombre }}</p>
                        <p class="is-size-7 has-text-grey">{{ miembro.rol }}</p>
                      </div>

                      <div class="media-right is-flex is-align-items-center">
                        <span :class="['tag is-rounded is-small mr-1', obtenerColorCarga(miembro.cargaTotal)]">
                          {{ miembro.cargaTotal }}
                        </span>
                        <button class="delete is-small" @click="quitarMiembro(miembro.id)"></button>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </div>

            <div class="field mt-4">
              <label class="label is-small">Asignar nuevo integrante</label>
              <div class="control has-icons-left">
                <input class="input is-rounded is-small" type="text" v-model="busqueda" @input="buscarUsuarios" placeholder="Escribe nombre o email...">
                <span class="icon is-small is-left"><i class="fas fa-search"></i></span>
                
                <div v-if="resultadosBusqueda.length > 0" class="box is-paddingless mt-1 search-results">
                  <aside class="menu">
                    <ul class="menu-list">
                      <li v-for="u in resultadosBusqueda" :key="u.id">
                        <a @click="seleccionarUsuario(u)" class="is-size-7 p-2">
                          <strong>{{ u.nombre }}</strong> 
                          <span class="tag is-light is-pulled-right">{{ u.Rol?.nombre || 'Alumno' }}</span>
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

      <footer class="modal-card-foot is-justify-content-flex-end p-3">
        <button class="button is-small" @click="$emit('close')">Cancelar</button>
        <button class="button is-success is-small" @click="confirmarCambios">Guardar Cambios</button>
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
    miembrosActuales: { type: Array, default: () => [] }
  },
  data() {
    return {
      form: { ...this.proyectoOriginal },
      estadosProyecto: [],
      prioridadesMaster: [], 
      miembrosAsignados: [],
      busqueda: '',
      resultadosBusqueda: []
    }
  },
  watch: {
    proyectoOriginal: {
      handler(newVal) {
        if (newVal) {
          this.form = { ...newVal };
          this.prepararMiembros();
        }
      },
      immediate: true,
      deep: true
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
        this.estadosProyecto = data.estadosProyecto; 
        this.prioridadesMaster = data.prioridades; 
      } catch (e) {
        console.error("Error cargando maestros", e);
      }
    },
    
    prepararMiembros() {
      const listaSucia = 
        this.proyectoOriginal?.integrantes || 
        this.proyectoOriginal?.Usuarios || 
        this.proyectoOriginal?.usuarios || 
        this.miembrosActuales || 
        [];

      const integrantes = Array.isArray(listaSucia) ? [...listaSucia] : [];

      this.miembrosAsignados = integrantes.map(m => {
        // EXTRAEMOS SOLO EL TEXTO DEL ROL
        let nombreRol = 'Alumno';
        if (m.Rol?.nombre) nombreRol = m.Rol.nombre;
        else if (m.rol?.nombre) nombreRol = m.rol.nombre;
        else if (typeof m.rol === 'string') nombreRol = m.rol;

        return {
          id: m.id,
          nombre: m.nombre || 'Sin nombre',
          email: m.email || '',
          rol: nombreRol,
          cargaTotal: this.calcularCargaAlumno(m.tareas || [])
        };
      });
    },

    obtenerColorAvatar(rol) {
      const r = (typeof rol === 'string') ? rol.toLowerCase() : '';
      if (r.includes('docente') || r.includes('profesor') || r.includes('admin')) {
        return 'has-background-link-light has-text-link';
      }
      return 'has-background-success-light has-text-success';
    },
    
    calcularCargaAlumno(tareas) {
      if (!tareas || !Array.isArray(tareas)) return 0;
      return tareas.reduce((total, tarea) => {
        const prioridad = this.prioridadesMaster.find(p => p.id === tarea.prioridad_id);
        return total + (prioridad ? prioridad.peso : 0);
      }, 0);
    },
    obtenerColorCarga(puntos) {
      if (puntos >= 60) return 'is-danger';
      if (puntos >= 30) return 'is-warning';
      return 'is-success';
    },
    obtenerIniciales(nombre) {
      if (!nombre) return '';
      return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },
    quitarMiembro(id) {
      this.miembrosAsignados = this.miembrosAsignados.filter(m => m.id !== id); 
    },
    async confirmarCambios() {
      await this.actualizarProyecto();
    },
    async actualizarProyecto() {
      try {
        const authStore = useAuthStore();
        const payload = {
          nombre: this.form.nombre,
          estado_id: this.form.estado_id,
          usuariosIds: this.miembrosAsignados.map(m => m.id)
        };
        await axios.put(`http://localhost:3000/api/proyectos/${this.form.id}`, payload, {
          headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        this.$emit('actualizado'); 
        this.$emit('close');
      } catch (error) {
        console.error("Error al guardar:", error);
        alert("No se pudo guardar.");
      }
    },
    async buscarUsuarios() {
      if (this.busqueda.length < 2) {
        this.resultadosBusqueda = [];
        return;
      }
      try {
        const authStore = useAuthStore();
        const response = await axios.get(`http://localhost:3000/api/usuarios?q=${this.busqueda}`, {
          headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        this.resultadosBusqueda = response.data;
      } catch (error) {
        console.error("Error al buscar usuarios:", error);
      }
    },
    seleccionarUsuario(u) {
      const yaExiste = this.miembrosAsignados.some(m => m.id === u.id);
      if (yaExiste) {
        alert("Este usuario ya está en el equipo");
        return;
      }
      this.miembrosAsignados.push({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        rol: u.Rol?.nombre || 'Alumno',
        cargaTotal: 0 
      });
      this.busqueda = '';
      this.resultadosBusqueda = [];
    }
  }
}
</script>

<style scoped>
.border-bottom { border-bottom: 1px solid #dbdbdb; margin-bottom: 1rem; padding-bottom: 0.5rem; }
.border-slack { border: 1px solid #edf0f3; border-radius: 8px; transition: all 0.2s; }
.border-slack:hover { border-color: #cbd5e0; background-color: #f8fafc; }

/* 1. Modal más alto y con scroll interno si es necesario */
.modal-card {
  height: 80vh; /* 80% del alto de la pantalla */
  max-height: 700px;
}

.modal-card-body {
  overflow-y: auto;
  min-height: 500px; /* Asegura un mínimo de altura */
}

.avatar-circle {
  width: 32px; height: 32px; border-radius: 6px; 
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: bold;
}

/* 2. Resultados de búsqueda que no rompan el layout */
.search-results {
  position: absolute; 
  z-index: 1000; /* Bien arriba */
  width: 100%; 
  max-height: 250px; 
  overflow-y: auto;
  border: 1px solid #dbdbdb; 
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  background: white;
}

.is-truncated { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>