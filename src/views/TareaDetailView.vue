<template>
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-6 px-4 pb-6">
        
        <div class="glass-panel p-5 mb-5">
          <div class="level mb-4">
            <div class="level-left">
              <button class="button is-ghost has-text-white p-0 mr-4" @click="$router.back()">
                <span class="icon"><i class="fas fa-arrow-left"></i></span>
              </button>
              <div>
                <h2 class="subtitle is-6 has-text-info has-text-weight-bold is-uppercase mb-0">
                  {{ esEdicion ? 'Gestionar Tarea Técnica' : 'Nueva Tarea' }}
                </h2>
                <h1 class="title has-text-white is-4 mb-0">
                  {{ esEdicion ? form.titulo : 'Nueva Tarea para la US' }}
                </h1>
              </div>
            </div>
            <div class="level-right">
              <div class="buttons">
                <button class="button is-light is-medium px-5" @click="$router.back()">Cancelar</button>
                <button 
                  class="button is-success is-medium has-text-weight-bold px-5" 
                  :class="{'is-loading': enviando}" 
                  :disabled="!puedeGuardar"
                  @click="guardarTarea"
                >
                  <span class="icon"><i class="fas fa-save"></i></span>
                  <span>{{ textoBotonGuardar }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="errorValidacion" class="notification is-danger is-light mb-5">
          <button class="delete" @click="errorValidacion = ''"></button>
          <span class="icon mr-2"><i class="fas fa-exclamation-triangle"></i></span>
          {{ errorValidacion }}
        </div>

        <div class="columns is-multiline">
          <div class="column is-8">
            <div class="glass-panel p-5 mb-5">
              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Título de la Tarea</label>
                <div class="control">
                  <input v-model="form.titulo" class="input is-medium custom-input" type="text" :disabled="!tienePermisoEstructura" placeholder="Ej: Desarrollar API">
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-white is-size-5">Descripción General</label>
                <div class="control">
                  <textarea v-model="form.descripcion" class="textarea custom-input" rows="4" :disabled="!tienePermisoEstructura"></textarea>
                </div>
              </div>

              <div v-if="esEstadoRevision || esEstadoFinalizado" class="box has-background-black-ter p-4 mb-5 border-info">
                <label class="label is-size-6 has-text-info">Comentarios de Cierre/Revisión</label>
                <textarea v-model="form.comentario_cierre" class="textarea custom-input is-small" rows="2"></textarea>
              </div>

              <div class="field">
                <label class="label has-text-info is-size-5">Criterios de Aceptación</label>
                <div class="control">
                  <textarea v-model="form.criterios_aceptacion" class="textarea is-small custom-input" rows="3" :disabled="!tienePermisoEstructura"></textarea>
                </div>
              </div>
            </div>

            <!-- ACORDEÓN DE TRAZABILIDAD / HISTORIAL -->
            <div class="box glass-panel p-0 mb-5 field-accordion" v-if="esEdicion">
              <button class="button is-dark is-fullwidth is-flex is-justify-content-space-between is-align-items-center p-4 custom-accordion-btn" type="button" @click="historialAbierto = !historialAbierto">
                <span class="has-text-weight-bold has-text-info is-size-6">
                  <i class="fas fa-history mr-2"></i> Trazabilidad de Estados ({{ form.historial.length }})
                </span>
                <span class="icon is-small">
                  <i :class="historialAbierto ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                </span>
              </button>
              
              <div v-if="historialAbierto" class="p-3 animate__animated animate__slideInDown animate__faster container-table-accordion">
                <div v-if="form.historial.length === 0" class="has-text-centered has-text-grey-light is-size-7 py-3">
                  No hay registros de cambios previos.
                </div>
                
                <div v-else class="historial-lista">
                  <div 
                    v-for="log in form.historial" 
                    :key="log.id" 
                    class="log-item p-2 mb-2"
                    @click="toggleFila(log.id)"
                  >
                    <!-- Vista Compacta (Siempre visible) -->
                    <div class="is-flex is-justify-content-space-between is-align-items-center">
                      <div class="is-flex is-align-items-center">
                        <div class="avatar-circle mr-3" :title="nombreCompleto(log.usuario_detalle)">
                          {{ obtenerIniciales(log.usuario_detalle) }}
                        </div>
                        <div>
                          <p class="is-size-6 has-text-white custom-date-font mb-0">
                            <i class="far fa-calendar-alt mr-1 has-text-info-light"></i> {{ formatoFechaCorta(log.fecha_registro) }}
                          </p>
                        </div>
                      </div>
                      <span class="tag is-small has-text-weight-bold" :class="colorPorEstado(log.estado_id)">
                        {{ log.estado_detalle?.nombre || 'ESTADO' }}
                      </span>
                    </div>

                    <!-- Vista Detalle Expandida (Acordeón) -->
                    <div v-if="filaExpandida === log.id" class="mt-3 pt-2 border-top-dark animate__animated animate__fadeIn">
                      <p class="is-size-6 has-text-white mb-2">
                        <strong class="has-text-info-light">Modificado por:</strong> {{ nombreCompleto(log.usuario_detalle) }}
                      </p>
                      <p class="is-size-6 has-text-white mb-0">
                        <strong class="has-text-info-light"><i class="far fa-clock mr-1"></i> Hora exacta:</strong> {{ formatoHora(log.fecha_registro) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="column is-4">
            <div class="glass-panel p-5 mb-5">
              <div class="field mb-5">
                <label class="label has-text-white">Responsable</label>
                <div class="select is-fullwidth is-medium custom-select">
                  <select v-model.number="form.responsable_id" :disabled="!puedeGuardar">
                    <option :value="null">Sin asignar</option>
                    <option v-for="u in integrantes" :key="u.id" :value="Number(u.id)">
                      {{ u.apellido?.toUpperCase() }}, {{ u.nombre }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-white">Tipo de Tarea</label>
                <div class="select is-fullwidth is-medium custom-select">
                  <select v-model.number="form.tipo_id" :disabled="!puedeGuardar">
                    <option v-for="t in maestras.tipos" :key="t.id" :value="Number(t.id)">{{ t.nombre }}</option>
                  </select>
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-white">Prioridad</label>
                <div class="select is-fullwidth is-medium custom-select">
                  <select v-model.number="form.prioridad_id" :disabled="!puedeGuardar">
                    <option v-for="p in maestras.prioridades" :key="p.id" :value="Number(p.id)">{{ p.nombre }}</option>
                  </select>
                </div>
              </div>

              <div class="field mb-5">
                <label class="label has-text-link">Estado Actual</label>
                <div class="select is-fullwidth is-medium custom-select">
                  <select v-model="form.estado_id" :disabled="!puedeGuardar">
                    <option v-for="e in estadosOrdenados" :key="e.id" :value="Number(e.id)">{{ e.nombre }}</option>
                  </select>
                </div>
              </div>

              <div class="columns is-mobile">
                <div class="column">
                  <label class="label has-text-white">Hs Est.</label>
                  <input v-model="form.horas_estimadas" class="input custom-input" type="number" step="0.5" :disabled="!tienePermisoEstructura">
                </div>
              </div>
            </div>

            <div class="glass-panel p-5 mb-5">
              <label class="label has-text-info is-size-6 mb-3">Checklist de Calidad</label>
              
              <div class="field">
                <label class="checkbox has-text-white is-size-7">
                  <input type="checkbox" v-model="form.cumpleAceptacion" :disabled="!tienePermisoEstructura" class="mr-2">
                  CUMPLE ACEPTACIÓN
                </label>
              </div>

              <div class="field">
                <label class="checkbox has-text-white is-size-7">
                  <input type="checkbox" v-model="form.testeado" :disabled="!tienePermisoEstructura" class="mr-2">
                  TESTEADO
                </label>
              </div>

              <div class="field">
                <label class="checkbox has-text-white is-size-7">
                  <input type="checkbox" v-model="form.documentado" :disabled="!tienePermisoEstructura" class="mr-2">
                  DOCUMENTADO
                </label>
              </div>

              <div v-if="form.documentado" class="field mt-3 mb-4 animate__animated animate__fadeIn">
                <label class="label is-size-7 has-text-info">Enlace de Evidencia</label>
                <div class="field has-addons">
                  <div class="control is-expanded has-icons-left">
                    <input 
                      v-model="form.link_evidencia" 
                      class="input is-small custom-input" 
                      type="url" 
                      placeholder="https://drive.google.com/..."
                    >
                    <span class="icon is-small is-left">
                      <i class="fas fa-link"></i>
                    </span>
                  </div>
                  <div class="control">
                    <button 
                      class="button is-small is-info" 
                      title="Abrir en nueva pestaña"
                      :disabled="!esUrlValida"
                      @click="abrirEnlace"
                    >
                      <span class="icon is-small">
                        <i class="fas fa-external-link-alt"></i>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="field">
                <label class="checkbox has-text-white is-size-7">
                  <input type="checkbox" v-model="form.utilizable" :disabled="!tienePermisoEstructura" class="mr-2">
                  UTILIZABLE
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { configService } from '../services/config.service';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
import { projectService } from '../services/project.services';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const proyectoId = route.params.id;
const usId = route.params.usId;
const tareaIdParam = route.params.tareaId;

const esEdicion = computed(() => tareaIdParam && tareaIdParam !== 'nueva');
const enviando = ref(false);
const errorValidacion = ref('');
const maestras = ref({ estados: [], prioridades: [], tipos: [] });
const integrantes = ref([]);

// Variables de estado para el Acordeón
const historialAbierto = ref(false);
const filaExpandida = ref(null);

const form = reactive({
  id: null, 
  titulo: '', 
  descripcion: '', 
  responsable_id: null,
  tipo_id: 1, 
  prioridad_id: 1, 
  estado_id: 1, 
  horas_estimadas: 0, 
  horas_reales: 0,
  cumpleAceptacion: false, 
  testeado: false, 
  documentado: false, 
  utilizable: false,
  link_evidencia: '',
  criterios_aceptacion: '', 
  comentario_cierre: '',
  usId: usId,
  historial: []
});

const tienePermisoEstructura = computed(() => {
  const u = authStore.usuario;
  if (!u) return false;
  if (Number(u.rol_id) === 1 || Number(u.rol_id) === 2) return true;
  return integrantes.value?.some(m => Number(m.id) === Number(u.id));
});

const puedeGuardar = computed(() => tienePermisoEstructura.value);
const esEstadoRevision = computed(() => Number(form.estado_id) === 4);
const esEstadoFinalizado = computed(() => Number(form.estado_id) === 5);
const estadosOrdenados = computed(() => [...maestras.value.estados].sort((a, b) => Number(a.id) - Number(b.id)));
const textoBotonGuardar = computed(() => esEdicion.value ? 'Guardar Cambios' : 'Crear Tarea');
const esUrlValida = computed(() => form.link_evidencia && form.link_evidencia.startsWith('http'));

/**
 * Propósito: Abrir la URL escrita en el textbox de evidencia en una pestaña nueva.
 * A quién alimenta (quién la llama): Al botón con el ícono de enlace externo en la vista.
 * Qué datos retorna: Nada (ejecuta una acción de ventana).
 */
const abrirEnlace = () => { 
  if (form.link_evidencia) window.open(form.link_evidencia, '_blank'); 
};

/**
 * Propósito: Alternar el estado expandido/contraído de una fila en el acordeón del historial.
 * A quién alimenta (quién la llama): Al evento @click de cada elemento `.log-item` renderizado.
 * Qué datos retorna: Nada (muta la variable de estado `filaExpandida`).
 */
const toggleFila = (id) => { 
  filaExpandida.value = filaExpandida.value === id ? null : id; 
};

/**
 * Propósito: Formatear el objeto usuario en un string "Apellido, Nombre".
 * A quién alimenta (quién la llama): A la vista expandida del log de historial.
 * Qué datos retorna: Cadena de texto con el nombre completo o 'Desconocido'.
 */
const nombreCompleto = (u) => u ? `${u.apellido}, ${u.nombre}` : 'Desconocido';

/**
 * Propósito: Extraer las iniciales del usuario para el avatar circular.
 * A quién alimenta (quién la llama): Al bloque de `.avatar-circle` en la vista compacta del log.
 * Qué datos retorna: Cadena de texto de 2 caracteres (Iniciales).
 */
const obtenerIniciales = (u) => u ? u.nombre.charAt(0).toUpperCase() + u.apellido.charAt(0).toUpperCase() : '?';

/**
 * Propósito: Formatear un string ISO de fecha a "DD mes. AAAA".
 * A quién alimenta (quién la llama): A la columna principal del log de historial.
 * Qué datos retorna: Cadena de texto con fecha corta formateada.
 */
const formatoFechaCorta = (fechaStr) => {
  if (!fechaStr) return '';
  const d = new Date(fechaStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Propósito: Formatear un string ISO de fecha para extraer solo la hora "HH:MM".
 * A quién alimenta (quién la llama): A la vista expandida del log de historial.
 * Qué datos retorna: Cadena de texto con la hora formateada.
 */
const formatoHora = (fechaStr) => {
  if (!fechaStr) return '';
  const d = new Date(fechaStr);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Propósito: Mapear el ID de un estado de tarea a una clase CSS de color de Bulma.
 * A quién alimenta (quién la llama): A la etiqueta `<span>` (tag) dentro del log de historial.
 * Qué datos retorna: String con las clases CSS correspondientes ('is-dark', 'is-warning', etc.).
 */
const colorPorEstado = (estadoId) => {
  const map = {
    1: 'is-dark',       
    2: 'is-warning',    
    3: 'is-info',       
    4: 'is-warning is-light', 
    5: 'is-success'     
  };
  return map[Number(estadoId)] || 'is-dark';
};

/**
 * Propósito: Obtener datos maestros del sistema, integrantes del proyecto, y los datos actuales de la tarea (incluyendo su historial) si es modo edición.
 * A quién alimenta (quién la llama): Al hook `onMounted` al iniciar el componente.
 * Qué datos retorna: Nada (muta las variables reactivas `maestras`, `integrantes` y `form`).
 */
const cargarDatos = async () => {
  try {
    const [resM, resProy] = await Promise.all([
      configService.getTablasMaestras(),
      projectService.getById(proyectoId)
    ]);
    
    maestras.value.prioridades = resM.prioridades || []; 
    maestras.value.tipos = resM.tipos || [];
    maestras.value.estados = resM.estados || [];
    integrantes.value = resProy.data?.integrantes || resProy.data?.Usuarios || [];

    if (esEdicion.value) {
      const resT = await api.get(`/tareas/${tareaIdParam}`);
      const t = resT.data;
      
      if (t) {
        form.id = t.id; 
        form.titulo = t.titulo; 
        form.descripcion = t.descripcion || '';
        form.responsable_id = t.responsable_id ? Number(t.responsable_id) : null;
        form.tipo_id = Number(t.tipo_id) || 1; 
        form.prioridad_id = Number(t.prioridad_id) || 1;
        form.estado_id = Number(t.estado_id) || 1; 
        form.horas_estimadas = t.horas_estimadas || 0;
        form.horas_reales = t.horasReales || t.horas_reales || 0;
        
        form.cumpleAceptacion = !!t.cumpleAceptacion; 
        form.testeado = !!t.testeado;
        form.documentado = !!t.documentado; 
        form.utilizable = !!t.utilizable;
        
        form.link_evidencia = t.linkEvidencia || t.link_evidencia || '';
        form.criterios_aceptacion = t.criteriosAceptacion || t.criterios_aceptacion || '';
        form.comentario_cierre = t.comentarioCierre || t.comentario_cierre || '';
        form.historial = t.historial || [];
      }
    }
  } catch (error) { 
    console.error("Error al cargar datos:", error); 
  }
};

/**
 * Propósito: Validar datos y enviar la petición POST (crear) o PUT (actualizar) de la tarea al backend.
 * A quién alimenta (quién la llama): Al botón "Guardar Cambios" / "Crear Tarea" en la interfaz.
 * Qué datos retorna: Nada (gestiona la redirección o muestra error en pantalla).
 */
const guardarTarea = async () => {
  errorValidacion.value = '';
  if (!form.titulo?.trim()) return (errorValidacion.value = "El título es obligatorio.");
  
  enviando.value = true;
  try {
    const payload = { ...form, proyecto_id: Number(proyectoId), usId: Number(usId) };
    if (esEdicion.value) await api.put(`/tareas/${tareaIdParam}`, payload);
    else await api.post('/tareas', payload);
    
    router.back();
  } catch (error) {
    errorValidacion.value = error.response?.data?.mensaje || "Error al guardar";
  } finally { 
    enviando.value = false; 
  }
};

onMounted(cargarDatos);
</script>

<style scoped>
.dashboard-bg { min-height: 100vh; background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('../assets/fondo.jpg'); background-size: cover; background-attachment: fixed; }
.glass-panel { background: rgba(255, 255, 255, 0.05) !important; backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
.custom-input, .custom-select select { background-color: #fff9e6 !important; color: #000 !important; border: 2px solid #dcd6c0 !important; font-weight: 600 !important; }
.field.has-addons .control .button { height: 100%; }
.border-info { border: 1px solid #3e8ed0; border-radius: 8px; }

/* ESTILOS DEL ACORDEÓN DE HISTORIAL */
.field-accordion { overflow: hidden; border: 1px solid rgba(52, 152, 219, 0.2); border-radius: 8px; }
.custom-accordion-btn { background: rgba(20, 20, 20, 0.5) !important; border: none !important; text-align: left; cursor: pointer; transition: background 0.2s ease; }
.custom-accordion-btn:hover { background: rgba(52, 152, 219, 0.1) !important; }
.container-table-accordion { background: rgba(0, 0, 0, 0.4); border-top: 1px solid rgba(255,255,255,0.05); max-height: 350px; overflow-y: auto; }
.log-item { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; cursor: pointer; transition: background 0.2s; }
.log-item:hover { background: rgba(255,255,255,0.08); }
.border-top-dark { border-top: 1px dashed rgba(255, 255, 255, 0.1); }
.custom-date-font { font-family: monospace; }
.avatar-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; background-color: rgba(52, 152, 219, 0.2); color: #3498db; flex-shrink: 0; font-size: 0.8rem; border: 1px solid rgba(52, 152, 219, 0.4); }

.animate__animated { animation-duration: 0.4s; }
</style>