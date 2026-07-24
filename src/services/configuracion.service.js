import api from './api';

/**
 * @función getAnioLectivo
 * @propósito Consultar al backend el valor actual de la configuración global del año lectivo (registro id: 1).
 * @a_quien_alimenta Alimenta a la función cargarAnioActual() en ConfiguracionModal.vue, al NavBar.vue para mostrar el ciclo en la cabecera, y a las vistas de calificaciones/notas al inicializarse.
 * @que_datos_retorna Retorna una Promesa que resuelve en un objeto de respuesta HTTP cuyo data contiene { success: true, data: { id: 1, nombre: 'anio_lectivo', valor: '2026' } }.
 */
const getAnioLectivo = () => {
  return api.get('/configuraciones/anio-lectivo');
};

/**
 * @función updateAnioLectivo
 * @propósito Enviar al backend el nuevo valor numérico del año lectivo para actualizar el registro global en la base de datos.
 * @a_quien_alimenta Alimenta a la función guardarConfiguracion() dentro de ConfiguracionModal.vue cuando el administrador confirma el cambio.
 * @que_datos_retorna Retorna una Promesa que resuelve en la respuesta del backend con el registro actualizado { success: true, mensaje: '...', data: { ... } }.
 */
const updateAnioLectivo = (valor) => {
  return api.put('/configuraciones/anio-lectivo', { valor });
};

/**
 * @función getAll
 * @propósito Consultar el catálogo completo de configuraciones globales de GEPRES para paneles de administración general.
 * @a_quien_alimenta Alimenta a futuras vistas de auditoría o mantenimiento de parámetros del sistema.
 * @que_datos_retorna Retorna una Promesa que resuelve en un array con todas las filas de la tabla configuraciones.
 */
const getAll = () => {
  return api.get('/configuraciones');
};

export default {
  getAnioLectivo,
  updateAnioLectivo,
  getAll
};