/**
 * Clase que crea un Datatable de jQuery que aloja las videotecas de un usuario para su administración
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class VideotecaAdminTableFacade extends TableFacade {

    /**
     * Constructor
     * @param {config} Objeto con la configuración que se pasará a la datatable
     */
    constructor(config) {
        // Se invoca al constructor de la superclase pasando los datos de configuración de la datatable
        super(config);
        // Se establece la función que procesa el resultado procedente del servidor para mostrarlo correctamente
        // en la databable
        super.setDataFilter(this.processVideotecaData.bind(this));
        // Se invoca al método init que carga la configuración de la datatable
        super.init();
    }



    /**
     * Procesa la respuesta del servidor y se procesa el resultado para presentar
     * los datos por pantallas
     * @param respuesta Respuesta procedente del servidor
     */
    processVideotecaData(respuesta) {
        // Se añade datos extra a la respuesta obtenida del servidor
        
        var res = JSON.parse(respuesta);
        var datos = res.data;
        for (var i = 0; datos != undefined && i < datos.length; i++) {
            // Se añaden las imágenes de la columna 5, que permiten acceder a la edición, borrado y fotografías del álbum
            var idVideoteca = datos[i][0];

            var publico = "NO";
            if (datos[i][3] == 1) {
                publico = "SI";
            }
            datos[i][3] = publico;
            var opciones = videotecaAdminTablaFacade.imgAccessVideos(idVideoteca) + "&nbsp;" + videotecaAdminTablaFacade.imgUploadVideo(idVideoteca) + "&nbsp;" + videotecaAdminTablaFacade.imgEditVideoteca(idVideoteca) + "&nbsp;" + videotecaAdminTablaFacade.imgDeleteVideoteca(idVideoteca);
            datos[i].push(opciones);

        } // for
        res.data = datos;
        return JSON.stringify(res);
    };



    /**
     * Devuelve el tag html para mostrar la imagen que permite acceder a la pantalla en la que se
     * muestran los vídeos de la videoteca
     * @param idVideoteca Id del álbum
     */
    imgAccessVideos(idVideoteca) {
        return "<img src=\"/images/camara.png\" border=\"0\" width=\"20\" height=\"20\" title=\"" + messages.titulo_videos + "\" alt=\"" + messages.titulo_videos + "\" onclick=\"window.location.href='/videoteca/videos/" + idVideoteca + "'\"/>";
    };

    /**
     * Devuelve el tag html para mostrar la imagen que permite acceder a la pantalla en la que se
     * se permite adjuntar vídeos a la videoteca
     * @param idVideoteca Id de la videoteca
     */
    imgUploadVideo(idVideoteca) {
        return "<img src=\"/images/backup.jpeg\" border=\"0\" width=\"20\" height=\"20\" title=\"" + messages.titulo_anadir_videos + "\" alt=\"" + messages.titulo_anadir_videos + "\" onclick=\"window.location.href='/videoteca/upload/" + idVideoteca + "'\"/>";
    };

    /**
     * Devuelve el tag html para mostrar la imagen que permite acceder a la pantalla en la que se
     * se permite editar una videoteca
     * @param idVideoteca Id de la videoteca
     */
    imgEditVideoteca(idVideoteca) {
        return "<img src=\"/images/pencil2.png\" border=\"0\" width=\"20\" height=\"20\" title=\"" + messages.editar + "\" alt=\"" + messages.editar + "\" onclick=\"window.location.href='/videoteca/" + idVideoteca + "'\"/>";
    };

    /**
     * Devuelve el tag html para mostrar la imagen que permite eliminar una videoteca de BBDD y disco
     * @param idVideoteca Id de la videoteca
     */
    imgDeleteVideoteca(idVideoteca) {
        return "<img src=\"/images/full_trash.png\" border=\"0\" width=\"20\" height=\"20\" title=\"" + messages.eliminar + "\" alt=\"" + messages.eliminar + "\" onclick=\"videoFacade.deleteVideoteca(" + idVideoteca + ");\"/>";
    };
}