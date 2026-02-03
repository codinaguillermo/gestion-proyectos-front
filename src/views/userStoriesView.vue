<template>
  <div class="container mt-5 px-4">
    <div class="level">
      <div class="level-left">
        <div>
          <button class="button is-small is-light mb-3" @click="$router.back()">
            <span class="icon is-small"><i class="fas fa-arrow-left"></i></span>
            <span>Volver</span>
          </button>
          <h1 class="title">Product Backlog</h1>
          <h2 class="subtitle is-6 has-text-grey">Proyecto ID: {{ proyectoId }}</h2>
        </div>
      </div>
      <div class="level-right">
        <button class="button is-primary" @click="isModalActive = true">
          <span class="icon"><i class="fas fa-plus"></i></span>
          <span>Nueva User Story (US)</span>
        </button>
      </div>
    </div>

    <hr>

    <div v-if="cargando" class="notification is-info is-light">
      Refrescando Backlog...
    </div>

    <div v-else-if="userStories && userStories.length > 0">
      <UserStoryCard 
        v-for="us in userStories" 
        :key="us.id" 
        :userStory="us" />
    </div>

    <div v-else class="box has-text-centered py-6">
      <span class="icon is-large has-text-grey-light mb-3">
        <i class="fas fa-list-ul fa-3x"></i>
      </span>
      <p class="is-size-5 has-text-grey">El Product Backlog está vacío.</p>
      <p class="is-size-7 has-text-grey-light">Define las User Stories necesarias para este proyecto.</p>
    </div>

    <div class="modal" :class="{ 'is-active': isModalActive }">
      <div class="modal-background" @click="isModalActive = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Definir Nueva User Story</p>
          <button class="delete" @click="isModalActive = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Título de la US</label>
            <div class="control">
              <input 
                class="input" 
                type="text" 
                v-model="formUS.titulo" 
                placeholder="Ej: Registro de Usuarios"
              >
            </div>
          </div>
          <div class="field">
            <label class="label">Descripción (Formato Estándar)</label>
            <div class="control">
              <textarea 
                class="textarea" 
                v-model="formUS.descripcion" 
                placeholder="Como [usuario], quiero [funcionalidad] para [beneficio]..."
              ></textarea>
            </div>
            <p class="help is-info">Usa el formato: Como... quiero... para...</p>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button 
            @click="crearUserStory" 
            :disabled="enviando"
            class="button is-primary"
          >
            {{ enviando ? 'Guardando...' : 'Añadir al Backlog' }}
          </button>
          <button class="button" @click="isModalActive = false">Cancelar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import UserStoryCard from '../components/userStoryCard.vue';
import userStoryService from '../services/userStory.service';
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api'; 


const route = useRoute();
const proyectoId = ref(null);
const userStories = ref([]); // Antes: tareas
const cargando = ref(true);
const isModalActive = ref(false);
const enviando = ref(false);

// El formulario ahora se refiere a la US
const formUS = reactive({
  titulo: '',
  descripcion: ''
});



const crearUserStory = async () => {
  if (!formUS.titulo) return alert("El título de la US es obligatorio");
  
  enviando.value = true;
  try {
    const payloadUS = {
      proyecto_id: Number(proyectoId.value),
      titulo: String(formUS.titulo).trim(),
      descripcion: String(formUS.descripcion || '').trim(),
      prioridad: 'Media'
    };

    // CAMBIO CLAVE: Usamos el service, no el api.post directo
    const res = await userStoryService.create(payloadUS);
    
    // Si el service devuelve directamente la data o el status
    if (res) { 
      isModalActive.value = false;
      formUS.titulo = '';
      formUS.descripcion = '';
      await cargarUserStories(); 
    }
  } catch (error) {
    console.error("Error al crear US:", error);
    alert("No se pudo crear la US");
  } finally {
    enviando.value = false;
  }
};

const cargarUserStories = async () => {
  cargando.value = true;
  try {
    // Usando el nuevo service que creamos
    const res = await userStoryService.getByProyecto(proyectoId.value);
    userStories.value = res.data;
  } catch (error) {
    console.error("Error al cargar US:", error);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  proyectoId.value = route.params.id;
  cargarUserStories();
});
</script>