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
                          <div class="media-right is-flex is-align-items-center">
                            <div v-if="calcularPuntos(miembro.id) > 0" class="workload-badge mr-2" :class="getColorCarga(calcularPuntos(miembro.id))">{{ calcularPuntos(miembro.id) }}</div>
                            <button 
                              v-if="miembro.telefono" 
                              class="button is-ghost has-text-success p-0 mr-3" 
                              title="Enviar WhatsApp"
                              @click="enviarWhatsapp(miembro.telefono)"
                            >
                              <i class="fab fa-whatsapp fa-lg"></i>
                            </button>
                            <button v-if="esAdminOOwner" class="button is-ghost has-text-danger p-0" @click="quitarMiembro(miembro.id)"><i class="fas fa-user-minus"></i></button>
                          </div>
                        </article>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="tabActiva === 'entregables'">
                  <div v-if="esAdminOOwner" class="field has-addons mb-6">
                    <div class="control is-expanded">
                      <input class="input is-medium custom-input-entregable" type="text" v-model="nuevoEntregableNombre" placeholder="Nombre del nuevo documento..." @keyup.enter="agregarEntregableRAM">
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
                          <th class="has-text-info">Enlace de Drive</th>
                          <th class="has-text-centered has-text-info">E</th>
                          <th class="has-text-centered has-text-info">A</th>
                          <th v-if="esAdminOOwner"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(e, index) in form.entregables" :key="index" class="delivery-row">
                          <td class="data-text-bright">{{ e.nombre }}</td>
                          <td>
                            <div class="field has-addons">
                              <div class="control is-expanded">
                                <input class="input custom-input-table" type="text" v-model="e.link_drive" placeholder="Pegue el enlace aquí">
                              </div>
                              <div class="control">
                                <button class="button is-info is-outlined btn-open-link" title="Abrir en nueva pestaña" :disabled="!e.link_drive" @click="abrirEnlace(e.link_drive)">
                                  <span class="icon is-small"><i class="fas fa-external-link-alt"></i></span>
                                </button>
                              </div>
                            </div>
                          </td>
                          <td class="has-text-centered"><input type="checkbox" v-model="e.entregado" :disabled="!esAdminOOwner" class="checkbox-ui"></td>
                          <td class="has-text-centered"><input type="checkbox" v-model="e.aprobado" :disabled="!esAdminOOwner" class="checkbox-ui"></td>
                          <td v-if="esAdminOOwner" class="has-text-centered">
                            <button class="button is-ghost has-text-danger p-0" @click="form.entregables.splice(index, 1)"><i class="fas fa-trash-alt"></i></button>
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
      cargando: true, guardando: false, tabActiva: 'alcance', proyectoOriginal: null,
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
      estadosProyecto: [], prioridades: [], todasLasTareas: [], miembrosAsignados: [],
      busqueda: '', resultadosBusqueda: [], nuevoEntregableNombre: ''
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
        const [resConfig, resTareas] = await Promise.all([configService.getTablasMaestras(), tareaService.getAll()]);
        this.estadosProyecto = resConfig.estadosProyecto || [];
        this.prioridades = resConfig.prioridades || [];
        this.todasLasTareas = resTareas.data || resTareas;
        const resProj = await projectService.getById(id);
        if (resProj.success) {
          const p = resProj.data;
          this.proyectoOriginal = p;
          let idDetectado = null;
          if (p.estado_proyecto && typeof p.estado_proyecto === 'object') {
            const match = this.estadosProyecto.find(e => e.nombre.toUpperCase() === p.estado_proyecto.nombre.toUpperCase());
            idDetectado = match ? match.id : null;
          } else if (p.estado_id) { idDetectado = p.estado_id; }
          this.form = { ...p, estado_id: idDetectado ? Number(idDetectado) : null };
          this.form.entregables = p.entregables ? JSON.parse(JSON.stringify(p.entregables)) : [];
          this.miembrosAsignados = p.integrantes || p.Usuarios || [];
        }
      } catch (err) { console.error(err); } finally { this.cargando = false; }
    },
    enviarWhatsapp(te) {
      if (!te) return;
      // Limpiamos el número de cualquier carácter que no sea dígito
      const numLimpio = String(te).replace(/\D/g, '');
      // Asumimos código de país si no lo tiene, o lo dejamos tal cual si es internacional
      const link = `https://wa.me/${numLimpio}`;
      window.open(link, '_blank');
    },
    abrirEnlace(url) {
      if (!url) return;
      const link = url.startsWith('http') ? url : `https://${url}`;
      window.open(link, '_blank');
    },
    agregarEntregableRAM() {
      if (!this.nuevoEntregableNombre.trim()) return;
      this.form.entregables.push({ nombre: this.nuevoEntregableNombre.trim(), link_drive: '', entregado: false, aprobado: false });
      this.nuevoEntregableNombre = '';
    },
    quitarMiembro(id) { this.miembrosAsignados = this.miembrosAsignados.filter(m => m.id !== id); },
    calcularPuntos(uId) {
      return (this.todasLasTareas || []).filter(t => Number(t.responsable_id) === Number(uId) && (Number(t.estado_id) === 2 || Number(t.estado_id) === 3))
        .reduce((acc, t) => acc + (this.prioridades.find(p => p.id === t.prioridad_id)?.peso || 0), 0);
    },
    getColorCarga(pts) { return pts >= 100 ? 'is-danger-badge' : pts >= 50 ? 'is-warning-badge' : 'is-success-badge'; },
    obtenerColorAvatar(rol) { return Number(rol) === 3 ? 'has-background-success-light has-text-success' : 'has-background-link-light has-text-link'; },
    obtenerIniciales(n) { return n ? n.split(' ').map(x => x[0]).join('').toUpperCase().substring(0, 2) : '?'; },
    async buscarUsuarios() {
      if (this.busqueda.length < 2) { this.resultadosBusqueda = []; return; }
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
          ...this.form, usuariosIds: this.miembrosAsignados.map(m => m.id), entregables: this.form.entregables
        }, { headers: { 'Authorization': `Bearer ${authStore.token}` } });
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
.glass-panel { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
.custom-tabs li a { color: #bdc3c7 !important; border-bottom: 2px solid transparent !important; }
.custom-tabs li.is-active a { background-color: rgba(52, 152, 219, 0.2) !important; color: #3498db !important; border-bottom-color: #3498db !important; }
.border-bottom-info { border-bottom: 2px solid rgba(52, 152, 219, 0.3); }

/* BUSCADOR */
.buscador-relativo { position: relative; }
.search-results-floating {
  position: absolute; top: 100%; left: 0; width: 100%; z-index: 1000;
  background: rgba(25, 25, 25, 0.98) !important;
  border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.5); margin-top: 5px;
  max-height: 250px; overflow-y: auto;
}
.dropdown-item-custom { color: #fff !important; display: block; padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; }
.dropdown-item-custom:hover { background: rgba(52, 152, 219, 0.4) !important; }

/* TABLA ENTREGABLES PROFESIONAL */
.delivery-table-v2 { background: transparent !important; }
.delivery-table-v2 td { 
  padding: 1.4rem 0.75rem !important; 
  vertical-align: middle !important;
  border-bottom: 1px solid rgba(255,255,255,0.05) !important;
}
.data-text-bright { color: #ffffff !important; font-size: 1.1rem !important; font-weight: 700; text-shadow: 0px 0px 8px rgba(255, 255, 255, 0.2); }

.custom-input-table {
  background: rgba(0, 0, 0, 0.5) !important; color: #3498db !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  height: 2.8rem !important; font-size: 1rem !important; font-weight: 500;
}
.btn-open-link { height: 2.8rem !important; border: 1px solid rgba(52, 152, 219, 0.3) !important; background: rgba(52, 152, 219, 0.1) !important; }

.custom-input-entregable {
  background: rgba(0, 0, 0, 0.4) !important; color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}
.custom-input-entregable::placeholder { color: rgba(255, 255, 255, 0.85) !important; opacity: 1 !important; font-weight: 500; }

.checkbox-ui { transform: scale(1.4); cursor: pointer; }
.delivery-row:hover { background: rgba(255, 255, 255, 0.03) !important; }

/* OTROS */
.is-dark-box { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; }
.avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.workload-badge { min-width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; color: white; }
.is-success-badge { background: #48c78e; }
.is-warning-badge { background: #ffe08a; color: #947600; }
.is-danger-badge { background: #f14668; }
.uppercase-label { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; font-weight: bold; }
</style>