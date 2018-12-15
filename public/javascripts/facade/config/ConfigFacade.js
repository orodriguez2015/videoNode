/**
 * Clase con operaciones utilizadas en la configuración de la aplicación
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
function ConfigFacade() {

    var URL_CHECK_DATABASE = "/config/comprobarConexionBD";
    var URL_CHECK_EXISTENCE_TABLES = "/config/comprobarExistenciaTablas";
    var URL_INSTALLATION_FINISHED = "/config/installationFinished";
    var URL_CREATE_DATABASE = "/config/createTablesDatabase";

    this.saveConfigDatabase = function(config, onSuccess, onError) {
        return $.ajax({
            async: false,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: config,
            url: URL_CHECK_DATABASE,
            success: onSuccess,
            error: onError
        });
    };


    /**
     * Función que se invoca para comprobar si existen las tablas de la aplicación en BBDD, y en caso
     * contrario, crear las tablas
     */
    this.comprobarExistenciaTablas = function(onSuccess, onError) {
        return $.ajax({
            async: false,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: null,
            url: URL_CHECK_EXISTENCE_TABLES,
            success: configFacade.onSuccessComprobarExistenciaTablas,
            error: configFacade.onErrorComprobarExistenciaTablas
        });
    };

    /**
     * Función que se invoca en caso de éxito al comprobar si existen las tablas de la aplicación en BBDD
     * @param data Respuesta del servidor
     */
    this.onSuccessComprobarExistenciaTablas = function(data) {

        console.log("resultado: " + JSON.stringify(data));
        if (data != undefined) {

            switch (data.status) {
                case 0:
                    {
                        $('#msgErrorInstallation').hide();
                        $('#btnSiguiente').hide();
                        $('#btnCrear').show();
                        $('#divMensaje').html('La base de datos no contiene las tablas que utiliza la aplicación.');
                        $('#divMensajeBoton').html('Pulsa el botón <b>Crear tablas de base de datos</b> para proceder al alta de las mismas.');
                        break;
                    }

                case 1:
                    {
                        $('#txtErrorDatabase').html("Con la información proporcionada no se ha podido establecer conexión con la base de datos");
                        $('#msgErrorInstallation').show();

                    }

                case 2:
                    {
                        $('#txtErrorDatabase').html("En la base de datos indicada ya existe alguna de las tablas de la base de datos. Si pulsas el botón \"Crear tabla de base de datos \", se borrarán y se crearán las nuevas tablas.");
                        $('#btnSiguiente').hide();
                        $('#msgErrorInstallation').show();
                        $('#btnCrear').show();
                    }
            } // switch
        }
    };


    /**
     * Función que se invoca en caso de error al comprobar si existen las tablas de la aplicación en BBDD
     * @param err Error
     */
    this.onErrorComprobarExistenciaTablas = function(err) {
        console.log("resultado: " + JSON.stringify(err));
        $('#txtErrorDatabase').html("Se ha producido un error al comprobar la existencia de las tablas de la base de datos");
        $('#msgErrorInstallation').show();
    };


    /**
     * Función invocada para enviar al servidor una petición, de tipo POST, de alta de las tablas de base de datos
     */
    this.createTablesDatabase = function() {

        return $.ajax({
            async: false,
            context: this,
            cache: false,
            type: 'POST',
            dataType: 'json',
            data: null,
            url: URL_CREATE_DATABASE,
            success: configFacade.onSuccessCreateTable,
            error: configFacade.onErrorCreateTable
        });
    };


    /**
     * Función que se ejecuta si la operación de creación de tablas ha tenido éxito
     * @param data Respuesta del servidor
     */
    this.onSuccessCreateTable = function(data) {
        if (data) {
            console.log("onSuccessCreateTable data: " + JSON.stringify(data));
            switch (data.status) {
                case 0:
                    {
                        window.location.href = URL_INSTALLATION_FINISHED;
                        break;
                    }

                case 1:
                    {
                        $('#txtErrorDatabase').html("Se ha producido un error técnico al crear la base de datos: " + data.descStatus);
                        $('#msgErrorInstallation').show();
                        break;
                    }

                case 2:
                    {
                        $('#txtErrorDatabase').html("Se ha producido un error técnico al ejecutar las sentencias de creación de las tablas. Inténtelo de nuevo.");
                        $('#msgErrorInstallation').show();
                        break;
                    }

                case 3:
                    {
                        $('#txtErrorDatabase').html("Se ha producido un error técnico. Inténtelo de nuevo.");
                        $('#msgErrorInstallation').show();
                        break;
                    }

                case 4:
                    {
                        $('#txtErrorDatabase').html("Se ha producido un error al obtener la conexión con la base de datos. Inténtelo de nuevo.");
                        $('#msgErrorInstallation').show();
                        break;
                    }

            } // switch
        }
    };

    /**
     * Función que se ejecuta en caso de error
     * @param error Error que se ha producido
     */
    this.onErrorCreateTable = function(error) {
        $('#txtErrorDatabase').html("Se ha producido un error al crear las tablas de la base de datos");
        $('#msgErrorInstallation').show();
    };
};

var configFacade = new ConfigFacade();