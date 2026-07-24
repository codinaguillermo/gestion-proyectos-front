<template>
  <div :class="['modal', { 'is-active': isActive }]">
    <div class="modal-background" @click="cerrarModal"></div>
    <div class="modal-card">
      <header class="modal-card-head has-background-dark">
        <p class="modal-card-title has-text-white is-size-5 text-truncate-mobile">
          <span class="icon mr-2"><i class="fas fa-cogs"></i></span>
          Configuración Global de GEPRES
        </p>
        <button class="delete" aria-label="close" @click="cerrarModal"></button>
      </header>
      
      <section class="modal-card-body">
        <div v-if="errorMsg" class="notification is-danger is-light py-2 mb-4 is-size-7-mobile">
          <i class="fas fa-exclamation-triangle mr-1"></i> {{ errorMsg }}
        </div>

        <div v-if="exitoMsg" class="notification is-success is-light py-2 mb-4 is-size-7-mobile">
          <i class="fas fa-check-circle mr-1"></i> {{ exitoMsg }}
        </div>

        <div class="box has-background-light p-3-mobile mb-4">
          <p class="is-size-7 has-text-grey mb-1">
            <i class="fas fa-info-circle mr-1"></i> <strong>Nota del Sistema:</strong>
          </p>
          <p class="is-size-7 texto-envolvente">
            El <strong>Año Lectivo</strong> seteado aquí será el valor por defecto que utilizarán todos los docentes al registrar calificaciones y observaciones en GEPRES durante el ciclo escolar.
          </p>
        </div>

        <div class="field">
          <label class="label is-size-7-mobile">Año Lectivo por Defecto</label>
          <div class="control has-icons-left">
            <div class="select is-fullwidth is-medium-tablet is-small-mobile">
              <select v-model="anioSeleccionado" :disabled="cargando || guardando">
                <option v-for="anio in listaAniosDisponibles" :key="anio" :value="String(anio)">
                  Ciclo Lectivo {{ anio }}
                </option>
              </select>
            </div>
            <span class="icon is-left">
              <i class="fas fa-calendar-alt"></i>
            </span>
          </div>
          <p class="help is-size-7-mobile mt-1">
            Solo los usuarios con rol Administrador pueden modificar este parámetro global.
          </p>
        </div>
      </section>

      <footer class="modal-card-foot is-justify-content-flex-end">
        <button 
          class="button is-success" 
          :class="{'is-loading': guardando}" 
          :disabled="cargando || guardando || !anioSeleccionado"
          @click="guardarConfiguracion"
        >
          Guardar Cambios
        </button>
        <button class="button" @click="cerrarModal" :disabled="guardando">
          Cancelar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import configuracionService from '../../services/configuracion.service';

const props = defineProps({
  isActive: Boolean
});

const emit = defineEmits(['close', 'anio-actualizado']);

const anioSeleccionado = ref('2026');
const cargando = ref(false);
const guardando = ref(false);
const errorMsg = ref('');
const exitoMsg = ref('');

/**
 * @propiedad_computada listaAniosDisponibles
 * @propósito Generar un rango de años seleccionables en el combo (desde 2020 hasta 5 años en el futuro del año actual) para dar versatilidad de configuración al Administrador.
 * @a_quien_alimenta Alimenta al <select> del template para renderizar las etiquetas <option>.
 * @que_datos_retorna Retorna un array de números enteros ordenados de mayor a menor (ej: [2031, 2030, ..., 2020]).
 */
const listaAniosDisponibles = computed(() => {
  const anioActualSistema = new Date().getFullYear();
  const rangoMaximo = Math.max(anioActualSistema + 5, 2030);
  const anios = [];
  for (let i = rangoMaximo; i >= 2020; i--) {
    anios.push(i);
  }
  return anios;
});

/**
 * @función cargarAnioActual
 * @propósito Solicitar al backend la configuración del año lectivo para inicializar el combo desplegable en el valor exacto guardado en la base de datos.
 * @a_quien_alimenta Alimenta a la variable reactiva anioSeleccionado y es invocada por el watch() al abrirse el modal.
 * @que_datos_retorna No retorna datos (void); actualiza los estados reactivos cargando, anioSeleccionado y errorMsg.
 */
const cargarAnioActual = async () => {
  cargando.value = true;
  errorMsg.value = '';
  exitoMsg.value = '';
  try {
    const res = await configuracionService.getAnioLectivo();
    if (res.data && res.data.success && res.data.data) {
      anioSeleccionado.value = String(res.data.data.valor);
    }
  } catch (err) {
    console.error('Error al recuperar configuración global:', err);
    errorMsg.value = 'No se pudo obtener el año lectivo actual desde el servidor.';
  } finally {
    cargando.value = false;
  }
};

/**
 * @función guardarConfiguracion
 * @propósito Enviar la petición PUT al backend con el año lectivo elegido para actualizar la base de datos y notificar a la interfaz.
 * @a_quien_alimenta Alimenta al evento @click del botón "Guardar Cambios" y dispara el emit 'anio-actualizado' hacia el NavBar.
 * @que_datos_retorna No retorna datos (void); actualiza los estados guardando, exitoMsg, y emite eventos hacia el componente padre.
 */
const guardarConfiguracion = async () => {
  if (!anioSeleccionado.value) return;
  
  guardando.value = true;
  errorMsg.value = '';
  exitoMsg.value = '';
  try {
    const res = await configuracionService.updateAnioLectivo(anioSeleccionado.value);
    if (res.data && res.data.success) {
      exitoMsg.value = 'Año lectivo actualizado correctamente.';
      emit('anio-actualizado', anioSeleccionado.value);
      setTimeout(() => {
        cerrarModal();
      }, 1000);
    }
  } catch (err) {
    console.error('Error al actualizar configuración:', err);
    errorMsg.value = err.response?.data?.mensaje || 'Ocurrió un error al intentar guardar los cambios.';
  } finally {
    guardando.value = false;
  }
};

/**
 * @función cerrarModal
 * @propósito Restablecer los mensajes de alerta y emitir la orden de cierre hacia el componente padre (NavBar).
 * @a_quien_alimenta Alimenta a los botones "Cancelar", la cruz de cierre, el fondo oscuro y el temporizador de guardado exitoso.
 * @que_datos_retorna No retorna datos (void); emite el evento 'close'.
 */
const cerrarModal = () => {
  errorMsg.value = '';
  exitoMsg.value = '';
  emit('close');
};

// Observamos la propiedad isActive para recargar el dato real de la BD cada vez que se abre la ventana
watch(() => props.isActive, (val) => {
  if (val) {
    cargarAnioActual();
  }
});
</script>

<style scoped>
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

  /* Apilamiento de botones y prioridad táctil con el pulgar (botón verde arriba) */
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