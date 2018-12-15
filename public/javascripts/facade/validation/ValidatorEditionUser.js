   /**
    * Validadores de jQuery Validation de utilidad a la hora de gestionar la validación 
    * de un formulario de edición de un usuario
    *
    * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
    */


   /**
    * Función de validación de jQuery validation que comprueba si existe un usuario
    * con un determinado login en BBDD, siempre y cuando no sea el actual
    */
   var msg = "";
   jQuery.validator.addMethod("comprobarLoginOtroUsuario", function(value, element, options) {
       // todo: Realizar petición ajax para comprobar si ya existe el login

       var salida = false;
       var resultado = userFacade.existsLoginAnotherUser({
           login: value,
           idUsuario: options.idUsuario
       }, function(data) {

           switch (data.status) {
               case 0:
                   {
                       // El login no existe, por tanto puede ser utilizado
                       salida = true;
                       break;
                   }

               case 1:
                   {
                       // Error al comprobar existencia del login en BBDD
                       msg = "Se ha producido un error técnico. Inténtelo de nuevo.";
                       salida = false;
                   }

               case 2:
                   {
                       // Error al comprobar conexión a la  BBDD
                       msg = "Se ha producido un error técnico. Inténtelo de nuevo.";
                       salida = false;
                   }

               case 3:
                   {
                       // Existe un usuario con el login en BBDD
                       msg = "Existe un usuario con el login introducido. Prueba con otro.";
                       salida = false;
                   }
           }

       }, function(error) {
           msg = "Uppsss ... Se ha producido un error técnico. Intentalo de nuevo."
           salida = false;
       });

       return salida;
   }, function(params, element) {
       // Se devuelve el mensaje de error si lo hay
       return msg;
   });




   /**
    * Función de validación de jQuery validation que comprueba si existe un usuario
    * con un determinado email en BBDD, y además que no tenga un determinado id de usuario, que 
    * coincide con el del usuario actual
    */
   var msgEmail = "";
   jQuery.validator.addMethod("comprobarEmailOtroUsuario", function(value, element, options) {
       // todo: Realizar petición ajax para comprobar si ya existe el login

       var salida = false;
       var resultado = userFacade.existsEmailAnotherUser({
           email: value,
           idUsuario: options.idUsuario
       }, function(data) {

           switch (data.status) {
               case 0:
                   {
                       // El email no existe, por tanto puede ser utilizado
                       salida = true;
                       break;
                   }

               case 1:
                   {
                       // Error al comprobar existencia del email en BBDD
                       msgEmail = "Se ha producido un error técnico. Inténtelo de nuevo.";
                       salida = false;
                   }

               case 2:
                   {
                       // Error al comprobar conexión a la  BBDD
                       msgEmail = "Se ha producido un error técnico. Inténtelo de nuevo.";
                       salida = false;
                   }

               case 3:
                   {
                       // Existe un usuario con el email en BBDD
                       msgEmail = "Existe un usuario con el email introducido.";
                       salida = false;
                   }
           }

       });

       return salida;
   }, function(params, element) {
       // Se devuelve el mensaje de error si lo hay
       return msgEmail;
   });



   /**
    * Función de validación de jQuery validation que comprueba en el caso de introducir la password, que esta tenga
    * un determinado número de caracteres
    */
   var msgPassword = "";
   jQuery.validator.addMethod("comprobarPassword", function(value, element, options) {

       var salida = true;

       if (value != '' && value.length < 4) {
           salida = false;
           msgPassword = "En el caso de introducir la contraseña, tiene que tener al menos 4 caracteres";
       }


       return salida;
   }, function(params, element) {
       // Se devuelve el mensaje de error si lo hay
       return msgPassword;
   });