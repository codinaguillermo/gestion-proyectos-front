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

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const cargando = ref(false);

const handleLogin = async () => {
  errorMsg.value = '';
  cargando.value = true;
  
  const resultado = await authStore.login(email.value, password.value);
  
  cargando.value = false;
  
  if (resultado.success) {
    alert('¡Bienvenido a la Software Factory! ✅');
    // Aquí luego usaremos el router para ir al Dashboard
  } else {
    errorMsg.value = resultado.error;
  }
};
</script>