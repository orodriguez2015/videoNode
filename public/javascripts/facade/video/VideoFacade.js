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

}

var videoFacade = new VideoFacade();