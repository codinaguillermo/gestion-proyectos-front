<template>
  <div class="container py-5 px-4">
    
    <!-- BANNER SUPERIOR AL ESTILO GEPRES -->
    <div class="box banner-gepres mb-5 is-flex is-justify-content-space-between is-align-items-center is-flex-wrap-wrap gap-3">
      <div class="is-flex is-align-items-center">
        <span class="icon is-large has-text-white mr-3">
          <i class="fas fa-user-clock fa-2x"></i>
        </span>
        <div>
          <h1 class="title is-size-3-tablet is-size-4-mobile has-text-white mb-1 has-text-weight-bold">
            Solicitudes de Cuenta
          </h1>
          <p class="subtitle is-size-6-tablet is-size-7-mobile has-text-grey-light mb-0 has-text-weight-semibold">
            USUARIOS PENDIENTES DE APROBACION
          </p>
        </div>
      </div>
      
      <!-- Botón de acción al estilo "NUEVA NOTA" -->
      <button 
        class="button boton-accion-banner has-text-weight-bold is-medium-tablet is-normal-mobile px-4" 
        @click="cargarPendientes" 
        :class="{ 'is-loading': cargando }"
      >
        <span class="icon is-small mr-2"><i class="fas fa-sync-alt"></i></span>
        <span>ACTUALIZAR VISTA</span>
      </button>
    </div>

    <!-- Notificaciones Generales de Retroalimentación -->
    <div v-if="mensajeExito" class="notification is-success is-light py-3 px-4 mb-4 is-size-5 has-text-weight-semibold">
      <button class="delete" @click="mensajeExito = ''"></button>
      <i class="fas fa-check-circle mr-2"></i> {{ mensajeExito }}
    </div>
    
    <div v-if="mensajeError" class="notification is-danger is-light py-3 px-4 mb-4 is-size-5 has-text-weight-semibold">
      <button class="delete" @click="mensajeError = ''"></button>
      <i class="fas fa-exclamation-triangle mr-2"></i> {{ mensajeError }}
    </div>

    <!-- Estado de Carga -->
    <div v-if="cargando" class="has-text-centered py-6">
      <span class="icon is-large has-text-info">
        <i class="fas fa-spinner fa-pulse fa-3x"></i>
      </span>
      <p class="has-text-white mt-4 is-size-4 has-text-weight-bold">Cargando solicitudes en espera...</p>
    </div>

    <!-- Estado Vacío -->
    <div v-else-if="pendientes.length === 0" class="box tarjeta-gepres has-text-centered py-6 px-4">
      <span class="icon is-large has-text-info mb-3">
        <i class="fas fa-check-double fa-3x"></i>
      </span>
      <h2 class="title is-size-3 has-text-white mt-2">¡Todo al día!</h2>
      <p class="subtitle is-size-5 has-text-grey-light mt-1 mb-0">
        No hay solicitudes de cuenta pendientes de aprobación en este momento.
      </p>
    </div>

    <!-- GRILLA DE TARJETAS AL ESTILO ESTÁNDAR GEPRES -->
    <div v-else class="columns is-multiline">
      <div v-for="solicitud in pendientes" :key="solicitud.id" class="column is-12-mobile is-6-tablet is-4-desktop">
        <div class="box tarjeta-gepres is-flex is-flex-direction-column h-100 p-4">
          
          <!-- Píldora superior tipo "Docente / Alumno" -->
          <div class="mb-4">
            <span 
              class="tag is-medium is-rounded has-text-weight-bold px-3 py-1 pildora-rol" 
              :class="Number(solicitud.rol_id) === 2 ? 'is-warning' : 'is-info'"
            >
              <i class="fas mr-2" :class="Number(solicitud.rol_id) === 2 ? 'fa-chalkboard-teacher' : 'fa-user-graduate'"></i>
              {{ Number(solicitud.rol_id) === 2 ? 'Docente' : 'Alumno' }}
            </span>
          </div>

          <!-- Nombre y Apellido -->
          <h3 class="title is-size-3 has-text-white mb-3 has-text-weight-bold">
            {{ solicitud.nombre }} {{ solicitud.apellido }}
          </h3>
          
          <!-- Metadatos de contacto con tipografía accesible -->
          <div class="content is-size-5 mb-4 flex-grow-1">
            <p class="mb-2 has-text-grey-light">
              <strong class="has-text-white"><i class="fas fa-envelope mr-2"></i>Email:</strong><br>
              <span class="has-text-white ml-4 is-underlined">{{ solicitud.email }}</span>
            </p>
            <p class="mb-0 has-text-grey-light">
              <strong class="has-text-white"><i class="fas fa-phone mr-2"></i>Teléfono:</strong><br>
              <span class="has-text-white ml-4">{{ solicitud.telefono || 'No especificado' }}</span>
            </p>
          </div>

          <!-- Pie dividido por línea sutil al estilo GEPRES -->
          <div class="pie-tarjeta-gepres mt-auto pt-3">
            <button 
              class="button boton-aprobar-gepres is-fullwidth has-text-weight-bold is-medium"
              :class="{ 'is-loading': aprobandoId === solicitud.id }"
              :disabled="aprobandoId !== null"
              @click="aprobarCuenta(solicitud)"
            >
              <span class="icon is-small mr-2"><i class="fas fa-check"></i></span>
              <span>APROBAR ACCESO</span>
            </button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import usuarioService from '../services/usuario.services';

