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
              <input class="input is-small" type="text" v-model="form.nombre" :disabled="!esAdminOOwner">
            </div>
            
            <div class="field">
              <label class="label is-small">Estado Global</label>
              <div class="select is-fullwidth is-small">
                <select v-model="form.estado_id" :disabled="!esAdminOOwner">
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
                        <button v-if="esAdminOOwner" class="delete is-small" @click="quitarMiembro(miembro.id)"></button>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="esAdminOOwner" class="field mt-4">
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
                          <span class="tag is-light is-pulled-right">
                            {{ u.Rol?.nombre || u.rol?.nombre || 'Alumno' }}
                          </span>
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
        <button class="button is-small" @click="$emit('close')">
          {{ esAdminOOwner ? 'Cancelar' : 'Cerrar' }}
        </button>
        <button v-if="esAdminOOwner" class="button is-success is-small" @click="confirmarCambios">Guardar Cambios</button>
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
  computed: {
    esAdminOOwner() {
      const authStore = useAuthStore();
      const user = authStore.usuario;
      if (!user) return false;

      // Buscamos el ROL ID con tolerancia a diferentes nombres de propiedad
      const rawRolId = user.rol_id || user.rolId || (user.Rol ? user.Rol.id : null);
      const rolId = Number(rawRolId);
      
      const usuarioId = Number(user.id);
      const ownerId = Number(this.proyectoOriginal?.docente_owner_id);

      // Si el rolId es 1 (Admin según tu imagen de BD), devolvemos true directamente
      if (rolId === 1) return true;
      
      // Si no es admin, verificamos si es el dueño
      return usuarioId === ownerId;
    }
  },
  // ... resto de los métodos se mantienen igual ...
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
      const listaSucia = this.proyectoOriginal?.integrantes || this.proyectoOriginal?.Usuarios || [];
      const integrantes = Array.isArray(listaSucia) ? [...listaSucia] : [];
      this.miembrosAsignados = integrantes.map(m => ({
        id: m.id,
        nombre: m.nombre || 'Sin nombre',
        email: m.email || '',
        rol: m.Rol?.nombre || m.rol?.nombre || 'Alumno',
        cargaTotal: this.calcularCargaAlumno(m.tareas || [])
      }));
    },
    obtenerColorAvatar(rol) {
      const r = (typeof rol === 'string') ? rol.toLowerCase() : '';
      return (r.includes('docente') || r.includes('profesor') || r.includes('admin')) 
        ? 'has-background-link-light has-text-link' 
        : 'has-background-success-light has-text-success';
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
      if(!this.esAdminOOwner) return;
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
      if (this.miembrosAsignados.some(m => m.id === u.id)) return alert("Ya está en el equipo");
      this.miembrosAsignados.push({
        id: u.id, nombre: u.nombre, email: u.email,
        rol: u.Rol?.nombre || u.rol?.nombre || 'Alumno',
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
.modal-card { height: 80vh; max-height: 700px; }
.modal-card-body { overflow-y: auto; min-height: 500px; }
.avatar-circle { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold; }
.search-results { position: absolute; z-index: 1000; width: 100%; max-height: 250px; overflow-y: auto; border: 1px solid #dbdbdb; box-shadow: 0 8px 16px rgba(0,0,0,0.1); background: white; }
.is-truncated { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>