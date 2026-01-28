<template>
  <div>
    <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
      <div class="container">
        <div class="navbar-brand">
          <a class="navbar-item has-text-weight-bold" href="#">
            SISTEMA GESTIÓN
          </a>
        </div>

        <div class="navbar-menu is-active">
          <div class="navbar-end">
            <div class="navbar-item has-text-white">
              <span class="mr-3">Hola, <strong>{{ authStore.user?.nombre || 'Usuario' }}</strong></span>
            </div>
            <div class="navbar-item">
              <div class="buttons">
                <button class="button is-danger is-small" @click="handleLogout">
                  <span class="icon is-small"><i class="fas fa-sign-out-alt"></i></span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mt-5 px-4">
      <div class="level">
        <div class="level-left">
          <h1 class="title">Mis Proyectos</h1>
        </div>
        <div class="level-right">
          <button class="button is-primary" @click="abrirModal">
            <span class="icon"><i class="fas fa-plus"></i></span>
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      <div v-if="cargando" class="notification is-info is-light">Cargando proyectos...</div>
      <div v-if="errorMsg" class="notification is-danger is-light">{{ errorMsg }}</div>

      <div class="box" v-if="!cargando && !errorMsg">
        <table class="table is-fullwidth is-hoverable is-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="proyecto in proyectos" :key="proyecto.id">
              <td><strong>{{ proyecto.nombre }}</strong></td>
              <td>{{ proyecto.descripcion }}</td>
              <td>
                <span class="tag is-primary is-light">
                  {{ proyecto.estado_proyecto?.nombre || 'Sin estado' }}
                </span>
              </td>
              <td>{{ formatearFecha(proyecto.created_at) }}</td>
            </tr>
            <tr v-if="proyectos.length === 0">
              <td colspan="4" class="has-text-centered">No hay proyectos para mostrar.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal" :class="{ 'is-active': isModalActive }">
      <div class="modal-background" @click="isModalActive = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Nuevo Proyecto</p>
          <button class="delete" aria-label="close" @click="isModalActive = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Nombre del Proyecto</label>
            <div class="control">
              <input class="input" type="text" v-model="formProyecto.nombre" placeholder="Ej: App de Asistencia">
            </div>
          </div>
          <div class="field">
            <label class="label">Descripción</label>
            <div class="control">
              <textarea class="textarea" v-model="formProyecto.descripcion" placeholder="¿De qué se trata el proyecto?"></textarea>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click="guardarProyecto" :class="{ 'is-loading': enviando }">
            Guardar Proyecto
          </button>
          <button class="button" @click="isModalActive = false">Cancelar</button>
        </footer>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
// Este es el import que vamos a usar ahora mismo:
import { projectService } from '../services/project.services'; 

const authStore = useAuthStore();
const router = useRouter();

// --- 1. Variables de Estado de la Tabla ---
const proyectos = ref([]);
const cargando = ref(false);
const errorMsg = ref('');

// --- 2. Variables del Modal y Formulario ---
const isModalActive = ref(false);
const enviando = ref(false);
const formProyecto = reactive({
    nombre: '',
    descripcion: ''
});

// --- 3. Funciones de Lógica ---

const handleLogout = () => {
    authStore.logout();
    router.push('/login');
};

const cargarProyectos = async () => {
    cargando.value = true;
    errorMsg.value = ''; // Limpiamos errores previos
    
    // AQUÍ usamos el import que decías que nadie usaba:
    const res = await projectService.getAll();
    
    if (res.success) {
        proyectos.value = res.data;
    } else {
        errorMsg.value = res.error;
    }
    cargando.value = false;
};

const abrirModal = () => {
    formProyecto.nombre = '';
    formProyecto.descripcion = '';
    isModalActive.value = true;
};

const guardarProyecto = async () => {
    if (!formProyecto.nombre) return alert("El nombre es obligatorio");
    
    enviando.value = true;
    const res = await projectService.create(formProyecto);
    
    if (res.success) {
        isModalActive.value = false;
        await cargarProyectos(); // Recarga la tabla para mostrar el nuevo
    } else {
        alert(res.error);
    }
    enviando.value = false;
};

const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return '-';
    return new Date(fechaRaw).toLocaleDateString('es-AR');
};

// --- 4. Disparo inicial ---
onMounted(() => {
    cargarProyectos();
});
</script>

<script>
/* ¿Qué hace que esto funcione?
v-if="cargando": Mientras Axios espera la respuesta del Node, mostramos un aviso amigable.

v-for="proy in proyectos": Este es el "bucle" de Vue. Por cada objeto que encontró en la base de datos, crea una fila <tr> nueva.

:key="proy.id": Fundamental para que Vue no se maree. Le damos el ID único de la base de datos para que sepa qué fila es cuál.
*/
</script>