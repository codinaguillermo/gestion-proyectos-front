<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card modal-grande">
      
      <header class="modal-card-head has-background-primary">
        <p class="modal-card-title has-text-white is-size-5-mobile">
          {{ esAdminOOwner ? 'Gestionar Proyecto:' : 'Detalles del Proyecto:' }} {{ proyectoOriginal.nombre }}
        </p>
        <button class="delete" aria-label="close" @click="$emit('close')"></button>
      </header>

      <section class="modal-card-body p-5">
        <div class="columns is-multiline">
          
          <div class="column is-12-mobile is-5-tablet border-right-tablet">
            <h3 class="title is-6 border-bottom has-text-grey uppercase-label">Información General</h3>
            
            <div class="columns is-multiline">
              <div class="column is-6">
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
              </div>
              <div class="column is-6">
                <div class="field mb-4">
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
            </div>

            <div class="field mb-3">
              <label class="label is-small">Nombre del Proyecto</label>
              <input class="input" type="text" v-model="form.nombre" :disabled="!esAdminOOwner">
            </div>

            <div class="field mb-4">
              <label class="label is-small">Descripción Breve</label>
              <div class="control">
                <textarea 
                  class="textarea is-small" 
                  rows="2" 
                  v-model="form.descripcion" 
                  :disabled="!esAdminOOwner"
                  placeholder="Resumen introductorio del proyecto...">
                </textarea>
              </div>
            </div>

            <div class="mt-5 pt-4" style="border-top: 2px solid #f5f5f5;">
              <h3 class="title is-6 has-text-grey uppercase-label mb-4">Identidad y Alcances</h3>
              
              <div class="field mb-5">
                <label class="label is-size-7 is-flex is-justify-content-between is-align-items-center">
                  <span>Objetivo General</span>
                  <span v-if="form.objetivoBloqueado" class="tag is-success is-light is-narrow has-text-weight-bold" style="font-size: 0.65rem">APROBADO</span>
                </label>
                <div class="field has-addons">
                  <div class="control is-expanded">
                    <textarea class="textarea is-small" rows="4" v-model="form.objetivo" :readonly="form.objetivoBloqueado" :class="{'has-background-light has-text-grey': form.objetivoBloqueado}" placeholder="Describa el problema y la solución propuesta..."></textarea>
                  </div>
                  <div class="control" v-if="esAdminOOwner">
                    <button class="button is-light" style="height: 100%; min-width: 45px;" @click="form.objetivoBloqueado = !form.objetivoBloqueado" :class="form.objetivoBloqueado ? 'has-text-danger' : 'has-text-link'" title="Habilitar/Bloquear edición">
                      <span class="icon">
                        <i class="fas" :class="form.objetivoBloqueado ? 'fa-lock' : 'fa-lock-open'"></i>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="field mb-5">
                <label class="label is-size-7 is-flex is-justify-content-between is-align-items-center">
                  <span>Alcance del Prototipo (Entrega Real)</span>
                  <span v-if="form.alcancePrototipoBloqueado" class="tag is-success is-light is-narrow has-text-weight-bold" style="font-size: 0.65rem">APROBADO</span>
                </label>
                <div class="field has-addons">
                  <div class="control is-expanded">
                    <textarea class="textarea is-small" rows="4" v-model="form.alcancePrototipo" :readonly="form.alcancePrototipoBloqueado" :class="{'has-background-light has-text-grey': form.alcancePrototipoBloqueado}" placeholder="Detalle técnico de la entrega actual..."></textarea>
                  </div>
                  <div class="control" v-if="esAdminOOwner">
                    <button class="button is-light" style="height: 100%; min-width: 45px;" @click="form.alcancePrototipoBloqueado = !form.alcancePrototipoBloqueado" :class="form.alcancePrototipoBloqueado ? 'has-text-danger' : 'has-text-link'">
                      <span class="icon">
                        <i class="fas" :class="form.alcancePrototipoBloqueado ? 'fa-lock' : 'fa-lock-open'"></i>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="field mb-4">
                <label class="label is-size-7 is-flex is-justify-content-between is-align-items-center">
                  <span>Alcance Producto Final (Escalabilidad)</span>
                  <span v-if="form.alcanceFinalBloqueado" class="tag is-success is-light is-narrow has-text-weight-bold" style="font-size: 0.65rem">APROBADO</span>
                </label>
                <div class="field has-addons">
                  <div class="control is-expanded">
                    <textarea class="textarea is-small" rows="4" v-model="form.alcanceFinal" :readonly="form.alcanceFinalBloqueado" :class="{'has-background-light has-text-grey': form.alcanceFinalBloqueado}" placeholder="Visión del producto a escala masiva..."></textarea>
                  </div>
                  <div class="control" v-if="esAdminOOwner">
                    <button class="button is-light" style="height: 100%; min-width: 45px;" @click="form.alcanceFinalBloqueado = !form.alcanceFinalBloqueado" :class="form.alcanceFinalBloqueado ? 'has-text-danger' : 'has-text-link'">
                      <span class="icon">
                        <i class="fas" :class="form.alcanceFinalBloqueado ? 'fa-lock' : 'fa-lock-open'"></i>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="column is-12-mobile is-7-tablet pl-6-tablet">
            <div class="is-flex is-justify-content-between is-align-items-center border-bottom mb-2">
              <h3 class="title is-6 has-text-grey uppercase-label mb-0">Integrantes ({{ miembrosAsignados.length }})</h3>
              <span class="icon has-text-info is-clickable help-tooltip-down" :data-tooltip="leyendaPrioridades">
                <i class="fas fa-info-circle"></i>
              </span>
            </div>
            
            <div class="miembros-scroll-area mb-2" style="max-height: 240px;">
              <div class="columns is-multiline is-mobile px-2 pt-2">
                <div class="column is-12 p-1" v-for="miembro in miembrosAsignados" :key="miembro.id">
                  <div class="box p-2 mb-0 is-shadowless border-slack">
                    <article class="media is-align-items-center">
                      <figure class="media-left mr-2">
                        <div :class="['avatar-circle-lg', obtenerColorAvatar(miembro.rol_id)]" style="width: 32px; height: 32px; font-size: 0.8rem;">
                          {{ obtenerIniciales(miembro.nombre) }}
                        </div>
                      </figure>
                      <div class="media-content">
                        <p class="is-size-7 mb-0 has-text-weight-bold">
                          {{ miembro.apellido ? miembro.apellido.toUpperCase() + ', ' : '' }}{{ miembro.nombre }}
                        </p>
                      </div>
                      <div class="media-right is-flex is-align-items-center">
                        <div v-if="calcularPuntos(miembro.id) > 0" class="workload-badge mr-2" :class="getColorCarga(calcularPuntos(miembro.id))" style="width: 22px; height: 22px; font-size: 0.65rem;">
                          {{ calcularPuntos(miembro.id) }}
                        </div>
                        <button v-if="esAdminOOwner" class="button is-white is-small" @click="quitarMiembro(miembro.id)">
                          <span class="icon is-small has-text-danger"><i class="fas fa-user-minus"></i></span>
                        </button>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="esAdminOOwner" class="field mb-5 buscador-relativo">
              <div class="control has-icons-left">
                <input class="input is-small is-rounded" type="text" v-model="busqueda" @input="buscarUsuarios" placeholder="Buscar y agregar integrante...">
                <span class="icon is-small is-left"><i class="fas fa-search"></i></span>
                <div v-if="resultadosBusqueda.length > 0" class="box is-paddingless mt-1 search-results-down">
                  <aside class="menu">
                    <ul class="menu-list">
                      <li v-for="u in resultadosBusqueda" :key="u.id">
                        <a @click="seleccionarUsuario(u)" class="p-2 is-size-7">
                          {{ u.apellido?.toUpperCase() }}, {{ u.nombre }}
                        </a>
                      </li>
                    </ul>
                  </aside>
                </div>
              </div>
            </div>

            <div class="is-flex is-justify-content-between is-align-items-center border-bottom mb-2 mt-2">
              <h3 class="title is-6 has-text-grey uppercase-label mb-0">Entregables Requeridos</h3>
            </div>

            <div v-if="esAdminOOwner" class="field has-addons mb-3">
              <div class="control is-expanded">
                <input class="input is-small is-rounded" type="text" v-model="nuevoEntregableNombre" placeholder="Nuevo documento..." @keyup.enter="agregarEntregableRAM">
              </div>
              <div class="control">
                <button class="button is-info is-small is-rounded" @click="agregarEntregableRAM">
                  <span class="icon"><i class="fas fa-plus"></i></span>
                </button>
              </div>
            </div>

            <div class="miembros-scroll-area" style="max-height: 250px; background: white;">
              <table class="table is-fullwidth is-narrow is-size-7">
                <thead>
                  <tr class="has-background-white-bis">
                    <th>Nombre</th>
                    <th>Link Drive</th>
                    <th class="has-text-centered">E</th>
                    <th class="has-text-centered">A</th>
                    <th v-if="esAdminOOwner"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(e, index) in form.entregables" :key="e.id || index">
                    <td><strong>{{ e.nombre }}</strong></td>
                    <td><input class="input is-small is-size-7 h-auto py-0" type="text" v-model="e.link_drive" placeholder="URL..."></td>
                    <td class="has-text-centered"><input type="checkbox" v-model="e.entregado" :disabled="!esAdminOOwner"></td>
                    <td class="has-text-centered"><input type="checkbox" v-model="e.aprobado" :disabled="!esAdminOOwner"></td>
                    <td v-if="esAdminOOwner"><a class="has-text-danger" @click="quitarEntregableRAM(index)"><i class="fas fa-trash-alt"></i></a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-flex-end p-4">
        <button class="button" @click="$emit('close')">{{ esAdminOOwner ? 'Cancelar' : 'Cerrar' }}</button>
        <button class="button is-success" @click="confirmarCambios"><span>Guardar Cambios</span></button>
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
      form: { 
        ...this.proyectoOriginal, 
        escuela_id: this.proyectoOriginal.escuela_id,
        descripcion: this.proyectoOriginal.descripcion || '',
        objetivo: this.proyectoOriginal.objetivo || '',
        objetivoBloqueado: !!this.proyectoOriginal.objetivoBloqueado,
        alcancePrototipo: this.proyectoOriginal.alcancePrototipo || '',
        alcancePrototipoBloqueado: !!this.proyectoOriginal.alcancePrototipoBloqueado,
        alcanceFinal: this.proyectoOriginal.alcanceFinal || '',
        alcanceFinalBloqueado: !!this.proyectoOriginal.alcanceFinalBloqueado,
        entregables: this.proyectoOriginal.entregables 
          ? JSON.parse(JSON.stringify(this.proyectoOriginal.entregables)) 
          : []
      },
      estadosProyecto: [],
      prioridades: [], 
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
      return user && (Number(user.rol_id) === 1 || Number(user.id) === Number(this.proyectoOriginal?.docente_owner_id));
    },
    leyendaPrioridades() {
      if (!this.prioridades || this.prioridades.length === 0) return "Cargando escala de puntos...";
      const escala = this.prioridades.map(p => `• ${p.nombre}: ${p.peso} pts`).join('\n');
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
      } catch (e) { console.error("Error cargando configuraciones:", e); }
    },
    prepararMiembros() {
      const lista = this.proyectoOriginal?.integrantes || this.proyectoOriginal?.Usuarios || [];
      this.miembrosAsignados = lista.map(m => ({ ...m }));
    },
    agregarEntregableRAM() {
      if (!this.nuevoEntregableNombre.trim()) return;
      this.form.entregables.push({
        nombre: this.nuevoEntregableNombre.trim(),
        link_drive: '',
        entregado: false,
        aprobado: false
      });
      this.nuevoEntregableNombre = '';
    },
    quitarEntregableRAM(index) {
      this.form.entregables.splice(index, 1);
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
            const res = await axios.get(`/api/usuarios?q=${this.busqueda}`, {
                headers: { 'Authorization': `Bearer ${authStore.token}` }
            });
            const idEscuelaProyecto = Number(this.proyectoOriginal.escuela_id);
            this.resultadosBusqueda = res.data.filter(u => {
                if (!u.activo) return false;
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
        await axios.put(`/api/proyectos/${this.form.id}`, {
          ...this.form,
          usuariosIds: this.miembrosAsignados.map(m => m.id),
          entregables: this.form.entregables
        }, { headers: { 'Authorization': `Bearer ${authStore.token}` } });
        
        this.$emit('actualizado');
        this.$emit('close');
      } catch (e) { 
        console.error("Error al guardar cambios:", e);
      }
    }
  }
}
</script>

