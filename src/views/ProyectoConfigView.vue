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
              <p class="subtitle is-3 has-text-info has-text-weight-bold">{{ form.nombre || 'Cargando...' }}</p>
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

        <div class="columns is-variable is-5" v-else>
          <div class="column is-4">
            <div class="box glass-panel h-full p-5">
              <h3 class="title is-5 has-text-info border-bottom-info pb-3 mb-5 uppercase-label">
                <i class="fas fa-calendar-alt mr-2"></i> Hitos y Estado
              </h3>

              <div class="field mb-5">
                <label class="label has-text-grey-lighter is-small uppercase-label">Estado Actual</label>
                <div class="control has-icons-left">
                  <div class="select is-fullwidth is-dark">
                    <select v-model.number="form.estado_id" :disabled="!esAdminOOwner">
                      <option v-for="est in estadosProyecto" :key="est.id" :value="Number(est.id)">
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
                  <input class="input is-dark" type="date" v-model="form.fecha_cierre_1" :disabled="!esAdminOOwner">
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-grey-lighter is-small uppercase-label">2do Cierre (Final)</label>
                <div class="control">
                  <input class="input is-dark" type="date" v-model="form.fecha_cierre_2" :disabled="!esAdminOOwner">
                </div>
              </div>

              <div class="field mt-6">
                <label class="label has-text-grey-lighter is-small uppercase-label">Descripción General</label>
                <textarea class="textarea is-dark" rows="5" v-model="form.descripcion" :disabled="!esAdminOOwner"></textarea>
              </div>
            </div>
          </div>

          <div class="column is-8">
            <div class="box glass-panel p-0 h-full is-flex is-flex-direction-column">
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

              <div class="p-5 flex-grow-1 overflow-y-auto" style="max-height: 65vh;">
                <div v-if="tabActiva === 'alcance'">
                  <div v-for="campo in camposAlcance" :key="campo.key" class="field mb-6">
                    <label class="label has-text-white is-size-6 is-flex is-justify-content-between mb-3">
                      <span>{{ campo.label }}</span>
                      <span v-if="form[campo.blockKey]" class="tag is-success is-light has-text-weight-bold">APROBADO</span>
                    </label>
                    <div class="field has-addons">
                      <div class="control is-expanded">
                        <textarea class="textarea is-dark custom-textarea" rows="5" v-model="form[campo.key]" :readonly="form[campo.blockKey]"></textarea>
                      </div>
                      <div class="control" v-if="esAdminOOwner">
                        <button class="button is-dark" style="height: 100%" @click="form[campo.blockKey] = !form[campo.blockKey]">
                          <span class="icon"><i class="fas" :class="form[campo.blockKey] ? 'fa-lock' : 'fa-lock-open'"></i></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="tabActiva === 'equipo'">
                  <div v-if="esAdminOOwner" class="field mb-5 buscador-relativo">
                    <div class="control has-icons-left">
                      <input class="input is-dark is-rounded" type="text" v-model="busqueda" @input="buscarUsuarios" placeholder="Buscar integrante...">
                      <span class="icon is-left"><i class="fas fa-search"></i></span>
                      <div v-if="resultadosBusqueda.length > 0" class="search-results-floating box p-0">
                        <a v-for="u in resultadosBusqueda" :key="u.id" @click="seleccionarUsuario(u)" class="dropdown-item py-3">
                          {{ u.apellido?.toUpperCase() }}, {{ u.nombre }}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div class="columns is-multiline">
                    <div class="column is-6" v-for="miembro in miembrosAsignados" :key="miembro.id">
                      <div class="box p-3 is-dark-box">
                        <article class="media is-align-items-center">
                          <figure class="media-left"><div :class="['avatar-circle', obtenerColorAvatar(miembro.rol_id)]">{{ obtenerIniciales(miembro.nombre) }}</div></figure>
                          <div class="media-content"><p class="has-text-white has-text-weight-bold mb-0">{{ miembro.nombre }} {{ miembro.apellido }}</p></div>
                          <div class="media-right is-flex is-align-items-center">
                            <div v-if="calcularPuntos(miembro.id) > 0" class="workload-badge mr-2" :class="getColorCarga(calcularPuntos(miembro.id))">{{ calcularPuntos(miembro.id) }}</div>
                            <button v-if="esAdminOOwner" class="button is-ghost has-text-danger p-0" @click="quitarMiembro(miembro.id)"><i class="fas fa-user-minus"></i></button>
                          </div>
                        </article>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="tabActiva === 'entregables'">
                  <div v-if="esAdminOOwner" class="field has-addons mb-5">
                    <div class="control is-expanded"><input class="input is-dark" type="text" v-model="nuevoEntregableNombre" placeholder="Nuevo documento..." @keyup.enter="agregarEntregableRAM"></div>
                    <div class="control"><button class="button is-info" @click="agregarEntregableRAM"><i class="fas fa-plus"></i></button></div>
                  </div>
                  <table class="table is-fullwidth glass-table is-narrow is-size-7">
                    <thead><tr><th class="has-text-info">Nombre</th><th class="has-text-info">Link Drive</th><th class="has-text-centered has-text-info">E</th><th class="has-text-centered has-text-info">A</th><th v-if="esAdminOOwner"></th></tr></thead>
                    <tbody>
                      <tr v-for="(e, index) in form.entregables" :key="index">
                        <td class="has-text-white"><strong>{{ e.nombre }}</strong></td>
                        <td><input class="input is-small is-dark h-auto py-0" type="text" v-model="e.link_drive"></td>
                        <td class="has-text-centered"><input type="checkbox" v-model="e.entregado" :disabled="!esAdminOOwner"></td>
                        <td class="has-text-centered"><input type="checkbox" v-model="e.aprobado" :disabled="!esAdminOOwner"></td>
                        <td v-if="esAdminOOwner" class="has-text-centered"><a class="has-text-danger" @click="form.entregables.splice(index, 1)"><i class="fas fa-trash-alt"></i></a></td>
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
      form: {
        id: null, nombre: '', descripcion: '', estado_id: null,
        fecha_cierre_1: '', fecha_cierre_2: '',
        objetivo: '', objetivoBloqueado: false,
        alcancePrototipo: '', alcancePrototipoBloqueado: false,
        alcanceFinal: '', alcanceFinalBloqueado: false,
        entregables: []
      },
      camposAlcance: [
        { label: 'Objetivo General', key: 'objetivo', blockKey: 'objetivoBloqueado' },
        { label: 'Alcance Prototipo', key: 'alcancePrototipo', blockKey: 'alcancePrototipoBloqueado' },
        { label: 'Alcance Final', key: 'alcanceFinal', blockKey: 'alcanceFinalBloqueado' }
      ],
      estadosProyecto: [],
      prioridades: [],
      todasLasTareas: [],
      miembrosAsignados: [],
      busqueda: '',
      resultadosBusqueda: [],
      nuevoEntregableNombre: ''
    }
  },
  computed: {
    esAdminOOwner() {
      const authStore = useAuthStore();
      const user = authStore.usuario;
      const ownerId = this.proyectoOriginal ? Number(this.proyectoOriginal.docente_owner_id) : null;
      return user && (Number(user.rol_id) === 1 || Number(user.id) === ownerId);
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

        this.estadosProyecto = resConfig.estadosProyecto || [];
        this.prioridades = resConfig.prioridades || [];
        this.todasLasTareas = resTareas.data || resTareas;

        const resProj = await projectService.getById(id);

        if (resProj.success) {
          const p = resProj.data;
          this.proyectoOriginal = p;
          
          let idDetectado = null;
          // Lógica de detección de estado por objeto o nombre
          if (p.estado_proyecto && typeof p.estado_proyecto === 'object') {
            const nombre = p.estado_proyecto.nombre;
            const match = this.estadosProyecto.find(e => e.nombre.trim().toUpperCase() === nombre.trim().toUpperCase());
            idDetectado = match ? match.id : null;
          } else if (typeof p.estado_proyecto === 'string') {
            const match = this.estadosProyecto.find(e => e.nombre.trim().toUpperCase() === p.estado_proyecto.trim().toUpperCase());
            idDetectado = match ? match.id : null;
          } else if (p.estado_id) {
            idDetectado = p.estado_id;
          }

          this.form = { 
            ...p, 
            estado_id: idDetectado ? Number(idDetectado) : null 
          };
          
          this.form.entregables = p.entregables ? JSON.parse(JSON.stringify(p.entregables)) : [];
          this.miembrosAsignados = p.integrantes || p.Usuarios || [];
        }
      } catch (err) {
        console.error("Error crítico de carga:", err);
      } finally {
        this.cargando = false;
      }
    },
    agregarEntregableRAM() {
      if (!this.nuevoEntregableNombre.trim()) return;
      this.form.entregables.push({ nombre: this.nuevoEntregableNombre.trim(), link_drive: '', entregado: false, aprobado: false });
      this.nuevoEntregableNombre = '';
    },
    quitarMiembro(id) { this.miembrosAsignados = this.miembrosAsignados.filter(m => m.id !== id); },
    calcularPuntos(uId) {
      return (this.todasLasTareas || []).filter(t => Number(t.responsable_id) === Number(uId) && (Number(t.estado_id) === 2 || Number(t.estado_id) === 3)).reduce((acc, t) => acc + (this.prioridades.find(p => p.id === t.prioridad_id)?.peso || 0), 0);
    },
    getColorCarga(pts) { return pts >= 100 ? 'is-danger-badge' : pts >= 50 ? 'is-warning-badge' : 'is-success-badge'; },
    obtenerColorAvatar(rol) { return Number(rol) === 3 ? 'has-background-success-light has-text-success' : 'has-background-link-light has-text-link'; },
    obtenerIniciales(n) { return n ? n.split(' ').map(x => x[0]).join('').toUpperCase().substring(0, 2) : '?'; },
    async buscarUsuarios() {
      if (this.busqueda.length < 2) return;
      const authStore = useAuthStore();
      const res = await axios.get(`/api/usuarios?q=${this.busqueda}`, { headers: { 'Authorization': `Bearer ${authStore.token}` } });
      const idEscuelaProj = Number(this.proyectoOriginal.escuela_id);
      this.resultadosBusqueda = res.data.filter(u => {
        if (!u.activo || this.miembrosAsignados.some(m => m.id === u.id)) return false;
        if (Number(u.rol_id) !== 3) return true;
        const schools = u.usuario_escuelas || u.Escuelas || [];
        return schools.some(rel => Number(rel.escuela_id || rel.id) === idEscuelaProj) || Number(u.escuela_id) === idEscuelaProj;
      });
    },
    seleccionarUsuario(u) {
      this.miembrosAsignados.push({ ...u });
      this.busqueda = '';
      this.resultadosBusqueda = [];
    },
    async confirmarCambios() {
      this.guardando = true;
      try {
        const authStore = useAuthStore();
        await axios.put(`/api/proyectos/${this.form.id}`, {
          ...this.form,
          usuariosIds: this.miembrosAsignados.map(m => m.id),
          entregables: this.form.entregables
        }, { headers: { 'Authorization': `Bearer ${authStore.token}` } });
        this.volver();
      } catch (err) {
        console.error("Error al guardar:", err);
      } finally { this.guardando = false; }
    },
    volver() { this.$router.push('/dashboard'); }
  },
  mounted() {
    this.cargarTodo();
  }
}
</script>

<style scoped>
.custom-textarea { font-size: 1.15rem !important; line-height: 1.6; }
.subtitle.is-3 { letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.dashboard-bg { min-height: 100vh; background: linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url('../assets/fondo.jpg'); background-size: cover; background-attachment: fixed; }
.glass-panel { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
.custom-tabs li a { color: #bdc3c7 !important; border-bottom: 2px solid transparent !important; }
.custom-tabs li.is-active a { background-color: rgba(52, 152, 219, 0.2) !important; color: #3498db !important; border-bottom-color: #3498db !important; }
.border-bottom-info { border-bottom: 2px solid rgba(52, 152, 219, 0.3); }
.is-dark-box { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; }
.avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.workload-badge { min-width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; color: white; }
.is-success-badge { background: #48c78e; }
.is-warning-badge { background: #ffe08a; color: #947600; }
.is-danger-badge { background: #f14668; }
.uppercase-label { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; font-weight: bold; }
.search-results-floating { position: absolute; width: 100%; z-index: 1000; background: #222; border: 1px solid #444; }
.overflow-y-auto { overflow-y: auto; }
</style>