<script setup>
import { ref, reactive, watch, computed, onUnmounted } from 'vue';
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
const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(null);

const form = reactive({
  id: null, nombre: '', apellido: '', email: '', password: '',
  rol_id: 3, curso: '', division: '', telefono: '', activo: true, escuelas_ids: [],
  avatar: null
});

// Lógica de permisos
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

const puedeEditarEstructura = computed(() => esAdminODocente.value);
const puedeEditarDatosPropios = computed(() => esAdminODocente.value || esPropioPerfil.value);

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      errorMsg.value = "La imagen no debe superar los 2MB";
      fileInput.value.value = "";
      return;
    }
    selectedFile.value = file;
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = URL.createObjectURL(file);
  }
};

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

watch(() => props.isActive, (val) => {
  if (val) {
    errorMsg.value = '';
    selectedFile.value = null;
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;

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
        avatar: u.avatar || null,
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
    rol_id: 3, curso: '', division: 'A', telefono: '', activo: true, escuelas_ids: [], avatar: null
  });
};

const guardar = async () => {
  enviando.value = true;
  errorMsg.value = '';
  try {
    if (elUsuarioEsAlumno.value && form.escuelas_ids.length !== 1) {
      throw new Error("Un alumno debe pertenecer a exactamente una escuela.");
    }

    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('apellido', form.apellido);
    formData.append('email', form.email);
    formData.append('rol_id', form.rol_id);
    formData.append('curso', form.curso);
    formData.append('division', form.division);
    formData.append('telefono', form.telefono);
    formData.append('activo', form.activo);
    
    if (form.password) formData.append('password', form.password);
    form.escuelas_ids.forEach(id => formData.append('escuelas_ids[]', id));

    if (selectedFile.value) {
      formData.append('avatar', selectedFile.value);
    }

    if (esModoEdicion.value) {
      await usuarioService.update(form.id, formData);
    } else {
      await usuarioService.create(formData);
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

        <div class="field has-text-centered mb-5">
           <div class="avatar-container is-inline-block" @click="fileInput.click()" :style="{ cursor: puedeEditarDatosPropios ? 'pointer' : 'default' }">
              <figure v-if="previewUrl || form.avatar" class="image is-128x128">
                <img class="is-rounded" 
                     :src="previewUrl || `http://localhost:3000/uploads/avatars/${form.avatar}`"
                     style="object-fit: cover; height: 128px; width: 128px; border: 2px solid #dbdbdb;">
              </figure>
              
              <div v-else class="avatar-placeholder is-rounded">
                <span class="icon is-large has-text-grey-light">
                  <i class="fas fa-user-circle fa-5x"></i>
                </span>
                <div class="overlay-camera" v-if="puedeEditarDatosPropios">
                  <i class="fas fa-camera"></i>
                </div>
              </div>
           </div>
           <p class="help mt-2" v-if="puedeEditarDatosPropios">Haz clic en la imagen para cambiarla</p>
        </div>

        <div class="columns is-multiline">
          <input class="is-hidden" type="file" ref="fileInput" @change="onFileSelected" accept="image/*" :disabled="!puedeEditarDatosPropios">

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
                <select v-model="form.escuelas_ids" multiple :size="3" :disabled="!puedeEditarEstructura">
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

<style scoped>
.avatar-container {
  position: relative;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  transition: opacity 0.3s;
}

.avatar-container:hover {
  opacity: 0.8;
}

.avatar-placeholder {
  width: 128px;
  height: 128px;
  background-color: #f5f5f5;
  border: 2px dashed #dbdbdb;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.is-rounded {
  border-radius: 50% !important;
}

.overlay-camera {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  padding: 4px 0;
  font-size: 0.8rem;
}
</style>