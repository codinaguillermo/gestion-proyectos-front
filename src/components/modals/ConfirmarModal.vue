<template>
  <div class="modal" :class="{ 'is-active': isActive }">
    <div class="modal-background" @click="$emit('cancelar')"></div>
    <div class="modal-card">
      <header class="modal-card-head has-background-warning">
        <p class="modal-card-title">Confirmar Acción</p>
        <button class="delete" @click="$emit('cancelar')"></button>
      </header>
      <section class="modal-card-body">
        <div class="media">
          <div class="media-left">
            <span class="icon is-large has-text-warning">
              <i class="fas fa-exclamation-triangle fa-2x"></i>
            </span>
          </div>
          <div class="media-content">
            <p class="is-size-5-tablet is-size-6-mobile has-text-weight-semibold">{{ mensaje }}</p>
            <p class="is-size-7 has-text-grey mt-2">Esta operación no se puede deshacer.</p>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="$emit('cancelar')">Cancelar</button>
        <button class="button is-danger has-text-weight-bold" @click="$emit('confirmar')">
          Confirmar y Eliminar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
/**
 * ConfirmarModal.vue
 * Propósito: Componente modal de interfaz gráfica genérico y reutilizable para solicitar confirmación explícita al usuario antes de ejecutar acciones críticas o destructivas (como eliminar User Stories, miembros de equipo o notas).
 * Quién la alimenta (quién la llama): Vistas y componentes padres del sistema GEPRES (ej: userStoriesView.vue, ProyectoConfigView.vue) mediante el paso de propiedades (props) 'isActive' (booleano de control de visibilidad) y 'mensaje' (cadena de texto descriptiva).
 * Qué datos retorna (o emite): Retorna eventos de usuario al componente padre mediante un emisor ($emit): emite 'confirmar' cuando el usuario presiona el botón rojo de acción, y emite 'cancelar' cuando presiona cancelar, el botón de cierre o el fondo del modal.
 */
defineProps({
  isActive: Boolean,
  mensaje: {
    type: String,
    default: '¿Estás seguro de que deseas eliminar este elemento?'
  }
});
defineEmits(['confirmar', 'cancelar']);
</script>

<style scoped>
/* Blindaje anti-desbordamiento y ergonomía táctil para móviles de pantallas reducidas (ej: 360px - 400px) */
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .modal-card-body {
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
  }
  
  /* Evitar que el icono lateral de advertencia comparta mal el ancho con un mensaje largo en celulares */
  .media {
    display: flex;
    align-items: flex-start;
  }
  .media-left {
    margin-right: 12px !important;
  }
  
  /* Apilamiento vertical de botones: botón destructivo principal arriba (orden 1) para acceso fácil y rápido con el pulgar */
  .modal-card-foot {
    flex-wrap: wrap !important;
    gap: 8px !important;
    justify-content: stretch !important;
  }
  .modal-card-foot .button {
    width: 100% !important;
    margin: 0 !important;
  }
  .modal-card-foot .button.is-danger {
    order: 1;
  }
  .modal-card-foot .button:not(.is-danger) {
    order: 2;
  }
}
</style>