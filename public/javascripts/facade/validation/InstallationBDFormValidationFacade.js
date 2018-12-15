/**
 * Clase que hereda de FormValidationFacade y que usa una validación propia para 
 * la validación del formulario de instalación de la aplicación
 * 
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
function InstallationBDFormValidationFacade() {

    this.prototype = new FormValidationFacade();

    /**
     * Método de configuración
     * @param config Objeto con los parámetros de configuración necesarios para ejecutar la validación
     */
    this.init = function(config) {
        config.submitFunction = this.saveDatabase;
        this.prototype.init(config);
    };


    /**
     * Edición de un usuario
     * @param user OBjeto con los datos del usuario
     */
    this.saveDatabase = function() {

        var config = {
            servidor: $('#servidor').val(),
            basedatos: $('#basedatos').val(),
            usuariobd: $('#usuariobd').val(),
            passwordbd: $('#passwordbd').val()
        };

        if (config != undefined) {
            /*
             * Se invoca a updateUser y se pasa la función de éxito y la de fracaso
             */
            configFacade.saveConfigDatabase(config, function(data) {
                    if (data) {
                        switch (data.status) {
                            case 0:
                                {
                                    // Se pasa a la pantalla de configuración del usuario administrador
                                    window.location.href = "/config/paso3";
                                    break;
                                }

                            case 1:
                                {
                                    messagesArea.showMessageError("Los datos proporcionados están incompletos");
                                    break;
                                }

                            case 2:
                                {
                                    messagesArea.showMessageError("Los datos de configuración proporcionados no son correctos. No se puede establecer conexión con la base de datos.");
                                    break;
                                }


                        }
                    }

                },
                function(error) {
                    messagesArea.showMessageError("Error al almacenar la configuración de la base de datos");
                }
            );
        }
    };

}

var installationFormValidationFacade = new InstallationBDFormValidationFacade();