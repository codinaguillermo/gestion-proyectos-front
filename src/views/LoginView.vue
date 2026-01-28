<template>
  <section class="hero is-fullheight">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-5-tablet is-4-desktop is-3-widescreen">
            <form class="box" @submit.prevent="handleLogin">
              <h2 class="title has-text-centered">Software Factory</h2>
              
              <div class="field">
                <label class="label">Email</label>
                <div class="control has-icons-left">
                  <input v-model="email" type="email" placeholder="e.g. guille@gmail.com" class="input" required>
                  <span class="icon is-small is-left">📧</span>
                </div>
              </div>

              <div class="field">
                <label class="label">Password</label>
                <div class="control has-icons-left">
                  <input v-model="password" type="password" placeholder="*******" class="input" required>
                  <span class="icon is-small is-left">🔒</span>
                </div>
              </div>

              <div v-if="errorMsg" class="notification is-danger is-light">
                {{ errorMsg }}
              </div>

              <div class="field">
                <button class="button is-primary is-fullwidth" :class="{'is-loading': cargando}">
                  Ingresar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
const router = useRouter();

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const cargando = ref(false);

const handleLogin = async () => {
  console.log("1. Intento de login iniciado...");
  errorMsg.value = '';
  cargando.value = true;
  
  try {
    console.log("2. Llamando al Store con:", email.value);
    const resultado = await authStore.login(email.value, password.value);
    
    console.log("3. Respuesta del Store:", resultado);
    
    if (resultado && resultado.success) {
      console.log("4. Login Exitoso, intentando redirigir...");
      router.push('/dashboard'); 
    } else {
      console.log("4. Login Fallido:", resultado?.error);
      errorMsg.value = resultado?.error || 'Credenciales incorrectas';
    }
  } catch (err) {
    console.error("❌ ERROR CRÍTICO EN LOGINVIEW:", err);
    errorMsg.value = 'Error inesperado en el sistema';
  } finally {
    cargando.value = false;
  }
};
</script>