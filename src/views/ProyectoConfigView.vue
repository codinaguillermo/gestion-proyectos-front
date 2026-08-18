<template>
  <div class="dashboard-bg">
    <div class="main-content-wrapper">
      <div class="container mt-0 pt-4 px-2-mobile px-4-tablet pb-6">
        
        <!-- ENCABEZADO ADAPTATIVO (Reemplazo de .level por Flex/Columnas) -->
        <div class="glass-panel p-4 mb-4">
          <div class="columns is-mobile is-multiline is-align-items-center">
            <div class="column is-12-mobile is-7-tablet pb-2-mobile">
              <div class="is-flex is-align-items-center">
                <button class="button is-ghost has-text-white p-0 mr-3" @click="volver">
                  <span class="icon is-medium"><i class="fas fa-arrow-left fa-lg"></i></span>
                </button>
                <div>
                  <h1 class="title has-text-white is-size-4-mobile is-size-2-tablet mb-0">Configuración del Proyecto</h1>
                  <p class="subtitle is-size-7-mobile is-size-6-tablet has-text-grey-light uppercase-label mb-0">Gestión de datos generales y alcances</p>
                </div>
              </div>
            </div>

            <!-- BOTONES DE ACCIÓN (APILADOS EN MÓVIL) -->
            <div class="column is-12-mobile is-5-tablet pt-1-mobile is-flex is-justify-content-flex-end-tablet">
              <div class="buttons is-fullwidth-mobile mt-2-mobile">
                <router-link 
                  :to="{ name: 'backlog-proyecto', params: { id: form.id } }" 
                  class="button is-info is-outlined is-flex-grow-1-mobile mb-0"
                  title="Ir a Gestión Operativa (Backlog)"
                >
                  <span class="icon"><i class="fas fa-tasks"></i></span>
                  <span>Backlog</span>
                </router-link>

                <button class="button is-light is-outlined mb-0 is-hidden-mobile" @click="volver">Cancelar</button>
                
                <button 
                  class="button is-success has-text-weight-bold is-flex-grow-1-mobile mb-0" 
                  @click="confirmarCambios" 
                  :class="{'is-loading': guardando}"
                >
                  <span class="icon"><i class="fas fa-save"></i></span>
                  <span>GUARDAR</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="cargando" class="notification glass-notification is-info is-size-6-mobile">
          <span class="icon"><i class="fas fa-spinner fa-pulse"></i></span> Obteniendo información del servidor...
        </div>

        <!-- ESTRUCTURA PRINCIPAL RESPONSIVE -->
        <div class="columns is-variable is-4" v-else-if="form && form.id">
          
          <!-- COLUMNA IZQUIERDA: HITOS, ESTADO Y NOTAS (100% en móvil, 4 col en escritorio) -->
          <div class="column is-12-mobile is-4-desktop">
            <div class="box glass-panel p-4-mobile p-5-tablet" style="height: 100%;">
              <h3 class="title is-6-mobile is-5-tablet has-text-info border-bottom-info pb-3 mb-4 uppercase-label">
                <i class="fas fa-calendar-alt mr-2"></i> Hitos y Estado
              </h3>
              
              <div class="field mb-4">
                <label class="label has-text-grey-lighter is-small uppercase-label">Estado Actual</label>
                <div class="control has-icons-left">
                  <div class="select is-fullwidth is-dark" :class="{'is-disabled': !esDocente}">
                    <select v-model.number="form.estado_id" :disabled="!esDocente">
                      <option :value="null" disabled>Seleccione un estado</option>
                      <option v-for="est in estadosProyecto" :key="est.id" :value="est.id">{{ est.nombre }}</option>
                    </select>
                  </div>
                  <span class="icon is-left has-text-info"><i class="fas fa-signal"></i></span>
                </div>
              </div>

              <div class="columns is-mobile mb-0">
                <div class="column is-6 pb-2">
                  <div class="field mb-3">
                    <label class="label has-text-grey-lighter is-small uppercase-label">1er Cierre</label>
                    <div class="control"><input class="input is-dark is-small-mobile" type="date" v-model="form.fecha_cierre_1" :disabled="!esDocente"></div>
                  </div>
                </div>
                <div class="column is-6 pb-2">
                  <div class="field mb-3">
                    <label class="label has-text-grey-lighter is-small uppercase-label">2do Cierre</label>
                    <div class="control"><input class="input is-dark is-small-mobile" type="date" v-model="form.fecha_cierre_2" :disabled="!esDocente"></div>
                  </div>
                </div>
              </div>

              <div class="field mt-3">
                <label class="label compromise-label has-text-grey-lighter is-small uppercase-label">Notas del Proyecto</label>
                <textarea class="textarea is-dark custom-textarea" rows="5" v-model="form.descripcion" :disabled="!esDocente" placeholder="Notas adicionales..."></textarea>
              </div>
            </div>
          </div>

          <!-- COLUMNA DERECHA: PESTAÑAS Y GESTIÓN (100% en móvil, 8 col en escritorio) -->
          <div class="column is-12-mobile is-8-desktop">
            <div class="box glass-panel p-0 is-flex is-flex-direction-column" style="min-height: 550px;">
              
              <!-- NAVEGACIÓN TABS (Estilo X.com: Solo iconos en móvil, iconos + texto en escritorio) -->
              <div class="tabs is-boxed is-fullwidth mb-0 custom-tabs">
                <ul>
                  <li :class="{'is-active': tabActiva === 'alcance'}">
                    <a @click="tabActiva = 'alcance'" class="px-2-mobile" title="Alcances">
                      <span class="icon is-medium-mobile"><i class="fas fa-bullseye fa-lg"></i></span>
                      <span class="is-size-6-tablet is-hidden-mobile ml-2">Alcances</span>
                    </a>
                  </li>
                  <li :class="{'is-active': tabActiva === 'equipo'}">
                    <a @click="tabActiva = 'equipo'" class="px-2-mobile" title="Equipo">
                      <span class="icon is-medium-mobile"><i class="fas fa-users fa-lg"></i></span>
                      <span class="is-size-6-tablet is-hidden-mobile ml-2">Equipo</span>
                      <span class="tag is-small is-info is-rounded ml-1">{{ miembrosAsignados.length }}</span>
                    </a>
                  </li>
                  <li :class="{'is-active': tabActiva === 'viabilidad'}">
                    <a @click="tabActiva = 'viabilidad'" class="px-2-mobile" title="Calificaciones y Notas">
                      <span class="icon is-medium-mobile"><i class="fas fa-graduation-cap fa-lg"></i></span>
                      <span class="is-size-6-tablet is-hidden-mobile ml-2">Notas</span>
                    </a>
                  </li>
                  <li :class="{'is-active': tabActiva === 'entregables'}">
                    <a @click="tabActiva = 'entregables'" class="px-2-mobile" title="Documentaciones">
                      <span class="icon is-medium-mobile"><i class="fas fa-file-upload fa-lg"></i></span>
                      <span class="is-size-6-tablet is-hidden-mobile ml-2">Docs</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div class="p-3-mobile p-5-tablet flex-grow-1">
                
                <!-- TAB 1: ALCANCES -->
                <div v-if="tabActiva === 'alcance'" class="animate__animated animate__fadeIn">
                  <div class="field mb-4">
                    <label class="label has-text-white is-size-7-mobile is-size-6-tablet mb-2 uppercase-label">TÍTULO DEL PROYECTO</label>
                    <div class="control"><input class="input is-dark is-medium-tablet custom-input-title" type="text" v-model="form.nombre" :disabled="!esDocente"></div>
                  </div>
                  <div v-for="campo in camposAlcance" :key="campo.key" class="field mb-4">
                    <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
                      <label class="label has-text-white is-size-7-mobile is-size-6-tablet mb-0 uppercase-label">{{ campo.label }}</label>
                      <button v-if="esDocente" class="button is-small" :class="form[campo.key + 'Bloqueado'] ? 'is-danger' : 'is-success is-outlined'" @click="form[campo.key + 'Bloqueado'] = !form[campo.key + 'Bloqueado']" type="button">
                        <span class="icon is-small"><i :class="form[campo.key + 'Bloqueado'] ? 'fas fa-lock' : 'fas fa-lock-open'"></i></span>
                        <span class="is-hidden-mobile">{{ form[campo.key + 'Bloqueado'] ? 'Bloqueado' : 'Abierto' }}</span>
                      </button>
                    </div>
                    <div class="control">
                      <textarea class="textarea is-dark custom-textarea" rows="5" v-model="form[campo.key]" :disabled="!esDocente && form[campo.key + 'Bloqueado']" :placeholder="(!esDocente && form[campo.key + 'Bloqueado']) ? 'Contenido bloqueado por el docente' : 'Escriba aquí...'"></textarea>
                    </div>
                  </div>
                </div>

                <!-- TAB 2: EQUIPO -->
                <div v-if="tabActiva === 'equipo'" class="animate__animated animate__fadeIn">
                  <div class="field mb-4 buscador-relativo" v-if="esDocente">
                    <div class="control has-icons-left">
                      <input class="input is-dark is-rounded" type="text" v-model="busqueda" @input="buscarUsuarios" placeholder="Escribe apellido o nombre...">
                      <span class="icon is-left has-text-info"><i class="fas fa-search"></i></span>
                      <div v-if="resultadosBusqueda.length > 0" class="search-results-floating box p-0">
                        <a v-for="u in resultadosBusqueda" :key="u.id" @click="seleccionarUsuario(u)" class="dropdown-item-custom">
                          <div class="is-flex is-justify-content-space-between is-align-items-center">
                            <span class="text-truncate-mobile"><strong>{{ u.apellido?.toUpperCase() }}</strong>, {{ u.nombre }}</span>
                            <span class="tag is-small is-dark ml-2">{{ Number(u.rol_id) === 3 ? 'Alumno' : 'Docente' }}</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div class="columns is-multiline mb-4">
                    <!-- 1 tarjeta por fila en móviles, 2 en tablets/escritorio -->
                    <div class="column is-12-mobile is-6-tablet" v-for="miembro in miembrosAsignados" :key="miembro.id">
                      <div class="box p-3 is-dark-box">
                        <article class="media is-align-items-center">
                          <figure class="media-left"><div :class="['avatar-circle', obtenerColorAvatar(miembro.rol_id)]">{{ obtenerIniciales(miembro.nombre) }}</div></figure>
                          <div class="media-content text-truncate-mobile">
                            <p class="has-text-white has-text-weight-bold mb-0 is-size-6">{{ miembro.nombre }} {{ miembro.apellido }}</p>
                            <p class="has-text-grey-light is-size-7" v-if="miembro.telefono">TE: {{ miembro.telefono }}</p>
                          </div>
                          <div class="media-right">
                              <div class="buttons is-flex-wrap-nowrap mb-0">
                                  <button v-if="Number(miembro.rol_id) === 3" class="button is-ghost has-text-info p-1" @click="intentarVerDetalle(miembro)" title="Ver detalle de notas"><i class="fas fa-eye"></i></button>
                                  <button v-if="esDocente && Number(miembro.rol_id) === 3" class="button is-ghost has-text-info p-1" @click="abrirModalSeguimiento(miembro)" title="Agregar Seguimiento"><i class="fas fa-chart-line"></i></button>
                                  <button v-if="esDocente" class="button is-ghost has-text-danger p-1" @click="confirmarEliminacionUsuario(miembro)" title="Eliminar usuario"><i class="fas fa-user-minus"></i></button>
                              </div>
                          </div>
                        </article>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- TAB 3: VIABILIDAD / CALIFICACIONES -->
                <div v-if="tabActiva === 'viabilidad'" class="animate__animated animate__fadeIn">
                  <div class="box is-dark-box p-3-mobile p-4-tablet mb-4">
                    <div class="field">
                      <label class="label has-text-white is-size-6 uppercase-label">Aprobación de Anteproyecto</label>
                      <div class="control mt-2">
                        <label class="checkbox has-text-white is-size-6-mobile is-size-5-tablet" :class="{'is-disabled': !esDocente}">
                          <input type="checkbox" v-model="form.viable" class="mr-2" :disabled="!esDocente"> PROYECTO VALIDADO / VIABLE
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div class="field mb-4">
                    <label class="label has-text-white is-size-7 uppercase-label">Documentación de Respaldo</label>
                    <div class="field has-addons mt-1">
                      <div class="control is-expanded has-icons-left">
                        <input class="input is-dark is-small-mobile" type="text" v-model="form.documentoViabilidadLink" placeholder="Link del documento..." :disabled="!esDocente">
                        <span class="icon is-left is-small-mobile has-text-info"><i class="fas fa-link"></i></span>
                      </div>
                      <div class="control"><button class="button is-info is-small-mobile" :disabled="!form.documentoViabilidadLink" @click="abrirEnlace(form.documentoViabilidadLink)"><i class="fas fa-external-link-alt"></i></button></div>
                    </div>
                  </div>

                  <article v-if="form.viable && !form.documentoViabilidadLink" class="message is-warning is-small mb-4">
                    <div class="message-body"><strong>Falta Respaldo:</strong> No se puede considerar viable sin el link al documento digitalizado.</div>
                  </article>
                  
                  <hr class="has-background-grey-dark my-4">
                  
                  <div class="box is-dark-box p-3-mobile p-4-tablet mb-4" v-if="esDocente">
                    <h3 class="title is-6 has-text-info uppercase-label mb-3"><i class="fas fa-pen-nib mr-2"></i> Registrar Evaluación del Proceso</h3>
                    <form @submit.prevent="crearCalificacionDiaria">
                      <div class="columns is-mobile is-multiline">
                        <div class="column is-12-mobile is-4-tablet pb-1">
                          <div class="field">
                            <label class="label has-text-grey-light is-small uppercase-label">Fecha</label>
                            <div class="control"><input class="input is-dark is-small" type="date" v-model="notaForm.fecha_evaluacion" required></div>
                          </div>
                        </div>
                        <div class="column is-8-mobile is-5-tablet pb-1">
                          <div class="field">
                            <label class="label has-text-grey-light is-small uppercase-label">Hito Evaluado</label>
                            <div class="control has-icons-left">
                              <div class="select is-fullwidth is-dark is-small">
                                <select v-model.number="notaForm.hito_id" required>
                                  <option :value="null" disabled>Seleccione...</option>
                                  <option v-for="hito in listaHitos" :key="hito.id" :value="hito.id">{{ hito.nombre }}</option>
                                </select>
                              </div>
                              <span class="icon is-left is-small has-text-info"><i class="fas fa-tasks"></i></span>
                            </div>
                          </div>
                        </div>
                        <div class="column is-4-mobile is-3-tablet pb-1">
                          <div class="field">
                            <label class="label has-text-grey-light is-small uppercase-label">Nota (0-10)</label>
                            <div class="control has-icons-left">
                              <input class="input is-dark is-small" type="number" step="0.1" min="0" max="10" v-model.number="notaForm.nota" placeholder="Ej: 7.5" required>
                              <span class="icon is-left is-small has-text-info"><i class="fas fa-star-half-alt"></i></span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="field mb-3 mt-1">
                        <label class="label has-text-grey-light is-small uppercase-label">Descripción / Motivo</label>
                        <div class="control"><textarea class="textarea is-dark is-small" rows="2" v-model="notaForm.descripcion" placeholder="Motivo o justificación de la nota..."></textarea></div>
                      </div>
                      <div class="has-text-right">
                        <button class="button is-info is-small has-text-weight-bold uppercase-label" :class="{'is-loading': cargandoEnvioNota}" type="submit" :disabled="!notaForm.fecha_evaluacion">Asentar Nota</button>
                      </div>
                    </form>
                  </div>

                  <div class="box is-dark-box p-3-mobile p-4-tablet mb-4">
                    <div class="is-flex is-justify-content-space-between is-align-items-center mb-2">
                      <h4 class="title is-7-mobile is-6-tablet has-text-white uppercase-label mb-0"><i class="fas fa-chart-bar mr-2"></i> Rendimiento Grupal</h4>
                      <span class="tag is-small-mobile is-medium-tablet has-text-weight-bold" :class="obtenerColorNota(promedioProyecto)">PROMEDIO: {{ promedioProyecto }} / 10</span>
                    </div>
                    <progress class="progress is-small-mobile is-medium-tablet mt-2" :class="obtenerColorNota(promedioProyecto)" :value="promedioProyecto" max="10"></progress>
                  </div>

                  <!-- ACCORDION CON TABLA SCROLLABLE -->
                  <div class="box is-dark-box p-0 mb-4 field-accordion">
                    <button class="button is-dark is-fullwidth is-flex is-justify-content-space-between is-align-items-center p-3-mobile p-4-tablet custom-accordion-btn" type="button" @click="accordionAbierto = !accordionAbierto">
                      <span class="has-text-weight-bold uppercase-label has-text-info is-size-7-mobile text-truncate-mobile"><i class="fas fa-history mr-2"></i> Evaluaciones Diarias ({{ notasHistorial.length }})</span>
                      <span class="icon is-small"><i :class="accordionAbierto ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i></span>
                    </button>
                    <div v-if="accordionAbierto" class="p-2-mobile p-4-tablet animate__animated animate__slideInDown animate__faster container-table-accordion">
                      <div v-if="cargandoHistorial" class="has-text-centered py-4 has-text-grey-light"><span class="icon"><i class="fas fa-spinner fa-pulse"></i></span> Buscando registros...</div>
                      <div v-else-if="notasHistorial.length === 0" class="notification is-dark is-size-7 has-text-centered my-0">No se registran evaluaciones numéricas asignadas.</div>
                      <div class="table-container mb-0" v-else>
                        <table class="table is-fullwidth glass-table delivery-table-v2 mb-0">
                          <thead>
                            <tr>
                              <th class="has-text-info is-size-7 uppercase-label th-compacta-fecha">FECHA</th>
                              <th class="has-text-info is-size-7 uppercase-label th-compacta-concepto">CONCEPTO</th>
                              <th class="has-text-info is-size-7 uppercase-label has-text-centered">NOTA</th>
                              <th class="has-text-info is-size-7 uppercase-label is-hidden-mobile">EVALUADOR</th>
                              <th class="has-text-info is-size-7 uppercase-label is-hidden-mobile">MOTIVO</th>
                              <th class="has-text-info is-size-7 uppercase-label has-text-centered">ACCIONES</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="nota in notasHistorial" :key="nota.id">
                              <td class="is-size-7 custom-date-font td-compacta-fecha">{{ convertirFechaLocal(nota.fecha_evaluacion || nota.fecha) }}</td>
                              <td class="has-text-weight-bold is-size-7 td-compacta-concepto">{{ hitoNormalizado(nota) }}</td>
                              <td class="has-text-centered"><span class="tag is-small has-text-weight-bold" :class="obtenerColorNota(nota.nota)"></span></td>
                              <td class="is-size-7 has-text-grey-lighter is-hidden-mobile">{{ nota.docente_calificador?.apellido }}, {{ nota.docente_calificador?.nombre }}</td>
                              <td class="is-size-7 desc-cell-format is-hidden-mobile" :title="nota.descripcion">{{ nota.descripcion || '-' }}</td>
                              <td class="has-text-centered">
                                <div class="buttons is-centered is-flex-wrap-nowrap mb-0" v-if="esDocente">
                                  <button class="button is-small is-ghost has-text-info p-1" @click="prepararEdicionNotaGrupal(nota)" title="Editar nota grupal"><i class="fas fa-edit"></i></button>
                                  <button class="button is-small is-ghost has-text-danger p-1" @click="prepararEliminacionNotaGrupal(nota)" title="Eliminar nota grupal"><i class="fas fa-trash-alt"></i></button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- TAB 4: ENTREGABLES -->
                <div v-if="tabActiva === 'entregables'" class="animate__animated animate__fadeIn">
                  <div class="box is-dark-box p-3-mobile p-4-tablet mb-4">
                    <label class="label has-text-info uppercase-label is-size-7-mobile"><i class="fab fa-google-drive mr-2"></i> Carpeta Raíz del Proyecto</label>
                    <div class="field has-addons mt-2">
                      <div class="control is-expanded has-icons-left">
                        <input class="input is-dark is-small-mobile" type="text" v-model="form.linkDrive" placeholder="Link a la carpeta compartida..." :disabled="!esDocente">
                        <span class="icon is-left is-small-mobile has-text-info"><i class="fas fa-folder-open"></i></span>
                      </div>
                      <div class="control"><button class="button is-info is-small-mobile" :disabled="!form.linkDrive" @click="abrirEnlace(form.linkDrive)" title="Abrir carpeta"><i class="fas fa-external-link-alt"></i></button></div>
                    </div>
                    <p class="help has-text-grey-lighter is-size-7 mt-1">Acceso rápido al repositorio de archivos digitales del proyecto.</p>
                  </div>

                  <!-- Se removió el v-if="esDocente" para que los alumnos puedan agregar documentos -->
                  <div class="field has-addons mb-4">
                    <div class="control is-expanded"><input class="input is-small-mobile custom-input-entregable" type="text" v-model="nuevoEntregableNombre" placeholder="Nombre del nuevo documento..." @keyup.enter="agregarEntregableRAM"></div>
                    <div class="control"><button class="button is-info is-small-mobile" @click="agregarEntregableRAM"><i class="fas fa-plus"></i></button></div>
                  </div>

                  <div class="table-container mb-0">
                    <table class="table is-fullwidth glass-table delivery-table-v2">
                      <thead>
                        <tr>
                          <th class="has-text-info is-size-7">Documento</th>
                          <th class="has-text-info is-size-7">Enlace de Drive</th>
                          <th style="width: 40px;"></th> <!-- Se removió restricción docente del header -->
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(e, index) in form.entregables" :key="index">
                          <td class="data-text-bright is-size-7 text-truncate-mobile" style="max-width: 120px;">{{ e.nombre }}</td>
                          <td>
                            <div class="field has-addons mb-0">
                              <!-- Se removió el :disabled="!esDocente" para que los alumnos editen links -->
                              <div class="control is-expanded"><input class="input custom-input-table is-small" type="text" v-model="e.link_drive" placeholder="Pegar link..."></div>
                              <div class="control"><button class="button is-info is-small is-outlined" :disabled="!e.link_drive" @click="abrirEnlace(e.link_drive)"><i class="fas fa-external-link-alt"></i></button></div>
                            </div>
                          </td>
                          <!-- Se removió el v-if="esDocente" para que los alumnos puedan borrar links de la lista -->
                          <td class="has-text-centered"><button class="button is-ghost has-text-danger p-1" @click="prepararEliminacion(index)"><i class="fas fa-trash-alt"></i></button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODALES (Blindados para no desbordar en pantallas de móviles) -->
    <div class="modal" :class="{'is-active': mostrarModalConfirmacion}">
      <div class="modal-background" @click="mostrarModalConfirmacion = false"></div>
      <div class="modal-card">
        <header class="modal-card-head has-background-warning"><p class="modal-card-title has-text-white">Confirmar acción</p></header>
        <section class="modal-card-body">¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.</section>
        <footer class="modal-card-foot is-justify-content-flex-end"><button class="button" @click="mostrarModalConfirmacion = false">Cancelar</button><button class="button is-danger" @click="confirmarEliminar">Confirmar</button></footer>
      </div>
    </div>

    <div class="modal" :class="{'is-active': showModalError}">
      <div class="modal-background" @click="showModalError = false"></div>
      <div class="modal-card">
        <header class="modal-card-head has-background-danger"><p class="modal-card-title has-text-white">Error de Validación</p><button class="delete" @click="showModalError = false"></button></header>
        <section class="modal-card-body"><p class="has-text-weight-semibold">{{ modalErrorMsg }}</p></section>
        <footer class="modal-card-foot is-justify-content-flex-end"><button class="button is-danger" @click="showModalError = false">Entendido</button></footer>
      </div>
    </div>

    <div class="modal" :class="{'is-active': mostrarModalEdicionNotaGrupal}">
      <div class="modal-background" @click="mostrarModalEdicionNotaGrupal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head has-background-info"><p class="modal-card-title has-text-white"><i class="fas fa-edit mr-2"></i> Editar Nota Grupal</p></header>
        <section class="modal-card-body">
          <div class="field"><label class="label">Fecha Evaluada</label><div class="control"><input class="input" type="date" v-model="formEdicionGrupal.fecha_evaluacion" required></div></div>
          <div class="field"><label class="label">Concepto: <span class="has-text-info has-text-weight-bold">{{ hitoNormalizado(notaSeleccionada) }}</span></label></div>
          <div class="field"><label class="label">Nota Numérica (0 a 10)</label><div class="control"><input class="input has-text-weight-bold has-text-info" type="number" step="0.1" min="0" max="10" v-model.number="formEdicionGrupal.nota" required></div></div>
          <div class="field"><label class="label">Descripción o Feedback</label><div class="control"><textarea class="textarea" v-model="formEdicionGrupal.descripcion"></textarea></div></div>
        </section>
        <footer class="modal-card-foot is-justify-content-flex-end"><button class="button" @click="mostrarModalEdicionNotaGrupal = false">Cancelar</button><button class="button is-info" :class="{'is-loading': procesandoOperacionGrupal}" :disabled="!formEdicionGrupal.fecha_evaluacion || !formEdicionGrupal.nota || formEdicionGrupal.nota < 0 || formEdicionGrupal.nota > 10" @click="guardarEdicionNotaGrupal">Guardar Cambios</button></footer>
      </div>
    </div>

    <div class="modal" :class="{'is-active': mostrarModalEliminarNotaGrupal}">
      <div class="modal-background" @click="mostrarModalEliminarNotaGrupal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head has-background-danger"><p class="modal-card-title has-text-white"><i class="fas fa-exclamation-triangle mr-2"></i> Confirmar Eliminación</p></header>
        <section class="modal-card-body">¿Estás seguro que deseás eliminar la nota de <strong>{{ notaSeleccionada?.nota }}</strong> asentada el día <strong>{{ convertirFechaLocal(notaSeleccionada?.fecha_evaluacion) }}</strong>? Esta acción no se puede deshacer.</section>
        <footer class="modal-card-foot is-justify-content-flex-end"><button class="button" @click="mostrarModalEliminarNotaGrupal = false">Cancelar</button><button class="button is-danger" :class="{'is-loading': procesandoOperacionGrupal}" @click="confirmarEliminacionNotaGrupal">Sí, Eliminar</button></footer>
      </div>
    </div>

    <SeguimientoModal v-if="mostrarModalSeguimiento" :alumno="alumnoSeleccionado" :proyectoId="form.id" @close="mostrarModalSeguimiento = false" @success="cargarStats"/>
    <DetalleSeguimientoModal v-if="mostrarDetalle" :alumno="alumnoSeleccionado" :proyectoId="form.id" @close="mostrarDetalle = false"/>
  </div>
