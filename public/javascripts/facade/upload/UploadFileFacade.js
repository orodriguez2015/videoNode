/**
 * Fachada para gestionar el alta de archivos al servidor
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class UploadFileFacade {

    /**
     * Constructor de la clase 
     */
    constructor() {
        this.URL_UPLOAD = "/upload";
        this.ID_DIV_MSG_ERROR = "msgErrorUpload";
        this.ID_DIV_MSG_SUCCESS = "msgSuccessUpload";
        this.PROCESSING_MODAL = "processingModal";

        $("#upl").on("change", function(e) {
            $('#botonEnviar').attr("disabled", false);
        });
    }

    /**
     * Función que se invoca a la hora de subir los archivos al servidor. Ejecuta las validaciones y si todo es correcto,
     * envía un objeto FormData con los ficheros al servidor
     * @param {config} Objeto con los valores de los diferentes parámetros de configuración
     */
    uploadFiles(config) {
        var idAlbum = config.idAlbum;

        if (config == undefined || config.idAlbum == undefined) {
            this.showMessageUpload(ID_DIV_MSG_ERROR, "No se puede adjuntar fotografías: Álbum desconocido");
        } else {

            if (this.validateFormatFiles()) {
                /**
                 * Se muestra la barra de progreso
                 */
                progressFacade.init({
                    idProgressModal: this.PROCESSING_MODAL,
                    txtModalHeader: "Procesando fotografías"
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
    };


    /**
     * Función que se invoca cuando el upload de archivos al servidor ha lanzado un error
     * @param {err} Error devuelve desde el servidor
     */
    onErrorUploadFiles(err) {
        progressFacade.hide();
        this.showMessageUpload(ID_DIV_MSG_ERROR, "Se ha producido un error al procesar la/s fotografía/s");
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
                        this.showMessageUploadList(this.ID_DIV_MSG_SUCCESS, "Resultados:", this.toStringArray(data));

                    } else {
                        this.showMessageUpload(this.ID_DIV_MSG_SUCCESS, "Las fotografías han sido añadidas al álbum");
                    }

                    this.emptySelectedFiles();
                    this.disableSendButton(true);
                    break;
                }

            case -1:
                {
                    progressFacade.hide();
                    this.showMessageUpload(this.ID_DIV_MSG_ERROR, "Se ha producido un error al grabar las fotografías en base de datos");
                    this.emptySelectedFiles();
                    break;
                }
            case -2:
                {
                    progressFacade.hide();
                    this.showMessageUpload(this.ID_DIV_MSG_ERROR, "Se ha producido un error al obtener conexión a la base de datos");
                    this.emptySelectedFiles();
                    break;
                }

            case -3:
                {
                    progressFacade.hide();
                    this.showMessageUpload(this.ID_DIV_MSG_ERROR, "Se ha producido un error al obtener conexión a la base de datos");
                    this.emptySelectedFiles();
                    break;
                }

            case -4:
                {
                    progressFacade.hide();
                    this.showMessageUpload(this.ID_DIV_MSG_ERROR, "Se ha producido un error al iniciar la transacción");
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
                            salida.push("La imagen " + resultado.proceso[i].name + " ha sido añadida al álbum");
                            break;
                        }

                    case 1:
                        {
                            salida.push("La imagen " + resultado.proceso[i].name + " ya existe en el álbum");
                            break;
                        }
                    case 2:
                        {
                            salida.push("El fichero " + resultado.proceso[i].name + " no es una imagen");
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
        var archivosSeleccionados = $("#upl")[0]["files"];

        var numMaxArchivos = false;
        // Si se excede el número de archivos, marcamos que hay error.
        if (archivosSeleccionados.length > maximoDeArchivos) {
            exito = false;
            this.showMessageUpload(this.ID_DIV_MSG_ERROR, "Sólo se puede subir un máximo de 10 imágenes");
            this.emptySelectedFiles();

        } else {

            if (!erroresEnArchivos) {
                // Si no hay error, seguimos comprobando
                for (var archivo in archivosSeleccionados) {
                    if (archivosSeleccionados[archivo]["name"] != undefined && archivosSeleccionados[archivo]["type"] != undefined) {
                        if (archivo != parseInt(archivo)) continue;
                        /*
                        if (archivosSeleccionados[archivo]['size'] > pesoMaximoPorArchivo) {
                            erroresEnArchivos = true;
                            break;
                        }*/
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

                    this.showMessageUploadList(this.ID_DIV_MSG_ERROR, "Los siguientes archivos no son imágenes: ", erroresTipoAdmitidos);
                }
                this.emptySelectedFiles();
                exito = false;
            } else if (archivosSeleccionados.length == 0) {
                this.showMessageUpload(this.ID_DIV_MSG_ERROR, "Es necesario seleccionar alguna imagen");
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
        $("#upl").replaceWith('<input type="file" name="upl[]" id="upl" multiple />');

        /**
         * Se oculta los div que muestra los mensajes de éxito y error en el caso de que estuviesen visibles
         * Se deshabi
         */

        $("#upl").on("click", function(e) {
            $("#" + idDivMsgError).css("display", "none");
            $("#" + idDivMsgUpload).css("display", "none");
        });

        $("#upl").on("change", function(e) {
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
};

var uploadFileFacade = new UploadFileFacade();
uploadFileFacade.disableSendButton(true);