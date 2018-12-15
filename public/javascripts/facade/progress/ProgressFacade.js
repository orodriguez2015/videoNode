/**
 * Clase utilizada para mostrar una modal de progreso
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
function ProgressFacade(config) {
    var ID_PROGRESS_MODAL_DEFAULT = "processingModal";
    var TXT_MODAL_HEADER_DEFAULT = "Procesando";
    var ID_TXT_MODAL_HEADER = "idTxtModalHeader";

    this.idProgressModal = ID_PROGRESS_MODAL_DEFAULT;
    this.txtModalHeader = TXT_MODAL_HEADER_DEFAULT;

    /**
     * Permite indicar a través del objeto que se pasa por parámetro, el id de la modal y el
     * text 
     */
    this.init = function(config) {
        this.idProgressModal = config != undefined && config.idProgressModal != undefined ? config.idProgressModal : ID_PROGRESS_MODAL_DEFAULT;
        this.txtModalHeader = config != undefined && config.txtModalHeader != undefined ? config.txtModalHeader : TXT_MODAL_HEADER_DEFAULT;
    }

    /**
     * Muestra la modal de progreso
     */
    this.show = function() {
        $("#" + ID_TXT_MODAL_HEADER).html("<h3>" + this.txtModalHeader + "</h3>");

        $("#" + this.idProgressModal).modal({
            show: true
        });
    };

    /**
     * Oculta la modal de progreso
     */
    this.hide = function() {
        $("#" + this.idProgressModal).modal('hide');
    };
};

var progressFacade = new ProgressFacade();