</template>

<script>
import { configService } from '../services/config.service';
import { projectService } from '../services/project.services';
import { tareaService } from '../services/tarea.service';
import seguimientoService from '../services/seguimiento.service';
import calificacionServices from '../services/calificacion.service';
import SeguimientoModal from '../components/modals/SeguimientoModal.vue';
import DetalleSeguimientoModal from '../components/modals/DetalleSeguimientoModal.vue'; 
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

export default {
  components: { SeguimientoModal, DetalleSeguimientoModal },
  data() {
    return {
      cargando: true, guardando: false, tabActiva: 'alcance', proyectoOriginal: null, busqueda: '', resultadosBusqueda: [],
      nuevoEntregableNombre: '', estadosProyecto: [], prioridades: [], todasLasTareas: [], miembrosAsignados: [],
      mostrarModalSeguimiento: false, mostrarDetalle: false, alumnoSeleccionado: null, showModalError: false,
      modalErrorMsg: '', accordionAbierto: false, cargandoHistorial: false, cargandoEnvioNota: false, listaHitos: [], notasHistorial: [],
      notaForm: { hito_id: null, nota: null, descripcion: '', fecha_evaluacion: new Date().toISOString().split('T')[0] },
      form: { id: null, nombre: '', descripcion: '', estado_id: null, fecha_cierre_1: '', fecha_cierre_2: '', objetivo: '', alcanceFinal: '', viable: false, documentoViabilidadLink: '', linkDrive: '', entregables: [] },
      camposAlcance: [ { label: 'Objetivo General', key: 'objetivo' }, { label: 'Alcance del Proyecto', key: 'alcanceFinal' } ],
      mostrarModalConfirmacion: false, indiceEliminar: null, miembroAEliminar: null,
      mostrarModalEdicionNotaGrupal: false, mostrarModalEliminarNotaGrupal: false,
      procesandoOperacionGrupal: false, notaSeleccionada: null, formEdicionGrupal: { id: null, fecha_evaluacion: '', nota: null, descripcion: '' }
    }
  },
  computed: {
    usuarioLogueado() { const authStore = useAuthStore(); return authStore.usuario || { id: null }; },
    esDocente() { const rol = Number(this.usuarioLogueado.rol_id || this.usuarioLogueado.rolId); return rol === 1 || rol === 2; },
    promedioProyecto() { return (!this.notasHistorial?.length) ? 0 : Number((this.notasHistorial.reduce((acc, curr) => acc + Number(curr.nota), 0) / this.notasHistorial.length).toFixed(1)); }
  },
  methods: {
    async cargarTodo() {
      this.cargando = true;
      try {
        const [resConfig, resTareas] = await Promise.all([configService.getTablasMaestras(), tareaService.getAll()]);
        this.estadosProyecto = (resConfig.estadosProyecto || []).map(e => ({ ...e, id: Number(e.id) })); this.prioridades = resConfig.prioridades || []; this.todasLasTareas = resTareas.data || resTareas;
        const resProj = await projectService.getById(this.$route.params.id);
        if (resProj.success) {
          const p = resProj.data; this.proyectoOriginal = p;
          Object.assign(this.form, { id: p.id, nombre: p.nombre, descripcion: p.descripcion, fecha_cierre_1: p.fecha_cierre_1, fecha_cierre_2: p.fecha_cierre_2, objetivo: p.objetivo, alcanceFinal: p.alcanceFinal, objetivoBloqueado: p.objetivoBloqueado || false, alcanceFinalBloqueado: p.alcanceFinalBloqueado || false, viable: p.viable || false, documentoViabilidadLink: p.documentoViabilidadLink || '', linkDrive: p.linkDrive || '', entregables: p.entregables ? JSON.parse(JSON.stringify(p.entregables)) : [] });
          this.miembrosAsignados = p.integrantes || p.Usuarios || []; this.form.estado_id = null; this.$nextTick(() => { this.form.estado_id = p.estado_id ? Number(p.estado_id) : (p.EstadoProyecto?.id ? Number(p.EstadoProyecto.id) : null); });
          this.recuperarHistorialNotas(); if (this.esDocente) this.cargarHitosSelector();
        }
      } catch (err) { console.error(err); } finally { this.cargando = false; }
    },
    prepararEliminacion(index) { this.indiceEliminar = index; this.mostrarModalConfirmacion = true; },
    confirmarEliminar() {
        if (this.indiceEliminar !== null) {
            this.form.entregables.splice(this.indiceEliminar, 1);
            this.mostrarModalConfirmacion = false; this.indiceEliminar = null;
        } else if (this.miembroAEliminar !== null) {
            this.quitarMiembro(this.miembroAEliminar.id);
            this.mostrarModalConfirmacion = false; this.miembroAEliminar = null;
        }
    },
    async cargarHitosSelector() { try { this.listaHitos = (await calificacionServices.obtenerHitosMaestros()).data || await calificacionServices.obtenerHitosMaestros(); } catch (e) { console.error(e); } },
    async recuperarHistorialNotas() { this.cargandoHistorial = true; try { this.notasHistorial = await calificacionServices.obtenerCalificaciones(this.$route.params.id); } catch (e) { console.error(e); } finally { this.cargandoHistorial = false; } },
    prepararEdicionNotaGrupal(nota) { this.notaSeleccionada = nota; this.formEdicionGrupal = { id: nota.id, fecha_evaluacion: nota.fecha_evaluacion ? nota.fecha_evaluacion : (nota.fecha ? nota.fecha.split('T')[0] : ''), nota: nota.nota, descripcion: nota.descripcion || '' }; this.mostrarModalEdicionNotaGrupal = true; },
    async guardarEdicionNotaGrupal() { this.procesandoOperacionGrupal = true; try { await calificacionServices.actualizarCalificacion(this.form.id, this.formEdicionGrupal.id, this.formEdicionGrupal); this.mostrarModalEdicionNotaGrupal = false; await this.recuperarHistorialNotas(); } catch (err) { console.error(err); this.modalErrorMsg = "Error al actualizar."; this.showModalError = true; } finally { this.procesandoOperacionGrupal = false; } },
    prepararEliminacionNotaGrupal(nota) { this.notaSeleccionada = nota; this.mostrarModalEliminarNotaGrupal = true; },
    async confirmarEliminacionNotaGrupal() { this.procesandoOperacionGrupal = true; try { await calificacionServices.eliminarCalificacion(this.form.id, this.notaSeleccionada.id); this.mostrarModalEliminarNotaGrupal = false; await this.recuperarHistorialNotas(); } catch (err) { console.error(err); this.modalErrorMsg = "Error al eliminar."; this.showModalError = true; } finally { this.procesandoOperacionGrupal = false; } },
    async crearCalificacionDiaria() { if (!this.notaForm.hito_id || this.notaForm.nota === null || !this.notaForm.fecha_evaluacion) return; this.cargandoEnvioNota = true; try { const res = await calificacionServices.registrarCalificacion(this.form.id, this.notaForm); if (res.calificacion) this.notasHistorial.unshift(res.calificacion); this.notaForm = { hito_id: null, nota: null, descripcion: '', fecha_evaluacion: new Date().toISOString().split('T')[0] }; } catch (e) { console.error(e); this.modalErrorMsg = "Error al procesar."; this.showModalError = true; } finally { this.cargandoEnvioNota = false; } },
    obtenerColorNota(n) { return Number(n) < 4 ? 'is-danger' : (Number(n) < 6 ? 'is-warning' : 'is-success'); },
    convertirFechaLocal(f) { if (!f) return '-'; if (typeof f === 'string' && f.length === 10) return new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }); return new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); },
    hitoNormalizado(nota) { if (!nota) return '-'; return nota.hito_detail || nota.hito_node || nota.hito_detalle?.nombre || '-'; },
    abrirModalSeguimiento(a) { this.alumnoSeleccionado = a; this.mostrarModalSeguimiento = true; },
    abrirEnlace(url) { if (url) window.open(url.startsWith('http') ? url : `https://${url}`, '_blank'); },
    agregarEntregableRAM() { if (this.nuevoEntregableNombre.trim()) { this.form.entregables.push({ nombre: this.nuevoEntregableNombre.trim(), link_drive: '' }); this.nuevoEntregableNombre = ''; } },
    quitarMiembro(id) { this.miembrosAsignados = this.miembrosAsignados.filter(m => m.id !== id); },
    obtenerColorAvatar(r) { return Number(r) === 3 ? 'has-background-success-light has-text-success' : 'has-background-link-light has-text-link'; },
    obtenerIniciales(n) { return n ? n.split(' ').map(x => x[0]).join('').toUpperCase().substring(0, 2) : '?'; },
    async buscarUsuarios() { if (this.busqueda.length < 2) return this.resultadosBusqueda = []; try { const res = await axios.get(`/api/usuarios?q=${this.busqueda}&escuela_id=${this.proyectoOriginal.escuela_id}`, { headers: { 'Authorization': `Bearer ${useAuthStore().token}` } }); this.resultadosBusqueda = res.data.filter(u => u.activo && !this.miembrosAsignados.some(m => m.id === u.id)); } catch (err) { console.error(err); } },
    seleccionarUsuario(u) { this.miembrosAsignados.push({ ...u }); this.busqueda = ''; this.resultadosBusqueda = []; },
    async confirmarCambios() { if (!this.form.nombre.trim()) return (this.modalErrorMsg = "El nombre del proyecto es obligatorio.", this.showModalError = true); if (this.form.viable && !this.form.documentoViabilidadLink) return (this.modalErrorMsg = "Atención Profe: Para marcar el proyecto como VIABLE debe adjuntar el link del documento digitalizado de respaldo.", this.showModalError = true, this.tabActiva = 'viabilidad'); this.guardando = true; try { await axios.put(`/api/proyectos/${this.form.id}`, { ...this.form, usuariosIds: this.miembrosAsignados.map(m => m.id) }, { headers: { 'Authorization': `Bearer ${useAuthStore().token}` } }); this.volver(); } catch (e) { console.error(e); this.modalErrorMsg = "Error de conexión."; this.showModalError = true; } finally { this.guardando = false; } },
    confirmarEliminacionUsuario(miembro) { this.miembroAEliminar = miembro; this.mostrarModalConfirmacion = true; },
    intentarVerDetalle(miembro) { if (this.esDocente || this.usuarioLogueado.id === miembro.id) { this.alumnoSeleccionado = miembro; this.mostrarDetalle = true; } else { this.modalErrorMsg = "No tienes permiso para ver las notas de este compañero."; this.showModalError = true; } },
    volver() { this.$router.push('/dashboard'); }
  },
  mounted() { this.cargarTodo(); }
}
</script>

