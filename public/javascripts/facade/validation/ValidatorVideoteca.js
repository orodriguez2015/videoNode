   /**
    * Validadores de jQuery Validation de utilidad a la hora de gestionar videoteca
    * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
    */

   /**
    * Función de validación de jQuery validation que comprueba si existe ya la ruta de 
    * una videoteca en la carpeta del usuario
    */
   var msg = "";
   jQuery.validator.addMethod("comprobarRutaVideoteca", function(value, element) {
    
       var salida = false;

       var resultado = videoFacade.existeRutaCarpetaUsuario(value, 
        function(data) { // onSuccess
           switch (data.status) {
             
               case 0: {
                 salida = true;
                   break;
               }

               case 1:{
                    msg = "Ya existe una carpeta con el mismo nombre en su carpeta de usuario";
                    salida = false;
                    break;
                }

                case 2:{                    
                    msg = "No ha llegado la carpeta introducida al servidor, escribala de nuevo";
                    salida = false;
                    break;
                }
           }// switch

       }, function(error) { // onError
           msg = "Uppsss ... Se ha producido un error técnico. Intentalo de nuevo."
           salida = false;
       });

       return salida;
   }, function(params, element) {
       // Se devuelve el mensaje de error si lo hay
       return msg;
   });