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
// Generación de un thumbnail
var thumb = require("node-thumbnail").thumb;


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
    

    console.log("idVideoteca subida: " + idVideoteca + ",Videoteca =  " + JSON.stringify(videoteca));
    console.log("ruta completa: " + videoteca.ruta_completa);
    // Se indica cual es el directorio de destino

    form.uploadDir = __dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + configUpload.path_upload_video;
    console.log("form.uploadDir = " + form.uploadDir);

    form.parse(req);
    var nameFile;
    var pathFile;
    var mimeType;
    var widthFile;
    var heightFile;
    var rutaRelativaArchivoServidor;
    var rutaAbsolutaArchivoServidor;
    var error; // Almacena el error que se desea devolver en caso de error

    var CARPETA_ALBUM;

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
        console.log("file");
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
            // /**
            //  * Se comprueba si el tipo mime del archivo se corresponde con el de alguna
            //  * de las imágenes admitidas,sino es válido se lanza un error para que sea procesado
            //  */
            // if (!fileUtils.isMimeTypeImage(mimeType)) {
            //     file.onErrorTipoMimeImagen = "El tipo MIME " + file.name + " no válido. Sólo se admiten imágenes";

            // } else 
            {
                // Ruta del fichero en disco
                file.path = pathAux;
                rutaRelativaArchivoServidor = configUpload.relative_path_show_video + req.session.usuario.ID + "/" + idVideoteca + "/" + nombreCarpetaVideoteca;
                rutaAbsolutaArchivoServidor = file.path;
            }
        }
    });


    /**
     * Devuelve una respuesta JSON ante un error
     */
    function devolverError(err) {
        res.header('Connection', 'close');
        res.status = 500;
        res.writeHead(500, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ status: err.codError, descStatus: err.message }));
        res.end();
    };

    /**
     * Se dispara en caso de error
     * @param err Error producido
     */
    form.on('error', function(err) {
        // Se almacena el error lanzado en el objeto error, para manejarlo
        // en el evento "end" de formidable
        error = err;
        console.log("error ===>");
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
        var nombresFicherosMiniatura = new Array();
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
                    resultadoProceso.descStatus = "Ya existe la imagen en el álbum";
                } else
                /**
                 * Si el tipo mime del fichero no es una imagen
                 */
                if (ERROR_TIPO_MIME_FICHERO) {
                    resultadoProceso.status = 2;
                    resultadoProceso.descStatus = "El fichero " + fichero.name + " no es una imagen";
                }

                resultadoProceso.name = fichero.name;
                resultadoFicherosProcesados.push(resultadoProceso);


                /**
                 * Si el fichero es una imagen y no existe se añade en los arrays correspondientes para su proceso
                 */
                if (resultadoProceso.status == 0) {

                    var RUTA_RELATIVA_ARCHIVO_SERVIDOR = CARPETA_ALBUM + constantes.FILE_SEPARATOR + fichero.name;
                    var PATH_RELATIVO_ARCHIVO = configUpload.relative_path_show_photo + req.session.usuario.ID + constantes.FILE_SEPARATOR + idAlbum + constantes.FILE_SEPARATOR + fichero.name;
                    var mimeType = fichero.type;
                    var dimensions = sizeOf(RUTA_RELATIVA_ARCHIVO_SERVIDOR);
                    var widthFile = dimensions.width;
                    var heightFile = dimensions.height;

                    /**
                     * Thumbnail
                     */
                    var datos = fileUtils.extraerNombreExtension(fichero.name);
                    var NOMBRE_MINIATURA = datos[0] + constantes.THUMB + constantes.PUNTO + datos[1];

                    var RUTA_RELATIVA_MINIATURA_SERVIDOR = CARPETA_ALBUM + constantes.FILE_SEPARATOR + NOMBRE_MINIATURA;
                    var PATH_RELATIVO_MINIATURA = configUpload.relative_path_show_photo + req.session.usuario.ID + constantes.FILE_SEPARATOR + idAlbum + constantes.FILE_SEPARATOR + NOMBRE_MINIATURA;

                    // Los campos de tipo datetime no pueden tomar el valor now() de mysql, se almacena en dicho campo el valor new Date()
                    var registro = [fichero.name, PATH_RELATIVO_ARCHIVO, PATH_RELATIVO_MINIATURA, heightFile, widthFile, mimeType, idAlbum, new Date(), idUsuario];
                    registros.push(registro);

                    // Nombres de los ficheros
                    nombresFicheros.push(RUTA_RELATIVA_ARCHIVO_SERVIDOR);
                    nombresFicherosMiniatura.push(RUTA_RELATIVA_MINIATURA_SERVIDOR);
                } else {
                    /**
                     * Se borra el fichero subido al servidor, para que no quede alojado en el disco ya que o no es una imagen, o ya 
                     * existe en el servidor
                     */
                    fileUtils.deleteFile(fichero.path);
                }


            }
        } // for


       
    });
};