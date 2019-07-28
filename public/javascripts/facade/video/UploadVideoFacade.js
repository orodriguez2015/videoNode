/**
 * Clase fachada utilizada para poder subir video al servidor, y más concretamente al directorio
 * de la videoteca del usuario
 * 
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class UploadVideoFacade {

    /**
     * Permite establecer la configuración 
     * 
     * @param {Object} config Objeto que contiene el id de la videoteca y un parámetro que indica que pretende 
     * subir un vídeo
     */
    static setConfiguracion(config) {

        this.DIV_MSG_FICHEROS_SELECCIONADOS ="msgFicherosSeleccionados";
        this.DIV_MSG_ERROR_FICHEROS_SELECCIONADOS ="msgErrorFicherosSeleccionados";
        this.IMAGEN_VIDEO_CORRECTO = "/images/correcto.png";
        this.IMAGEN_VIDEO_INCORRECTO = "/images/incorrecto.png";
        this.UPLOAD_VIDEOS = ""
        this.FICHEROS_FORMATO_VIDEO_NO_VALIDO = new Array();
        this.UPLOAD_VIDEO = false;
        this.URL_VIDEO_UPLOAD = "/upload/video/";
        this.URL_COMPROBAR_EXISTENCIA_VIDEO = '/videoteca/existe/video/';
        this.FORM_DATA = new FormData();


        if(config!=null && config!=undefined && config.UPLOAD_VIDEOS==true && config.ID_VIDEOTECA!=null && config.ID_VIDEOTECA!=undefined) {
            this.ID_VIDEOTECA = config.ID_VIDEOTECA;
            this.UPLOAD_VIDEO = true;
        }

        UploadVideoFacade.mostrarBotoneraVideo(false);
    }


    /**
     * Procesa los ficheros de tipo File seleccionados por el usuario
     * @param {ficheros} Colección con los objetos de tipo File seleccionados por el usuario
     * @return Objeto con atributos:
     *           nombresFicheros que representa un array con los nombres de los ficheros seleccionados
     *           tiposFicheros que representa un array con los tipos de los ficheros seleccionados
     */
    static procesarFicheros() {
        var ficheros = $("input[type=file]")[0].files;    
        var datos = new Array();
        var mime = (MIME_VIDEO_ACEPTADAS!=null)?MIME_VIDEO_ACEPTADAS:"";
        var tiposMime = mime.split(",");

        /*
         * Se inicializa el array con los nombres de archivos de vídeo no válido
         */
        UploadVideoFacade.inicializarVideosFormatoNoValido();

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
                    this.FICHEROS_FORMATO_VIDEO_NO_VALIDO.push(nombreFichero);
                }

            }// for

            UploadVideoFacade.mostrarFicherosSeleccionados(datos);
            UploadVideoFacade.mostrarBotoneraVideo(true);

            if(this.FICHEROS_FORMATO_VIDEO_NO_VALIDO.length>0) {
                UploadVideoFacade.deshabilitarBotonEnviar(true);
                UploadVideoFacade.anadirMensajeErrorFicherosSeleccionados(messages.mensaje_seleccion_videos_no_validas);
                UploadVideoFacade.mostrarMensajeErrorFicherosSeleccionados(true);
            }

        }// if

        return datos;
    };


    /**
     * Indica si el usuario ha seleccionado ficheros no válidos
     * @return {Boolean} 
     */
    static hayFicherosNoValidosSeleccionados() {
        var exito = false;

        if(this.FICHEROS_FORMATO_VIDEO_NO_VALIDO.length>0) {
            exito = true;
        }

        return exito;
    }


    /**
     * Muestra la lista de ficheros seleccionados por el usuario para subir al servidor
     * @param {files} Colección con los ficheros seleccionados
     */
    static mostrarFicherosSeleccionados(resultado) {
        
        var mime = (MIME_VIDEO_ACEPTADAS!=null)?MIME_VIDEO_ACEPTADAS:"";
        var tiposMime = mime.split(",");

        if(resultado!=null && resultado!=undefined && resultado.length>0 ) {

            var salida = "<p>" + messages.archivos_seleccionados + "</p>";
            for(var i=0;i<resultado.length;i++) { 

                var fichero  = resultado[i];
                var imagen = window.location.origin + this.IMAGEN_VIDEO_CORRECTO;
                var tooltip = messages.archivo_video_permitido_1 +  fichero.nombre + messages.archivo_video_permitido_2;

                if(!tiposMime.includes(fichero.mime)) {
                    imagen = window.location.origin + this.IMAGEN_VIDEO_INCORRECTO;
                    tooltip = messages.archivo_video_permitido_1 +  fichero.nombre + messages.archivo_video_no_permitido;
                }
                
                salida = salida + "<li>" + fichero.nombre + "&nbsp;&nbsp;" + "<img width=20 height=20 title='" + tooltip + "' alt='" + tooltip + "' src='"  + imagen + "'></li>";

            }// for

            $('#' + this.DIV_MSG_FICHEROS_SELECCIONADOS).html(salida);
            $('#' + this.DIV_MSG_FICHEROS_SELECCIONADOS).css("display","block");
            
        }// if
    }// mostrarFicherosSeleccionados



    /**
     * Inicializa la lista de videos seleccionados por el usuario que no tiene un formato válido
     */
    static inicializarVideosFormatoNoValido() {
        this.FICHEROS_FORMATO_VIDEO_NO_VALIDO = new Array();
    }

    /**
     * Devuelve la lista de videos seleccionados por el usuario que no tiene un formato válido
     * @return Array
     */
    static getVideosFormatoNoValido() {
        return this.FICHEROS_FORMATO_VIDEO_NO_VALIDO;
    }


    /**
     * Muestra la botonera de video
     * @param {boolean} flag : True para mostrar la botonera de la pantalla de upload video y false en caso contrario
     */
    static mostrarBotoneraVideo(flag) {

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
    static deshabilitarBotonEnviar(flag) {
        if(flag !=undefined && flag!= null) {
            $('#botonEnviar').attr('disabled',flag);
        }
    }

    /**
     * Permite mostrar o ocultar el área con los ficheros seleccionados
     * @param {boolean} flag 
     */
    static mostrarMensajeFicherosSeleccionados(flag) {
        var valor = "none";
        if(flag) {
            valor = "block";
        }
        $('#' + this.DIV_MSG_FICHEROS_SELECCIONADOS).css("display",valor);
    }


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


    
    static anadirMensajeErrorFicherosSeleccionados(msg) {

        // Se vacia el div de errores
        $('#' + this.DIV_MSG_ERROR_FICHEROS_SELECCIONADOS).html("");
        // Se muestra mensaje nuevo en div de errores
        $('#' + this.DIV_MSG_ERROR_FICHEROS_SELECCIONADOS).html(msg);

        /*
        * Se muestra  el área de mensaje de error
        */
       UploadVideoFacade.mostrarMensajeErrorFicherosSeleccionados(true);
    }


    /**
     * Envia los ficheros al servidor, pero previamente se encarga de comprobar que 
     * no haya sido seleccionado ningún fichero con formato de vídeo no válido
     */
    static enviarFicheros() {
        var exito  =true;
        var noValidos = UploadVideoFacade.getVideosFormatoNoValido();
        
        if(noValidos!=null && noValidos!=undefined && noValidos.length>0) {
            UploadVideoFacade.anadirMensajeErrorFicherosSeleccionados(messages.mensaje_seleccion_videos_no_validas);
            return false;
        } else {

            /**
             * Se muestra la barra de progreso
             */
            progressFacade.init({
                idProgressModal: this.PROCESSING_MODAL,
                txtModalHeader: messages.procesando_carga_video
            });
            progressFacade.show();

            /**
             * Se crea el objeto FormData en el que se aloja cada fichero para
             * ser enviado por AJAX
             */
            var filename;

            var formDataAux = new FormData();
            jQuery.each(
                $("input[type=file]")[0].files,
                function(i,file) {
                    filename = file.name;
                    formDataAux.append("file-" + i,file);
                }
            );

            this.FORM_DATA = formDataAux;
            UploadVideoFacade.procesarVideo(filename,this.ID_VIDEOTECA);
        }

        return false;  
    }


    /**
     * Esta función se encarga de eliminar dinámicamente el campo de tipo file para crear uno nuevo
     * de forma dinámica
     */
    static vaciarCamposFicheros() {

        this.FORM_DATA = new FormData();

        // Se elimina el campo de tipo file con id="ficheros"
        var ficheros = $('#ficheros');
        ficheros.remove();

        // Se crea dinámicamente el campo de tipo file con id="ficheros" dentro del span cno id="inputFile"
        $('#inputFile').append("<input type=\"file\" name=\"ficheros\" id=\"ficheros\" class=\"btn btn-primary\"/>");

        // Es necesario añadir de nuevo los eventos correspondiente para detectar el cambio en el input recién creado.
        // Esto se debe al haber sido eliminado anteriormente, se eliminan los listener que existiesen sobre el mismo
        $("#ficheros").on("change", function(e) {    
            UploadVideoFacade.procesarFicheros();
        });

        $("#ficheros").on("click", function(e) {        
            UploadVideoFacade.mostrarMensajeErrorFicherosSeleccionados(false);
            UploadVideoFacade.mostrarMensajeFicherosSeleccionados(false);
        });
    
    }


     /**
     * Comprueba si la videoteca ya tiene un video con un determinado nombre
     * @param {String} video Nombre del video junto con su extensión. Ejemplo: video01.MP4
     * @param {Integer} idVideoteca Id de la videoteca en la que se comprueba la existencia del video
     */
    static procesarVideo(video,idVideoteca) {

        if(video!=null && video!=undefined && video!="") {

            return $.ajax({
                async: false,
                context: this,
                cache: false,
                type: 'POST',
                dataType: 'json',
                data: {nombre:video},
                url: this.URL_COMPROBAR_EXISTENCIA_VIDEO + idVideoteca,
                success: UploadVideoFacade.onSuccessComprobacionExistenciaVideo,
                error: UploadVideoFacade.onErrorExisteVideo
            });
        }
    }

    /**
     * Función invocada cuando se ha comprobado la existencia de un vídeo en una videoteca
     * @param {Object} data : Respuesta del servidor
     */
    static onSuccessComprobacionExistenciaVideo(data) {
        switch(data.status) {
            case 0: {
                UploadVideoFacade.submitVideo();
                break;
            }

            case 1: {
                // Se oculta la barra de progreso
                progressFacade.hide();
                UploadVideoFacade.deshabilitarBotonEnviar(true);
                UploadVideoFacade.anadirMensajeErrorFicherosSeleccionados("Ya existe un vídeo en la videoteca del mismo nombre que el seleccionado");
                messagesArea.showMessageError("Ya existe un vídeo en la videoteca del mismo nombre que el seleccionado");
                UploadVideoFacade.vaciarCamposFicheros();
                break;
            }

            case 2: {
                // Se oculta la barra de progreso
                progressFacade.hide();
                UploadVideoFacade.deshabilitarBotonEnviar(true);
                UploadVideoFacade.anadirMensajeErrorFicherosSeleccionados("Se ha producido un error al comprobar la existencia del vídeo en la videoteca");
                messagesArea.showMessageError("Se ha producido un error al comprobar la existencia del vídeo en la videoteca");
                UploadVideoFacade.vaciarCamposFicheros();
                break;
            }
        }// switch
    }

    /**
     * Función invocada cuando se ha producido un error 
     * @param {Error} error 
     */
    static onErrorExisteVideo(error) {
        // Se oculta la barra de progreso
        progressFacade.hide();
        // Se muestran los mensajes de error
        UploadVideoFacade.anadirMensajeErrorFicherosSeleccionados("Se ha producido un error al comprobar la existencia del vídeo en la videoteca");
        messagesArea.showMessageError("Se ha producido un error al comprobar la existencia del vídeo en la videoteca");
    }


    /**
     * Envia el vídeo seleccionado al servidor
     */
    static submitVideo() {
        var urlSubida = "";
        if(this.UPLOAD_VIDEO) {
            urlSubida = this.URL_VIDEO_UPLOAD + this.ID_VIDEOTECA
           /**
            * Envío por POST de los archivos al servidor
            */
            $.ajax({
                url: urlSubida,
                data: this.FORM_DATA,
                cache: false,
                contentType: false,
                processData: false,
                type: "POST",
                success: UploadVideoFacade.onSuccessUploadFiles, // Se hace el bind para asociar el objeto actual a esta función, sino no se puede llamar a métodos del mismo objeto
                error: UploadVideoFacade.onErrorUploadFiles // bind es necesario para que desde onErrorUploadFiles se pueda llamar a métodos de esta clase
            });
        }
    }

   

    /**
     * Método invocado cuando la subida del vídeo al servidor se ha realizado con éxito
     * @param {Object} data 
     */
    static onSuccessUploadFiles(data) { 
        
        if(data!=undefined && data!=null) {
            progressFacade.hide();

            UploadVideoFacade.mostrarMensajeErrorFicherosSeleccionados(false);
            UploadVideoFacade.mostrarMensajeFicherosSeleccionados(false);
            UploadVideoFacade.deshabilitarBotonEnviar(true);

            switch(data.status) {
                case 0: {
                    messagesArea.showMessageSuccess(messages.mensaje_exito_subida_video);
                    break;
                }

                case 1: {
                    UploadVideoFacade.anadirMensajeErrorFicherosSeleccionados(messages.mensaje_error_existe_video);
                    messagesArea.showMessageError(messages.mensaje_error_existe_video);
                    break;
                }

                case 2: {
                    UploadVideoFacade.anadirMensajeErrorFicherosSeleccionados(messages.mensaje_error_video_formato_no_valido);
                    messagesArea.showMessageError(messages.mensaje_error_video_formato_no_valido);
                    break;
                }

                case 3: {
                    UploadVideoFacade.anadirMensajeErrorFicherosSeleccionados(messages.mensaje_error_video_insertar_bbdd);
                    messagesArea.showMessageError(messages.mensaje_error_video_insertar_bbdd);
                    break;
                }

            } // switch
        }// if
    }// onSucccessUploadFiles

   
    /**
     * Método invocado cuando se produce un error al enviar los vídeos por petición 
     * AJAX al servidor
     * @param {err} err 
     */
    static onErrorUploadFiles(err) { 
        progressFacade.hide();
        // Mensaje por defecto
        var mensaje = messages.mensaje_error_upload_video;

        // Si se envia otro tipo de respuesta en err.responseText
        if(err.responseText!=undefined && err.responseText!=null && err.responseText.length>0 && err.responseText!='') {

            // La respuesta de err.responseText viene en formato JSON
            var respuesta = JSON.parse(err.responseText);
        
            switch(respuesta.status) {

                case 100: {
                    mensaje = messages.mensaje_error_upload_video_excede_tamano + " " + respuesta.limite + " " + messages.mensaje_bytes;
                    break;
                }

                default: {
                    mensaje = messages.mensaje_error_upload_video;
                    break;
                }
            }// switch

        }// if
        messagesArea.showMessageError(mensaje);
        
    }// onErrorUploadFiles

}


