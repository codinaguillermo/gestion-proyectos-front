<template>
  <nav v-if="mostrarNavbar" class="navbar is-dark">
    <div class="container">
      <div class="navbar-brand is-flex is-align-items-center">
        <router-link to="/dashboard" class="navbar-item has-text-weight-bold has-text-white is-size-5">
          GEPRES{{ nombreEscuelaNavbar ? ' - ' + nombreEscuelaNavbar : '' }}
        </router-link>

        <a 
          role="button" 
          class="navbar-burger ml-auto" 
          :class="{ 'is-active': menuAbierto }"
          aria-label="menu" 
          aria-expanded="false" 
          @click="menuAbierto = !menuAbierto"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': menuAbierto }">
        <div class="navbar-end">
          <!-- MODO CLARO/OSCURO -->
          <div class="navbar-item">
            <button class="button is-ghost has-text-white p-2" @click="themeStore.toggleTheme" title="Alternar Tema">
              <span class="icon is-medium">
                <i class="fas icono-siempre-amarillo" :class="themeStore.esModoOscuro ? 'fa-sun' : 'fa-moon'"></i>
              </span>
            </button>
          </div>
          
          <!-- Indicador visual del Ciclo Lectivo activo en GEPRES -->
          <div class="navbar-item is-flex is-align-items-center">
            <span class="tag is-info is-light has-text-weight-bold px-3 py-2 badge-anio-mobile" title="Ciclo Lectivo Activo en el Sistema">
              <span class="icon is-small mr-1"><i class="fas fa-calendar-alt"></i></span>
              <span>Ciclo {{ anioLectivoActual }}</span>
            </span>
          </div>

          <!-- ACCESO DIRECTO EN NAVBAR: Toma de Asistencia -->
          <div v-if="esDocenteOAdmin" class="navbar-item">
            <router-link to="/asistencia" class="button is-ghost has-text-white p-2" title="Toma de Asistencia">
              <span class="icon is-medium">
                <i class="fas fa-clipboard-check fa-lg has-text-success"></i>
              </span>
              <span class="ml-1">Toma de asistencia</span>
            </router-link>
          </div>

          <!-- Ícono de Solicitudes Pendientes con burbuja de notificación -->
          <div v-if="esDocenteOAdmin && authStore.usuario?.solicitudes_pendientes > 0" class="navbar-item">
            <router-link to="/solicitudes-pendientes" class="button is-ghost has-text-white p-2 icon-mensaje-contenedor" title="Solicitudes de Cuenta Pendientes">
              <span class="icon is-medium">
                <i class="fas fa-user-clock fa-lg has-text-warning"></i>
              </span>
              <span class="badge-facebook">
                {{ authStore.usuario.solicitudes_pendientes }}
              </span>
            </router-link>
          </div>

          <!-- Ícono de Mensajería Docente existente -->
          <div v-if="esDocenteOAdmin && authStore.usuario?.mensajes_sin_leer > 0" class="navbar-item">
            <router-link to="/mensajeria" class="button is-ghost has-text-white p-2 icon-mensaje-contenedor" title="Mensajería Docente">
              <span class="icon is-medium">
                <i class="fas fa-envelope fa-lg"></i>
              </span>
              <span class="badge-facebook">
                {{ authStore.usuario.mensajes_sin_leer }}
              </span>
            </router-link>
          </div>

          <div class="navbar-item is-flex is-align-items-center">
            <figure class="image is-32x32 mr-3">
              <img 
                v-if="authStore.usuario?.avatar && authStore.usuario.avatar !== ''"
                :src="`/uploads/avatars/${authStore.usuario.avatar}`"
                class="is-rounded"
                style="object-fit: cover; width: 32px; height: 32px; min-width: 32px; border: 1px solid #fff;"
              >
              <div 
                v-else 
                class="is-rounded has-background-primary has-text-white is-flex is-justify-content-center is-align-items-center"
                style="width: 32px; height: 32px; font-size: 0.75rem; font-weight: bold; border-radius: 50% !important;"
              >
                {{ nombreUsuario.substring(0, 2).toUpperCase() }}
              </div>
            </figure>
            
            <span class="has-text-white texto-usuario-movil">
              Hola, <strong class="has-text-white">{{ nombreUsuario }}</strong>
            </span>
          </div>

          <div class="navbar-item has-dropdown is-arrowless is-hoverable">
            <a class="navbar-link is-arrowless">
              <span class="icon has-text-white engranaje-icono">
                <i class="fas fa-cog"></i> 
              </span>
            </a>

            <div class="navbar-dropdown is-right">
              <!-- Acceso exclusivo para Administradores a la Vista General de Configuración -->
              <router-link v-if="esAdmin" to="/configuracion" class="navbar-item has-background-warning-light">
                <span class="icon is-small mr-2 has-text-dark"><i class="fas fa-cogs"></i></span>
                <strong class="has-text-dark">Configuración GEPRES</strong>
              </router-link>
              <hr v-if="esAdmin" class="navbar-divider">

              <router-link v-if="esDocenteOAdmin" to="/usuarios" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-users-cog"></i></span>
                Gestión de Usuarios
              </router-link>
              
              <router-link v-if="esDocenteOAdmin" to="/solicitudes-pendientes" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-user-clock has-text-warning"></i></span>
                Solicitudes de Cuenta
                <span v-if="authStore.usuario?.solicitudes_pendientes > 0" class="tag is-warning is-rounded ml-auto has-text-weight-bold">
                  {{ authStore.usuario.solicitudes_pendientes }}
                </span>
              </router-link>

              <router-link v-if="esDocenteOAdmin" to="/escuelas" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-school"></i></span>
                Gestionar Escuelas
              </router-link>
              
              <router-link v-if="esDocenteOAdmin" to="/gestion-curricular" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-book"></i></span>
                Especialidades y Materias
              </router-link>

              <router-link v-if="esDocenteOAdmin" to="/asistencia" class="navbar-item">
                <span class="icon is-small mr-2"><i class="fas fa-clipboard-check has-text-success"></i></span>
                Toma de Asistencia
              </router-link>
              
              <router-link v-if="esDocenteOAdmin" to="/reporte-asistencia" class="navbar-item">
                <span class="icon is-small mr-2 has-text-info"><i class="fas fa-chart-line has-text-info"></i></span>
                Informe de Asistencia
              </router-link>

              <a v-if="esDocenteOAdmin" class="navbar-item" @click="abrirExportacion">
                <span class="icon is-small mr-2 has-text-success"><i class="fas fa-file-excel"></i></span>
                Exportar Planilla Excel
              </a>

              <router-link v-if="esDocenteOAdmin" to="/sugerencias" class="navbar-item">
                <span class="icon is-small mr-2 has-text-warning"><i class="fas fa-lightbulb"></i></span>
                Sugerencias y Errores
              </router-link>

              <router-link v-if="esDocenteOAdmin" to="/mensajeria" class="navbar-item">
                <span class="icon is-small mr-2 has-text-info"><i class="fas fa-envelope-open-text"></i></span>
                Mensajería Docente
              </router-link>
              
              <hr v-if="esDocenteOAdmin" class="navbar-divider">

              <router-link v-if="esDocenteOAdmin" to="/tutoriales" class="navbar-item">
                <span class="icon is-small mr-2 has-text-danger"><i class="fas fa-play-circle"></i></span>
                Tutoriales GEPRES
              </router-link>

              <a class="navbar-item" @click="abrirPerfil">
                <span class="icon is-small mr-2"><i class="fas fa-user"></i></span>
                Mi Perfil
              </a>

              <hr class="navbar-divider">

              <a class="navbar-item has-text-danger" @click="handleLogout">
                <span class="icon is-small mr-2"><i class="fas fa-sign-out-alt"></i></span>
                Cerrar Sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <router-view />

  <UsuarioModal 
    v-if="modalPerfilActivo && roles.length > 0 && escuelas.length > 0"
    :key="usuarioParaEditar?.id" 
    :is-active="modalPerfilActivo"
    :usuario-edit="usuarioParaEditar"
    :escuelas="escuelas"
    :roles="roles"
    @close="modalPerfilActivo = false"
    @usuario-guardado="refrescarDatos"
  />

  <ExportarNotasModal 
    v-if="modalExportarActivo"
    @close="modalExportarActivo = false"
  />
