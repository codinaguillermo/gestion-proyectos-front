import api from './api';


export default {
    // Registrar una nueva observación (Docentes/Admin)
    crear(datos) {
        return api.post('/seguimientos', datos);
    },

    // Obtener promedios para el gráfico de barras del proyecto
    getStats(proyectoId) {
        return api.get(`/seguimientos/stats/${proyectoId}`);
    },

    // Obtener el historial de un alumno específico (Tabla/PDF)
    getHistorial(proyectoId, alumnoId) {
        return api.get(`/seguimientos/historial/${proyectoId}/${alumnoId}`);
    }
};