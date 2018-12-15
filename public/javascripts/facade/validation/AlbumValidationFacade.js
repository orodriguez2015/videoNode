/**
 * Clase que hereda de FormValidationFacade y que usa una validación propia para 
 * la validación de un formulario de alta/edición de álbumes fotográficos
 * 
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
function AlbumValidationFacade() {

    this.prototype = new FormValidationFacade();
    this.TYPE_NEW_ALBUM = 0;
    this.TYPE_EDIT_ALBUM = 1;

    /**
     * Método de configuración
     * @param config Objeto con los parámetros de configuración necesarios para ejecutar la validación
     */
    this.init = function(config, type) {
        
        if (config != undefined && type != undefined) {
            switch (type) {
                // Validación del formulario de alta de un álbum
                case this.TYPE_NEW_ALBUM:
                    {
                        config.submitFunction = this.createAlbum;
                        break;
                    }

                    // Validación del formulario de edición de un álbum
                case this.TYPE_EDIT_ALBUM:
                    {
                        config.submitFunction = this.updateAlbum;
                        break;
                    }
            }
            this.prototype.init(config);
        }
    };


    /**
     * Alta de un álbum fotográfico
     */
    this.createAlbum = function() {

        var album = {
            nombre: $('#nombre').val(),
            descripcion: $('#descripcion').val(),
            publico: $("#publico").prop('checked')
        };

        albumFacade.saveAlbum(album);
    };


    /**
     * Función invocada en el caso de querer actualizar un álbum
     */
    this.updateAlbum = function() {

        var album = {
            id: $('#id').val(),
            nombre: $('#nombre').val(),
            descripcion: $('#descripcion').val(),
            publico: $("#publico").prop('checked')
        };

        albumFacade.updateAlbum(album);
    }
}

var albumValidationFacade = new AlbumValidationFacade();