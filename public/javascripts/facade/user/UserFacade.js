/**
 * Clase UserFacade
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez Brea</a>
 */
function UserFacade() {

    var URL_LOGIN = "/login";
    var URL_USER = "/user";
    var URL_USER_EXISTS = "/user/exists";
    var URL_USER_EXISTS_LOGIN = "/user/existsLogin";
    var URL_USER_EXISTS_EMAIL = "/user/existsEmail";
    var URL_USER_PROFILE = "/user/profile/";

    var URL_USER_EXISTS_LOGIN_ANOTHER_USER = "/user/existsLoginAnotherUser";
    var URL_USER_EXISTS_EMAIL_ANOTHER_EMAIL = "/user/existsEmailAnotherUser";
    var URL_USER_DISABLE_USER_ACCOUNT = "/user/disableUserAccount";

    var URL_USER_ASSIGN_PERMISSION = "/users/permissions/";


    /**
     * Envio por post de login y password del usuario para validarlo en el servidor
     * @param user Objeto con los datos del usuario
     */
    this.authenticateUser = function(user) {
        return $.ajax({
            async: true,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: user,
            url: URL_LOGIN,
            success: this.onSuccessAuthentication,
            error: this.onErrorAuthentication
        });
    };



    this.validateUserForm = function() {
        var login = $("#username").val();
        var password = $("#password").val();

        if (login != '' && password != '' && login.length > 0 && password.length > 0) {
            userFacade.authenticateUser({ username: login, password: password });
        } else {
            messagesArea.showMessageWarning("Es necesario el nombre de usuario y la contraseña");
        }
    }



    /**
     * Función invocada en caso de error durante la autenticación
     * @param data: Respuesta del servidor
     */
    this.onSuccessAuthentication = function(data) {
        if (data.status != 0) {
            messagesArea.showMessageError("Error durante la autenticación. Inténtelo de nuevo");
            $("#username").val('');
            $("#password").val('');
            $("#username").focus();
        } else {
            window.location.href = data.path;
        }
    };

    /**
     * Función invocada en caso de error durante la autenticación
     * @param err Error
     */
    this.onErrorAuthentication = function(err) {
        messagesArea.showMessageError("Error durante autenticación: " + err.message);
    };


    /**
     * Actualiza el perfil de un usuario
     * @param user Objeto con los datos del usuario a editar
     * @param onSuccess Función invocada en caso de que la llamada AJAX haya tenido éxito
     * @param onError Función invocada en caso de que la llamada AJAX haya lanzado un error
     */
    this.updateUserProfile = function(user, onSuccess, onError) {
        if (user) {
            return $.ajax({
                async: true,
                context: this,
                cache: false,
                type: 'POST',
                dataType: 'json',
                data: user,
                url: URL_USER_PROFILE + user.id + '?_method=PUT',
                success: onSuccess,
                error: onError
            });
        }
    };


    /**
     * Actualiza el perfil de un usuario
     * @param user Objeto con los datos del usuario a editar
     * @param onSuccess Función invocada si la petición AJAX se ha ejecutado correctamente
     * @param onError   Función invocada si la petición AJAX no se ha ejecutado correctamente
     */
    this.updateUser = function(user, onSuccess, onError) {
        if (user) {
            return $.ajax({
                async: true,
                context: this,
                cache: false,
                type: 'POST',
                dataType: 'json',
                data: user,
                url: URL_USER + "/" + user.id + '?_method=PUT',
                success: onSuccess,
                error: onError
            });
        }
    };



    /**
     * Envia la petición de alta de un usuario al servidor
     * @param user 
     */
    this.existsUser = function(user) {

        if (user) {
            return $.ajax({
                async: true,
                context: this,
                cache: false,
                type: 'POST',
                dataType: 'json',
                data: user,
                url: URL_USER_EXISTS,
                success: this.onSuccessExistsUser,
                error: this.onErrorExistsUser
            });
        }
    };


    this.onSuccessExistsUser = function(data) {
        if (data) {
            switch (data.status) {
                case 0:
                    {
                        // Todo OK, se puede dar de alta el usuario
                        break;
                    }

                case 1:
                    {
                        // El login está ocupado
                        messagesArea.showMessageWarning("El login está siendo utilizado por otro usuario");
                        break;
                    }

                case 2:
                    {
                        // El email está ocupado
                        messagesArea.showMessageWarning("El email está siendo utilizado por otro usuario");
                        break;
                    }

                case 3:
                    {
                        // Error al comprobar el mail
                        messagesArea.showMessageWarning("Se ha producido un error al comprobar el email");
                        break;
                    }

                case 4:
                    {
                        // Error al comprobar el login
                        messagesArea.showMessageWarning("Se ha producido un error al comprobar el login");
                        break;
                    }


            }
        }
    };


    /**
     * Función que se invoca en caso de error
     * @param {Err} err 
     */
    this.onErrorExistsUser = function(err) {
        messagesArea.showMessageError("Se ha producido un error técnico. Inténtelo de nuevo.");
    };



    /**
     * Comprueba la existencia de un login en BBDD, siempre y cuando pertenezca a un usuario
     * con un identificador distinto al pasado por parámetro
     * @param login: Login a verificar
     * @param onSuccess: Función invocada en caso de éxito
     * @param onError: Función invocada en caso de fallo
     */
    this.existsLoginAnotherUser = function(user, onSuccess, onError) {

        return $.ajax({
            async: false,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: user,
            url: URL_USER_EXISTS_LOGIN_ANOTHER_USER,
            success: onSuccess,
            error: onError
        });
    };




    /**
     * Comprueba la existencia de un login en BBDD
     * @param login: Login a verificar
     * @param onSuccess: Función invocada en caso de éxito
     * @param onError: Función invocada en caso de fallo
     */
    this.existsLogin = function(login, onSuccess, onError) {

        return $.ajax({
            async: false,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: login,
            url: URL_USER_EXISTS_LOGIN,
            success: onSuccess,
            error: onError
        });
    };



    /**
     * Comprueba la existencia de un email en BBDD
     * @param email: Email a verificar
     * @param onSuccess: Función invocada en caso de éxito
     * @param onError: Función invocada en caso de fallo
     */
    this.existsEmail = function(email, onSuccess, onError) {

        return $.ajax({
            async: false,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: email,
            url: URL_USER_EXISTS_EMAIL,
            success: onSuccess,
            error: onError
        });
    };



    /**
     * Comprueba la existencia de un email en BBDD, y además que no sea de un determinado usuario
     * @param datos Objeto con el id de usuario y el email a comprobar
     * @param onSuccess Función invocada en caso de éxito
     * @param onError Función invocada en caso de fallo
     */
    this.existsEmailAnotherUser = function(datos, onSuccess, onError) {

        return $.ajax({
            async: false,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: datos,
            url: URL_USER_EXISTS_EMAIL_ANOTHER_EMAIL,
            success: onSuccess,
            error: onError
        });
    };



    /**
     * Permite dar de alta un usuario
     * @param user Objeto con los datos del usuario a editar
     * @param onSuccess Función invocada en caso de éxito
     * @param onError   Función invocada en caso de error
     */
    this.saveUser = function(user) {

        if (user) {
            return $.ajax({
                async: false,
                context: this,
                cache: false,
                type: 'POST',
                dataType: 'json',
                data: user,
                url: URL_USER,
                success: this.onSuccessNewUser,
                error: this.onErrorNewUser
            });
        }
    };



    /**
     * Función invocada en caso de éxito al dar de alta un usuario
     * @param data Objeto con la respuesta del servidor
     */
    this.onSuccessNewUser = function(data) {
        if (data != undefined) {
            switch (data.status) {
                case 0:
                    {
                        window.location.href = "/users";
                        break;
                    }

                case 1:
                    {
                        messagesArea.showMessageError("Se ha producido un error al dar de alta el usuario");
                        break;
                    }

                case 2:
                    {
                        messagesArea.showMessageError("Se ha producido un error al obtener conexión a la BBDD");
                        break;
                    }
            }

        }
    };


    /**
     * Función invocada en caso de error al dar de alta un usuario
     * @param data Objeto con la respuesta del servidor
     */
    this.onErrorNewUser = function(data) {
        messagesArea.showMessageError("Se ha producido un error al dar de alta el usuario");
    };




    /**
     * Función que pide al usuario confirmación para desactivar/activar la cuenta de un usuario
     * @param id Identificador del usuario
     * @param activo Indica si el usuario está activo o no en el momento actual
     */
    this.confirmDisableUserAccount = function(id, activo) {

        permissionFacade.validatePermission(6, function(data) {

            if (data != undefined) {
                console.log("data: " + JSON.stringify(data));
                switch (data.status) {
                    case 0:
                        {
                            if (id != undefined && activo != undefined) {

                                var parametro = {
                                    idUsuario: id,
                                    activo: (activo == 1) ? 0 : 1
                                };

                                var mensaje = "¿Deseas desactivar la cuenta del usuario con #id " + id + "?";
                                if (activo == 0) {
                                    mensaje = "¿Deseas activar la cuenta del usuario con #id " + id + "?";
                                }

                                bootbox.confirm({
                                    title: "Atención",
                                    message: mensaje,
                                    buttons: {
                                        cancel: {
                                            label: 'Cancelar',
                                            className: 'btn btn-danger'
                                        },
                                        confirm: {
                                            label: 'Confirmar',
                                            className: 'btn btn-success'
                                        }
                                    },
                                    callback: function(result) {
                                        if (result) {


                                            return $.ajax({
                                                async: true,
                                                context: this,
                                                cache: false,
                                                type: 'POST',
                                                dataType: 'json',
                                                data: parametro,
                                                url: URL_USER_DISABLE_USER_ACCOUNT,
                                                success: userFacade.onSuccessDisableUserAccount,
                                                error: userFacade.onErrorDisableUserAccount
                                            });


                                        } //if
                                    }
                                });
                            }

                            break;
                        }

                    case 1:
                        {
                            bootbox.alert("No dispones de permiso para deshabilitar la cuenta de un usuario. Contacta con el administrador");
                            break;
                        }

                    case 2:
                        {
                            bootbox.alert("Se ha producido un error al verificar si dispones de permiso para deshabilitar la cuenta del usuario");
                            break;
                        }
                }
            }

        }, function(err) {
            console.log("error al validar permiso de desactivación de usuario");
        });
    };



    /**
     * Función que es invocada cuando la petición AJAX al servidor para dar de alta un 
     * usuario, se ha ejecutado correctamente
     * @param data Respuesta del servidor
     */
    this.onSuccessDisableUserAccount = function(data) {
        console.log("onSuccessDissable: " + JSON.stringify(data));

        if (data != undefined) {
            switch (data.status) {
                case 0:
                    {
                        window.location.href = "/users";
                        break;
                    }

                case 1:
                    {
                        messagesArea.showMessageError("Se ha producido un error al activar/desactivar la cuenta del usuario");
                        break;
                    }

                case 2:
                    {
                        messagesArea.showMessageError("Se ha producido un error al obtener conexión a la BBDD");
                        break;
                    }
            }
        }
    };


    /**
     * Función que es invocada cuando la petición AJAX al servidor para dar de alta un 
     * usuario ha lanzado un error
     * @param data Respuesta del servidor
     */
    this.onErrorDisableUserAccount = function(data) {
        messagesArea.showMessageError("Se ha producido un error al activar/desactivar la cuenta de usuario seleccionada");
    };


    /**
     * Permite asignar/desasignar un permiso a un determinado usuario
     * 
     * @param {Object} config Objeto con los datos necesarios para realizar la llamada al servidor
     * @param {Function} onSuccess Función que se invoca si la operación se ha ejecutado correctamente
     * @param {Function} onError Función que se invoca si se ha producido un error
     */
    this.assignPermission = function(config, onSuccess, onError) {

        var idUser = config.idUsuario;
        var idPermiso = config.idPermiso;
        var value = config.valorPermiso;

        if (idUser != undefined && idPermiso != undefined && value != undefined) {
            /**
             * Envío por POST de los archivos al servidor
             */
            $.ajax({
                url: this.URL_USER_ASSIGN_PERMISSION + idUser,
                async: true,
                context: this,
                cache: false,
                type: 'POST',
                dataType: 'JSON',
                data: { idPermiso: idPermiso, valorPermiso: value },
                success: onSuccess, // Se hace el bind para asociar el objeto actual a esta función, sino no se puede llamar a métodos del mismo objeto
                error: onError // bind es necesario para que desde onErrorUploadFiles se pueda llamar a métodos de esta clase
            });
        }
    };

};

var userFacade = new UserFacade();;