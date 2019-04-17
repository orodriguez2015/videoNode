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
        this.IMAGEN_VIDEO_CORRECTO = "/images/correcto.png";
        this.IMAGEN_VIDEO_INCORRECTO = "/images/incorrecto.png";
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
            }// for

            this.mostrarFicherosSeleccionados(datos);
            this.mostrarBotoneraVideo(true);

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
     * Valida que los tipos de los ficheros seleccionados se encuentren entre
     * los admitidos
     */
    validarTiposMime() {

    }

}


