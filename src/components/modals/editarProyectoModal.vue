<template>
  <div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card" style="width: 80%; max-width: 950px;">
      
      <header class="modal-card-head has-background-primary">
        <p class="modal-card-title has-text-white">Gestionar Proyecto: {{ proyectoOriginal.nombre }}</p>
        <button class="delete" aria-label="close" @click="$emit('close')"></button>
      </header>

      <section class="modal-card-body">
        <div class="columns">
          
          <div class="column is-5">
            <h3 class="title is-5 border-bottom">Información General</h3>
            <div class="field">
              <label class="label">Nombre del Proyecto</label>
              <input class="input" type="text" v-model="form.nombre">
            </div>
            
            <div class="field">
              <label class="label">Estado Global</label>
              <div class="select is-fullwidth">
                <select v-model="form.estado_id">
                  <option v-for="est in estadosProyecto" :key="est.id" :value="est.id">
                    {{ est.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="column is-7">
            <h3 class="title is-5">Equipo y Carga (Scrum/Kanban)</h3>
            
            <div class="miembros-container" style="max-height: 400px; overflow-y: auto;">
              <div class="box p-3 mb-2" v-for="miembro in miembrosAsignados" :key="miembro.id">
                <div class="level is-mobile">
                  <div class="level-left">
                    <div>
                      <p class="is-size-6"><strong>{{ miembro.nombre }}</strong></p>
                      <p class="is-size-7 has-text-grey">{{ miembro.email }}</p>
                    </div>
                  </div>
                  
                  <div class="level-right">
                    <div class="has-text-right mr-4">
                      <p class="heading mb-0">Carga Actual</p>
                      <span :class="['tag is-medium', obtenerColorCarga(miembro.cargaTotal)]">
                        {{ miembro.cargaTotal }} pts
                      </span>
                    </div>
                    <button class="button is-small is-danger is-light" @click="quitarMiembro(miembro.id)">
                      <i class="fas fa-user-minus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="field mt-4">
              <label class="label">Asignar nuevo integrante</label>
              <div class="control has-icons-left">
                <input class="input" type="text" v-model="busqueda" @input="buscarUsuarios" placeholder="Buscar por nombre o email...">
                <div v-if="resultadosBusqueda.length > 0" class="box is-paddingless mt-1" style="position: absolute; z-index: 100; width: 90%;">
                  <aside class="menu">
                    <ul class="menu-list">
                      <li v-for="u in resultadosBusqueda" :key="u.id">
                        <a @click="seleccionarUsuario(u)">
                          <strong>{{ u.nombre }}</strong> 
                          <small class="is-pulled-right">{{ u.email }}</small>
                        </a>
                      </li>
                    </ul>
                  </aside>
                </div>
                <span class="icon is-small is-left"><i class="fas fa-search"></i></span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="$emit('close')">Cancelar</button>
        <button class="button is-success" @click="confirmarCambios">Guardar Cambios</button>
      </footer>

    </div>
  </div>
</template>

<script>
//Agregamos las llaves para que coincida con 'export const'
import { configService } from '../../services/configService';
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
      busqueda: '',          // Aquí se guarda lo que escribís
      resultadosBusqueda: [] // Aquí guardaremos los alumnos que encontremos
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
      // Mapeamos los miembros y calculamos su carga inicial basada en los pesos 
      this.miembrosAsignados = this.miembrosActuales.map(m => ({
        ...m,
        cargaTotal: this.calcularCargaAlumno(m.tareas) 
      }));
    },
    calcularCargaAlumno(tareas) {
      if (!tareas) return 0;
      // Sumamos el peso de cada tarea buscando su valor en prioridadesMaster 
      return tareas.reduce((total, tarea) => {
        const prioridad = this.prioridadesMaster.find(p => p.id === tarea.prioridad_id);
        return total + (prioridad ? prioridad.peso : 0);
      }, 0);
    },
    obtenerColorCarga(puntos) {
      // Lógica de semáforo pedagógico 
      if (puntos >= 60) return 'is-danger';    // Saturado (Rojo)
      if (puntos >= 30) return 'is-warning';   // Carga Media (Amarillo)
      return 'is-success';                     // Disponible (Verde)
    },
    quitarMiembro(id) {
      this.miembrosAsignados = this.miembrosAsignados.filter(m => m.id !== id); 
    },
    async confirmarCambios() {
      // Llamamos a la lógica de guardado real
      await this.actualizarProyecto();
    },
    async actualizarProyecto() {
      try {
        const authStore = useAuthStore();
        
        // 1. Extraemos los IDs finales del equipo
        const usuariosIds = this.miembrosAsignados.map(m => m.id);

        // 2. Armamos el paquete con lo que realmente hay en el formulario
        const datosParaGuardar = {
          nombre: this.form.nombre,      // Antes decía this.proyecto.nombre
          estado_id: this.form.estado_id, // Aprovechamos de guardar el estado
          usuariosIds: usuariosIds
        };

        // 3. Mandamos el PUT usando el ID que vive en form
        await axios.put(`http://localhost:3000/api/proyectos/${this.form.id}`, datosParaGuardar, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });

        // 4. Éxito y limpieza
        alert("Proyecto actualizado con éxito");
        this.$emit('actualizado'); 
        this.$emit('close'); // En lugar de this.close(), que no está definido

      } catch (error) {
        console.error("Error al guardar:", error);
        alert("No se pudo guardar el proyecto. Revisá la consola.");
      }
    },
    async buscarUsuarios() {
        // Si escribiste menos de 2 letras, no buscamos nada
        if (this.busqueda.length < 2) {
          this.resultadosBusqueda = [];
          return;
        }

        try {
        const authStore = useAuthStore(); // Accedemos a Pinia
        
        const response = await axios.get(`http://localhost:3000/api/usuarios?q=${this.busqueda}`, {
          
          headers: {
            // Importante: El espacio después de 'Bearer' es obligatorio por el .split(' ')[1] del backend
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        console.log("Datos recibidos del servidor:", response.data);

        this.resultadosBusqueda = response.data;
      } catch (error) {
        console.error("Error al buscar:", error);
        // Si vuelve a dar 403, revisá la consola para ver el mensaje exacto
      }
    },
    seleccionarUsuario(u) {
      // 1. Lo sumamos a la lista de miembros asignados
      // Le ponemos puntos en 0 por ahora, el cargómetro se encargará después
      this.miembrosAsignados.push({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        puntos: 0 
      });

      // 2. Limpiamos el buscador (esto hace que la lista desaparezca sola)
      this.busqueda = '';
      this.resultadosBusqueda = [];
    }
  }
}
</script>

<style scoped>
.border-bottom { border-bottom: 1px solid #dbdbdb; margin-bottom: 1rem; padding-bottom: 0.5rem; }
.miembros-container::-webkit-scrollbar { width: 5px; }
.miembros-container::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
</style>