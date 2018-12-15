   /**
    * Validadores de jQuery Validation de utilidad a la hora de gestionar usuarios
    * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
    */



   /**
    * Función de validación de jQuery validation que comprueba si existe un usuario
    * con un determinado login en BBDD
    */
   var msg = "";
   jQuery.validator.addMethod("comprobarLogin", function(value, element) {
       // todo: Realizar petición ajax para comprobar si ya existe el login

       var salida = false;
       var resultado = userFacade.existsLogin({
           login: value
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
    * con un determinado email en BBDD
    */
   var msgEmail = "";
   jQuery.validator.addMethod("comprobarEmail", function(value, element) {
       // todo: Realizar petición ajax para comprobar si ya existe el login

       var salida = false;
       var resultado = userFacade.existsEmail({
           email: value
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