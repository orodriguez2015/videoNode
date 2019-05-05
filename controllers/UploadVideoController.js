// Se incorpora el archivo de configuración con las rutas
var configUpload = require('../config/config_upload.json');
var constantes = require('../config/constantes.json');
var database = require('../db/DatabaseMysql.js');
// Upload de ficheros usando el middleware formidable
var formidable = require('formidable');
// Middleware para obtener las dimensiones de una imagen
var sizeOf = require('image-size');
// Middleware para poder ejecutar consultas contra la BBDD MySql
// Middleware que contiene operaciones de utilidad en el manejo de ficheros
var fileUtils = require('../util/FileUtils.js');
// Middleware que contiene operaciones de utilidad en el manejo de ficheros
var httpResponse = require('../util/HttpResponseUtil.js');
// Middleware path
var path = require('path');
var fs = require("fs");



/**
 * Renderiza la vista de selección de imágenes para el nuevo albúm fotográfico
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.uploadVideoFile = function(req, res, next) {
    var form = new formidable.IncomingForm();
    var idVideoteca = req.params.idVideoteca;
    var videoteca = req.Videoteca;
    
    /**
     * CONFIGURACION PROPIEDADES DEL MIDDLEWARE FORMIDABLE
     * 
     * 1. Se modifica la propiedad form.maxFileSize para establecer el tamaño máximo del archivos a subir al servidor
     *    de un archivo a subir al servidorSE MODIFICA EL TAMAÑO MÁXIMO DE ARCHIVO A SUBIR AL SERVIDOR MULTIPLICANDO POR 10 EL VALOR POR DEFECTO 
     * 
     * 2. Se modifica la propiedad form.uploadDir para establecer la ruta del directorio en que se alojará el archivo subido al servidor
     */
    form.maxFileSize =  5097152000;
    form.uploadDir = __dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + configUpload.path_upload_video;
    form.parse(req);

    console.log("Tamaño maximo archivo a subir al servidor = " + form.maxFileSize + " bytes");
    console.log("Directorio de alojamiento de archivos     = " + form.uploadDir);
    
    console.log("idVideoteca subida: " + idVideoteca + ",Videoteca =  " + JSON.stringify(videoteca));
    console.log("ruta completa: " + videoteca.ruta_completa);

    
    var nameFile;
    var pathFile;
    var mimeType;
    var widthFile;
    var heightFile;
    var rutaRelativaArchivoServidor;
    var rutaAbsolutaArchivoServidor;
    var error; // Almacena el error que se desea devolver en caso de error


    // Contiene
    var ficheros = new Array();
    var respuesta = new Array();
    var resultado = new Array();

    /**
     * Se dispara cuando el archivo ha llegado al servidor
     * @param field Campo del formulario desde el que se sube el archivo
     * @param file Fichero
     */
    form.on('file', function(field, file) {
        console.log("Archivo" + file.name + " recibido");
        ficheros.push(file);
    });


    /**
     * Se dispara antes de guardar el archivo. Por tanto en este momento
     * se puede modificar el nombre del archivo antes de grabarlo en disco
     * @param field Campo del formulario desde el que se sube el archivo
     * @param file Fichero
     */
    form.on('fileBegin', function(field, file) {
        nameFile = file.name;
        mimeType = file.type;

        var videoteca = req.Videoteca;
        var idVideoteca = req.Videoteca.id;
        var idUsuario = req.session.usuario.ID

        console.log("fileBegin nameFile = " + nameFile + " mime: " + mimeType);
        console.log("idVideoteca = " + idVideoteca);
        console.log("field = " + field);
        
        if (file.name!=undefined) {
            var upload_dir = path.join(__dirname, ".." + configUpload.path_upload_videos);
            var name = file.name;
            
            var carpetaUsuario = upload_dir + constantes.FILE_SEPARATOR + idUsuario;
            var carpetaVideoteca = upload_dir + idUsuario + constantes.FILE_SEPARATOR + idVideoteca;
            

            try {
                // Se comprueba si existe primero la carpeta store dentro de la carpeta public, sino existe hay que crearlo
                var carpetaVideos = path.join(__dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR +
                    constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO);

                var carpetaVideoteca = videoteca.ruta_completa;

                console.log("carpetaVideos = " + carpetaVideos + ", carpetaVideoteca = " + carpetaVideoteca);


                var existsCarpetaVideos = fileUtils.existsFile(carpetaVideos);
                
                /**
                 * Sino existe la carpeta videos
                 */
                if (!existsCarpetaVideos) {
                    console.log("No existe carpetaStore se crea");
                    // Se crea la carpeta videos
                    fileUtils.mkdirSync(carpetaVideos);
                }


                /*
                 * Se crea la carpeta del álbum dentro de la carpeta del usuario sino existe
                 */

                if(!fileUtils.existsFile(carpetaVideoteca)) {
                    fileUtils.mkdirSync(carpetaVideoteca);
                }


            } catch (err) {
                console.log("Error al crear las carpetas de la videoteca: " + err.message);
                var err = new Error("Error al crear las carpetas de la videoteca: " + err.message);
                err.codError = 7;
                form.emit('error', err);
            }


            // Ruta en el que se alojará el archivo
            var pathAux = carpetaVideoteca + constantes.FILE_SEPARATOR + file.name;
            var datos = fileUtils.extraerNombreExtension(file.name);
            

            /**
             * Se comprueba si existe ya un fichero con el mismo nombre.
             * En ese caso, se lanza un error para que sea procesado
             */
            if (fileUtils.existsFile(pathAux)) {
                file.onErrorExisteFichero = "El fichero " + file.name + " ya existe en el servidor";
            } else
            {
                // Ruta del fichero en disco
                file.path = pathAux;
                rutaRelativaArchivoServidor = configUpload.relative_path_show_video + req.session.usuario.ID + "/" + idVideoteca + "/" + carpetaVideoteca;
                rutaAbsolutaArchivoServidor = file.path;
            }
        }
    });


    /**
     * Devuelve una respuesta JSON ante un error
     */
    function devolverError(err) {
        res.header('Connection', 'close');
        res.writeHead(500, { "Content-Type": "application/json" });
        res.write(JSON.stringify(err));
        res.end();
    };

    /**
     * Se dispara en caso de error
     * @param err Error producido
     */
    form.on('error', function(err) {
        // Se almacena el error lanzado en el objeto error, para manejarlo
        // en el evento "end" de formidable
        console.log("error =  " + err.message);
        devolverError({status:100,descStatus:'Se ha excedido el tamaño máximo de archivo',limite:form.maxFileSize});
    });


    /**
     * Se dispara cuando el archivo se ha guarda en disco
     */
    form.on('end', function() {
        // Si hay error, se devuelve un HTTP 500 con el código de error, ya que no funciona
        // el evento 'error' del middleware formidable
        var idUsuario = req.session.usuario.ID;
        var contador = 0;
        var registros = new Array();
        var nombresFicheros = new Array();
        var resultadoFicherosProcesados = new Array();
        var db = new database.DatabaseMysql();

        /*
         * Se genera el array con los valores de las fotografías que se pasan en la query de inserción
         */
        for (i = 0; ficheros != undefined && i < ficheros.length; i++) {
            var fichero = ficheros[i];

            if (fichero != undefined) {

                /**
                 * Si el fichero subido al servidor existe o no es una imagen
                 */
                var ERROR_EXISTE_FICHERO = (fichero.onErrorExisteFichero != undefined && fichero.onErrorExisteFichero.length > 0) ? true : false;
                var ERROR_TIPO_MIME_FICHERO = (fichero.onErrorTipoMimeImagen != undefined && fichero.onErrorTipoMimeImagen.length > 0) ? true : false;

                console.log("nombre fichero: " + fichero.name);
                console.log("ERROR_EXISTE_FICHERO: " + ERROR_EXISTE_FICHERO);
                console.log("ERROR_TIPO_MIME_FICHERO: " + ERROR_TIPO_MIME_FICHERO);

                var resultadoProceso = { status: 0, descStatus: "OK" };

                /**
                 * Si existe el fichero
                 */
                if (ERROR_EXISTE_FICHERO) {
                    resultadoProceso.status = 1;
                    resultadoProceso.descStatus = "Ya existe el archivo en el servidor";
                } else
                /**
                 * Si el tipo mime del fichero no es una imagen
                 */
                if (ERROR_TIPO_MIME_FICHERO) {
                    resultadoProceso.status = 2;
                    resultadoProceso.descStatus = "El fichero " + fichero.name + " no es de un tipo de archivo válido";
                }

                resultadoProceso.name = fichero.name;
                resultadoFicherosProcesados.push(resultadoProceso);

                console.log("resultadoFicherosPRroceso = " + JSON.stringify(resultadoFicherosProcesados));
                httpResponse.devolverJSON(res,resultadoProceso);
  
            }
        } // for


       
    });
};