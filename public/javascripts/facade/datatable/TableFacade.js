/**
 * Clase TableFacade que permite realizar la configuración de un datatable de JQuery
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class TableFacade {

    /**
     * Constructor
     */
    constructor(configuration) {
        this.config = configuration;
    }

    /**
     * Método que inicializa el datatable en función de la configuración pasada a la Clase
     * @param {configuration} configuration 
     */
    setDataFilter(datafilter) {
        if (this.config != undefined) {
            this.config.dataFilter = datafilter;
        }
    }

    /**
     * Método que inicializa el datatable en función de la configuración pasada a la clase
     * @param {configuration} configuration 
     */
    init() {
            try {

                if (this.config != null && this.config != undefined) {
                    var idDataTable = this.config.idDataTable; // ID DE LA DATATABLE
                    var ajaxType = this.config.ajaxType; // GET, POST, PUT, DELETE
                    var ajaxUrl = this.config.ajaxUrl; // URL A LA QUE SE PASA LA PETICIÓN AJAX
                    var dataFilter = (this.config.dataFilter != undefined) ? this.config.dataFilter : function() {};
                    var displayLength = (this.config.displayLength != undefined) ? this.config.undefined : 10;
                    
                    // Fichero de idiomas
                    var language = "";
                    if(config.i18n!=null && config.i18n!=undefined) {
                        language = "/javascripts/vendor/datatables/datatables_i18n_" + config.i18n + ".json";
                    }else {
                        // Sino hay un idioma configurado por defecto, se supone que es el español
                        language = '/javascripts/vendor/datatables/datatables_i18n_es.json';
                    }

                    // Alineado del contenido de las celdas, por defecto a la izquierda
                    var alignment = (this.config.alignment != undefined) ? this.config.alignment : [
                        { "className": "dt-left", "targets": "_all" }
                    ];


                    $(function() {
                        var dTable = $('#' + idDataTable).dataTable({
                            // Configuración de idioma
                            "language": {
                                "url": language
                            },
                            "iDisplayLength": displayLength,
                            "serverSide": true,
                            "ajax": {
                                "type": ajaxType,
                                "url": ajaxUrl,
                                "dataFilter": dataFilter
                            },
                            "columnDefs": alignment
                        });
                    });

                }
            } catch (err) {
                console.log("Se ha producido un error al configurar el datatable: " + err.message);
            }
        } // init

} // TableFacade