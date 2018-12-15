/**
 * Clase que se encarga de crear la datatable que contiene los permisos que se pueden 
 * asignar a un usuario
 * <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class UsersPermissionsTableFacade extends TableFacade {

    /**
     * Constructor
     * @param {config} config 
     */
    constructor(config) {
        // Se invoca al constructor de la superclase pasando los datos de configuración de la datatable
        super(config);
        this.ESPACIO_BLANCO = "&nbsp";
        this.IMG_CORRECTO = "images/correcto.png";
        this.IMG_INCORRECTO = "images/incorrecto.png";

        // Se establece la función que procesa el resultado procedente del servidor para mostrarlo correctamente
        // en la databable
        super.setDataFilter(this.processUsers.bind(this));
        // Se invoca al método init que carga la configuración de la datatable
        super.init();
    }


    /**
     * Procesa la respuesta del servidor y la convierte los datos a mostrar en el datatable en JSON
     * @param respuesta Respuesta procedente del servidor
     */
    processUsers(respuesta) {
        // Se añade datos extra a la respuesta obtenida del servidor
        var res = JSON.parse(respuesta);
        var datos = res.data;

        try {
            for (var i = 0; datos != undefined && i < datos.length; i++) {
                var idPermiso = datos[i][0];
                var hasPermission = datos[i][2];

                datos[i][2] = this.imgAssignPermission(idPermiso, hasPermission);
            };
        } catch (err) {

        }

        res.data = datos;
        return JSON.stringify(res);
    }


    /**
     * Devuelve el tag html con la imagen a través de la cual se puede asignar el permiso a un usuario o retirarselo
     * @param {Integer} idUsuario: Id del usuario
     * @param {Integer} hasPermission: Tiene permiso
     */
    imgAssignPermission(idPermiso, hasPermission) {
        var img;

        if (hasPermission == 0) {
            img = "<img src=\"/images/incorrecto.png\" id=\"imgPermiso" + idPermiso + "\" border=\"0\" width=\"20\" height=\"20\" title=\"Permiso no asignado\" alt=\"Permiso no asignado\" onclick=\"javascript:assignPermission(" + idPermiso + ",1);\"/>";

        } else {
            img = "<img src=\"/images/correcto.png\" id=\"imgPermiso" + idPermiso + "\" border=\"0\" width=\"20\" height=\"20\" title=\"Permiso asignado\" alt=\"Permiso asignado\" onclick=\"javascript:assignPermission(" + idPermiso + ",0);\"/>";
        }

        img = img + "<input type=\"hidden\" name=\"valorPermiso" + idPermiso + "\" id=\"valorPermiso" + idPermiso + "\" value=\"" + hasPermission + "\"/>";
        return img;
    };

};


/**
 * Función que envia la asignación/desasignación del permiso para un usuario. Está
 * fuera de la clase porque 
 * @param {Integer} idPermiso: Identificador del permiso
 * @param {Integer} value: Valor del permiso 
 */
function assignPermission(idPermiso, value) {
    // Valor actual del permiso
    var valorActual = $('#valorPermiso' + idPermiso).val();
    // Nuevo valor del permiso en función del actual
    var nuevoValor = (valorActual == 1) ? 0 : 1;

    if (idPermiso != undefined && ID_USUARIO_SELECCIONADO != undefined && nuevoValor != undefined && valorActual != undefined) {
        var configuracion = {
            idUsuario: ID_USUARIO_SELECCIONADO,
            idPermiso: idPermiso,
            valorPermiso: nuevoValor
        }
        userFacade.assignPermission(configuracion, onSuccessAssignPermission, onErrorAssignPermission);
    }
};


/**
 * Función invocada si la asignación de un permiso a un usuario ha sido exitosa
 * @param {Object} result: Objeto con la respuesta del servidor
 */
function onSuccessAssignPermission(result) {
    if (result != undefined) {
        switch (result.status) {
            case 0:
                {
                    // Id del permiso modificado para el usuario
                    var idPermisoModificado = result.idPermiso;
                    // Valor del permiso (1 = asignado, 0 = sin asignar)
                    var valorPermisoModificado = result.valorPermiso;

                    // Se cambia la imagen según el valor si está ahora el permiso asignado o no al usuario
                    var rutaImagen = "/images/incorrecto.png";
                    if (valorPermisoModificado == 1) {
                        rutaImagen = "/images/correcto.png";
                    }

                    $('#imgPermiso' + idPermisoModificado).attr("src", rutaImagen);
                    $('#valorPermiso' + idPermisoModificado).val(valorPermisoModificado);
                    break;
                }

            case -1:
                {
                    messagesArea.showMessageError("Se ha producido un error al obtener una conexión a la base de datos");
                    break;
                }

            case -2:
                {
                    messagesArea.showMessageError("Se ha producido un error al insertar el permiso en base de datos");
                    break;
                }
        } // switch
    } // if
};

/**
 * Función que es invocada en caso de error
 * @param {Object} result : Objeto con la respuesta del servidor
 */
function onErrorAssignPermission(result) {
    messagesArea.showMessageError("Se ha producido un error al asignar el permiso al usuario. Inténtelo de nuevo");
};