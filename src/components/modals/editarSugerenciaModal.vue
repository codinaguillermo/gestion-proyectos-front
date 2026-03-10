<template>
  <div :class="['modal', { 'is-active': isActive }]">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-size-5">Detalle de la Sugerencia</p>
        <button class="delete" @click="$emit('close')"></button>
      </header>
      <section class="modal-card-body">
        <div class="box has-background-light">
          <p class="is-size-7 has-text-grey mb-1">
            <strong>Enviado por:</strong> {{ sugerencia?.autor?.nombre }} {{ sugerencia?.autor?.apellido }} 
            ({{ formatearFecha(sugerencia?.createdAt) }})
          </p>
          <h3 class="title is-5 mb-2">{{ sugerencia?.titulo }}</h3>
          <p class="is-family-secondary">{{ sugerencia?.descripcion }}</p>
        </div>

        <hr>

        <div class="field">
          <label class="label">Respuesta del Administrador</label>
          
          <div v-if="esAdmin && sugerencia?.estado === 'PENDIENTE'" class="control">
            <textarea 
              v-model="respuesta" 
              class="textarea" 
              placeholder="Escribí acá tu respuesta o solución..."
              rows="4"
            ></textarea>
          </div>

          <div v-else class="notification is-info is-light">
            <p v-if="sugerencia?.respuesta_admin">
              {{ sugerencia.respuesta_admin }}
            </p>
            <p v-else class="has-text-grey is-italic">
              Aún no hay una respuesta oficial.
            </p>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <button 
          v-if="esAdmin && sugerencia?.estado === 'PENDIENTE'"
          class="button is-success" 
          :class="{'is-loading': enviando}"
          :disabled="!respuesta"
          @click="enviarRespuesta"
        >
          Enviar Respuesta
        </button>
        <button class="button" @click="$emit('close')">Cerrar</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import sugerenciaService from '../../services/sugerencia.service';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  isActive: Boolean,
  sugerencia: Object
});

const emit = defineEmits(['close', 'respuesta-enviada']);
const authStore = useAuthStore();

const respuesta = ref('');
const enviando = ref(false);
const esAdmin = computed(() => Number(authStore.usuario?.rol_id) === 1);

// Limpiar el campo cuando se abre una nueva sugerencia
watch(() => props.isActive, (val) => {
  if (val) respuesta.value = '';
});

const enviarRespuesta = async () => {
  enviando.value = true;
  try {
    await sugerenciaService.responder(props.sugerencia.id, { 
      respuesta_admin: respuesta.value 
    });
    emit('respuesta-enviada');
    emit('close');
  } catch (error) {
    console.error("Error al responder:", error);
  } finally {
    enviando.value = false;
  }
};

const formatearFecha = (f) => f ? new Date(f).toLocaleString('es-AR') : '';
</script>