const authStore = useAuthStore();
const pendientes = ref([]);
const cargando = ref(false);
const aprobandoId = ref(null);
const mensajeExito = ref('');
const mensajeError = ref('');

/**
 * Propósito: Recuperar desde la base de datos el listado actualizado de usuarios con solicitudes de cuenta pendientes y sincronizar en vivo el contador de la barra de navegación (Navbar).
 * A quién alimenta (quién la llama): Es invocada por el hook del ciclo de vida `onMounted` al inicializar la vista, por el botón "ACTUALIZAR VISTA" del banner y de forma automática tras aprobar una solicitud con éxito.
 * Qué datos retorna: No retorna una estructura de datos (promesa tipo void). Muta el array reactivo `pendientes.value` y actualiza el estado global en `authStore`.
 */
const cargarPendientes = async () => {
  cargando.value = true;
  mensajeError.value = '';
  try {
    const res = await usuarioService.obtenerPendientes();
    pendientes.value = res.data || [];
    
    // Sincronizamos en vivo la burbuja de notificación del Navbar
    authStore.actualizarContadorPendientes(pendientes.value.length);
  } catch (error) {
    console.error("Error al cargar solicitudes pendientes:", error);
    mensajeError.value = 'No se pudo obtener el listado de solicitudes pendientes del servidor.';
  } finally {
    cargando.value = false;
  }
};

/**
 * Propósito: Enviar la orden de aprobación operativa de una cuenta al backend, quitarla de la lista visual tras el éxito y actualizar el contador del store en tiempo real.
 * A quién alimenta (quién la llama): Es disparada al capturar el evento `@click` en el botón "APROBAR ACCESO" de cada tarjeta de usuario.
 * Qué datos recibe: solicitud (Objeto que representa los datos completos de la cuenta pendiente seleccionada).
 * Qué datos retorna: No retorna una estructura de datos (promesa tipo void). Muta el array local filtrando el ID aprobado y emite la actualización de estado hacia Pinia.
 */
const aprobarCuenta = async (solicitud) => {
  aprobandoId.value = solicitud.id;
  mensajeExito.value = '';
  mensajeError.value = '';

  try {
    // Enviamos el payload vacío para que el backend aplique la clave por defecto 'Gepres2026*'
    const res = await usuarioService.aprobarSolicitud(solicitud.id, { password: '' });
    
    if (res.data && res.data.success) {
      mensajeExito.value = res.data.mensaje || `La cuenta de ${solicitud.nombre} ${solicitud.apellido} fue aprobada correctamente.`;
      
      // Eliminamos visualmente la tarjeta de la lista local sin forzar otra petición HTTP
      pendientes.value = pendientes.value.filter(item => item.id !== solicitud.id);
      
      // Sincronizamos inmediatamente el contador en el Navbar para que disminuya de a uno
      authStore.actualizarContadorPendientes(pendientes.value.length);
    }
  } catch (error) {
    console.error("Error al aprobar la solicitud:", error);
    const errMsj = error.response?.data?.mensaje || error.response?.data?.error || 'Ocurrió un error inesperado al intentar aprobar la cuenta.';
    mensajeError.value = errMsj;
  } finally {
    aprobandoId.value = null;
  }
};

/**
 * Propósito: Disparar la consulta inicial al servidor para poblar la lista de solicitudes pendientes en cuanto el componente es montado en la pantalla.
 * A quién alimenta (quién la llama): Ciclo de vida nativo del componente Vue (`onMounted`).
 * Qué datos retorna: Void.
 */
onMounted(() => {
  cargarPendientes();
});
</script>

<style scoped>
/* BANNER ENCABEZADO ESTILO GEPRES */
.banner-gepres {
  background: rgba(15, 20, 25, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5) !important;
  padding: 1.5rem 2rem !important;
}

/* BOTÓN DEL BANNER ESTILO "NUEVA NOTA / CREAR USER STORY" */
.boton-accion-banner {
  background-color: #56ccf2 !important; /* Celeste claro idéntico a la referencia */
  color: #000000 !important;
  border: none !important;
  border-radius: 20px !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.boton-accion-banner:hover:not(:disabled) {
  background-color: #6ed5f5 !important;
  transform: translateY(-1px);
}

/* TARJETAS ESTILO GEPRES (Negro semitransparente limpio) */
.tarjeta-gepres {
  background: rgba(15, 20, 25, 0.75) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4) !important;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.tarjeta-gepres:hover {
  border-color: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-2px);
}

/* PÍLDORA DEL ROL ESTILO GEPRES */
.pildora-rol {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
}

/* PIE DE TARJETA CON LÍNEA DIVISORIA SUTIL */
.pie-tarjeta-gepres {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* BOTÓN APROBAR ESTILO GEPRES (Celeste claro estándar de botones principales) */
.boton-aprobar-gepres {
  background-color: #56ccf2 !important;
  color: #000000 !important;
  border: none !important;
  border-radius: 8px !important;
  transition: all 0.2s ease;
}

.boton-aprobar-gepres:hover:not(:disabled) {
  background-color: #6ed5f5 !important;
  box-shadow: 0 0 12px rgba(86, 204, 242, 0.5);
}

.h-100 {
  height: 100%;
}

.flex-grow-1 {
  flex-grow: 1;
}

@media screen and (max-width: 768px) {
  .banner-gepres {
    padding: 1.2rem 1rem !important;
    text-align: center;
    justify-content: center !important;
  }
}
</style>