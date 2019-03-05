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
                    msg = messages.mensaje_carpeta_asociada_otra_videoteca;
                    salida = false;
                    break;
                }

                case 2:{                    
                    msg = messages.mensaje_comprobar_carpeta_bbdd;
                    salida = false;
                    break;
                }

                case 3:{                    
                    msg = messages.mensaje_no_existe_directorio_servidor;
                    salida = true;
                    break;
                }
           }// switch

       }, function(error) { // onError
           msg = messages.errorTecnicoCompleto;
           //"Uppsss ... Se ha producido un error técnico. Intentalo de nuevo."
           salida = false;
       });

       return salida;
   }, function(params, element) {
       // Se devuelve el mensaje de error si lo hay
       return msg;
   });



   /**
    * Función de validación de jQuery validation que comprueba si existe ya la carpeta indicada por el usuario ya
    * existe entre otra de las videotecas del usuario
    */
   jQuery.validator.addMethod("comprobarRutaVideotecaUsuario", function(value, element) {
        var salida = false;
        var idVideoteca = $('#idVideoteca').val();
    
        if(idVideoteca!=undefined && value!=undefined && value!='') {

            var parametro = {
                idVideoteca: idVideoteca,
                carpeta: value
            };

            var resultado = videoFacade.existeRutaCarpetaOtraVideoteca(parametro, 
                function(data) { // onSuccess
                    switch (data.status) {
                        
                        case 0: {
                            salida = true;
                            break;
                        }
            
                            case 1:{                    
                                msg = messages.mensaje_carpeta_asociada_otra_videoteca;
                                salida = false;
                                break;
                            }
            
                            case 2:{                    
                                msg = messages.mensaje_error_comprobar_carpeta_idvideoteca;
                                salida = false;
                                break;
                            }
            
                            case 3:{                    
                                msg = messages.mensaje_error_comprobar_carpeta_videoteca;
                                salida = true;
                                break;
                            }
                    }// switch
        
            }, function(error) { // onError
                msg = messages.errorTecnicoCompleto;
                //"Uppsss ... Se ha producido un error técnico. Intentalo de nuevo."
                salida = false;
            });

        }

        return salida;
    }, function(params, element) {
        // Se devuelve el mensaje de error si lo hay
        return msg;
    });