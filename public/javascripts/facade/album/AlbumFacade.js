/**
 * Clase con métodos que permiten almacenar un álbum en BBDD
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
function AlbumFacade() {

    var URL_ALBUM = "/album";

    /**
     * Envio de un álbum por post para almacenarlo en BBDD
     * @param user Objeto con los datos del álbum
     */
    this.saveAlbum = function(album) {
        return $.ajax({
            async: true,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: album,
            url: URL_ALBUM,
            success: this.onSuccessSaveAlbum,
            error: this.onErrorSaveAlbum
        });
    };


    /**
     * Envio de un álbum al servidor para su edición
     * @param user Objeto con los datos del álbum
     */
    this.updateAlbum = function(album) {
        return $.ajax({
            async: true,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: album,
            url: URL_ALBUM + "/" + album.id + "?_method=PUT",
            success: this.onSuccessEditAlbum,
            error: this.onErrorEditAlbum
        });
    };



    /**
     * Función invocada en caso de éxito al editar el álbum en BBDD
     * @param data
     */
    this.onSuccessEditAlbum = function(data) {
        console.log("onSuccessEditAlbum: " + JSON.stringify(data));
        if (data != undefined) {
            switch (data.status) {
                case 0:
                    {
                        window.location.href = "/album/admin";
                        break;
                    }

                case 1:
                    {
                        messagesArea.showMessageError("Se ha producido un error al editar el álbum");
                        break;
                    }

            } //switch
        }

    };


    /**
     * Funcion que se invoca en caso de error al editar el álbum en BBDD
     * @param err Error
     */
    this.onErrorSaveAlbum = function(err) {
        messagesArea.showMessageError(messages.mensaje_error_editar_album);
    };


    /**
     * Función invocada en caso de éxito al almacenar el álbum en BBDD
     * @param data
     */
    this.onSuccessSaveAlbum = function(data) {
        window.location.href = "/album/admin";
    };


    /**
     * Funcion que se invoca en caso de error al almacenar el álbum en BBDD
     * @param err Error
     */
    this.onErrorSaveAlbum = function(err) {
        messagesArea.showMessageError(messages.mensaje_error_grabar_album);
    };




    /**
     * Función que se invoca para preguntar al usuario si desea desactivar 
     * @param {Integer} id: Id del álbum
     * @param {Function} onSuccess : Función de éxito
     * @param {Function} onError: Función de error
     */
    this.validateDeleteAlbum = function(id, onSuccess, onError) {
        permissionFacade.validatePermission(6, function(data) {
            switch (data.status) {
                case 0:
                    {

                        if (id != undefined) {
                            bootbox.confirm({
                                title: messages.atencion_titulo_modal,
                                message: messages.mensaje_eliminar_album_1 + " " +  id + " " +  messages.mensaje_eliminar_album_2,
                                buttons: {
                                    cancel: {
                                        label: messages.boton_cancelar,
                                        className: 'btn btn-danger'
                                    },
                                    confirm: {
                                        label: messages.boton_confirmar,
                                        className: 'btn btn-success'
                                    }
                                },
                                callback: function(result) {
                                    if (result) {

                                        return $.ajax({
                                            async: true,
                                            context: this,
                                            cache: false,
                                            type: 'POST',
                                            dataType: 'json',
                                            data: null,
                                            url: URL_ALBUM + "/" + id + '?_method=DELETE',
                                            success: onSuccess,
                                            error: onError
                                        });

                                    } //if
                                }
                            });
                        } // if
                        break;
                    }

                case 1:
                    {
                        bootbox.alert(messages.mensaje_error_no_permiso_borrar_album);
                        break;
                    }

                case 2:
                    {
                        bootbox.alert(messages.mensaje_error_comprobar_permiso_borrar_album);
                        break;
                    }
            } // switch


        }, function(err) {
            console.log("Error al verificar permiso")
        });

    };


    /**
     * Función invocada en caso de éxito al borrar un álbum
     * @param data Respuesta del servidor
     */
    this.onSuccessDeleteAlbum = function(data) {
        if (data != undefined && data.status == 0) {
            window.location.href = "/album/admin";
        }
    };


    /**
     * Función invocada en caso de fallo al borrar un álbum
     * @param err Respuesta del servidor
     */
    this.onErrorDeleteAlbum = function(err) {
        messagesArea.showMessageError(messages.mensaje_error_eliminar_album);
    };

};

var albumFacade = new AlbumFacade();