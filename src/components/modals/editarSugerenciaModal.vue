<template>
  <div :class="['modal', { 'is-active': isActive }]">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title is-size-5 text-truncate-mobile">Detalle de la Sugerencia</p>
        <button class="delete" @click="$emit('close')"></button>
      </header>
      <section class="modal-card-body">
        <div class="box has-background-light p-3-mobile">
          <p class="is-size-7 has-text-grey mb-1">
            <strong>Enviado por:</strong> {{ sugerencia?.autor?.nombre }} {{ sugerencia?.autor?.apellido }} 
            <span class="is-inline-block">({{ formatearFecha(sugerencia?.createdAt) }})</span>
          </p>
          <h3 class="title is-size-6-mobile is-size-5-tablet mb-2">{{ sugerencia?.titulo }}</h3>
          <p class="is-family-secondary texto-envolvente">{{ sugerencia?.descripcion }}</p>
        </div>

        <hr class="my-3">

        <div class="field">
          <label class="label is-size-7-mobile">Respuesta del Administrador</label>
          
          <div v-if="esAdmin && sugerencia?.estado === 'PENDIENTE'" class="control">
            <textarea 
              v-model="respuesta" 
              class="textarea is-medium-tablet is-small-mobile custom-textarea-mobile" 
              placeholder="Escribí acá tu respuesta o solución..."
              rows="4"
            ></textarea>
          </div>

          <div v-else class="notification is-info is-light p-3 is-size-7-mobile texto-envolvente">
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

<style scoped>
/* Ajuste de texto para descripciones y reportes largos */
.texto-envolvente {
  word-break: break-word;
  overflow-wrap: anywhere;
}

.text-truncate-mobile {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Blindaje anti-desbordamiento y ergonomía táctil para móviles de 360px - 400px */
@media (max-width: 768px) {
  .modal-card {
    margin: 0 12px !important;
    width: calc(100vw - 24px) !important;
    max-width: 500px !important;
  }

  .modal-card-head,
  .modal-card-body,
  .modal-card-foot {
    padding: 12px 16px !important;
  }

  .modal-card-title {
    font-size: 1rem !important;
    max-width: calc(100% - 30px);
  }

  .custom-textarea-mobile {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Apilamiento de botones y prioridad táctil con el pulgar (acción principal verde arriba) */
  .modal-card-foot {
    flex-wrap: wrap !important;
    gap: 8px !important;
    justify-content: stretch !important;
  }
  
  .modal-card-foot .button {
    width: 100% !important;
    margin: 0 !important;
  }
  
  .modal-card-foot .button.is-success {
    order: 1;
  }
  
  .modal-card-foot .button:not(.is-success) {
    order: 2;
  }
}
</style>