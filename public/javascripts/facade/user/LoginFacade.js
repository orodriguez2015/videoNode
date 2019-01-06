/**
 * Clase encargada de la validación de un usuario
 * <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
function LoginFacade() {
    var URL_LOGIN = "/login";


    /**
     * Muestra la ventana modal de autenticación
     */
    this.show = function() {

        $('.modal-dialog').load('/login/login.html', function() {
            $('#login').modal({ show: true });

            // Etiquetas de texto de la modal de autenticación según el idioma seleccionado por el usuario
            $('#tituloAutenticacion').text(messages.autenticacion);
            $('#nombreUsuario').text(messages.nombre_usuario);
            $('#passwordUsuario').text(messages.contrasenha);         
            $('#btnModalAceptar').text(messages.boton_aceptar);         
            $('#btnModalCancelar').text(messages.boton_cancelar);         
            
        });
    };

    /**
     * Función encargada de autenticar a un usuario
     */
    this.autenticar = function() {
        var login = $('#username').val();
        var password = $('#password').val();

        if (login != undefined && password != undefined && login != '' && password != '') {
            var user = {
                username: login,
                password: password
            };

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
        } //if
    };


    /**
     * Función invocada en caso de que la llamada AJAX para la invocación
     * tenga éxito
     * @param data Objeto con la respuesta del servidor
     */
    this.onSuccessAuthentication = function(data) {

        if (data) {
            switch (data.status) {
                case 0:
                    {
                        window.location.href = "/album/admin";
                        break;
                    }

                case 1:
                    {
                        messagesArea.showMessageError("Se ha producido un error al validar tu cuenta de usuario");
                        break;
                    }

                case 2:
                    {
                        messagesArea.showMessageError("No existe una cuenta de usuario con los datos introducidos");
                        break;
                    }

                case 3:
                    {
                        messagesArea.showMessageError("Su cuenta de usuario está desactivada. Contacte con el administrador");
                        break;
                    }
            }
        }

    };


    /**
     * Función que se invoca en caso de error
     * @param err Error
     */
    this.onErrorAuthentication = function(err) {
        messagesArea.showMessageError("Se ha producido un error técnico. Inténtelo de nuevo.");
    }
};

var loginFacade = new LoginFacade();