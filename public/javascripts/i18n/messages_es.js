var messages = {
    sProcessing:     "Procesando...",
    sLengthMenu:     "Mostrar _MENU_ registros",
    sZeroRecords:    "No se encontraron resultados",
    sEmptyTable:     "Ningún dato disponible en esta tabla",
    sInfo:           "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
    sInfoEmpty:      "Mostrando registros del 0 al 0 de un total de 0 registros",
    sInfoFiltered:   "(filtrado de un total de _MAX_ registros)",
    sInfoPostFix:    "",
    sSearch:         "Buscar:",
    sUrl:            "",
    sInfoThousands:  ",",
    sLoadingRecords: "Cargando...",
    oPaginate: {
        sFirst:    "Primero",
        sLast:     "Último",
        sNext:     "Siguiente",
        sPrevious: "Anterior"
    },
    oAria: {
        sSortAscending:  ": Activar para ordenar la columna de manera ascendente",
        sSortDescending: ": Activar para ordenar la columna de manera descendente"
    },

    atencion_titulo_modal: "Atención",
    mensaje_eliminar_album_1: "¿ Deseas eliminar el álbum con #id",
    mensaje_eliminar_album_2: "y todas sus fotografías asociadas?",
    mensaje_confirmar_hacer_visible_foto_1    : "¿ Deseas hacer visible la foto con #id ",
    mensaje_confirmar_hacer_visible_foto_2    : " para todo el mundo?",
    boton_cancelar : "Cancelar",
    boton_confirmar : "Confirmar",
    mensaje_error_no_permiso_borrar_album : "No dispones de permiso para borrar un álbum. Contacta con el administrador",
    mensaje_error_comprobar_permiso_borrar_album : "Se ha producido un error al comprobar si dispone de permiso de borrado del álbum",
    mensaje_error_eliminar_album : "Se ha producido un error al eliminar el álbum",
    mensaje_error_grabar_album : "No se ha podido almacenar el álbum en base de datos",
    mensaje_error_editar_album : "No se ha podido editar el álbum en base de datos",
    
    mensaje_eliminar_foto_1 : "¿ Deseas eliminar la fotografía con #id ",
    mensaje_eliminar_foto_2 : " del álbum ?",
    mensaje_error_cambiar_visibilidad_fotografia : "Se ha producido un error al cambiar la visibilidad de la fotografía seleccionada",
    mensaje_seleccionar_fotografia : "Es necesario que selecciones alguna fotografía",
    mensaje_error_borrado_fotografias : "Se ha producido un error al realizar el borrado de las fotografías",
    mensaje_error_borrado_fotografia : "Se ha producido un error al borrar la fotografía",
    mensaje_error_base_datos         : "Se ha producido un error en base de datos",
    mensaje_error_tecnico_borrado_fotografia   : "Se ha producido un error técnico al eliminar la fotografía",
    mensaje_error_no_existe_fotografia   : "No existe la fotografía en el servidor",
    mensaje_error_eliminar_fotografia_disco   : "Se ha producido un error al eliminar la fotografia del disco",
    mensaje_error_obtener_conexion_bbdd       : "No se ha podido obtener conexión a la base de datos",
    mensaje_confirmar_ocultar_foto       : "¿ Deseas ocultar la foto con #id ",
    mensaje_error_no_permiso_editar_album   : "No dispones de permisos para editar el álbum. Contacta con el administrador",
    mensaje_error_comprobar_permisos_editar_album : "Se ha producido un error al comprobar si dispones de permiso para editar el álbum. Contacta con el administrador",
    mensaje_error_cambio_visibilidad_foto : "Se ha producido un error al cambiar la visibilidad de la fotografía",
    mensaje_nombre_contrasena_usuario_obligatorio : "Es necesario el nombre de usuario y la contraseña",
    mensaje_error_durante_autenticacion : "Error durante la autenticación. Inténtelo de nuevo",
    mensaje_error_login_utilizado : "El login está siendo utilizado por otro usuario",
    mensaje_error_email_utilizado : "El email está siendo utilizado por otro usuario",
    mensaje_error_comprobar_email : "Se ha producido un error al comprobar el email",
    mensaje_error_comprobar_login : "Se ha producido un error al comprobar el login",
    mensaje_error_alta_usuario    : "Se ha producido un error al dar de alta el usuario",
    mensaje_error_conexion_bbdd   : "Se ha producido un error al obtener conexión a la BBDD",
    mensaje_confirmacion_desactivar_cuenta_usuario : "¿ Deseas desactivar la cuenta del usuario con #id ",
    mensaje_confirmacion_activar_cuenta_usuario : "¿ Deseas activar la cuenta del usuario con #id ",
    mensaje_error_no_permiso_deshabilitar_cuenta : "No dispones de permiso para deshabilitar la cuenta de un usuario. Contacta con el administrador",

    mensaje_error_comprobar_permiso_deshabilitar_cuenta : "Se ha producido un error al verificar si dispones de permiso para deshabilitar la cuenta del usuario",
    mensaje_error_activar_desactivar_cuenta_usuario : "Se ha producido un error al activar/desactivar la cuenta del usuario",

    



    
    

    

    


    

    
    

    

    

    
    /** etiquetas del plugin de jQuery validation */
    required: "Este campo es obligatorio.",
	remote: "Por favor, rellena este campo.",
	email: "Por favor, escribe una dirección de correo válida.",
	url: "Por favor, escribe una URL válida.",
	date: "Por favor, escribe una fecha válida.",
	dateISO: "Por favor, escribe una fecha (ISO) válida.",
	number: "Por favor, escribe un número válido.",
	digits: "Por favor, escribe sólo dígitos.",
	creditcard: "Por favor, escribe un número de tarjeta válido.",
	equalTo: "Por favor, escribe el mismo valor de nuevo.",
	extension: "Por favor, escribe un valor con una extensión aceptada.",
	maxlength: $.validator.format( "Por favor, no escribas más de {0} caracteres." ),
	minlength: $.validator.format( "Por favor, no escribas menos de {0} caracteres." ),
	rangelength: $.validator.format( "Por favor, escribe un valor entre {0} y {1} caracteres." ),
	range: $.validator.format( "Por favor, escribe un valor entre {0} y {1}." ),
	max: $.validator.format( "Por favor, escribe un valor menor o igual a {0}." ),
	min: $.validator.format( "Por favor, escribe un valor mayor o igual a {0}." ),
	nifES: "Por favor, escribe un NIF válido.",
	nieES: "Por favor, escribe un NIE válido.",
	cifES: "Por favor, escribe un CIF válido.",
	existeUsuarioConLoginIntroducido:"Existe un usuario con el login introducido. Prueba con otro.",
	existeUsuarioConMailIntroducido:"Existe un usuario con el email introducido.",
	errorTecnico:"Se ha producido un error técnico. Inténtelo de nuevo.",
	errorTecnicoCompleto:"Uppsss ... Se ha producido un error técnico. Intentalo de nuevo."
}