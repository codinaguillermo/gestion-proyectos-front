import api from './api';

/**
 * Servicio para la gestión de notas y recordatorios entre docentes.
 * Versión: 2.4.2
 * Propósito: Conectar con el endpoint de notas anidado en common.
 */
export const notaService = {
    // Obtener todas mis notas (enviadas y recibidas)
    async getMisNotas() {
        try {
            // Se usa 'common/notas-docentes' porque está definido dentro de common.routes.js
            const response = await api.get('common/notas-docentes');
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.mensaje || 'Error al obtener las notas'
            };
        }
    },

    // Crear una nueva nota
    async crear(notaData) {
        try {
            const response = await api.post('common/notas-docentes', notaData);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.mensaje || 'Error al crear la nota'
            };
        }
    },

    // Alternar estado PENDIENTE/TERMINADA
    async toggleEstado(id) {
        try {
            const response = await api.patch(`common/notas-docentes/${id}/estado`);
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.mensaje || 'Error al actualizar la nota'
            };
        }
    }
};