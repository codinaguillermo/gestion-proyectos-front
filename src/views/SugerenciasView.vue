<template>
  <div class="container mt-5 px-4">
    <div class="level">
      <div class="level-left">
        <div>
          <h1 class="title">Canal de Sugerencias y Errores</h1>
          <h2 class="subtitle is-6 has-text-grey">
            {{ esAdmin ? 'Panel de Gestión (Administrador)' : 'Mis Consultas y Reportes' }}
          </h2>
        </div>
      </div>
      <div class="level-right">
        <button class="button is-primary" @click="abrirModalNueva">
          <span class="icon"><i class="fas fa-plus"></i></span>
          <span>Enviar Sugerencia</span>
        </button>
      </div>
    </div>

    <hr>

    <div class="box p-0 shadow-sm" style="overflow: hidden;">
      <table class="table is-fullwidth is-hoverable is-striped mb-0">
        <thead class="has-background-light">
          <tr>
            <th>Fecha</th>
            <th v-if="esAdmin">Usuario</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sug in sugerencias" :key="sug.id">
            <td class="has-text-weight-semibold">{{ formatearFecha(sug.createdAt) }}</td>
            
            <td v-if="esAdmin" class="has-text-weight-bold">
              {{ sug.autor?.apellido }}, {{ sug.autor?.nombre }}
            </td>
            <td>{{ sug.titulo }}</td>
            <td>
              <span :class="['tag', sug.estado === 'PENDIENTE' ? 'is-warning' : 'is-success']">
                {{ sug.estado }}
              </span>
            </td>
            <td>
              <button class="button is-small is-info is-light" @click="verDetalle(sug)">
                <span class="icon is-small"><i class="fas fa-eye"></i></span>
              </button>
            </td>
          </tr>
          <tr v-if="sugerencias.length === 0">
            <td colspan="5" class="has-text-centered py-5 has-text-grey">
              No se encontraron sugerencias.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <SugerenciaModal 
      :is-active="mostrarModalNueva"
      @close="mostrarModalNueva = false"
      @sugerencia-enviada="cargarSugerencias"
    />

    <SugerenciaDetalleModal 
      :is-active="mostrarModalDetalle"
      :sugerencia="sugerenciaSeleccionada"
      @close="cerrarDetalle"
      @respuesta-enviada="cargarSugerencias"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import sugerenciaService from '../services/sugerencia.service';
import { useAuthStore } from '../stores/auth';

// Importación de componentes
import SugerenciaModal from '../components/modals/crearSugerenciaModal.vue';
import SugerenciaDetalleModal from '../components/modals/editarSugerenciaModal.vue';

const authStore = useAuthStore();
const sugerencias = ref([]);
const cargando = ref(true);

// Estados para control de modales
const mostrarModalNueva = ref(false);
const mostrarModalDetalle = ref(false);
const sugerenciaSeleccionada = ref(null);

const esAdmin = computed(() => Number(authStore.usuario?.rol_id) === 1);

const cargarSugerencias = async () => {
  try {
    const res = await sugerenciaService.getAll();
    sugerencias.value = res.data.data;
  } catch (error) {
    console.error("Error al cargar:", error);
  } finally {
    cargando.value = false;
  }
};

const abrirModalNueva = () => {
  mostrarModalNueva.value = true;
};

const verDetalle = (sug) => {
  sugerenciaSeleccionada.value = sug;
  mostrarModalDetalle.value = true;
};

const cerrarDetalle = () => {
  mostrarModalDetalle.value = false;
  sugerenciaSeleccionada.value = null;
};

const formatearFecha = (f) => {
  if (!f) return '';
  return new Date(f).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(cargarSugerencias);
</script>