<style scoped>
.dashboard-bg { 
  min-height: 100vh; 
  background: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('../assets/fondo.jpg'); 
  background-size: cover; 
  background-position: center;
  background-attachment: fixed; 
}

@media (max-width: 768px) {
  .dashboard-bg {
    background-attachment: scroll;
  }
}

.glass-panel { 
  background: rgba(255, 255, 255, 0.05) !important; 
  backdrop-filter: blur(10px); 
  border: 1px solid rgba(255,255,255,0.1); 
  border-radius: 12px; 
}

.custom-textarea { 
  width: 100% !important; 
  max-width: 100% !important; 
  background: rgba(0, 0, 0, 0.4) !important; 
  color: white !important; 
  border: 1px solid rgba(255, 255, 255, 0.2) !important; 
  resize: vertical; 
}

.custom-input-title { 
  background: rgba(52, 152, 219, 0.15) !important; 
  color: #3498db !important; 
  border: 1px solid rgba(52, 152, 219, 0.4) !important; 
  font-weight: 700 !important; 
  text-transform: uppercase; 
}

/* Pestañas con scroll horizontal táctil y centrado en móviles */
.custom-tabs ul { 
  border-bottom: 2px solid rgba(255, 255, 255, 0.2); 
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.custom-tabs li a { 
  color: #bdc3c7 !important; 
  border-bottom: 2px solid transparent !important; 
  white-space: nowrap;
}
.custom-tabs li.is-active a { 
  background-color: rgba(52, 152, 219, 0.2) !important; 
  color: #3498db !important; 
  border-bottom-color: #3498db !important; 
}

/* Alineación de iconos estilo X.com para móviles */
@media (max-width: 768px) {
  .custom-tabs li a {
    justify-content: center;
    padding: 0.75rem 0.25rem !important;
  }
  .custom-tabs li a .icon {
    margin: 0 !important;
  }
}

.border-bottom-info { border-bottom: 2px solid rgba(52, 152, 219, 0.3); }
.border-top-info { border-top: 2px solid rgba(52, 152, 219, 0.3); } 
.buscador-relativo { position: relative; }

.search-results-floating { 
  position: absolute; 
  top: 100%; 
  left: 0; 
  width: 100%; 
  z-index: 1000; 
  background: rgba(25, 25, 25, 0.98) !important; 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  border-radius: 8px; 
  margin-top: 5px; 
  max-height: 250px; 
  overflow-y: auto; 
}
.dropdown-item-custom { 
  color: #fff !important; 
  display: block; 
  padding: 12px 16px; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.05); 
  cursor: pointer; 
}
.dropdown-item-custom:hover { background: rgba(52, 152, 219, 0.4) !important; }

