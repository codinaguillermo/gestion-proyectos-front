<template>
  <div class="container mt-5 px-2-mobile">
    <div class="mb-4">
      <button class="button is-small is-light mb-3" @click="$router.back()">
        <span class="icon is-small"><i class="fas fa-arrow-left"></i></span>
        <span>Volver</span>
      </button>
    </div>

    <!-- ENCABEZADO ADAPTATIVO (Reemplazo de .level por Columnas/Flex para evitar desbordamiento) -->
    <div class="columns is-mobile is-multiline is-align-items-center mb-4">
      <div class="column is-12-mobile is-7-tablet pb-2-mobile">
        <h1 class="title is-size-4-mobile is-size-2-tablet mb-0">Gestión de Usuarios</h1>
      </div>
      <div class="column is-12-mobile is-5-tablet pt-1-mobile is-flex is-justify-content-flex-end-tablet">
        <button class="button is-primary is-fullwidth-mobile" @click="abrirModalNuevo">
          <span class="icon"><i class="fas fa-user-plus"></i></span>
          <span>Nuevo Usuario</span>
        </button>
      </div>
    </div>

    <!-- CAJA DE FILTROS (Se apila automáticamente en móviles) -->
    <div class="box p-3-mobile p-4-tablet">
      <div class="columns is-vcentered">
        <div class="column is-4">
          <div class="control has-icons-left">
            <input 
              v-model="filtros.q" 
              class="input" 
              type="text" 
              placeholder="Buscar por nombre, apellido o email..."
              @input="cargarUsuarios"
            >
            <span class="icon is-left"><i class="fas fa-search"></i></span>
          </div>
        </div>
        <div class="column is-3">
          <div class="select is-fullwidth">
            <select v-model="filtros.curso" @change="cargarUsuarios">
              <option value="">Todos los Cursos</option>
              <option v-for="n in 6" :key="n" :value="n + 'to'">{{ n }}to Año</option>
            </select>
          </div>
        </div>
        <div class="column is-3">
          <div class="select is-fullwidth">
            <select v-model="filtros.division" @change="cargarUsuarios">
              <option value="">Todas las Divisiones</option>
              <option value="1ra">1ra</option>
              <option value="2da">2da</option>
              <option value="3ra">3ra</option>
              <option value="4ta">4ta</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
        </div>
        <div class="column is-2">
          <button class="button is-link is-light is-fullwidth" @click="limpiarFiltros">
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- TABLA DE USUARIOS (Blindada con is-hidden-mobile para celulares) -->
    <div class="table-container box p-0" style="position: relative; min-height: 200px;">
      <div v-if="cargando" class="is-overlay has-background-white-ter is-flex is-align-items-center is-justify-content-center" style="z-index: 10; opacity: 0.7;">
        <div class="loader" style="width: 3rem; height: 3rem; border-width: 4px;"></div>
      </div>

      <table class="table is-fullwidth is-hoverable is-striped mb-0">
        <thead class="has-background-light">
          <tr>
            <th>Apellido, Nombre</th>
            <th class="is-hidden-mobile">Email</th>
            <th>Rol</th>
            <th class="is-hidden-mobile">Escuela/s</th>
            <th class="has-text-centered is-hidden-mobile">Especialidad</th> 
            <th class="has-text-centered is-hidden-mobile">Curso/Div</th>
            <th class="has-text-centered">Estado</th>
            <th class="has-text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="usuarios.length === 0 && !cargando">
            <td colspan="8" class="has-text-centered py-5 has-text-grey">
              No se encontraron usuarios con los filtros aplicados.
            </td>
          </tr>

          <tr v-for="u in usuarios" :key="u.id">
            <td class="is-vcentered text-truncate-mobile">
              <strong>{{ u.apellido ? u.apellido + ', ' : '' }}{{ u.nombre }}</strong>
            </td>
            <td class="is-vcentered is-hidden-mobile">{{ u.email }}</td>
            <td class="is-vcentered">
              <span class="tag is-info is-light is-normal">{{ u.rol?.nombre }}</span>
            </td>
            <td class="is-vcentered is-hidden-mobile">
              <div class="tags mb-0">
                <span v-for="esc in u.escuelas" 
                    :key="esc.id" 
                    class="tag is-info is-light" 
                    :title="'Nombre oficial: ' + esc.nombre_largo">
                  {{ esc.nombre_corto }}
                </span>
              </div>
            </td>
            <td class="has-text-centered is-vcentered is-hidden-mobile">
              <span v-if="Number(u.rol_id) === 3" class="tag is-white">
                {{ getEspecialidadNombre(u) }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="has-text-centered is-vcentered is-hidden-mobile">
              {{ Number(u.rol_id) === 3 ? `${u.curso || ''} ${u.division || ''}` : '-' }}
            </td>
            <td class="has-text-centered is-vcentered">
              <span :class="['tag', u.activo ? 'is-success' : 'is-danger']">
                {{ u.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="has-text-right is-vcentered">
              <button class="button is-small is-warning is-light p-2" @click="abrirModalEditar(u)" title="Editar usuario">
                <span class="icon is-small"><i class="fas fa-edit"></i></span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UsuarioModal 
        v-if="roles.length > 0 && escuelas.length > 0 && especialidades.length > 0"
        :is-active="modalActivo"
        :usuario-edit="usuarioParaEditar"
        :escuelas="escuelas"
        :roles="roles"
        :especialidades="especialidades"
        @close="modalActivo = false"
        @usuario-guardado="cargarUsuarios"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import usuarioService from '../services/usuario.services';
import api from '../services/api';
import UsuarioModal from '../components/modals/usuarioModal.vue';

const usuarios = ref([]);
const escuelas = ref([]);
const roles = ref([]);
const especialidades = ref([]); 
const filtros = reactive({ q: '', curso: '', division: '' });
const cargando = ref(false);

const modalActivo = ref(false);
const usuarioParaEditar = ref(null);

const cargarUsuarios = async () => {
  cargando.value = true;
  try {
    const res = await usuarioService.getAll(filtros);
    usuarios.value = res.data;
  } catch (err) {
    console.error("Error al cargar usuarios", err);
  } finally {
    cargando.value = false;
  }
};


const getEspecialidadNombre = (u) => {
  if (!u || !especialidades.value.length) return '-';
  const id = u.especialidad_id || u.id_especialidad || u.especialidadId;
  const encontrada = especialidades.value.find(e => e.id == id);
  return encontrada ? encontrada.nombre : '-';
};

const cargarMaestras = async () => {  
  try {    
    const [resEscuelas, resRoles, resEspecialidades] = await Promise.all([
      api.get('/common/escuelas'), 
      api.get('/common/roles'),
      api.get('/common/especialidades') 
    ]);
    
    escuelas.value = resEscuelas.data;
    roles.value = resRoles.data;
    especialidades.value = resEspecialidades.data; 
    console.log("ESPECIALIDADES CARGADAS:", especialidades.value);
  } catch (err) {
    console.error("Error cargando maestras", err);
  }
};

const abrirModalNuevo = () => {
  usuarioParaEditar.value = null;
  modalActivo.value = true;
};

const abrirModalEditar = (u) => {
  usuarioParaEditar.value = { ...u };
  modalActivo.value = true;
};

const limpiarFiltros = () => {
  filtros.q = '';
  filtros.curso = '';
  filtros.division = '';
  cargarUsuarios();
};

// ARREGLADO: Cargamos primero las maestras para asegurar que los nombres estén disponibles
onMounted(async () => {
  await cargarMaestras();
  await cargarUsuarios();
});
</script>

<style scoped>
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3273dc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Blindaje anti-desbordamiento y ajuste de celdas para pantallas móviles de 360px - 400px */
@media (max-width: 768px) {
  .table td, .table th {
    padding: 0.75rem 0.35rem !important;
    font-size: 0.85rem !important;
  }
  
  .tag {
    font-size: 0.75rem !important;
  }
  
  .text-truncate-mobile {
    max-width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>