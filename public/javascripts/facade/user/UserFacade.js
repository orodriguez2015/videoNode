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
            messagesArea.showMessageWarning(messages.mensaje_nombre_contrasena_usuario_obligatorio);
        }
    }



    /**
     * Función invocada en caso de error durante la autenticación
     * @param data: Respuesta del servidor
     */
    this.onSuccessAuthentication = function(data) {
        if (data.status != 0) {
            messagesArea.showMessageError(messages.mensaje_error_durante_autenticacion);
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
        messagesArea.showMessageError(messages.mensaje_error_durante_autenticacion + " : " + err.message);
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
                        messagesArea.showMessageWarning(messages.mensaje_error_login_utilizado);
                        
                        break;
                    }

                case 2:
                    {
                        // El email está ocupado
                        messagesArea.showMessageWarning(messages.mensaje_error_email_utilizado);
                        break;
                    }

                case 3:
                    {
                        // Error al comprobar el mail
                        messagesArea.showMessageWarning(messages.mensaje_error_comprobar_email);
                        break;
                    }

                case 4:
                    {
                        // Error al comprobar el login
                        messagesArea.showMessageWarning(messages.mensaje_error_comprobar_login);
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
        messagesArea.showMessageError(messages.errorTecnico);
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
                        messagesArea.showMessageError(messages.mensaje_error_alta_usuario);
                        break;
                    }

                case 2:
                    {
                        messagesArea.showMessageError(messages.mensaje_error_conexion_bbdd);
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
        messagesArea.showMessageError(messages.mensaje_error_alta_usuario);
    };




    /**
     * Función que pide al usuario confirmación para desactivar/activar la cuenta de un usuario
     * @param id Identificador del usuario
     * @param activo Indica si el usuario está activo o no en el momento actual
     */
    this.confirmDisableUserAccount = function(id, activo) {

        permissionFacade.validatePermission(6, function(data) {

            if (data != undefined) {
                switch (data.status) {
                    case 0:
                        {
                            if (id != undefined && activo != undefined) {
                                var parametro = {
                                    idUsuario: id,
                                    activo: (activo == 1) ? 0 : 1
                                };

                                var mensaje = messages.mensaje_confirmacion_desactivar_cuenta_usuario + id + "?";
                                if (activo == 0) {
                                    mensaje = messages.mensaje_confirmacion_activar_cuenta_usuario + id + "?";
                                }


                                DialogFacade.showConfirmation(messages.atencion_titulo_modal,mensaje,function(result){
                                    if (result) {
                                        return $.ajax({
                                            async: true,
                                            context: this,
                                            cache: false,
                                            type: 'POST',
                                            dataType: 'json',
                                            data: parametro,
                                            url: URL_USER_DISABLE_USER_ACCOUNT,
                                            success: function(data) {
        
                                                if (data != undefined) {
                                                    switch (data.status) {
                                                        case 0:
                                                            {
                                                                window.location.href = "/users";
                                                                break;
                                                            }
                                        
                                                        case 1:
                                                            {
                                                                messagesArea.showMessageError(messages.mensaje_error_activar_desactivar_cuenta_usuario);
                                                                break;
                                                            }
                                        
                                                        case 2:
                                                            {
                                                                messagesArea.showMessageError(messages.mensaje_error_conexion_bbdd);
                                                                break;
                                                            }
                                                    }
                                                }
                                            },
                                            error: function(data) {
                                                messagesArea.showMessageError(messages.mensaje_error_activar_desactivar_cuenta_usuario);
                                            }
                                        });
                                    }
                                });
                            }

                            break;
                        }

                    case 1:{
                            DialogFacade.showAlert(messages.mensaje_error_no_permiso_deshabilitar_cuenta);
                            break;
                        }

                    case 2:
                        {
                            DialogFacade.showAlert(messages.mensaje_error_comprobar_permiso_deshabilitar_cuenta);
                            break;
                        }
                }
            }

        }, function(err) {
            console.log("error al validar permiso de desactivación de usuario");
        });
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