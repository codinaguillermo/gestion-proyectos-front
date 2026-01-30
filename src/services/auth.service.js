/* Su único trabajo es hablar con el mundo exterior (el Backend).
No sabe nada de tu aplicación de Vue; solo sabe que recibe un email/password, 
lo envía y devuelve lo que el servidor le responda

Función: Llama al Servicio para obtener los datos, pero luego decide qué hacer con ellos.
Responsabilidad: Es quien guarda el token en el localStorage, quien decide si el usuario 
    está "logueado" o no, y quien avisa a los componentes de Vue que la sesión cambió.
Reactividad: Este es el que hace que, si te deslogueas, desaparezca tu nombre de la 
pantalla instantáneamente.
*/
import api from './api';

export const authService = {
    async login(email, password) {
        // Solo pedimos los datos y los devolvemos. 
        // No guardamos nada acá para no puentear al Store.
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    }
    // El logout lo manejamos directo en el Store
};