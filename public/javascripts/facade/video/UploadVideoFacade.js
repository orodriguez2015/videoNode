/**
 * Clase fachada utilizada para poder subir video al servidor, y más concretamente al directorio
 * de la videoteca del usuario
 * 
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class UploadVideoFacade {

    constructor(config) {
        /*
         * ID del div que contiene la lista HTML con ficheros seleccionados
         * por el usuario para realizar subida de los mismos al servidor
         */
        this.DIV_MSG_FICHEROS_SELECCIONADOS ="msgFicherosSeleccionados";
        this.DIV_MSG_ERROR_FICHEROS_SELECCIONADOS ="msgErrorFicherosSeleccionados";
        this.IMAGEN_VIDEO_CORRECTO = "/images/correcto.png";
        this.IMAGEN_VIDEO_INCORRECTO = "/images/incorrecto.png";
        this.UPLOAD_VIDEOS = ""
        this.FICHEROS_FORMATO_VIDEO_NO_VALIDO = new Array();
        this.UPLOAD_VIDEO = false;
        this.URL_VIDEO_UPLOAD = "/upload/video/";
        
        if(config!=null && config!=undefined && config.UPLOAD_VIDEOS==true && config.ID_VIDEOTECA!=null && config.ID_VIDEOTECA!=undefined) {
            this.ID_VIDEOTECA = config.ID_VIDEOTECA;
            this.UPLOAD_VIDEO = true;
        }

        this.mostrarBotoneraVideo(false);

      
    }// constructor


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
        var mime = (MIME_VIDEO_ACEPTADAS!=null)?MIME_VIDEO_ACEPTADAS:"";
        var tiposMime = mime.split(",");

        /*
         * Se inicializa el array con los nombres de archivos de vídeo no válido
         */
        this.inicializarVideosFormatoNoValido();

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

            this.mostrarFicherosSeleccionados(datos);
            this.mostrarBotoneraVideo(true);

            if(this.FICHEROS_FORMATO_VIDEO_NO_VALIDO.length>0) {
                this.deshabilitarBotonEnviar(true);
                this.anadirMensajeErrorFicherosSeleccionados(messages.mensaje_seleccion_videos_no_validas);
                this.mostrarMensajeErrorFicherosSeleccionados(true);
            }

        }// if

        return datos;
    };

    /**
     * Muestra la lista de ficheros seleccionados por el usuario para subir al servidor
     * @param {files} Colección con los ficheros seleccionados
     */
    mostrarFicherosSeleccionados(resultado) {
        
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
    inicializarVideosFormatoNoValido() {
        this.FICHEROS_FORMATO_VIDEO_NO_VALIDO = new Array();
    }

    /**
     * Devuelve la lista de videos seleccionados por el usuario que no tiene un formato válido
     * @return Array
     */
    getVideosFormatoNoValido() {
        return this.FICHEROS_FORMATO_VIDEO_NO_VALIDO;
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
        console.log("habilitar flag = " + flag);
        if(flag !=undefined && flag!= null) {
            $('#botonEnviar').attr('disabled',flag);
        }
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
     * Envia los ficheros al servidor, pero previamente se encarga de comprobar que 
     * no haya sido seleccionado ningún fichero con formato de vídeo no válido
     */
    enviarFicheros() {
        var exito  =true;
        console.log("enviarFicheros")
        var noValidos = this.getVideosFormatoNoValido();
        console.log("noValidos = " + JSON.stringify(noValidos));

        if(noValidos!=null && noValidos!=undefined && noValidos.length>0) {
            this.anadirMensajeErrorFicherosSeleccionados(messages.mensaje_seleccion_videos_no_validas);
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
            var data = new FormData();
            jQuery.each(
                $("input[type=file]")[0].files,
                function(i,file) {
                    data.append("file-" + i,file);
                }
            );

            /*
                * Se comprueba si lo que se está es subiendo un vídeo, en ese caso se carga
                * la url de upload de video 
                */

            var urlSubida = "";

            if(this.UPLOAD_VIDEO) {
                urlSubida = this.URL_VIDEO_UPLOAD + this.ID_VIDEOTECA
            }


            /**
             * Envío por POST de los archivos al servidor
             */
            $.ajax({
                url: urlSubida,
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                type: "POST",
                success: this.onSuccessUploadFiles.bind(this), // Se hace el bind para asociar el objeto actual a esta función, sino no se puede llamar a métodos del mismo objeto
                error: this.onErrorUploadFiles.bind(this) // bind es necesario para que desde onErrorUploadFiles se pueda llamar a métodos de esta clase
            });
        }

        return false;  
    }
    

    /**
     * Método invocado cuando la subida del vídeo al servidor se ha realizado con éxito
     * @param {Object} data 
     */
    onSuccessUploadFiles(data) {
        console.log("onSuccessUploadFiles data = " + JSON.stringify(data));
        
        if(data!=undefined && data!=null) {
            progressFacade.hide();

            switch(data.status) {
                case 0: {
                    messagesArea.showMessageSuccess(messages.mensaje_exito_subida_video);
                    break;
                }

                case 1: {
                    messagesArea.showMessageError(messages.mensaje_error_existe_video);
                    break;
                }

                case 2: {
                    messagesArea.showMessageError(messages.mensaje_error_video_formato_no_valido);
                    break;
                }

                case 3: {
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
    onErrorUploadFiles(err) {
        progressFacade.hide();
        // Mensaje por defecto
        var mensaje = messages.mensaje_error_upload_video;

        console.log("Error = " + JSON.stringify(err));
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