</template>

<script setup>
import { useThemeStore } from './stores/theme.store';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import api from './services/api';
import UsuarioModal from './components/modals/usuarioModal.vue';
import ExportarNotasModal from './components/modals/ExportarNotasModal.vue';
import configuracionService from './services/configuracion.service';

const authStore = useAuthStore();
const themeStore = useThemeStore();
const route = useRoute();
const router = useRouter();

const menuAbierto = ref(false);
const modalPerfilActivo = ref(false);
const modalExportarActivo = ref(false); 
const usuarioParaEditar = ref(null); 
const escuelas = ref([]);
const roles = ref([]);

const anioLectivoActual = ref('2026');

watch(() => route.path, () => {
  menuAbierto.value = false;
});

const mostrarNavbar = computed(() => {
  const rutasSinNavbar = ['/login', '/', '/solicitar-cuenta'];
  return authStore.token && !rutasSinNavbar.includes(route.path);
});

const nombreUsuario = computed(() => {
  return authStore.usuario?.nombre || 'Usuario';
});

/**
 * Propósito: Obtener el nombre corto o largo de la escuela vinculada en la sesión para mostrarla en la navbar principal.
 * A quién alimenta: Template de App.vue al lado del logo GEPRES.
 * Qué retorna: String con el nombre de la institución o cadena vacía si no está definida.
 */
