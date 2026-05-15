<template>
  <div class="dashboard-bg">
    <div class="container pt-6 px-4 pb-6">
      <div class="level mb-6 glass-panel p-5">
        <div class="level-left">
          <div>
            <h1 class="title has-text-white is-2 mb-1">
              <span class="icon mr-3"><i class="fas fa-envelope-open-text"></i></span>
              Mensajería Docente
            </h1>
            <p class="subtitle is-6 has-text-grey-light uppercase-label">Notas y recordatorios de colaboración</p>
          </div>
        </div>
        <div class="level-right">
          <button class="button is-info is-medium has-text-weight-bold" @click="abrirModalNuevaNota">
            <span class="icon"><i class="fas fa-pen"></i></span>
            <span>NUEVA NOTA</span>
          </button>
        </div>
      </div>

      <div class="field mb-6">
        <label class="label has-text-white uppercase-label">Filtrar vista por Proyecto</label>
        <div class="control has-icons-left">
          <div class="select is-fullwidth is-dark">
            <select v-model="proyectoFiltro">
              <option :value="null">Todos los proyectos</option>
              <option v-for="p in proyectos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>
          <span class="icon is-left has-text-info"><i class="fas fa-filter"></i></span>
        </div>
      </div>

      <div v-if="cargando" class="notification glass-notification is-info">
        <i class="fas fa-spinner fa-pulse mr-2"></i> Cargando tus mensajes...
      </div>

      <div v-else class="columns is-multiline">
        <div class="column is-4" v-for="nota in notasFiltradas" :key="nota.id">
          <div class="box is-dark-box h-100 nota-card">
            <div class="is-flex is-justify-content-between is-align-items-center mb-4">
              <span class="tag is-medium has-text-weight-bold" :class="obtenerColorTipo(nota.tipo)">
                {{ nota.tipo }}
              </span>
              
              <button class="button is-ghost btn-status" @click="toggleEstado(nota)" :title="nota.estado">
                <span class="icon is-medium">
                  <i class="fas fa-2x" 
                     :class="nota.estado === 'TERMINADA' ? 'fa-check-circle has-text-success' : 'fa-circle has-text-grey-darker'">
                  </i>
                </span>
              </button>
            </div>
            
            <h3 class="title is-5 has-text-white mb-2">{{ nota.titulo }}</h3>
            <p class="has-text-grey-lighter is-size-6 mb-5">{{ nota.descripcion }}</p>
            
            <div class="nota-footer mt-auto pt-3">
              <div class="is-flex is-align-items-center is-justify-content-between">
                <div class="is-size-7 has-text-grey-light">
                  <p><i class="fas fa-paper-plane mr-1"></i> {{ nota.creador?.nombre }}</p>
                  <p><i class="fas fa-user-tag mr-1"></i> {{ nota.destinatario?.nombre }}</p>
                </div>
                <div class="has-text-right">
                  <span class="tag is-dark is-rounded border-info">{{ nota.proyecto?.nombre }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="notasFiltradas.length === 0" class="column is-12 has-text-centered py-6">
          <i class="fas fa-comment-slash fa-4x has-text-grey-dark mb-4"></i>
          <p class="has-text-grey is-size-5">No hay notas o recordatorios para mostrar.</p>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ 'is-active': modalActivo }">
      <div class="modal-background" @click="modalActivo = false"></div>
      <div class="modal-card glass-panel">
        <header class="modal-card-head has-background-dark">
          <p class="modal-card-title has-text-white">Nueva Nota Docente</p>
          <button class="delete" @click="modalActivo = false"></button>
        </header>
        <section class="modal-card-body has-background-dark">
          <div class="field">
            <label class="label has-text-white">Proyecto</label>
            <div class="control">
              <div class="select is-fullwidth is-dark">
                <select v-model="form.proyecto_id">
                  <option :value="null">Seleccionar proyecto...</option>
                  <option v-for="p in proyectos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label has-text-white">Para</label>
            <div class="control">
              <div class="select is-fullwidth is-dark">
                <select v-model="form.destino_id">
                  <option v-for="u in destinatariosDisponibles" :key="u.id" :value="u.id">
                    {{ u.apellido }}, {{ u.nombre }} {{ Number(u.id) === miId ? '(Yo)' : '' }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column is-8">
              <div class="field">
                <label class="label has-text-white">Título</label>
                <div class="control"><input class="input is-dark" v-model="form.titulo"></div>
              </div>
            </div>
            <div class="column is-4">
              <div class="field">
                <label class="label has-text-white">Tipo</label>
                <div class="control">
                  <div class="select is-fullwidth is-dark">
                    <select v-model="form.tipo">
                      <option>Recordatorio</option>
                      <option>Tarea</option>
                      <option>Aviso importante</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label has-text-white">Descripción</label>
            <div class="control">
              <textarea class="textarea is-dark" v-model="form.descripcion" maxlength="250" rows="3"></textarea>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot has-background-dark is-justify-content-end">
          <button class="button is-success" @click="guardarNota" :class="{ 'is-loading': enviando }" :disabled="!formValido">ENVIAR</button>
          <button class="button" @click="modalActivo = false">Cancelar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { notaService } from '../services/nota.service';
import api from '../services/api';

const authStore = useAuthStore();
const miId = computed(() => Number(authStore.usuario?.id));

const notas = ref([]);
const proyectos = ref([]);
const docentesGlobales = ref([]);
const cargando = ref(true);
const enviando = ref(false);
const modalActivo = ref(false);
const proyectoFiltro = ref(null);

const form = reactive({
  titulo: '',
  descripcion: '',
  tipo: 'Recordatorio',
  proyecto_id: null,
  destino_id: null
});

const formValido = computed(() => form.titulo && form.descripcion && form.proyecto_id && form.destino_id);

const notasFiltradas = computed(() => {
  if (!proyectoFiltro.value) return notas.value;
  return notas.value.filter(n => n.proyecto_id === proyectoFiltro.value);
});

const destinatariosDisponibles = computed(() => {
  let lista = [];
  if (!form.proyecto_id) {
    lista = docentesGlobales.value;
  } else {
    const proj = proyectos.value.find(p => p.id === form.proyecto_id);
    lista = proj?.integrantes?.filter(i => [1, 2].includes(Number(i.rol_id))) || docentesGlobales.value;
  }
  if (!lista.some(u => Number(u.id) === miId.value) && authStore.usuario) {
    return [authStore.usuario, ...lista];
  }
  return lista;
});

const cargarDatos = async () => {
  cargando.value = true;
  try {
    const [resNotas, resProyectos, resDocentes] = await Promise.all([
      notaService.getMisNotas(),
      api.get('proyectos'), 
      api.get('usuarios')   
    ]);
    if (resNotas.success) notas.value = resNotas.data;
    proyectos.value = resProyectos.data;
    docentesGlobales.value = resDocentes.data.filter(u => [1, 2].includes(Number(u.rol_id)));
  } catch (error) { console.error(error); } 
  finally { cargando.value = false; }
};

const abrirModalNuevaNota = () => {
  form.destino_id = miId.value;
  modalActivo.value = true;
};

const guardarNota = async () => {
  enviando.value = true;
  const res = await notaService.crear(form);
  if (res.success) {
    modalActivo.value = false;
    form.titulo = ''; form.descripcion = ''; form.proyecto_id = null;
    await cargarDatos();
  }
  enviando.value = false;
};

const toggleEstado = async (nota) => {
  const res = await notaService.toggleEstado(nota.id);
  if (res.success) nota.estado = res.data.estado;
};

const obtenerColorTipo = (t) => {
  if (t === 'Tarea') return 'is-info';
  if (t === 'Aviso importante') return 'is-danger';
  return 'is-warning';
};

onMounted(cargarDatos);
</script>

<style scoped>
.dashboard-bg { min-height: 100vh; background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('../assets/fondo.jpg'); background-size: cover; background-attachment: fixed; }
.glass-panel { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
.is-dark-box { display: flex; flex-direction: column; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; transition: all 0.3s ease; }
.nota-card:hover { border-color: #3498db; box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
.btn-status { height: auto; padding: 0; transition: transform 0.2s ease; }
.btn-status:hover { transform: scale(1.2); background: transparent !important; }
.border-info { border: 1px solid #3498db; }
.uppercase-label { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px; font-weight: bold; color: #3498db; }
.nota-footer { border-top: 1px solid rgba(255,255,255,0.1); }
</style>