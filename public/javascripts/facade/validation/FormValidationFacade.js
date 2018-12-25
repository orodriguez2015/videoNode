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
     * Configurar el idioma para el plugin de JQuery Validation, extrayendo las etiquetas de idioma
     * del archivo de internacionalización correspondiente /javascripts/i18n/messages_[es|en].js
     */
    this.configurarIdioma = function() {    

        $.extend( $.validator.messages, {
            required: messages.required,
            remote: messages.remote,
            email: messages.email,
            url: messages.url,
            date: messages.date,
            dateISO: messages.dateISO,
            number: messages.number,
            digits: messages.digits,
            creditcard: messages.creditcard,
            equalTo: messages.equalTo,
            extension: messages.extension,
            maxlength: messages.maxlength,
            minlength: messages.minlength,
            rangelength: messages.rangelength,
            range: messages.range,
            max: messages.max,
            min: messages.min,
            nifES: messages.nifES,
            nieES: messages.nieES,
            cifES: messages.cifES,
            existeUsuarioConLoginIntroducido: messages.existeUsuarioConLoginIntroducido,
            existeUsuarioConMailIntroducido: messages.existeUsuarioConMailIntroducido,
            errorTecnico: messages.errorTecnico,
            errorTecnicoCompleto : messages.errorTecnicoCompleto
        });
    }// configurarIdioma



    /**
     * Inicializa la validación de un formulario
     * @param config Objeto que contiene la configuración del formulario y reglas de validación
     */
    this.init = function(config) {
        idForm = config.idForm; // Id del formulario
        reglas = config.rules; // Reglas de validación
        submitFunction = config.submitFunction; // Función que se invoca cuando se desea enviar el formulario

        this.configurarIdioma();

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