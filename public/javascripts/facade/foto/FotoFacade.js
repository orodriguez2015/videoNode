/**
 * Clase FotoFacade con operaciones sobre el manejo de las fotografías de un álbum
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class FotoFacade {

    /**
     * Constructor
     */
    constructor() {

        this.URL_PHOTO = "/photo";
        this.URL_PHOTO_VISIBLE = "/photo/visible/";
        this.URL_PHOTO_VISUALIZED = "/photo/visualized/";
        this.URL_BORRADO_MULTIPLE = "/photo/multiple";
    }



    /**
     * Envío de petición de incremento de número de veces que la 
     * foto ha sido visualizad
     * @param id Id de la fotografía
     * @param onSuccess Función onSuccess
     * @param onError Función onError
     */
    photoDisplayed(id, onSuccess, onError) {
        return $.ajax({
            async: true,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: id,
            url: this.URL_PHOTO_VISUALIZED + id,
            success: onSuccess,
            error: onError
        });
    };



    /**
     * Envío de petición de borrado de una fotografía al servidor
     * @param id Id de la fotografía 
     */
    deletePhoto(id) {
        return $.ajax({
            async: true,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: id,
            url: this.URL_PHOTO + "/" + id + '?_method=DELETE',
            success: this.onSuccessDeletePhoto,
            error: this.onErrorDeletePhoto
        });
    };


    /**
     * Operación invocado en caso de éxito al eliminar una fotografía
     */
    onSuccessDeletePhoto(data) {
        if (data != undefined) {
            switch (data.status) {
                case 0:
                    window.location.reload(true);
                    break;
                case 1:
                    messagesArea.showMessageWarning("Se ha producido un error en base de datos");
                    break;
                case 2:
                    messagesArea.showMessageWarning("Se ha producido un error técnico al eliminar la fotografía");
                    break;
                case 3:
                    messagesArea.showMessageWarning("No existe la fotografía en el servidor");
                    break;
                case 4:
                    messagesArea.showMessageWarning("Se ha producido un error al eliminar la fotografia del disco");
                    break;
                case 5:
                    messagesArea.showMessageWarning("No se ha podido obtener conexión a la base de datos");
                    break;
            } // switch
        }
    };


    /**
     * Operación invocado en caso de fracaso al eliminar una fotografía
     */
    onErrorDeletePhoto(err) {
        messagesArea.showMessageError("Se ha producido un error al borrar la fotografía");
    };


    /**
     * Función que pregunta al usuario si desea modificar la visibilidad
     * de una fotografía
     * @param id Id de la fotografía
     * @param flag True si se hace visible la foto y false en caso contrario
     */
    validarVisibibilidadFoto(id) {

        permissionFacade.validatePermission(5, function(data) {

            switch (data.status) {
                case 0:
                    {
                        if (id != undefined) {
                            var publico = $('#publico' + id).val();

                            var message = "";
                            var flag = true;
                            if (publico == 0) {
                                message = "¿Deseas hacer visible la foto con #id " + id + " para todo el mundo?";
                            } else {
                                message = "¿Deseas ocultar la foto con #id " + id + "?";
                                flag = false;
                            }

                            bootbox.confirm({
                                title: "Atención",
                                message: message,
                                buttons: {
                                    cancel: {
                                        label: 'Cancelar',
                                        className: 'btn btn-danger'
                                    },
                                    confirm: {
                                        label: 'Confirmar',
                                        className: 'btn btn-success'
                                    }
                                },
                                callback: function(result) {
                                    if (result) {
                                        fotoFacade.setPublishPhoto(id, flag);

                                    } //if
                                }
                            });
                        } // if
                        break;
                    }

                case 1:
                    {
                        bootbox.alert("No dispones de permisos para editar el álbum. Contacta con el administrador");
                        break;
                    }

                case 2:
                    {
                        bootbox.alert("Se ha producido un error al comprobarNo dispones de permisos para editar el álbum. Contacta con el administrador");
                        break;
                    }


            } // switch

        }, function(err) {
            bootbox.alert("Se ha producido un error al cambiar la visibilidad de la fotografía");
        });

    };


    /**
     * Envio de petición al servidor para cambiar el estado de visibilidad de
     * una fotografía en la parte pública de la aplicación
     * @param id Id de la fotografía
     * @param visible Boolean
     */
    setPublishPhoto(id, visible) {
        return $.ajax({
            async: true,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: { publico: visible },
            url: this.URL_PHOTO_VISIBLE + id,
            success: this.onSuccessPublishPhoto,
            error: this.onErrorPublishPhoto
        });

    };



    /**
     * Operación invocada en caso de que el
     * cambio de la visibilidad de una fotografía se haya ejecutado con éxito
     * @param data Objeto con la respuesta del servidor
     */
    onSuccessPublishPhoto(data) {
        if (data != undefined) {
            switch (data.status) {
                case 0:
                    {
                        var pathImage = "/images/ojo_cerrado.png";

                        if (data.publico == 1) {
                            pathImage = "/images/ojo_abierto.png";
                        }

                        $('#publico' + data.idPhoto).val(data.publico);
                        $('#imgPublico' + data.idPhoto).attr("src", pathImage);
                        break;
                    } // case
            } // switch
        } // if

    };


    /**
     * Operación invocada en caso de que se haya producido un error al
     * cambiar la visibilidad de una fotografía
     * @param data Objeto con la respuesta del servidor
     */
    onErrorPublishPhoto(data) {
        messagesArea.showMessageError("Se ha producido un error al cambiar la visibilidad de la fotografía seleccionada");
    };



    /**
     * Pregunta al usuario si desea eliminar una fotografía del álbum. Previamente comprueba si el usuario
     * tiene permiso de edición de un álbum, en ese caso, no se permite borrar ninguna fotografía
     * @param {Integer} id: Id de la foto seleccionada por el usuario
     */
    validarBorradoFoto(id) {

        permissionFacade.validatePermission(5, function(data) {

                switch (data.status) {
                    case 0:
                        {

                            if (id != undefined) {

                                bootbox.confirm({
                                    title: "Atención",
                                    message: "¿Deseas eliminar la fotografía con #id " + id + " del álbum ?",
                                    buttons: {
                                        cancel: {
                                            label: 'Cancelar',
                                            className: 'btn btn-danger'
                                        },
                                        confirm: {
                                            label: 'Confirmar',
                                            className: 'btn btn-success'
                                        }
                                    },
                                    callback: function(result) {
                                        if (result) {

                                            fotoFacade.deletePhoto(id);

                                        } //if
                                    }
                                });
                            }

                            break;
                        }

                    case 1:
                        {
                            bootbox.alert("No dispones de permiso para borrar un álbum. Contacta con el administrador");
                            break;
                        }

                    case 2:
                        {
                            bootbox.alert("Se ha producido un error al comprobar si dispone de permiso de borrado del álbum");
                            break;
                        }
                }
            },
            function(err) {
                bootbox.alert("Se ha producido un error al comprobar si dispone de permiso de borrado del álbum");
            });
    }



    /**
     * Método que se encarga de validar y enviar al servidor la petición
     * de borrado múltiple de fotografías
     */
    borradoMultipleFotografias() {

        var seleccionados = new Array();

        $('input[type=checkbox]').each(function(){
            if (this.checked) {
                selected += $(this).val()+', ';
                seleccionados.push();
            }
        }); 

        if(seleccionados==null || seleccionados.length==0) {
            bootbox.alert("Es necesario que selecciones alguna fotografía");

        } else {

            return $.ajax({
                async: true,
                context: this,
                cache: false,
                type: 'POST',
                dataType: 'json',
                data: { seleccionados: seleccionados },
                url: this.URL_BORRADO_MULTIPLE + '?_method=DELETE',
                success: this.onSuccessBorradoFotografiaMultiple,
                error: this.onErrorBorradoFotografiaMultiple
            });

            
        }
    }// borradoMultipleFotografias


    onSuccessBorradoFotografiaMultiple(data) {
        bootbox.alert("OK");
    }


    onErrorBorradoFotografiaMultiple(error) {
        bootbox.alert("Se ha producido un error al realizar el borrado de las fotografías");
    }


};

// Única instancia de la clase FotoFacade
var fotoFacade = new FotoFacade();