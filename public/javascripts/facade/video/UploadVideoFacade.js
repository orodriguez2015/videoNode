/**
 * Clase fachada utilizada para poder subir video al servidor, y más concretamente al directorio
 * de la videoteca del usuario
 * 
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class UploadVideoFacade {

    constructor() {
        /*
         * ID del div que contiene la lista HTML con ficheros seleccionados
         * por el usuario para realizar subida de los mismos al servidor
         */
        this.DIV_MSG_FICHEROS_SELECCIONADOS ="msgFicherosSeleccionados";
        this.mostrarBotoneraVideo(false);

    }// constructor


    /**
     * Procesa los ficheros de tipo File seleccionados por el usuario
     * @param {ficheros} Colección con los objetos de tipo File seleccionados por el usuario
     */
    procesarFicheros() {
        console.log("procesarFicheros")
        var ficheros = $("input[type=file]")[0].files;    

        if(ficheros!=null && ficheros!=undefined) {
            var nombres = new Array();

            for(var i=0;i<ficheros.length;i++) {
                var nombreFichero = ficheros[i].name;
                var sizeFichero = ficheros[i].size;
                nombres.push(nombreFichero);

            }// for

            this.mostrarFicherosSeleccionados(nombres);
        }// if
    };

    /**
     * Muestra la lista de ficheros seleccionados por el usuario para subir al servidor
     * @param {files} Colección con los ficheros seleccionados
     */
    mostrarFicherosSeleccionados(ficheros) {
        
        if(ficheros!=null && ficheros!=undefined) {

            var salida = "<p>" + messages.archivos_seleccionados + "</p>";
            for(var i=0;i<ficheros.length;i++) {
                
                salida = salida + "<li>" + ficheros[i] + "</li>";
            }// for

            $('#' + this.DIV_MSG_FICHEROS_SELECCIONADOS).html(salida);
            $('#' + this.DIV_MSG_FICHEROS_SELECCIONADOS).css("display","block");
            
        }// if
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


}


var uploadVideoFacade = new UploadVideoFacade();