.avatar-circle { 
  width: 40px; 
  height: 40px; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-weight: bold; 
  flex-shrink: 0;
}
.uppercase-label { 
  text-transform: uppercase; 
  font-size: 0.75rem; 
  letter-spacing: 1px; 
  font-weight: bold; 
}
.is-dark-box { 
  background: rgba(0,0,0,0.4); 
  border: 1px solid rgba(255,255,255,0.1); 
  border-radius: 10px; 
}
.glass-table { background-color: transparent !important; }
.delivery-table-v2 td, .delivery-table-v2 th { 
  background-color: transparent !important; 
  border-bottom: 1px solid rgba(255,255,255,0.05) !important; 
  color: white; 
  vertical-align: middle; 
}
.is-disabled { opacity: 0.5; cursor: not-allowed; }
.progress.is-dark { background-color: rgba(255, 255, 255, 0.1); }
.field-accordion { 
  border: 1px solid rgba(52, 152, 219, 0.2); 
  overflow: hidden; 
  border-radius: 8px; 
}
.custom-accordion-btn { 
  background: rgba(20, 20, 20, 0.5) !important; 
  border: none !important; 
  text-align: left; 
  cursor: pointer; 
  transition: background 0.2s ease; 
}
.custom-accordion-btn:hover { background: rgba(52, 152, 219, 0.1) !important; }
.container-table-accordion { 
  background: rgba(0, 0, 0, 0.3); 
  border-top: 1px solid rgba(255,255,255,0.05); 
  max-height: 350px; 
  overflow-y: auto; 
}
.custom-date-font { font-family: monospace; color: #a4b0be !important; }
.desc-cell-format { 
  max-width: 280px; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  color: #cbd5e1 !important; 
}
.th-compacta-fecha, .td-compacta-fecha { width: 90px !important; text-align: center; }
.th-compacta-concepto, .td-compacta-concepto { 
  max-width: 140px; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
}

/* Control de desbordamiento de texto en pantallas reducidas */
.text-truncate-mobile {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Blindaje anti-desbordamiento y ergonomía táctil para todos los modales nativos en móviles */
@media (max-width: 768px) {
  .text-truncate-mobile {
    max-width: 180px;
  }
  .is-flex-grow-1-mobile {
    flex-grow: 1 !important;
  }
  .custom-input-table {
    min-width: 130px;
  }

  /* Reglas globales de protección para modales nativos en celulares */
  .modal-card {
    margin: 0 12px !important;
    width: calc(100vw - 24px) !important;
    max-width: 500px !important;
  }
  .modal-card-head,
  .modal-card-body,
  .modal-card-foot {
    padding: 12px 16px !important;
  }
  .modal-card-title {
    font-size: 1rem !important;
    max-width: calc(100% - 30px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .modal-card-body {
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
  }
  .modal-card-foot {
    flex-wrap: wrap !important;
    gap: 8px !important;
    justify-content: stretch !important;
  }
  .modal-card-foot .button {
    width: 100% !important;
    margin: 0 !important;
  }
  /* Prioridad de pulgar: En botones de acción doble, el botón principal (guardar/confirmar/eliminar) va arriba y cancelar abajo */
  .modal-card-foot .button.is-info,
  .modal-card-foot .button.is-danger,
  .modal-card-foot .button.is-success {
    order: 1;
  }
  .modal-card-foot .button:not(.is-info):not(.is-danger):not(.is-success) {
    order: 2;
  }
}
</style>