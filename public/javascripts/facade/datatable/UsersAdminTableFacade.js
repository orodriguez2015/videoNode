/**
 * Clase que se encarga de crear la datatable que contiene los usuarios 
 * del sistema
 */
class UsersAdminTableFacade extends TableFacade {

    constructor() {
        // Se invoca al constructor de la superclase pasando los datos de configuración de la datatable
        super(config);
        // Se establece la función que procesa el resultado procedente del servidor para mostrarlo correctamente
        // en la databable
        super.setDataFilter(this.processUsers.bind(this));
        this.ESPACIO_BLANCO = "&nbsp";
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

        for (var i = 0; datos != undefined && i < datos.length; i++) {
            var idUsuario = datos[i][0];
            var activo = datos[i][6];

            if (activo == "1") {
                datos[i][6] = "SI";
            } else
                datos[i][6] = "NO";

            var opciones = userAdminTableFacade.imgEditUser(idUsuario) + this.ESPACIO_BLANCO + userAdminTableFacade.imgDeleteUser(idUsuario, activo) +
                this.ESPACIO_BLANCO + userAdminTableFacade.imgPermissionsUser(idUsuario);
            datos[i][9] = opciones;

        } // for
        res.data = datos;
        return JSON.stringify(res);
    };


    /**
     * Devuelve el tag html para mostrar la imagen que permite acceder a la pantalla en la que se
     * se permite editar el álbum
     * @param id Id del álbum
     */
    imgEditUser(id) {
        return "<img src=\"/images/pencil2.png\" border=\"0\" width=\"20\" height=\"20\" title=\"Editar\" alt=\"Editar\" onclick=\"window.location.href='/users/" + id + "'\"/>";
    };

    /**
     * Devuelve el tag html para mostrar la imagen que permite dar de baja un usuario sin borrarlo fisicamente de la BBDD
     * @param id Id del usuario
     * @param activo Indica si el usuario actualmente está activo o no
     */
    imgDeleteUser(id, activo) {
        return "<img src=\"/images/full_trash.png\" border=\"0\" width=\"20\" height=\"20\" title=\"Eliminar\" alt=\"Eliminar\"  onclick=\"userFacade.confirmDisableUserAccount(" + id + "," + activo + ");\" />";
    };


    /**
     * Devuelve el tag html que muestra una imagen que permite el acceso a la pantalla de control de los permisos
     * de un usuario
     * 
     */
    imgPermissionsUser(id) {
        var salida = "";
        if (USER_ROOT != undefined && USER_ROOT == true) {
            salida = "<img src = \"/images/backup.jpeg\" border=\"0\" width=\"20\" height=\"20\" title=\"Permisos del usuario\" alt=\"Permisos del usuario\" onclick=\"window.location.href='/users/permissions/" + id + "'\">";
        }
        return salida;
    };


};