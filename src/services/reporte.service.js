import api from './api';

/**
 * @servicio ReporteService
 * @propósito Manejar las peticiones HTTP al backend relacionadas con la exportación y reportes de datos del sistema.
 */
class ReporteService {
  /**
   * @función getFiltrosPlanilla
   * @propósito Solicitar al backend el listado de escuelas y las combinaciones de cursos/divisiones existentes.
   * @alimenta ExportarNotasModal.vue (para poblar los combobox de selección).
   * @retorna {Promise} Promesa de Axios con { success: true, data: { escuelas, cursosDivisiones } }.
   */
  getFiltrosPlanilla() {
    return api.get('/reportes/filtros-planilla');
  }

  /**
   * @función generarPlanillaExcel
   * @propósito Enviar los parámetros de filtrado al backend para procesar el motor de promedios.
   * @alimenta ExportarNotasModal.vue (para obtener el JSON que se convertirá en Excel).
   * @retorna {Promise} Promesa de Axios con { success: true, data: Array de objetos JSON purificados }.
   */
  generarPlanillaExcel(filtros) {
    return api.post('/reportes/generar-planilla', filtros);
  }
}

export default new ReporteService();