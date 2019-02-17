/**
 * Clase VideoFacade con operaciones de utilidad con 
 */
class VideoFacade {

    /**
     * Constructor
     */
    constructor() {
        this.URL_COMPROBAR_RUTA_VIDEOTECA = "/videoteca/comprobarRutaCarpetaUsuario";
        this.URL_GUARDAR_VIDEOTECA = "/videoteca/guardar";
        this.URL_VIDEOTECA = "/videoteca";
    };

     /**
     * Comprueba la existencia de un login en BBDD
     * @param login: Login a verificar
     * @param onSuccess: Función invocada en caso de éxito
     * @param onError: Función invocada en caso de fallo
     */
    existeRutaCarpetaUsuario(ruta,onSuccess,onError) {
        
        return $.ajax({
            async: false,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: {carpeta:ruta},
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


    onSuccessDeleteVideoteca(resultado){
        console.log("onSuccessDeleteVideoteca resultado = " + JSON.stringify(resultado));
        if(resultado!=undefined) {
            switch(resultado.status) {
                case 0: {
                    window.location = "/videoteca";
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

}

var videoFacade = new VideoFacade();