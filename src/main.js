// Acá se configura todas las herramientas (Bulma, Pinia, Router) y "enchufa" la lógica de Vue 
// al archivo físico index.html


/*Aclaraciones:
Es la memoria central de tu aplicación. Imaginalo como un depósito donde guardas datos
que muchas pantallas necesitan al mismo tiempo (como el Token o el Nombre del Usuario).


*/

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'bulma/css/bulma.css'


//decirle a Vue cuál es el componente raíz (el "abuelo" de todos), que en nuestro caso es App.vue
const app = createApp(App)

//activa la memoria global que usamos para el Token
app.use(createPinia()) 


app.use(router) // ¡Importante! Enchufamos el router antes de montar

//le decimos a Vue: "Busca el DIV con el id 'app' en el HTML y toma el control total de lo 
// que pase ahí dentro"
app.mount('#app')