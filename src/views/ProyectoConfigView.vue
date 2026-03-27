<template>
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-6 px-4 pb-6">
        
        <div class="level mb-6 glass-panel p-5">
          <div class="level-left">
            <button class="button is-ghost has-text-white p-0 mr-5" @click="volver">
              <span class="icon is-large"><i class="fas fa-arrow-left fa-lg"></i></span>
            </button>
            <div>
              <h1 class="title has-text-white is-2 mb-1">Configuración del Proyecto</h1>
              <p class="subtitle is-6 has-text-grey-light uppercase-label">Gestión de datos generales y alcances</p>
            </div>
          </div>
          <div class="level-right">
            <div class="buttons">
              <button class="button is-light is-outlined" @click="volver">Cancelar</button>
              <button class="button is-success is-medium has-text-weight-bold" @click="confirmarCambios" :class="{'is-loading': guardando}">
                <span class="icon"><i class="fas fa-save"></i></span>
                <span>GUARDAR CAMBIOS</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="cargando" class="notification glass-notification is-info">
          <span class="icon"><i class="fas fa-spinner fa-pulse"></i></span> Obteniendo información del servidor...
        </div>

        <div class="columns is-variable is-5" v-else-if="form && form.id">
          
          <div class="column is-4">
            <div class="box glass-panel p-5" style="height: 100%;">
              <h3 class="title is-5 has-text-info border-bottom-info pb-3 mb-5 uppercase-label">
                <i class="fas fa-calendar-alt mr-2"></i> Hitos y Estado
              </h3>

              <div class="field mb-5">
                <label class="label has-text-grey-lighter is-small uppercase-label">Estado Actual</label>
                <div class="control has-icons-left">
                  <div class="select is-fullwidth is-dark">
                    <select v-model.number="form.estado_id">
                      <option :value="null" disabled>Seleccione un estado</option>
                      <option v-for="est in estadosProyecto" :key="est.id" :value="est.id">
                        {{ est.nombre }}
                      </option>
                    </select>
                  </div>
                  <span class="icon is-left has-text-info"><i class="fas fa-signal"></i></span>
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-grey-lighter is-small uppercase-label">1er Cierre (Prototipo)</label>
                <div class="control">
                  <input class="input is-dark" type="date" v-model="form.fecha_cierre_1">
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-grey-lighter is-small uppercase-label">2do Cierre (Final)</label>
                <div class="control">
                  <input class="input is-dark" type="date" v-model="form.fecha_cierre_2">
                </div>
              </div>

              <div class="field mt-6">
                <label class="label has-text-grey-lighter is-small uppercase-label">Notas del Proyecto</label>
                <textarea class="textarea is-dark" rows="6" v-model="form.descripcion" placeholder="Notas adicionales..."></textarea>
              </div>
            </div>
          </div>

          <div class="column is-8">
            <div class="box glass-panel p-0 is-flex is-flex-direction-column" style="min-height: 600px;">
              
              <div class="tabs is-boxed is-fullwidth mb-0 custom-tabs">
                <ul>
                  <li :class="{'is-active': tabActiva === 'alcance'}">
                    <a @click="tabActiva = 'alcance'"><span class="icon"><i class="fas fa-bullseye"></i></span><span>Alcances</span></a>
                  </li>
                  <li :class="{'is-active': tabActiva === 'equipo'}">
                    <a @click="tabActiva = 'equipo'"><span class="icon"><i class="fas fa-users"></i></span><span>Equipo ({{ miembrosAsignados.length }})</span></a>
                  </li>
                  <li :class="{'is-active': tabActiva === 'entregables'}">
                    <a @click="tabActiva = 'entregables'"><span class="icon"><i class="fas fa-file-upload"></i></span><span>Entregables</span></a>
                  </li>
                </ul>
              </div>

              <div class="p-5 flex-grow-1">
                
                <div v-if="tabActiva === 'alcance'" class="animate__animated animate__fadeIn">
                  <div class="field mb-6">
                    <label class="label has-text-white is-size-6 mb-3">TÍTULO DEL PROYECTO</label>
                    <div class="control">
                      <input 
                        class="input is-dark is-medium custom-input-title" 
                        type="text" 
                        v-model="form.nombre"
                      >
                    </div>
                  </div>

                  <div v-for="campo in camposAlcance" :key="campo.key" class="field mb-6">
                    <label class="label has-text-white is-size-6 mb-3 uppercase-label">{{ campo.label }}</label>
                    <div class="control">
                      <textarea 
                        class="textarea is-dark custom-textarea" 
                        rows="4" 
                        v-model="form[campo.key]"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div v-if="tabActiva === 'equipo'" class="animate__animated animate__fadeIn">
                  <div class="field mb-5 buscador-relativo">
                    <div class="control has-icons-left">
                      <input class="input is-dark is-rounded is-medium" type="text" v-model="busqueda" @input="buscarUsuarios" placeholder="Escribe apellido o nombre...">
                      <span class="icon is-left has-text-info"><i class="fas fa-search"></i></span>
                      <div v-if="resultadosBusqueda.length > 0" class="search-results-floating box p-0">
                        <a v-for="u in resultadosBusqueda" :key="u.id" @click="seleccionarUsuario(u)" class="dropdown-item-custom">
                          <div class="is-flex is-justify-content-between is-align-items-center">
                            <span><strong>{{ u.apellido?.toUpperCase() }}</strong>, {{ u.nombre }}</span>
                            <span class="tag is-small is-dark">{{ Number(u.rol_id) === 3 ? 'Alumno' : 'Docente' }}</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div class="columns is-multiline">
                    <div class="column is-6" v-for="miembro in miembrosAsignados" :key="miembro.id">
                      <div class="box p-3 is-dark-box">
                        <article class="media is-align-items-center">
                          <figure class="media-left"><div :class="['avatar-circle', obtenerColorAvatar(miembro.rol_id)]">{{ obtenerIniciales(miembro.nombre) }}</div></figure>
                          <div class="media-content">
                            <p class="has-text-white has-text-weight-bold mb-0">{{ miembro.nombre }} {{ miembro.apellido }}</p>
                            <p class="has-text-grey-light is-size-7" v-if="miembro.telefono">TE: {{ miembro.telefono }}</p>
                          </div>
                          <div class="media-right">
                            <button class="button is-ghost has-text-danger p-0" @click="quitarMiembro(miembro.id)"><i class="fas fa-user-minus"></i></button>
                          </div>
                        </article>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="tabActiva === 'entregables'" class="animate__animated animate__fadeIn">
                  <div class="field has-addons mb-6">
                    <div class="control is-expanded">
                      <input class="input is-medium custom-input-entregable" type="text" v-model="nuevoEntregableNombre" placeholder="Nuevo entregable..." @keyup.enter="agregarEntregableRAM">
                    </div>
                    <div class="control">
                      <button class="button is-info is-medium" @click="agregarEntregableRAM"><i class="fas fa-plus"></i></button>
                    </div>
                  </div>

                  <div class="table-container">
                    <table class="table is-fullwidth glass-table delivery-table-v2">
                      <thead>
                        <tr>
                          <th class="has-text-info">Documento</th>
                          <th class="has-text-info">Enlace</th>
                          <th style="width: 50px;"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(e, index) in form.entregables" :key="index">
                          <td class="data-text-bright">{{ e.nombre }}</td>
                          <td>
                            <div class="field has-addons">
                              <div class="control is-expanded">
                                <input class="input custom-input-table is-small" type="text" v-model="e.link_drive">
                              </div>
                              <div class="control">
                                <button class="button is-info is-small is-outlined" :disabled="!e.link_drive" @click="abrirEnlace(e.link_drive)">
                                  <i class="fas fa-external-link-alt"></i>
                                </button>
                              </div>
                            </div>
                          </td>
                          <td class="has-text-centered">
                            <button class="button is-ghost has-text-danger p-0" @click="form.entregables.splice(index, 1)">
                              <i class="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { configService } from '../services/config.service';
