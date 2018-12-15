/**
 * Clase que hereda de FormValidationFacade y que usa una validación propia para 
 * la validación de formularios de alta/edición de usuarios
 * 
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
function UserFormValidationFacade() {

    this.prototype = new FormValidationFacade();
    this.TYPE_EDITION = 1;
    this.TYPE_NEW = 2;
    this.TYPE_PROFILE = 3;

    /**
     * Método de configuración
     * @param config Objeto con los parámetros de configuración necesarios para ejecutar la validación
     */
    this.init = function(config, type) {

        switch (type) {
            case this.TYPE_EDITION:
                {
                    config.submitFunction = this.editUser;
                    break;
                }

            case this.TYPE_NEW:
                {
                    config.submitFunction = this.newUser;
                    break;
                }

            case this.TYPE_PROFILE:
                {
                    config.submitFunction = this.profileUser;
                    break;
                }
        };

        this.prototype.init(config);
    };



    /**
     * Alta de usuario
     * @param user OBjeto con los datos del usuario
     */
    this.newUser = function() {

        var user = {
            login: $('#usuario').val(),
            password: $('#contrasena').val(),
            nombre: $('#nombre').val(),
            apellido1: $('#apellido1').val(),
            apellido2: $('#apellido2').val(),
            email: $('#email').val()
        };
        console.log("userFormValidation.newUser " + JSON.stringify(user));
        if (user != undefined) {
            userFacade.saveUser(user);
        }
    };


    /**
     * Edición de un usuario
     * @param user OBjeto con los datos del usuario
     */
    this.editUser = function() {

        var user = {
            id: $('#idUsuario').val(),
            login: $('#usuario').val(),
            password: $('#contrasena').val(),
            nombre: $('#nombre').val(),
            apellido1: $('#apellido1').val(),
            apellido2: $('#apellido2').val(),
            email: $('#email').val()
        };

        if (user != undefined) {
            /*
             * Se invoca a updateUser y se pasa la función de éxito y la de fracaso
             */
            userFacade.updateUser(user, function(data) {

                    if (data) {
                        switch (data.status) {
                            case 0:
                                {
                                    // Se ha actualiza el usuario en BBDD
                                    window.location.href = "/users";
                                    break;
                                }

                            case 1:
                                {
                                    messagesArea.showMessageError("Se ha producido un error al actualizar el usuario");
                                    break;
                                }

                            case 2:
                                {
                                    messagesArea.showMessageError("Se ha producido un error al obtener conexión a la BBDD");
                                    break;
                                }


                        }
                    }
                },
                function(error) {
                    console.log("Error al dar editar usuario " + err.message);
                }
            );
        }
    };



    /**
     * Edición del perfil de un usuario
     * @param user Objeto con los datos del usuario
     */
    this.profileUser = function() {

        var user = {
            id: $('#id').val(),
            login: $('#usuario').val(),
            password: $('#contrasena').val(),
            nombre: $('#nombre').val(),
            apellido1: $('#apellido1').val(),
            apellido2: $('#apellido2').val(),
            email: $('#email').val()
        };

        if (user != undefined) {
            /*
             * Se invoca a updateUserProfile y se pasa la función de éxito y la de fracaso
             */
            userFacade.updateUserProfile(user, function(data) {

                    if (data) {
                        switch (data.status) {
                            case 0:
                                {
                                    // Se ha actualiza el perfil de usuario en BBDD
                                    //messagesArea.showMessageSuccess("Tu perfil de usuario ha sido actualizado");
                                    window.location.href = "/";
                                    break;
                                }

                            case 1:
                                {
                                    messagesArea.showMessageError("Se ha producido un error al actualizar su perfil de usuario");
                                    break;
                                }

                            case 2:
                                {
                                    messagesArea.showMessageError("Se ha producido un error al obtener conexión a la BBDD");
                                    break;
                                }


                        }
                    }
                },
                function(error) {
                    messagesArea.showMessageError("Se ha producido un error al modificar el perfil del usuario: " + error.message);
                }
            );

        }

    };

}

var userFormValidationFacade = new UserFormValidationFacade();