/* Axios es una librería que funciona como un "cartero" especializado. 
Su único trabajo es llevar una petición desde tu pantalla de Vue hasta tu 
servidor de Node.js y traer la respuesta de vuelta.
Axios entiende que hablas JSON. Cuando el backend le manda datos, Axios ya 
te los entrega como un objeto de JavaScript listo para usar, sin que tengas que 
transformarlos manualmente.
*/
import axios from 'axios';

// Creamos una instancia de axios configurada
const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Esta es la URL de tu Backend de Node
});

// Este "interceptor" servirá para que, una vez logueado, 
// el token se envíe automáticamente en cada pedido.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        //Confía en quien porte esta llave, no importa quién sea ni de dónde venga
        config.headers.Authorization = `Bearer ${token}`;
        /*
        Authorization: Es el campo donde va la identificación.
        Bearer: Indica qué tipo de identificación estás usando (un token de portador).
        ${token}: Es la llave real que generó tu Backend.

        Bearer es la palabra estándar que le avisa al servidor: "Lo que viene a continuación 
        es un Token JWT, tratalo como tal"
        */
    }
    return config;
});

export default api;

/*
El Flujo Combinado:
Axios recibe el Token del servidor.

Pinia toma ese Token y le pide al navegador: "Guardame esto en el localStorage".

La próxima vez que Axios tenga que pedir la lista de proyectos, irá al localStorage, 
sacará el Token y lo enviará al Backend para demostrar quién sos.
*/