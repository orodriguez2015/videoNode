/**
 * Clase DialogFacade con operaciones estáticas a través de las cuales 
 * se muestran un cuadro de diálogo de a través del plugin bootbox
 * 
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class DialogFacade {

    /**
     * Muestra un cuadro de diálogo de confirmación
     * @param {String} titulo Titulo de la ventana modal
     * @param {String} mensaje Mensaje a mostrar en la ventana modal
     * @param {function} onSuccess Función que se invoca cuando el usuario a pulsado el botón confirmar
     */
    static showConfirmation(titulo,mensaje,onSuccess) {

        if(titulo!=undefined && mensaje!=undefined && onSuccess!=undefined) {
            bootbox.confirm({
                title: titulo,
                message: mensaje,
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
                callback: onSuccess  
            });       
        } else {
            console.log("Es obligatorio indicar el título, mensaje y función callback");
        }
    }// showConfirmation


    /**
     * Muestra un cuadro de diálogo de tipo alert
     * @param {String} mensaje 
     */
    static showAlert(mensaje) {
        bootbox.alert(mensaje);
    }
}

