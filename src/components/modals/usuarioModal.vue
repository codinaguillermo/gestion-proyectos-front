<script setup>
import { ref, reactive, watch, computed } from 'vue';
import usuarioService from '../../services/usuario.services';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  isActive: Boolean,
  usuarioEdit: { type: Object, default: null },
  escuelas: { type: Array, default: () => [] },
  roles: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'usuario-guardado']);
const authStore = useAuthStore();
const enviando = ref(false);
const errorMsg = ref('');

const form = reactive({
  id: null, nombre: '', apellido: '', email: '', password: '',
  rol_id: 3, curso: '', division: '', telefono: '', activo: true, escuelas_ids: []
});

// --- LÓGICA DE PERMISOS ---
const esAdminODocente = computed(() => {
  const rol = Number(authStore.usuario?.rol_id);
  return rol === 1 || rol === 2;
});

const esPropioPerfil = computed(() => {
  return form.id && Number(authStore.usuario?.id) === Number(form.id);
});

const esModoEdicion = computed(() => !!form.id);
const elUsuarioEsAlumno = computed(() => Number(form.rol_id) === 3);

const tituloModal = computed(() => {
  if (esPropioPerfil.value) return 'Mi Perfil';
  return esModoEdicion.value ? 'Editar Usuario' : 'Nuevo Usuario';
});

// REGLAS DE NEGOCIO:
// 1. Rol y Escuela: Solo Admin/Docente (Blindado para Alumnos)
const puedeEditarEstructura = computed(() => esAdminODocente.value);

// 2. Datos personales e Identidad: Admin/Docente O el dueño del perfil
const puedeEditarDatosPropios = computed(() => {
  return esAdminODocente.value || esPropioPerfil.value;
});

watch(() => props.isActive, (val) => {
  if (val) {
    errorMsg.value = '';
    const u = props.usuarioEdit;
    if (u && (u.id || u.uid)) {
      Object.assign(form, {
        id: u.id || u.uid,
        nombre: u.nombre || '',
        apellido: u.apellido || '',
        email: u.email || '',
        telefono: u.telefono || '',
        rol_id: Number(u.rol_id),
        curso: u.curso || '',
        division: u.division || '',
        activo: u.activo ?? true,
        password: '', 
        escuelas_ids: u.escuelas?.map(e => e.id) || []
      });
    } else {
      resetForm();
    }
  }
}, { immediate: true });

const resetForm = () => {
  Object.assign(form, {
    id: null, nombre: '', apellido: '', email: '', password: '',
    rol_id: 3, curso: '', division: 'A', telefono: '', activo: true, escuelas_ids: []
  });
};

const guardar = async () => {
  enviando.value = true;
  errorMsg.value = '';
  try {
    if (elUsuarioEsAlumno.value && form.escuelas_ids.length !== 1) {
      throw new Error("Un alumno debe pertenecer a exactamente una escuela.");
    }
    if (esModoEdicion.value) {
      await usuarioService.update(form.id, form);
    } else {
      await usuarioService.create(form);
    }
    emit('usuario-guardado');
    emit('close');
  } catch (err) {
    errorMsg.value = err.response?.data?.error || err.message || "Error al guardar";
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <div class="modal" :class="{ 'is-active': isActive }">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ tituloModal }}</p>
        <button class="delete" @click="$emit('close')"></button>
      </header>
      <section class="modal-card-body">
        <div v-if="errorMsg" class="notification is-danger is-light py-2">{{ errorMsg }}</div>

        <div class="columns is-multiline">
          <div class="column is-6">
            <label class="label">Nombre</label>
            <input v-model="form.nombre" class="input" type="text" :disabled="!puedeEditarDatosPropios">
          </div>
          <div class="column is-6">
            <label class="label">Apellido</label>
            <input v-model="form.apellido" class="input" type="text" :disabled="!puedeEditarDatosPropios">
          </div>

          <div class="column is-6">
            <label class="label">Email (Usuario)</label>
            <input v-model="form.email" class="input" type="email" :disabled="!puedeEditarDatosPropios">
          </div>
          
          <div class="column is-6">
            <label class="label">{{ esModoEdicion ? 'Nueva Contraseña' : 'Contraseña' }}</label>
            <input v-model="form.password" class="input" type="password" placeholder="********" :disabled="!puedeEditarDatosPropios">
          </div>

          <div class="column is-6">
            <label class="label">Rol</label>
            <div class="select is-fullwidth">
              <select v-model="form.rol_id" :disabled="!puedeEditarEstructura">
                <option v-for="r in roles" :key="r.id" :value="Number(r.id)">{{ r.nombre }}</option>
              </select>
            </div>
          </div>

          <div class="column is-6">
            <label class="label">Teléfono</label>
            <input v-model="form.telefono" class="input" type="text" :disabled="!puedeEditarDatosPropios">
          </div>

          <div class="column is-12">
            <label class="label">Escuela/s</label>
            <div class="select is-multiple is-fullwidth">
                <select v-model="form.escuelas_ids" multiple :size="5" :disabled="!puedeEditarEstructura">
                    <option v-for="e in escuelas" :key="e.id" :value="e.id">
                      {{ e.nombre_corto }} | {{ e.nombre_largo }}
                    </option>
                </select>
            </div>
          </div>

          <template v-if="elUsuarioEsAlumno">
            <div class="column is-6">
              <label class="label">Curso</label>
              <div class="select is-fullwidth">
                <select v-model="form.curso" :disabled="!puedeEditarDatosPropios">
                  <option value="">(Sin asignar)</option>
                  <option value="1ro">1ro Año</option>
                  <option value="2do">2do Año</option>
                  <option value="3ro">3ro Año</option>
                  <option value="4to">4to Año</option>
                  <option value="5to">5to Año</option>
                  <option value="6to">6to Año</option>
                </select>
              </div>
            </div>
            <div class="column is-6">
              <label class="label">División</label>
              <div class="select is-fullwidth">
                <select v-model="form.division" :disabled="!puedeEditarDatosPropios">
                  <option value="">(Sin asignar)</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="1ra">1ra</option>
                  <option value="2da">2da</option>
                  <option value="3ra">3ra</option>
                  <option value="4ta">4ta</option>
                  <option value="5ta">5ta</option>
                </select>
              </div>
            </div>
          </template>

          <div class="column is-12" v-if="esAdminODocente">
            <label class="checkbox">
              <input type="checkbox" v-model="form.activo" :disabled="!puedeEditarEstructura || esPropioPerfil"> Usuario Activo
            </label>
          </div>
        </div>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="$emit('close')">Cancelar</button>
        <button class="button is-success" :class="{'is-loading': enviando}" @click="guardar">
          {{ esPropioPerfil ? 'Actualizar Mi Perfil' : (esModoEdicion ? 'Guardar Cambios' : 'Crear Usuario') }}
        </button>
      </footer>
    </div>
  </div>
</template>