import { projectService } from '../services/project.services';
import { tareaService } from '../services/tarea.service';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

export default {
  data() {
    return {
      cargando: true,
      guardando: false,
      tabActiva: 'alcance',
      proyectoOriginal: null,
      busqueda: '',
      resultadosBusqueda: [],
      nuevoEntregableNombre: '',
      estadosProyecto: [],
      prioridades: [],
      todasLasTareas: [],
      miembrosAsignados: [],
      form: {
        id: null, nombre: '', descripcion: '', estado_id: null,
        fecha_cierre_1: '', fecha_cierre_2: '',
        objetivo: '', alcancePrototipo: '', alcanceFinal: '',
        entregables: []
      },
      camposAlcance: [
        { label: 'Objetivo General', key: 'objetivo' },
        { label: 'Alcance Prototipo', key: 'alcancePrototipo' },
        { label: 'Alcance Final', key: 'alcanceFinal' }
      ]
    }
  },
  methods: {
    async cargarTodo() {
      this.cargando = true;
      const id = this.$route.params.id;
      try {
        const [resConfig, resTareas] = await Promise.all([
          configService.getTablasMaestras(),
          tareaService.getAll()
        ]);
        this.estadosProyecto = (resConfig.estadosProyecto || []).map(e => ({ ...e, id: Number(e.id) }));
        this.prioridades = resConfig.prioridades || [];
        this.todasLasTareas = resTareas.data || resTareas;

        const resProj = await projectService.getById(id);
        if (resProj.success) {
          const p = resProj.data;
          this.proyectoOriginal = p;
          const idEstado = p.estado_id ? Number(p.estado_id) : (p.EstadoProyecto?.id ? Number(p.EstadoProyecto.id) : null);
          Object.assign(this.form, {
            id: p.id, nombre: p.nombre, descripcion: p.descripcion,
            fecha_cierre_1: p.fecha_cierre_1, fecha_cierre_2: p.fecha_cierre_2,
            objetivo: p.objetivo, alcancePrototipo: p.alcancePrototipo, alcanceFinal: p.alcanceFinal,
            entregables: p.entregables ? JSON.parse(JSON.stringify(p.entregables)) : []
          });
          this.miembrosAsignados = p.integrantes || p.Usuarios || [];
          this.form.estado_id = null; 
          this.$nextTick(() => { this.form.estado_id = idEstado; });
        }
      } catch (err) { console.error(err); } finally { this.cargando = false; }
    },
    abrirEnlace(url) {
      if (!url) return;
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    },
    agregarEntregableRAM() {
      if (!this.nuevoEntregableNombre.trim()) return;
      this.form.entregables.push({ nombre: this.nuevoEntregableNombre.trim(), link_drive: '' });
      this.nuevoEntregableNombre = '';
    },
    quitarMiembro(id) { this.miembrosAsignados = this.miembrosAsignados.filter(m => m.id !== id); },
    obtenerColorAvatar(rol) { return Number(rol) === 3 ? 'has-background-success-light has-text-success' : 'has-background-link-light has-text-link'; },
    obtenerIniciales(n) { return n ? n.split(' ').map(x => x[0]).join('').toUpperCase().substring(0, 2) : '?'; },
    async buscarUsuarios() {
      if (this.busqueda.length < 2) { this.resultadosBusqueda = []; return; }
      try {
        const authStore = useAuthStore();
        const res = await axios.get(`/api/usuarios?q=${this.busqueda}&escuela_id=${this.proyectoOriginal.escuela_id}`, {
          headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        this.resultadosBusqueda = res.data.filter(u => u.activo && !this.miembrosAsignados.some(m => m.id === u.id));
      } catch (err) { console.error(err); }
    },
    seleccionarUsuario(u) {
      this.miembrosAsignados.push({ ...u });
      this.busqueda = '';
      this.resultadosBusqueda = [];
    },
    async confirmarCambios() {
      if (!this.form.nombre.trim()) return alert("Nombre obligatorio");
      this.guardando = true;
      try {
        const authStore = useAuthStore();
        await axios.put(`/api/proyectos/${this.form.id}`, { ...this.form, usuariosIds: this.miembrosAsignados.map(m => m.id) }, 
          { headers: { 'Authorization': `Bearer ${authStore.token}` } });
        this.volver();
      } catch (err) { console.error(err); } finally { this.guardando = false; }
    },
    volver() { this.$router.push('/dashboard'); }
  },
  mounted() { this.cargarTodo(); }
}
</script>

<style scoped>
.dashboard-bg { min-height: 100vh; background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('../assets/fondo.jpg'); background-size: cover; background-attachment: fixed; }
.glass-panel { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }

/* FIX DE TEXTAREAS Y CONTENEDORES */
.custom-textarea {
  width: 100% !important;
  max-width: 100% !important;
  background: rgba(0, 0, 0, 0.4) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  resize: vertical;
}

.custom-input-title {
  background: rgba(52, 152, 219, 0.15) !important;
  color: #3498db !important;
  border: 1px solid rgba(52, 152, 219, 0.4) !important;
  font-weight: 700 !important;
  text-transform: uppercase;
}

.custom-tabs li a { color: #bdc3c7 !important; border-bottom: 2px solid transparent !important; }
.custom-tabs li.is-active a { background-color: rgba(52, 152, 219, 0.2) !important; color: #3498db !important; border-bottom-color: #3498db !important; }

.border-bottom-info { border-bottom: 2px solid rgba(52, 152, 219, 0.3); }
.buscador-relativo { position: relative; }
.search-results-floating { position: absolute; top: 100%; left: 0; width: 100%; z-index: 1000; background: rgba(25, 25, 25, 0.98) !important; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; margin-top: 5px; max-height: 250px; overflow-y: auto; }
.dropdown-item-custom { color: #fff !important; display: block; padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; }
.dropdown-item-custom:hover { background: rgba(52, 152, 219, 0.4) !important; }

.avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.uppercase-label { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; font-weight: bold; }
.is-dark-box { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; }
.delivery-table-v2 td { border-bottom: 1px solid rgba(255,255,255,0.05) !important; color: white; vertical-align: middle; }
</style>