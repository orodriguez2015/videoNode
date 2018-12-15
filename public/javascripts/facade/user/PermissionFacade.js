/**
 * Clase PermissionFacade con métodos para realizar operaciones de comprobación
 * de permisos de un usuario
 * 
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class PermissionFacade {

    constructor() {
        this.URL_PERMISSION_VALIDATE = "/users/permission/validation";
    }



    /**
     * Comprueba si un usuario tiene un determinado permiso
     * @param {Integer} idPermiso: Id del permiso a verificar
     * @param {Function} onSuccess: Función invocada si la llamada AJAX se ha ejecutado correctamente
     * @param {Function} onError: Función invocada si la llamada AJAX ha lanzado un error
     */
    validatePermission(idPermiso, onSuccess, onError) {
        if (idPermiso != undefined) {
            return $.ajax({
                async: true,
                context: this,
                cache: false,
                type: 'POST',
                dataType: 'json',
                data: { idPermiso: idPermiso },
                url: this.URL_PERMISSION_VALIDATE,
                success: onSuccess,
                error: onError
            });
        }
    };
}

var permissionFacade = new PermissionFacade();