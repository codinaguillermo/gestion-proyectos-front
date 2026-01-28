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
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            // Guardamos el token para no perder la sesión
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.usuario));
        }
        return response.data;
    },
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};