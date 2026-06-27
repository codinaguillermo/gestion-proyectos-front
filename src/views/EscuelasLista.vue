<template>
  <div class="container mt-5">
    <div class="level mb-5">
      <div>
          <button class="button is-small is-light mb-3" @click="$router.back()">
            <span class="icon is-small"><i class="fas fa-arrow-left"></i></span>
            <span>Volver</span>
          </button>
          <h1 class="title">Gestión de Escuelas</h1>
        </div>
      
      <div class="level-right" v-if="escuelas.length === 0">
        <button class="button is-primary" @click="abrirModal()">
          <span class="icon"><i class="fas fa-plus"></i></span>
          <span>Nueva Escuela</span>
        </button>
      </div>
    </div>

    <div class="box">
      <p v-if="escuelas.length === 0" class="has-text-centered has-text-grey">
        No hay ninguna escuela configurada. Por favor, registre la institución.
      </p>

      <table class="table is-fullwidth is-hoverable" v-else>
        <thead>
          <tr>
            <th>Siglas</th>
            <th>Nombre Completo</th>
            <th>CUE</th>
            <th>Dirección</th>
            <th class="has-text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in escuelas" :key="e.id">
            <td><strong>{{ e.nombre_corto }}</strong></td>
            <td>{{ e.nombre_largo }}</td>
            <td><span class="tag is-light">{{ e.cue }}</span></td>
            <td>{{ e.direccion }}</td>
            <td class="has-text-right">
              <button class="button is-small is-info is-light" @click="abrirModal(e)">
                Editar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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