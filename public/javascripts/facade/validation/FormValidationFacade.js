/**
 * Clase FormValidationFacade que inicializa la validación con el plugin
 * de jQuery Validation, y dispone de funcionalidades interesantes a la hora 
 * de realizar la validación de formularios, y su posterior envio al servidor
 * 
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
function FormValidationFacade() {

    var idForm = ""; // Id del formulario
    var reglas = ""; // Reglas de validación
    var submitFunction = ""; // Función que se invoca cuando se desea enviar el formulario


    /**
     * Inicializa la validación de un formulario
     * @param config Objeto que contiene la configuración del formulario y reglas de validación
     */
    this.init = function(config) {
        idForm = config.idForm; // Id del formulario
        reglas = config.rules; // Reglas de validación
        submitFunction = config.submitFunction; // Función que se invoca cuando se desea enviar el formulario

        if (idForm != undefined && reglas != undefined && submitFunction != undefined && typeof(idForm) == "string" &&
            typeof(reglas) == "object" && typeof(submitFunction) == "function") {

            $("#" + idForm).validate({
                rules: reglas,
                messages: {
                    nombre: {
                        lettersonly: "Escribe sólo letras"
                    }
                },
                // Si la validación es correcta, se añade la clase css 'has-success' de bootstrap,
                // al campo de formulario validado
                success: function(element) {
                    $(element).closest('.form-group').addClass('has-success');
                },
                // Si la validación no es correcta, se añade la clase css 'has-error' de bootstrap,
                // al campo de formulario validado
                highlight: function(element) {
                    $(element).closest('.form-group').addClass('has-error');
                },

                // Si la validación no es correcta, se añade la clase css 'has-error' de bootstrap,
                // al campo de formulario validado
                unhighlight: function(element) {
                    $(element).closest('.form-group').removeClass('has-error');
                },
                errorElement: 'span',
                errorClass: 'help-block',
                errorPlacement: function(error, element) {
                    if (element.parent('.input-group').length) {
                        error.insertAfter(element.parent());
                    } else {
                        error.insertAfter(element);
                    }
                },
                submitHandler: submitFunction
            });

        };
    }
};

var formValidationFacade = new FormValidationFacade();