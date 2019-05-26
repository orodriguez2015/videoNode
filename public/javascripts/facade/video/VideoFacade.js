/**
 * Clase VideoFacade con operaciones de utilidad para envio de peticiones al servidor
 * para el trabajo con videoteca
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class VideoFacade {

    /**
     * Constructor
     */
    constructor() {
        this.URL_COMPROBAR_RUTA_VIDEOTECA = "/videoteca/comprobarRutaCarpetaUsuario";
        this.URL_COMPROBAR_RUTA_VIDEOTECA_USUARIO = "/videoteca/comprobarRutaOtraVideotecaUsuario";
        this.URL_GUARDAR_VIDEOTECA = "/videoteca/guardar";
        this.URL_VIDEOTECA = "/videoteca";
    };

    /**
     * Comprueba si una carpeta de una videoteca ya está asociada a otra carpeta del usuario actual
     * @param {String} carpeta Carpeta a comprobar
     * @param {function} onSuccess Función invocada en caso de éxito
     * @param {function} onError Función invocada en caso de fallo
     */
    existeRutaCarpetaUsuario(carpeta,onSuccess,onError) {
        
        return $.ajax({
            async: false,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: {carpeta:carpeta},
            url: this.URL_COMPROBAR_RUTA_VIDEOTECA,
            success: onSuccess,
            error: onError
        });
    };



   /**
     * Almacena una videoteca
     * @param videoteca Objeto con los datos de la videoteca
     * @param onSuccess: Función invocada en caso de éxito
     * @param onError: Función invocada en caso de fallo
     */
    saveVideoteca(videoteca,onSuccess,onError) {
        
        return $.ajax({
            async: false,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: videoteca,
            url: this.URL_GUARDAR_VIDEOTECA,
            success: onSuccess,
            error: onError
        });
    };


    /**
     * Envia al servidor la petición de borrado de una videoteca
     * @param id Objeto con los datos de la videoteca
     * @param onSuccess Función invocada en caso de éxito
     * @param onError Función invocada en caso de fallo
     */
    deleteVideoteca(id,onSuccess,onError) {

        bootbox.confirm({
            title: messages.atencion_titulo_modal,
            message: messages.mensaje_eliminar_videoteca_1 + " " +  id + " " +  messages.mensaje_eliminar_videoteca_2,
            buttons: {
                cancel: {
                    label: messages.boton_cancelar,
                    className: 'btn btn-danger'
                },
                confirm: {
                    label: messages.boton_confirmar,
                    className: 'btn btn-success'
                }
            },
            callback: function(result) {
                
                if (result) {
                    return $.ajax({
                        async: false,
                        context: this,
                        cache: false,
                        type: 'POST',
                        dataType: 'json',
                        data: null,
                        url: "/videoteca/" + id +  '?_method=DELETE',
                        success: onSuccess,
                        error: onError
                    });

                } //if
                
                
            }
        });       
    };


    /**
     * Función invocada si la ejecución del borrado de una videoteca ha tenido éxito
     * @param {Object} resultado 
     */
    onSuccessDeleteVideoteca(resultado){
        if(resultado!=undefined) {
            switch(resultado.status) {
                case 0: {
                    window.location = "/videotecas";
                    break;
                }

                case 1: {
                    messagesArea.showMessageError(messages.mensaje_error_eliminar_videoteca_crear_transaccion);
                    break;
                }

                case 2: {
                    messagesArea.showMessageError(messages.mensaje_error_eliminar_videoteca_confirmar_transaccion);
                    break;
                }

                case 3: {
                    messagesArea.showMessageError(messages.mensaje_error_eliminar_videoteca);
                    break;
                }


                default: {
                    messagesArea.showMessageError(messages.mensaje_error_eliminar_videoteca);
                    break;
                }
            }// switch
        }// if

    }



    /**
     * Función que es invocada en caso de que la llamada al servidor para borrar una videoteca
     * no se haya ejecutado correctamente
     * @param {Error} error 
     */
    onErrorDeleteVideoteca(error){
        messagesArea.showMessageError(messages.mensaje_error_eliminar_videoteca);
    }



    /**
     * Comprueba si una carpeta ya está asociada a otra videoteca del usuario actual
     * @param {Object} datos Objeto que contiene la ruta y el idVideoteca sobre la que se realiza
     * @param {function} onSuccess Función invocada en caso de éxito
     * @param {function} onError Función invocada en caso de fallo
     */
    existeRutaCarpetaOtraVideoteca(datos,onSuccess,onError) {
        
        return $.ajax({
            async: false,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: datos,
            url: this.URL_COMPROBAR_RUTA_VIDEOTECA_USUARIO,
            success: onSuccess,
            error: onError
        });
    };




    /**
     * Editar una videoteca
     * @param {Integer} id Identificador de la videoteca
     * @param {Object} videoteca Objeto con los datos de la videoteca
     * @param {function} onSuccess Función invocada en caso de éxito
     * @param {function} onError Función invocada en caso de fallo
     */
    editarVideoteca(id,videoteca,onSuccess,onError) {
        
        return $.ajax({
            async: false,
            context: this,
            cache: false,
            type: 'PUT',
            dataType: 'json',
            data: videoteca,
            url: this.URL_VIDEOTECA + "/" + id,
            success: onSuccess,
            error: onError
        });
    };



    /**
     * Elimina un vídeo del servidor
     * @param {Integer} id Identificador de la videoteca
     * @param {function} onSuccess Función invocada en caso de éxito
     * @param {function} onError Función invocada en caso de fallo
     */
    eliminarVideo(id,onSuccess,onError) {

        bootbox.confirm({
            title: messages.atencion_titulo_modal,
            message: messages.mensaje_desea_eliminar_video_1 + " " +  id + " " +  messages.mensaje_desea_eliminar_video_2,
            buttons: {
                cancel: {
                    label: messages.boton_cancelar,
                    className: 'btn btn-danger'
                },
                confirm: {
                    label: messages.boton_confirmar,
                    className: 'btn btn-success'
                }
            },
            callback: function(result) {
                
                if (result) {
                    return $.ajax({
                        async: false,
                        context: this,
                        cache: false,
                        type: 'POST',
                        dataType: 'json',
                        data: null,
                        url: "/video/" + id +  '?_method=DELETE',
                        success: onSuccess,
                        error: onError
                    });

                } // if
            }// callback
        });       
    }


    /**
     * Método a invocar en caso de éxito al eliminar un vídeo de BBDD
     * @param {data} data 
     */
    onSuccessEliminarVideo(data) {
    
        if(data!=null && data!=undefined) {
            switch(data.status) {
                
                case 0: {
                    window.location = window.location.href;
                    break;
                }

                case 1: {
                    messagesArea.showMessageError(messages.mensaje_error_eliminar_video_crear_transaccion);
                    break;
                }

                case 2: {
                    messagesArea.showMessageError(messages.mensaje_error_eliminar_video_confirmar_transaccion);
                    break;
                }

                case 3: {
                    messagesArea.showMessageError(messages.mensaje_error_eliminar_video);
                    break;
                }

                default: {
                    messagesArea.showMessageError(messages.mensaje_error_eliminar_video);
                    break;
                }
            }// switch
        }
    }// onSuccessEliminarVideo



    /**
     * Método a invocar en caso de error al eliminar un vídeo de BBDD
     * @param {data} data 
     */
    onErrorEliminarVideo(data) {
        messagesArea.showMessageError(messages.mensaje_error_eliminar_video);
    }



    /**
     * Cambia el estado de visibilidad de un vídeo
     * @param {Integer} id: Id del vídeo
     * @param {Function} onSuccess: Función onSuccess
     * @param {Function} onError: Función onError
     */
    publicarVideo(id,onSuccess,onError) {
        if(id!=null && id!=undefined) {
            var publico = $('#publico' + id).val();
        
            if(publico!=null && publico!=undefined) {

                var res = (publico==1) ? 0:1;
                var mensaje = (publico==1)?messages.mensaje_ocultar_video:messages.mensaje_mostrar_video;

                bootbox.confirm({
                    title: messages.atencion_titulo_modal,
                    message: mensaje,
                    buttons: {
                        cancel: {
                            label: messages.boton_cancelar,
                            className: 'btn btn-danger'
                        },
                        confirm: {
                            label: messages.boton_confirmar,
                            className: 'btn btn-success'
                        }
                    },
                    callback: function(result) {
                        
                        
                        if (result) {
                            return $.ajax({
                                async: false,
                                context: this,
                                cache: false,
                                type: 'POST',
                                dataType: 'json',
                                data: {publico:res},
                                url: "/video/publicar/" + id,
                                success: onSuccess,
                                error: onError
                            });
        
                        } // if
                        
                    }// callback
                });       

            }// if

        }// if
    };


    /**
     * Método invocado en caso de éxito en la llamada a cambiar la visibilidad de un vídeo
     * @param {Object} data : Respuesta del servidor
     */
    onSuccessPublicarVideo(data) {
        
        if(data!=null && data!=undefined) {

            switch(data.status) {

                case 0: {
                    var pathImage = (data.publico == 1)?"/images/ojo_abierto.png":"/images/ojo_cerrado.png";
                    $('#publico' + data.id).val(data.publico);
                    $('#imgPublico' + data.id).attr("src", pathImage);
                    break;
                }

                case 1: {
                    messagesArea.showMessageError(messages.mensaje_error_cambiar_visibidad_video);
                    break;
                }

            }// switch

        }
    };


    /**
     * Método invocado en caso de error en la llamada a cambiar la visibilidad de un vídeo
     * @param {Object} data : Respuesta del servidor
     */
    onErrorPublicarVideo(data) {
        messagesArea.showMessageError(messages.mensaje_error_cambiar_visibidad_video);
    }

}// VideoFacade

var videoFacade = new VideoFacade();