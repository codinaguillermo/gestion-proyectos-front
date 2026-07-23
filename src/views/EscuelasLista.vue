<template>
  <div class="container mt-5 px-2-mobile">
    <!-- ENCABEZADO ADAPTATIVO (Reemplazo de .level por Columnas/Flex para evitar desbordamiento) -->
    <div class="columns is-mobile is-multiline is-align-items-center mb-4">
      <div class="column is-12-mobile is-8-tablet pb-2-mobile">
        <button class="button is-small is-light mb-3" @click="$router.back()">
          <span class="icon is-small"><i class="fas fa-arrow-left"></i></span>
          <span>Volver</span>
        </button>
        <h1 class="title is-size-4-mobile is-size-2-tablet mb-0">Gestión de Escuelas</h1>
      </div>
      
      <div class="column is-12-mobile is-4-tablet pt-1-mobile is-flex is-justify-content-flex-end-tablet" v-if="escuelas.length === 0">
        <button class="button is-primary is-fullwidth-mobile mt-2-mobile" @click="abrirModal()">
          <span class="icon"><i class="fas fa-plus"></i></span>
          <span>Nueva Escuela</span>
        </button>
      </div>
    </div>

    <!-- TABLA DE ESCUELAS (Blindada con is-hidden-mobile para celulares) -->
    <div class="box p-3-mobile p-4-tablet">
      <p v-if="escuelas.length === 0" class="has-text-centered has-text-grey py-4">
        No hay ninguna escuela configurada. Por favor, registre la institución.
      </p>

      <div class="table-container mb-0" v-else>
        <table class="table is-fullwidth is-hoverable mb-0">
          <thead>
            <tr>
              <th>Siglas</th>
              <th>Nombre Completo</th>
              <th class="is-hidden-mobile">CUE</th>
              <th class="is-hidden-mobile">Dirección</th>
              <th class="has-text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in escuelas" :key="e.id">
              <td class="is-vcentered"><strong>{{ e.nombre_corto }}</strong></td>
              <td class="is-vcentered text-truncate-mobile" style="max-width: 180px;">{{ e.nombre_largo }}</td>
              <td class="is-vcentered is-hidden-mobile"><span class="tag is-light">{{ e.cue }}</span></td>
              <td class="is-vcentered is-hidden-mobile">{{ e.direccion }}</td>
              <td class="has-text-right is-vcentered">
                <button class="button is-small is-info is-light p-2" @click="abrirModal(e)" title="Editar escuela">
                  <span class="is-hidden-mobile">Editar</span>
                  <span class="icon is-small is-hidden-tablet"><i class="fas fa-edit"></i></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <EscuelaModal 
      :is-active="modalActivo" 
      :escuela-edit="seleccionada" 
      @close="modalActivo = false" 
      @escuela-guardada="cargarEscuelas"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import EscuelaModal from '../components/modals/escuelaModal.vue';

const escuelas = ref([]);
const modalActivo = ref(false);
const seleccionada = ref(null);

const cargarEscuelas = async () => {
  try {
    const res = await api.get('/escuelas');
    escuelas.value = res.data;
  } catch (error) {
    console.error("Error al cargar escuelas:", error);
  }
};

const abrirModal = (escuela = null) => {
  seleccionada.value = escuela;
  modalActivo.value = true;
};

onMounted(cargarEscuelas);
</script>

<style scoped>
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
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>