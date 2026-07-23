<template>
  <div class="container mt-5 px-2-mobile px-4-tablet">
    <!-- ENCABEZADO ADAPTATIVO (Reemplazo de .level por Columnas/Flex para evitar desbordamiento) -->
    <div class="columns is-mobile is-multiline is-align-items-center mb-3">
      <div class="column is-12-mobile is-8-tablet pb-2-mobile">
        <h1 class="title is-size-4-mobile is-size-2-tablet mb-0">Canal de Sugerencias y Errores</h1>
        <h2 class="subtitle is-size-7-mobile is-size-6-tablet has-text-grey mt-1 mb-0">
          {{ esAdmin ? 'Panel de Gestión (Administrador)' : 'Mis Consultas y Reportes' }}
        </h2>
      </div>
      <div class="column is-12-mobile is-4-tablet pt-1-mobile is-flex is-justify-content-flex-end-tablet">
        <button class="button is-primary is-fullwidth-mobile mt-2-mobile" @click="abrirModalNueva">
          <span class="icon"><i class="fas fa-plus"></i></span>
          <span>Enviar Sugerencia</span>
        </button>
      </div>
    </div>

    <hr class="my-3">

    <!-- TABLA DE SUGERENCIAS (Blindada con is-hidden-mobile y truncamiento en celulares) -->
    <div class="box p-0 shadow-sm" style="overflow: hidden;">
      <table class="table is-fullwidth is-hoverable is-striped mb-0">
        <thead class="has-background-light">
          <tr>
            <th class="is-hidden-mobile">Fecha</th>
            <th v-if="esAdmin" class="is-hidden-mobile">Usuario</th>
            <th>Título</th>
            <th class="has-text-centered">Estado</th>
            <th class="has-text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sug in sugerencias" :key="sug.id">
            <td class="has-text-weight-semibold is-vcentered is-hidden-mobile">{{ formatearFecha(sug.createdAt) }}</td>
            
            <td v-if="esAdmin" class="has-text-weight-bold is-vcentered is-hidden-mobile">
              {{ sug.autor?.apellido }}, {{ sug.autor?.nombre }}
            </td>
            <td class="is-vcentered text-truncate-mobile" style="max-width: 180px;">
              {{ sug.titulo }}
              <!-- Subtítulo con fecha solo visible en móviles para no perder la traza temporal -->
              <div class="is-hidden-tablet is-size-7 has-text-grey-light mt-1">
                <i class="far fa-clock mr-1"></i> {{ formatearFecha(sug.createdAt) }}
              </div>
            </td>
            <td class="has-text-centered is-vcentered">
              <span :class="['tag is-small-mobile', sug.estado === 'PENDIENTE' ? 'is-warning' : 'is-success']" style="font-weight: 600;">
                {{ sug.estado }}
              </span>
            </td>
            <td class="has-text-right is-vcentered">
              <button class="button is-small is-info is-light p-2" @click="verDetalle(sug)" title="Ver detalle de la sugerencia">
                <span class="icon is-small"><i class="fas fa-eye"></i></span>
              </button>
            </td>
          </tr>
          <tr v-if="sugerencias.length === 0">
            <td :colspan="esAdmin ? 5 : 4" class="has-text-centered py-5 has-text-grey is-size-7-mobile">
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

<style scoped>
.table th, .table td {
  vertical-align: middle;
}

/* Control de desbordamiento de texto */
.text-truncate-mobile {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Blindaje anti-desbordamiento y ergonomía táctil para móviles de 360px - 400px */
@media (max-width: 768px) {
  .table td, .table th {
    padding: 0.75rem 0.35rem !important;
    font-size: 0.85rem !important;
  }
  
  .tag {
    font-size: 0.75rem !important;
  }
  
  .text-truncate-mobile {
    max-width: 160px;
  }
}
</style>