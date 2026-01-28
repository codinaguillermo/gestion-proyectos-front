import { createApp } from 'vue'
import { createPinia } from 'pinia' // <--- Línea nueva
import App from './App.vue'
import 'bulma/css/bulma.css'

const app = createApp(App)

app.use(createPinia()) // <--- Línea nueva
app.mount('#app')