<style scoped>
.modal-grande { width: 95%; max-width: 1100px; height: 90vh; }
.modal-card-body { overflow-y: visible !important; }
.miembros-scroll-area { overflow-y: auto; background: #fafafa; border-radius: 8px; border: 1px solid #eee; }
.avatar-circle-lg { border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.buscador-relativo { position: relative; }
.border-right-tablet { border-right: 1px solid #dbdbdb; }
.pl-6-tablet { padding-left: 2rem !important; } 
.border-slack { border: 1px solid #e1e4e8; border-radius: 10px; background: white; }
.uppercase-label { text-transform: uppercase; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px; }
.workload-badge { border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.is-success-badge { background-color: #48c78e; }
.is-warning-badge { background-color: #ffe08a; color: #947600; }
.is-danger-badge { background-color: #f14668; }
.help-tooltip-down:hover::after { content: attr(data-tooltip); position: absolute; top: 130%; right: 0; background: #2c3e50; color: white; padding: 14px; border-radius: 8px; font-size: 0.85rem; white-space: pre-wrap; z-index: 1000; width: 280px; line-height: 1.5; box-shadow: 0 6px 20px rgba(0,0,0,0.4); text-align: left; }
.search-results-down { position: absolute; top: 100%; left: 0; width: 100%; max-height: 250px; overflow-y: auto; z-index: 9999; background: white; border: 1px solid #dbdbdb; box-shadow: 0 8px 15px rgba(0,0,0,0.2); }
.h-auto { height: auto !important; }
</style>