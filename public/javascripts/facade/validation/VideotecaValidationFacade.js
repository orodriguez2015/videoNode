
/**
 * Clase de validación de formulario de alta/edición de videoteca
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
function VideotecaValidationFacade() {

    this.prototype = new FormValidationFacade();


    /**
     * Método init que inicializa la validación del formulario
     */
    this.init = function(config) {
        
        if(config!=null && config.idForm!=null && config.idForm!=undefined && config.rules!=undefined) {
            config.submitFunction = this.guardarVideoteca;
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

        console.log("nombrevideoteca: " + nombreVideoteca + ", carpeta: " + carpetaVideoteca);
        console.log("publico: " + publico);

        var videoteca = {
            nombre: nombreVideoteca,
            carpeta : carpetaVideoteca,
            publico: (publico==true)?1:0
        }

        videoFacade.saveVideoteca(videoteca,
            function(data) { // onSuccess

                
                switch(data.status) {
                    case 0: {    
                        window.location = "/videoteca";
                        break;
                    }

                    case 1: {
                        messagesArea.showMessageError("Se ha producido un error al insertar la videoteca");
                        break;
                    }
                }
            },
            function(err){ // onError
                messagesArea.showMessageError("Se ha producido un error al insertar la videoteca");
            }
        );
        
    };

   
}

var videotecaValidation = new VideotecaValidationFacade();