/**
 * Fachada para gestionar el alta de fotografías al servidor
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class UploadFileFacade {
    
    /**
     * Constructor de la clase 
     */
    constructor() {
        this.instance;
        this.URL_UPLOAD = "/upload";
        this.ID_DIV_MSG_ERROR = "msgErrorUpload";
        this.ID_DIV_MSG_SUCCESS = "msgSuccessUpload";
        this.PROCESSING_MODAL = "processingModal";
        this.DIV_MSG_FICHEROS_SELECCIONADOS ="msgFicherosSeleccionados";
        this.DIV_MSG_ERROR_FICHEROS_SELECCIONADOS ="msgErrorFicherosSeleccionados";
        this.TIPOS_MIME_ADMITIDOS = new Array("image/jpeg", "image/png", "image/gif", "image/tiff");
        this.FICHEROS_FORMATO_NO_VALIDO = new Array();
        this.IMAGEN_FICHERO_CORRECTO = "/images/correcto.png";
        this.IMAGEN_FICHERO_INCORRECTO = "/images/incorrecto.png";
    }


    /**
     * Devuelve la única instancia existente de esta clase
     */
    static getInstance() {
         if(this.instance==undefined) {
            this.instance = new UploadFileFacade();
         }

         return this.instance;
    }


    /**
     * Función que se invoca a la hora de subir los archivos al servidor. Ejecuta las validaciones y si todo es correcto,
     * envía un objeto FormData con los ficheros al servidor
     * @param {config} Objeto con los valores de los diferentes parámetros de configuración
     */
    enviarFicheros(config) {
        var idAlbum = config.idAlbum;

        if (config == undefined || config.idAlbum == undefined) {
            this.showMessageUpload(ID_DIV_MSG_ERROR, messages.mensaje_error_album_desconocido);
            return false;
        } else {

            if (this.validateFormatFiles()) {
                /**
                 * Se muestra la barra de progreso
                 */
                progressFacade.init({
                    idProgressModal: this.PROCESSING_MODAL,
                    txtModalHeader: messages.procesando_fotografias
                });
                progressFacade.show();

                /**
                 * Se crea el objeto FormData en el que se aloja cada fichero para
                 * ser enviado por AJAX
                 */
                var data = new FormData();
                jQuery.each(
                    $("input[type=file]")[0].files,
                    function(i,file) {
                        data.append("file-" + i,file);
                    }
                );

                /**
                 * Envío por POST de los archivos al servidor
                 */
                $.ajax({
                    url: this.URL_UPLOAD + "?idAlbum=" + idAlbum,
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false,
                    type: "POST",
                    success: this.onSuccessUploadFiles.bind(this), // Se hace el bind para asociar el objeto actual a esta función, sino no se puede llamar a métodos del mismo objeto
                    error: this.onErrorUploadFiles.bind(this) // bind es necesario para que desde onErrorUploadFiles se pueda llamar a métodos de esta clase
                });
                
            } // else
        }

        return false;
    };


    /**
     * Función que se invoca cuando el upload de archivos al servidor ha lanzado un error
     * @param {err} Error devuelve desde el servidor
     */
    onErrorUploadFiles(err) {
        progressFacade.hide();
        this.showMessageUpload(this.ID_DIV_MSG_ERROR, messages.mensaje_error_procesar_fotos);
        this.emptySelectedFiles();
    };


    /**
     * Permite habilitar/deshabilitar el botón de enviar
     * @param {value} True si se deshabilita el botón de enviar o false en caso contrario
     */
    disableSendButton(value) {
        $('#botonEnviar').attr('disabled', value);
    }

    /**
     * Función que es invocada cuando el envio de los archivos al servidor se ha ejecutado correctamente
     * @param {data} Respuesta del servidor
     */
    onSuccessUploadFiles(data) {    
        switch (data.status) {
            case 0:
                {
                    progressFacade.hide();
                    if (data.proceso != undefined || data.proceso.length > 0) {
                        this.showMessageUploadList(this.ID_DIV_MSG_SUCCESS, messages.resultados, this.toStringArray(data));

                    } else {
                        this.showMessageUpload(this.ID_DIV_MSG_SUCCESS, messages.fotografias_incluidas_album);
                    }

                    this.emptySelectedFiles();
                    this.disableSendButton(true);
                    break;
                }

            case -1:
                {
                    progressFacade.hide();
                    this.showMessageUpload(this.ID_DIV_MSG_ERROR, messages.mensaje_error_grabar_fotografias);
                    this.emptySelectedFiles();
                    this.disableSendButton(true);
                    break;
                }
            case -2:
                {
                    progressFacade.hide();
                    this.showMessageUpload(this.ID_DIV_MSG_ERROR, messages.mensaje_error_conexion_bbdd);
                    this.emptySelectedFiles();
                    this.disableSendButton(true);
                    break;
                }

            case -3:
                {
                    progressFacade.hide();
                    this.showMessageUpload(this.ID_DIV_MSG_ERROR, messages.memsaje_error_generar_miniaturas_imagenes);
                    this.emptySelectedFiles();
                    this.disableSendButton(true);
                    break;
                }

            case -4:
                {
                    progressFacade.hide();
                    this.showMessageUpload(this.ID_DIV_MSG_ERROR, messages.mensaje_error_iniciar_transaccion);
                    this.disableSendButton(true);
                    this.emptySelectedFiles();
                    break;
            }

            case -5:{
                progressFacade.hide();
                this.showMessageUpload(this.ID_DIV_MSG_ERROR, messages.mensaje_error_subida_fotografias_error);
                if (data.proceso != undefined || data.proceso.length > 0) {
                    this.showMessageUploadList(this.ID_DIV_MSG_SUCCESS, messages.resultados, this.toStringArray(data))
                }
                this.disableSendButton(true);
                this.emptySelectedFiles();
                break;
            }
        }
    };


    /**
     * Devuelve un array con los nombres de los ficheros
     * @param {resultado} Objeto con los resultados de procesar las fotografías
     */
    toStringArray(resultado) {
        var salida = new Array();

        if (resultado != undefined && resultado.proceso != undefined) {
            for (var i = 0; i < resultado.proceso.length; i++) {

                var proceso = resultado.proceso[i];

                switch (resultado.proceso[i].status) {
                    case 0:
                        {
                            salida.push(messages.imagen_incluida_album_1 + resultado.proceso[i].nombre + messages.imagen_incluida_album_2);
                            break;
                        }

                    case 1:
                        {
                            salida.push(messages.imagen_incluida_album_1 + resultado.proceso[i].nombre + messages.imagen_existe_album);
                            break;
                        }
                    case 2:
                        {
                            salida.push(messages.fichero + resultado.proceso[i].nombre + messages.fichero_no_imagen);
                            break;
                        }

                    case 3: {
                        salida.push(messages.mensaje_error_generacion_miniatura + resultado.proceso[i].nombre);
                        break;
                    }    
                } // switch
            } // for
        } // if
        return salida;
    };



    /**
     * Valida el formato de los ficheros que se pretenden subir al servidor
     */
    validateFormatFiles() {
        var exito = true;
        var erroresEnArchivos = false; // Para comprobar si hay errores
        var maximoDeArchivos = NUM_MAX_FILES_UPLOAD; // El número máximo de archivos que se podrán enviar
        var pesoMaximoPorArchivo = 100000; // El peso máximo en bytes por archivo.
        var matrizDeTiposAdmitidos = new Array("image/jpeg", "image/png", "image/gif", "image/tiff");
        var erroresTipoAdmitidos = new Array();
        var archivosSeleccionados = $("#ficheros")[0]["files"];

        var numMaxArchivos = false;
        // Si se excede el número de archivos, marcamos que hay error.
        if (archivosSeleccionados.length > maximoDeArchivos) {
            exito = false;
            this.showMessageUpload(this.ID_DIV_MSG_ERROR, messages.mensaje_error_subir_maximo_fotografías_1 + maximoDeArchivos + messages.mensaje_error_subir_maximo_fotografías_2);
            this.emptySelectedFiles();

        } else {

            if (!erroresEnArchivos) {
                // Si no hay error, seguimos comprobando
                for (var archivo in archivosSeleccionados) {
                    if (archivosSeleccionados[archivo]["name"] != undefined && archivosSeleccionados[archivo]["type"] != undefined) {
                        if (archivo != parseInt(archivo)) continue;
                        
                        if (matrizDeTiposAdmitidos.indexOf(archivosSeleccionados[archivo]["type"]) < 0) {
                            erroresTipoAdmitidos.push(archivosSeleccionados[archivo]["name"]);
                            erroresEnArchivos = true;
                        }
                    }
                }
            }


            if (erroresEnArchivos) {
                if (erroresTipoAdmitidos.length > 0) {
                    var msgError = "";
                    for (var i = 0; erroresTipoAdmitidos != null && i < erroresTipoAdmitidos.length; i++) {
                        msgError = msgError + erroresTipoAdmitidos[i];
                        if (erroresTipoAdmitidos.length - i > 1) {
                            msgError = msgError + ",";
                        }
                    } // for

                    this.showMessageUploadList(this.ID_DIV_MSG_ERROR, messages.mensaje_error_archivos_no_son_imagenes, erroresTipoAdmitidos);
                }
                this.emptySelectedFiles();
                exito = false;
            } else if (archivosSeleccionados.length == 0) {
                this.showMessageUpload(this.ID_DIV_MSG_ERROR, messages.mensaje_error_archivos_no_son_imagenes);
                this.hideDivMessage(this.ID_DIV_MSG_SUCCESS);
                exito = false;
            }
        }

        return exito;
    };

    /**
     * Borra los ficheros seleccionadas, sustituyendo el campo de tipo file por
     * uno nuevo del mismo tipo de datos y nombre/id
     */
    emptySelectedFiles() {
        progressFacade.hide();
        this.replaceFieldSelectedFiles(this.ID_DIV_MSG_ERROR, this.ID_DIV_MSG_SUCCESS);
    };

    /**
     * Reemplaza el campo input de tipo file por otro igual, para poder vaciar
     * los ficheros seleccionados que el usuario pudiese haber seleccionado con anterioridad
     * @param idDivMsgError Id del div que muestra los mensajes de error
     * @param idDivMsgUpload Id del div que muestra los mensajes de éxito
     */
    replaceFieldSelectedFiles(idDivMsgError, idDivMsgUpload) {
        this.vaciarCamposFicheros();

        /**
         * Se oculta los div que muestra los mensajes de éxito y error en el caso de que estuviesen visibles
         * Se deshabi
         */

        $("#ficheros").on("click", function(e) {
            $("#" + idDivMsgError).css("display", "none");
            $("#" + idDivMsgUpload).css("display", "none");
        });

        $("#ficheros").on("change", function(e) {
            $("#" + idDivMsgError).css("display", "none");
            $("#" + idDivMsgUpload).css("display", "none");
            $('#botonEnviar').attr("disabled", false);
        });
    };

    /**
     * Muestra un mensaje en el área de mensajes de error
     * @param idDivError Id del div en el que se muestra el error
     * @param msg Mensaje de error a mostrar
     */
    showMessageUpload(idDivError, msg) {
        if (msg != null && msg != undefined && msg.length > 0) {
            $("#" + idDivError).html(msg);
            this.showDivMessage(idDivError);
        }
    };

    /**
     * Muestra un mensaje de error con un determinado texto fijo, y un texto variable que depende
     * del contenido del array <param>ficheros</param>
     * @param idDivError Id del div en el que se muestra el error
     * @param title Mensaje de error que se muestra a modo de título
     * @param ficheros Mensaje de error que se muestra a modo de título
     */
    showMessageUploadList(idDivError, title, ficheros) {
        if (title != null && title != undefined && title.length > 0) {
            if (ficheros != undefined && ficheros.length > 0) {
                var lista = "<ul>";
                for (var i = 0; ficheros != undefined && i < ficheros.length; i++) {
                    lista = lista + "<li>" + ficheros[i] + "</li>";
                }
                lista = lista + "</ul>";
                title = title + lista;
            } // if

            $("#" + idDivError).html(title);
            this.showDivMessage(idDivError);
        }
    };

    /**
     * Muestra el área de mensajes
     * @param idDiv Idenficador del div
     */
    showDivMessage(idDiv) {
        $("#" + idDiv).css("display", "block");
    };

    /**
     * Oculta el área de mensajes
     * @param idDiv Idenficador del div
     */
    hideDivMessage(idDiv) {
        $("#" + idDiv).css("display", "none");
    };


    /**
     * Esta función se encarga de eliminar dinámicamente el campo de tipo file para crear uno nuevo
     * de forma dinámica
     */
    vaciarCamposFicheros() {
    
        this.FORM_DATA = new FormData();

        // Se elimina el campo de tipo file con id="ficheros"
        var ficheros = $('#ficheros');
        ficheros.remove();

        // Se crea dinámicamente el campo de tipo file con id="ficheros" dentro del span cno id="inputFile"
        $('#inputFile').append("<input type=\"file\" name=\"ficheros[]\" multiple id=\"ficheros\" class=\"btn btn-primary\"/>");

        // Es necesario añadir de nuevo los eventos correspondiente para detectar el cambio en el input recién creado.
        // Esto se debe al haber sido eliminado anteriormente, se eliminan los listener que existiesen sobre el mismo
        $("#ficheros").on("change", function(e) {    
            UploadFileFacade.getInstance().procesarFicheros();
        });

        $("#ficheros").on("click", function(e) {        
            UploadFileFacade.getInstance().onClickEventInputFicheros();
        });
    
    }


    /**
     * Método invocado cuando se hace click sobre el botón [Seleccionar] que permite seleccionar ficheros
     */
    onClickEventInputFicheros() {
        this.mostrarMensajeErrorFicherosSeleccionados(false);
        this.mostrarMensajeFicherosSeleccionados(false);
        this.vaciarListaFicherosFormatoNoValidos();
        this.hideDivMessage();
    }

    /**
     * Método invocado cuando se hace click sobre el botón [Cancelar]
     */
    onClickBotonCancelar() {
        this.mostrarMensajeFicherosSeleccionados(false);
        this.mostrarBotoneraVideo(false);
        this.mostrarMensajeErrorFicherosSeleccionados(false);
        this.vaciarListaFicherosFormatoNoValidos();
        this.vaciarCamposFicheros();
        this.hideDivMessage();
    }


     /**
     * Muestra la lista de ficheros seleccionados por el usuario para subir al servidor
     * @param {files} Colección con los ficheros seleccionados
     */
    mostrarFicherosSeleccionados(resultado) {
        
        var mime = (this.TIPOS_MIME_ADMITIDOS!=null)?new String(this.TIPOS_MIME_ADMITIDOS):"";
        var tiposMime = mime.split(",");

        if(resultado!=null && resultado!=undefined && resultado.length>0 ) {

            var salida = "<p>" + messages.archivos_seleccionados + "</p>";
            for(var i=0;i<resultado.length;i++) { 

                var fichero  = resultado[i];
                var imagen = window.location.origin + this.IMAGEN_FICHERO_CORRECTO;
                var tooltip = messages.archivo_foto_permitido_1 +  fichero.nombre + messages.archivo_foto_permitido_2;

                if(!tiposMime.includes(fichero.mime)) {
                    imagen = window.location.origin + this.IMAGEN_FICHERO_INCORRECTO;
                    tooltip = messages.archivo_foto_permitido_1 +  fichero.nombre + messages.archivo_foto_permitido_2;
                }
                
                salida = salida + "<li>" + fichero.nombre + "&nbsp;&nbsp;" + "<img width=20 height=20 title='" + tooltip + "' alt='" + tooltip + "' src='"  + imagen + "'></li>";

            }// for

            $('#' + this.DIV_MSG_FICHEROS_SELECCIONADOS).html(salida);
            $('#' + this.DIV_MSG_FICHEROS_SELECCIONADOS).css("display","block");
            
        }// if

        if(this.FICHEROS_FORMATO_NO_VALIDO!=undefined && this.FICHEROS_FORMATO_NO_VALIDO.length>0) {
            this.vaciarCamposFicheros();
        }
    }// mostrarFicherosSeleccionados


     /**
     * Permite mostrar o ocultar el área con los ficheros seleccionados
     * @param {boolean} flag 
     */
    static mostrarMensajeErrorFicherosSeleccionados(flag) {
        var valor = "none";
        if(flag) {
            valor = "block";
        }
        $('#' + this.DIV_MSG_ERROR_FICHEROS_SELECCIONADOS).css("display",valor);
    }


    /**
     * Procesa los ficheros de tipo File seleccionados por el usuario
     * @param {ficheros} Colección con los objetos de tipo File seleccionados por el usuario
     * @return Objeto con atributos:
     *           nombresFicheros que representa un array con los nombres de los ficheros seleccionados
     *           tiposFicheros que representa un array con los tipos de los ficheros seleccionados
     */
    procesarFicheros() {
        var ficheros = $("input[type=file]")[0].files;    
        var datos = new Array();
        var mime = (this.TIPOS_MIME_ADMITIDOS!=null)?new String(this.TIPOS_MIME_ADMITIDOS):"";
        var tiposMime = mime.split(",");

    
        if(ficheros!=null && ficheros!=undefined) {

            for(var i=0;i<ficheros.length;i++) {
                var nombreFichero = ficheros[i].name;
                var sizeFichero = ficheros[i].size;
                var tipo = ficheros[i].type;

                var dato = {};
                dato.nombre = ficheros[i].name;
                dato.mime   = ficheros[i].type;
                dato.tamano = ficheros[i].size;

                datos.push(dato);

                if(!tiposMime.includes(tipo)) {
                    this.FICHEROS_FORMATO_NO_VALIDO.push(nombreFichero);
                }

            }// for

            this.mostrarFicherosSeleccionados(datos);
            this.mostrarBotoneraVideo(true);

            if(this.FICHEROS_FORMATO_NO_VALIDO.length>0) {
                this.deshabilitarBotonEnviar(true);
                this.anadirMensajeErrorFicherosSeleccionados(messages.mensaje_seleccion_fotos_no_validas);
                this.mostrarMensajeErrorFicherosSeleccionados(true);
                this.vaciarCamposFicheros();
                this.vaciarListaFicherosFormatoNoValidos();
            }

        }// if

        return datos;
    };


    /**
     * Vacía la lista de ficheros con formato no válido seleccionados por el usuariorario
     */
    vaciarListaFicherosFormatoNoValidos() {
        this.FICHEROS_FORMATO_NO_VALIDO = new Array();
    }

     /**
     * Muestra la botonera de video
     * @param {boolean} flag : True para mostrar la botonera de la pantalla de upload video y false en caso contrario
     */
    mostrarBotoneraVideo(flag) {

        var value ="none";
        var disabled = true;
        if(flag!=undefined && flag!=null && flag==true) {
            value = "block";
            disabled = false;
        } 

        $('#botonEnviar').attr("disabled", disabled);
        $('#botonCancelar').attr("disabled", disabled);
        $('#botonEnviar').css("display",value);
        $('#botonCancelar').css("display",value);
    }


     /**
     * Permite habilitar/deshabilitar el botón de envio del formulario
     * @param {Boolean} flag 
     */
    deshabilitarBotonEnviar(flag) {
        if(flag !=undefined && flag!= null) {
            $('#botonEnviar').attr('disabled',flag);
        }
    }


    /**
     * Permite mostrar o ocultar el área con los ficheros seleccionados
     * @param {boolean} flag 
     */
    mostrarMensajeErrorFicherosSeleccionados(flag) {
        var valor = "none";
        if(flag) {
            valor = "block";
        }
        $('#' + this.DIV_MSG_ERROR_FICHEROS_SELECCIONADOS).css("display",valor);
    }

    
    /**
     * Permite mostrar o ocultar el área con los ficheros seleccionados
     * @param {boolean} flag 
     */
    mostrarMensajeFicherosSeleccionados(flag) {
        var valor = "none";
        if(flag) {
            valor = "block";
        }
        $('#' + this.DIV_MSG_FICHEROS_SELECCIONADOS).css("display",valor);
    }


    /**
     * Añade un mensaje de error para que sea mostrado en el área de mensajes de error
     * @param {String} msg Mensaje a mostrar
     */
    anadirMensajeErrorFicherosSeleccionados(msg) {

        // Se vacia el div de errores
        $('#' + this.DIV_MSG_ERROR_FICHEROS_SELECCIONADOS).html("");
        // Se muestra mensaje nuevo en div de errores
        $('#' + this.DIV_MSG_ERROR_FICHEROS_SELECCIONADOS).html(msg);

        /*
        * Se muestra  el área de mensaje de error
        */
       this.mostrarMensajeErrorFicherosSeleccionados(true);
    }


     /**
     * Muestra la lista de ficheros seleccionados por el usuario para subir al servidor
     * @param {files} Colección con los ficheros seleccionados
     */
    mostrarFicherosSeleccionados(resultado) {
        
        var mime = (this.TIPOS_MIME_ADMITIDOS!=null)?new String(this.TIPOS_MIME_ADMITIDOS):"";
        var tiposMime = mime.split(",");

        if(resultado!=null && resultado!=undefined && resultado.length>0 ) {

            var salida = "<p>" + messages.archivos_seleccionados + "</p>";
            for(var i=0;i<resultado.length;i++) { 

                var fichero  = resultado[i];
                var imagen = window.location.origin + this.IMAGEN_FICHERO_CORRECTO;
                var tooltip = messages.archivo_foto_permitido_1 +  fichero.nombre + messages.archivo_foto_permitido_2;

                if(!tiposMime.includes(fichero.mime)) {
                    imagen = window.location.origin + this.IMAGEN_FICHERO_INCORRECTO;
                    tooltip = messages.archivo_foto_permitido_1 +  fichero.nombre + messages.archivo_foto_no_permitido;
                }
                
                salida = salida + "<li>" + fichero.nombre + "&nbsp;&nbsp;" + "<img width=20 height=20 title='" + tooltip + "' alt='" + tooltip + "' src='"  + imagen + "'></li>";

            }// for

            $('#' + this.DIV_MSG_FICHEROS_SELECCIONADOS).html(salida);
            $('#' + this.DIV_MSG_FICHEROS_SELECCIONADOS).css("display","block");
            
        }// if
    }// mostrarFicherosSeleccionados

};


UploadFileFacade.getInstance().mostrarBotoneraVideo(false);
