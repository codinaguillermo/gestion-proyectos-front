<template>
  <div class="container mt-5">
    <div class="mb-4">
      <button class="button is-small is-light mb-3" @click="$router.back()">
        <span class="icon is-small"><i class="fas fa-arrow-left"></i></span>
        <span>Volver</span>
        </button>
    </div>

    <div class="level">
      <div class="level-left">
        <h1 class="title">Gestión de Usuarios</h1>
      </div>
      <div class="level-right">
        <button class="button is-primary" @click="abrirModalNuevo">
          <span class="icon"><i class="fas fa-user-plus"></i></span>
          <span>Nuevo Usuario</span>
        </button>
      </div>
    </div>

    <div class="box">
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

    <div class="table-container box p-0" style="position: relative; min-height: 200px;">
      <div v-if="cargando" class="is-overlay has-background-white-ter is-flex is-align-items-center is-justify-content-center" style="z-index: 10; opacity: 0.7;">
        <div class="loader" style="width: 3rem; height: 3rem; border-width: 4px;"></div>
      </div>

      <table class="table is-fullwidth is-hoverable is-striped">
        <thead class="has-background-light">
          <tr>
            <th>Apellido, Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Escuela/s</th>
            <th class="has-text-centered">Curso/Div</th>
            <th class="has-text-centered">Estado</th>
            <th class="has-text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="usuarios.length === 0 && !cargando">
            <td colspan="7" class="has-text-centered py-5 has-text-grey">
              No se encontraron usuarios con los filtros aplicados.
            </td>
          </tr>

          <tr v-for="u in usuarios" :key="u.id">
            <td class="is-vcentered"><strong>{{ u.apellido ? u.apellido + ', ' : '' }}{{ u.nombre }}</strong></td>
            <td class="is-vcentered">{{ u.email }}</td>
            <td class="is-vcentered">
              <span class="tag is-info is-light">{{ u.rol?.nombre }}</span>
            </td>
            <td class="is-vcentered">
              <div class="tags">
                <span v-for="esc in u.escuelas" 
                    :key="esc.id" 
                    class="tag is-info is-light" 
                    :title="'Nombre oficial: ' + esc.nombre_largo">
                  {{ esc.nombre_corto }}
                </span>
              </div>
            </td>
            <td class="has-text-centered is-vcentered">
              {{ Number(u.rol_id) === 3 ? `${u.curso || ''} ${u.division || ''}` : '-' }}
            </td>
            <td class="has-text-centered is-vcentered">
              <span :class="['tag', u.activo ? 'is-success' : 'is-danger']">
                {{ u.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="has-text-right is-vcentered">
              <button class="button is-small is-warning is-light" @click="abrirModalEditar(u)">
                <span class="icon is-small"><i class="fas fa-edit"></i></span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UsuarioModal 
        v-if="roles.length > 0 && escuelas.length > 0"
        :is-active="modalActivo"
        :usuario-edit="usuarioParaEditar"
        :escuelas="escuelas"
        :roles="roles"
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

const cargarMaestras = async () => {
  try {    
    const [resEscuelas, resRoles] = await Promise.all([
      api.get('/common/escuelas'), 
      api.get('/common/roles')
    ]);
    
    escuelas.value = resEscuelas.data;
    roles.value = resRoles.data;
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

onMounted(() => {
  cargarUsuarios();
  cargarMaestras();
});
</script>

<style scoped>
/* Agregamos una pequeña transición para el loader de Bulma */
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
</style>