const nombreEscuelaNavbar = computed(() => {
  const listaEscuelas = authStore.usuario?.escuelas;
  if (listaEscuelas && listaEscuelas.length > 0) {
    return listaEscuelas[0].nombre_corto || listaEscuelas[0].nombre_largo || '';
  }
  return '';
});

const esDocenteOAdmin = computed(() => {
  const rol = Number(authStore.usuario?.rol_id);
  return rol === 1 || rol === 2;
});

const esAdmin = computed(() => {
  return Number(authStore.usuario?.rol_id) === 1;
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const cargarMaestras = async () => {
  try {
    const [resE, resR] = await Promise.all([
      api.get('/common/escuelas'),
      api.get('/common/roles')
    ]);
    escuelas.value = resE.data;
    roles.value = resR.data;
  } catch (err) {
    console.error("Error al cargar maestras en App.vue", err);
  }
};

const cargarAnioLectivo = async () => {
  try {
    const res = await configuracionService.getAnioLectivo();
    if (res.data && res.data.success && res.data.data) {
      anioLectivoActual.value = String(res.data.data.valor);
    }
  } catch (error) {
    console.error("Error al cargar año lectivo en App.vue:", error);
  }
};

const abrirPerfil = async () => {
  try {
    const res = await api.get(`/usuarios/${authStore.usuario.id}`);
    usuarioParaEditar.value = res.data;
    if (escuelas.value.length === 0) await cargarMaestras();
    modalPerfilActivo.value = true;
  } catch (err) {
    console.error("Error al abrir perfil:", err);
    usuarioParaEditar.value = authStore.usuario;
    modalPerfilActivo.value = true;
  }
};

const abrirExportacion = () => {
  modalExportarActivo.value = true;
};

const refrescarDatos = async () => {
  modalPerfilActivo.value = false;
  try {
    const res = await api.get(`/usuarios/${authStore.usuario.id}`);
    authStore.actualizarDatosUsuario(res.data);
  } catch (error) {
    console.error("Error al refrescar datos:", error);
  }
};

onMounted(() => {
  themeStore.aplicarClaseGlobal();
  if (authStore.token) {
    cargarMaestras();
    cargarAnioLectivo();
  }
});
</script>

<style scoped>
.navbar-dropdown.is-right {
  right: 0;
  left: auto;
}

.navbar-item.is-flex {
  display: flex;
  align-items: center;
}

.image.is-32x32 {
    width: 32px !important;
    height: 32px !important;
}

.image.is-32x32 img {
    border-radius: 50% !important;
    object-fit: cover;
    width: 32px !important;
    height: 32px !important;
    max-height: 32px !important;
}

.avatar-siglas {
    border-radius: 50% !important;
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
    font-weight: bold;
}

.icon-mensaje-contenedor {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.badge-facebook {
  position: absolute;
  top: 0px;
  right: -2px;
  background-color: #f14668;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 2904a5px;
  padding: 1px 5px;
  line-height: 1;
  text-align: center;
  min-width: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.navbar-burger span {
  background-color: #f5f5f5 !important;
}

@media (max-width: 768px) {
  .badge-anio-mobile {
    width: 100%;
    justify-content: center;
    margin-bottom: 0.5rem;
  }
}

.icono-siempre-amarillo {
  color: #ffdd57 !important;
}

.texto-usuario-movil {
  color: #ffffff !important;
}

.engranaje-icono {
  color: #ffffff !important;
}

@media screen and (max-width: 1023px) {
  .navbar-menu.is-active {
    background-color: #22272e !important;
  }
}

body.theme-light .dashboard-bg {
    background: #f4f7f6 !important; 
}
body.theme-light .glass-panel,
body.theme-light .box.is-dark-box {
    background: #ffffff !important;
    border: 1px solid #dcdcdc !important;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05) !important;
}
body.theme-light .navbar.is-dark {
    background-color: #ffffff !important;
    border-bottom: 1px solid #dcdcdc !important;
}
body.theme-light .custom-input,
body.theme-light .custom-select select {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    border: 1px solid #b8c2cc !important;
}

body.theme-light [class*="has-text-white"],
body.theme-light [class*="has-text-light"],
body.theme-light .title,
body.theme-light .subtitle,
body.theme-light label,
body.theme-light p,
body.theme-light td,
body.theme-light span:not(.tag):not(.icon):not(.fas):not(.far),
body.theme-light .navbar-burger {
    color: #2c3e50 !important;
}

body.theme-light .navbar-burger span {
    background-color: #2c3e50 !important;
}

body.theme-light th {
    color: #1d6fa5 !important;
}

body.theme-light .table {
    background-color: transparent !important;
}
body.theme-light .table.is-hoverable tbody tr:not(.is-selected):hover {
    background-color: #f1f5f8 !important;
}
</style>