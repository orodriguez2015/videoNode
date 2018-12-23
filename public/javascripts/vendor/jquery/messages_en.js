/*
* Translated default messages for the jQuery validation plugin.
* Locale: EN (Inglés)
*/
$.extend( $.validator.messages, {
   required: "This field is required.",
   remote: "Please fill in this field.",
   email: "Please enter a valid email address.",
   url: "Please enter a valid URL.",
   date: "Please enter a valid date.",
   dateISO: "Please enter a valid date (ISO).",
   number: "Please, write a valid number.",
   digits: "Please, write only digits.",
   creditcard: "Please, write a valid card number.",
   equalTo: "Please write the same value again.",
   extension: "Please enter a value with an accepted extension.",
   maxlength: $.validator.format( "Please, do not write more than {0} characters." ),
   minlength: $.validator.format( "Please, do not write less than {0} characters." ),
   rangelength: $.validator.format( "Please enter a value between {0} and {1} characters." ),
   range: $.validator.format( "Please enter a value between {0} and {1}." ),
   max: $.validator.format( "Please enter a value less than or equal to {0}." ),
   min: $.validator.format( "Please enter a value greater than or equal to {0}." ),
   nifES: "Please, write a valid NIF.",
   nieES: "Please, write a valid NIE.",
   cifES: "Please, write a valid CIF.",

   existeUsuarioConLoginIntroducido:"There is a user with the login entered. Try another one.",
	existeUsuarioConMailIntroducido:"There is a user with the email entered.",
   errorTecnico: "A technical error has occurred. Try again.",
   errorTecnicoCompleto:"Uppsss ... A technical error has occurred. Try again."
} );