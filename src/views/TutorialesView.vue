<template>
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-6 px-4 pb-6">
        
        <div class="level mb-6 glass-panel p-5 animate__animated animate__fadeInDown">
          <div class="level-left">
            <div class="is-flex is-align-items-center">
              <button class="button is-ghost has-text-white p-0 mr-4" @click="$router.back()">
                <span class="icon is-medium"><i class="fas fa-arrow-left"></i></span>
              </button>
              <div>
                <h2 class="subtitle is-6 has-text-info has-text-weight-bold is-uppercase letter-spacing-1 mb-1">
                  Centro de Ayuda
                </h2>
                <h1 class="title has-text-white is-2 mb-0">Tutoriales de GEPRES</h1>
              </div>
            </div>
          </div>
          <div class="level-right">
            <span class="icon is-large has-text-info opacity-5">
              <i class="fas fa-graduation-cap fa-3x"></i>
            </span>
          </div>
        </div>

        <div class="columns is-multiline">
          <div v-for="(video, index) in tutoriales" :key="index" class="column is-12-tablet is-6-desktop">
            <a :href="video.url" target="_blank" class="video-card-link">
              <div class="glass-panel p-5 h-full is-flex is-align-items-center card-hover-effect">
                <div class="video-icon-container mr-5">
                  <span class="icon is-large has-text-danger">
                    <i class="fab fa-youtube fa-3x"></i>
                  </span>
                </div>
                <div>
                  <h3 class="title is-5 has-text-white mb-2">{{ video.titulo }}</h3>
                  <p class="subtitle is-6 has-text-grey-lighter mb-0">{{ video.descripcion }}</p>
                </div>
                <div class="ml-auto">
                  <span class="icon has-text-info"><i class="fas fa-external-link-alt"></i></span>
                </div>
              </div>
            </a>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Definimos el link base para todos los accesos
const BASE_URL = 'https://www.youtube.com/watch?v=MXGakfEteT0';

const tutoriales = ref([
  { 
    titulo: 'Primeros Pasos: Crear y Editar Proyectos', 
    descripcion: 'Aprende a configurar tu espacio de trabajo y gestionar los integrantes del equipo.',
    url: BASE_URL 
  },
  { 
    titulo: 'Dominando el Backlog: Crear y Editar US', 
    descripcion: 'Cómo definir entregables, prioridades y fechas de entrega de forma correcta.',
    url: BASE_URL 
  },
  { 
    titulo: 'Gestión de Tareas y Registro de Horas', 
    descripcion: 'Carga tus tareas técnicas, asocia responsables y registra tu esfuerzo diario.',
    url: BASE_URL 
  },
  { 
    titulo: 'Ciclo de Vida: De Pendiente a Revisión', 
    descripcion: 'El flujo de estados y cómo enviar tareas para que el docente las audite.',
    url: BASE_URL 
  },
  { 
    titulo: 'Entendiendo las Métricas y Gráficos', 
    descripcion: 'Cómo leer el análisis de carga y rendimiento de tu equipo.',
    url: BASE_URL 
  },
  { 
    titulo: 'Configuración de Perfil y Notificaciones', 
    descripcion: 'Personaliza tu cuenta y mantente al tanto de los cambios en tus proyectos.',
    url: BASE_URL 
  }
]);
</script>

<style scoped>
.dashboard-bg { 
  min-height: 100vh; 
  background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.8)), url('../assets/fondo.jpg'); 
  background-size: cover; 
  background-attachment: fixed; 
}
.glass-panel { 
  background: rgba(255, 255, 255, 0.05) !important; 
  backdrop-filter: blur(12px); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 12px; 
  transition: all 0.3s ease; 
}

.video-card-link { text-decoration: none; display: block; height: 100%; }

.card-hover-effect { border-left: 0px solid #3498db; }
.card-hover-effect:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateX(10px);
  border-left: 5px solid #3498db;
}

.video-icon-container { min-width: 60px; text-align: center; }
.letter-spacing-1 { letter-spacing: 1px; }
.opacity-5 { opacity: 0.2; }
.h-full { height: 100%; }
</style>