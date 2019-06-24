var constantes = require('../config/constantes.json');

/**
 * Clase con operaciones estáticas que presetan diferentes 
 * <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 * 
 */
class Utilities {

    /**
     * Devuelve un array con la ruta de los vídeos, tanto relativa como absoluta actualizada
     * @param {String} rutaRelativaVideoteca 
     * @param {String} rutaAbsolutaVideoteca 
     * @param {Colección con los videos de una videoteca} videos 
     */
    static convertirParametrosSqlVideos(rutaRelativaVideoteca,rutaAbsolutaVideoteca,video) {
        var salida = new Array();
        
        //console.log("rutaRelativaVideoteca = " + rutaRelativaVideoteca + ",rutaAbsolutaVideoteca = " + rutaAbsolutaVideoteca);
        //for( var i=0;videos!=undefined && i<videos.length;i++) {

            const rutaRelativaVideo = rutaRelativaVideoteca + constantes.FILE_SEPARATOR + video.nombre;
            const rutaAbsolutaVideo = rutaAbsolutaVideoteca + constantes.FILE_SEPARATOR + video.nombre;
            salida = [rutaRelativaVideo,rutaAbsolutaVideo,video.id];
            

        //}// for

        return salida;
    }
}


module.exports=Utilities;