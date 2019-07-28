
/**
 * Clase de validación de formulario de alta/edición de videoteca
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
function VideotecaValidationFacade() {

    this.prototype = new FormValidationFacade();
    this.GUARDAR_VIDEOTECA = 1;
    this.EDITAR_VIDEOTECA = 2;


    /**
     * Método init que inicializa la validación del formulario
     * @param config Configuración del plugin de validación
     * @param tipoAccion Número entero que indica el tipo de validación a aplicar
     */
    this.init = function(config,tipoAccion) {
        
        if(config!=null && config.idForm!=null && config.idForm!=undefined && config.rules!=undefined && tipoAccion!=undefined) {
            if(tipoAccion==this.GUARDAR_VIDEOTECA) {
                config.submitFunction = this.guardarVideoteca;
            } else
            if(tipoAccion==this.EDITAR_VIDEOTECA) {
                config.submitFunction = this.editarVideoteca;
            } 

            this.prototype.init(config);
        }
    }


    /**
     * Envia peticion de alta de videoteca al servidor
     */
    this.guardarVideoteca = function() {
        var nombreVideoteca  = $('#nombre').val();
        var carpetaVideoteca = $('#carpeta').val();
        var publico  = $('#publico').prop('checked');

        var videoteca = {
            nombre: nombreVideoteca,
            carpeta : carpetaVideoteca,
            publico: (publico==true)?1:0
        }

        videoFacade.saveVideoteca(videoteca,
            function(data) { // onSuccess

                
                switch(data.status) {
                    case 0: {    
                        window.location = "/videotecas";
                        break;
                    }

                    case 1: {
                        messagesArea.showMessageError(messages.mensaje_error_insertar_videoteca);
                        break;
                    }
                }
            },
            function(err){ // onError
                messagesArea.showMessageError(messages.mensaje_error_insertar_videoteca);
            }
        );
        
    };


    this.editarVideoteca = function() {
        var idVideoteca = $('#idVideoteca').val();
        var nombreVideoteca  = $('#nombre').val();
        var carpetaVideoteca = $('#carpeta').val();
        var publico  = $('#publico').prop('checked');

        var videoteca = {
            id: idVideoteca,
            nombre: nombreVideoteca,
            carpeta : carpetaVideoteca,
            publico: (publico==true)?1:0
        }
        
        videoFacade.editarVideoteca(idVideoteca,videoteca,
            function(data) { // onSuccess

                
                switch(data.status) {
                    case 0: {    
                        window.location = "/videotecas";
                        break;
                    }

                    case 1: {
                        messagesArea.showMessageError(messages.mensaje_error_actualizar_videoteca);
                        break;
                    }

                    case 2: {
                        messagesArea.showMessageError(messages.mensaje_error_actualizar_videoteca);
                        break;
                    }
                }
            },
            function(err){ // onError
                messagesArea.showMessageError(messages.mensaje_error_actualizar_videoteca);
            }
        );  
    };
}

var videotecaValidation = new VideotecaValidationFacade();