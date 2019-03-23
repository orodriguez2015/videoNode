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
    var idVideoteca = req.query.idVideoteca;
    var nombreCarpetaVideoteca = req.query.carpetaVideoteca;

    console.log("idVideoteca subida: " + idVideoteca + ",nombreCarpetaVideoteca =  " + nombreCarpetaVideoteca);
    // Se indica cual es el directorio de destino

    form.uploadDir = __dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + configUpload.path_upload_videos;
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

        if (file.name) {
            var upload_dir = path.join(__dirname, ".." + configUpload.path_upload_videos);
            var name = file.name;
            var idUsuario = req.session.usuario.ID
            var carpetaUsuario = upload_dir + constantes.FILE_SEPARATOR + req.session.usuario.ID;
            var carpetaVideoteca = upload_dir + req.session.usuario.ID + constantes.FILE_SEPARATOR + idVideoteca;
            CARPETA_ALBUM = carpetaAlbum;


            try {
                // Se comprueba si existe primero la carpeta store dentro de la carpeta public, sino existe hay que crearlo
                var carpetaVideos = path.join(__dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR +
                    constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO);

                var carpetaUsuario = path.join(__dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR +
                        constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO + constantes.FILE_SEPARATOR + idUsuario);

                var carpetaVideoteca = path.join(__dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR +
                            constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO + constantes.FILE_SEPARATOR + idUsuario
                            + constantes.FILE_SEPARATOR + nombreCarpetaVideoteca);            


                var existsCarpetaVideos = fileUtils.existsFile(carpetaVideos);
                
                /**
                 * Sino existe la carpeta videos
                 */
                if (!existsCarpetaVideos) {
                    console.log("No existe carpetaStore se crea");
                    // Se crea la carpeta videos
                    fileUtils.mkdirSync(carpetaVideos);
                }

                /**
                 * Se crea la carpeta del usuario en el caso de que no exista
                 */
                fileUtils.mkdirSync(carpetaUsuario);

                /**
                 * Se crea la carpeta del álbum dentro de la carpeta del usuario sino existe
                 */
                fileUtils.mkdirSync(carpetaVideoteca);


            } catch (err) {
                console.log("Error al crear las carpetas del álbum y/o usuario: " + err.message);

                var err = new Error("Error al crear las carpetas del álbum y/o usuario: " + err.message);
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
            /**
             * Se comprueba si el tipo mime del archivo se corresponde con el de alguna
             * de las imágenes admitidas,sino es válido se lanza un error para que sea procesado
             */
            if (!fileUtils.isMimeTypeImage(mimeType)) {
                file.onErrorTipoMimeImagen = "El tipo MIME " + file.name + " no válido. Sólo se admiten imágenes";

            } else {
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


        /**
         * Si hay ficheros se procede a insertar la información en BBDD y se generan las imágenes
         * en miniatura
         */
        if (nombresFicheros.length == 0) {
            httpResponse.devolverJSON(res, {
                status: 0,
                descStatus: "No hay ficheros",
                proceso: resultadoFicherosProcesados
            });

        } else {
            /**
             * Se insertan los datos de las fotografias en BBDD
             */
            var sql = "INSERT INTO foto(nombre,ruta,rutaMiniatura,alto,ancho,tipomime,idAlbum,fechaAlta,idUsuario) VALUES ?";
            console.log(sql);



            db.beginTransaction().then(result=>{

                generateThumbnails(nombresFicheros, CARPETA_ALBUM, function(err) {
                    if (err) {
                        /**
                         * No se han generado las miniaturas => Se borran de disco las fotografías de disco
                         */
                        console.log("****** ERROR AL GENERAR MINIATURAS****");
                        fileUtils.deleteFileList(nombresFicheros);
                        fileUtils.deleteFileList(nombresFicherosMiniatura);

                        connection.release();
                        var salida = { status: -3, descStatus: "Error al generar las miniaturas de las imagenes en disco" };
                        httpResponse.devolverJSON(res, salida);
                    } else {
                        /**
                         * Si se han generado las miniaturas
                         */

                        db.query(sql,[registros]).then(data=>{
                            console.log("Tras insert : " + JSON.stringify(data));
                            db.commitTransaction();
                            db.close();
                            var salida = { status: 0, descStatus: "OK", proceso: resultadoFicherosProcesados };
                            httpResponse.devolverJSON(res, salida);
                        }).catch(err=>{
                            console.log("Se ha producido un error al insertar fotos en BBDD: " + err.message);
                            db.rollbackTransaction();
                            db.close();

                            // TODO: Eliminar todas las fotografías que se hayan subido
                            fileUtils.deleteFileList(nombresFicheros);
                            fileUtils.deleteFileList(nombresFicherosMiniatura);
                            var salida = { status: -1, descStatus: "Error al insertar en BBDD los datos de las fotografías: " + err.message };
                            httpResponse.devolverJSON(res, salida);

                        });

                    }
                });


            }).catch(err=>{
                console.log("Se ha producido un error: " + err.message);
                db.close();

                // Se eliminan las imagenes subidas por el usuario de disco
                fileUtils.deleteFileList(nombresFicheros);
    
                // Se devuelve un JSON con la respuesta al servidor
                httpUtil.devolverJSON(res, {
                    status: -4,
                    descStatus: "Error al iniciar transacción a BBDD: " + err.message
                });

            });     
        }
    });
};


/**
 * Genera un thumbnail por cada una de las imagenes que se han subido al servidor
 * @param {images} Array con los nombres que tendrán los thumbnails 
 * @param {callback} Función callback que se invoca cuando 
 * @param {directoryImages} Directorio en el que se han almacenado las imagenes
 */
async function generateThumbnails(images, directoryImages, callback) {
    try {

        var contador = 0;

        for (i = 0; images != undefined && i < images.length; i++) {
            var imageOriginal = images[i];
            console.log("===> i: " + i);
            await thumb({
                    source: imageOriginal,
                    destination: directoryImages,
                    prefix: "",
                    suffix: "_thumb",
                    digest: false,
                    hashingType: "sha1", // 'sha1', 'md5', 'sha256', 'sha512'
                    width: 251,
                    height: 188,
                    concurrency: 10,
                    quiet: false, // if set to 'true', console.log status messages will be supressed
                    overwrite: false,
                    basename: undefined, // basename of the thumbnail. If unset, the name of the source file is used as basename.
                    ignore: false, // Ignore unsupported files in "dest"
                    logger: function(message) {
                        console.log(message);
                    }
                })
                .then(function() {
                    console.log("miniatura creada");
                    contador++;
                })
                .catch(function(e) {
                    console.log("Error thumb: " + e.message);
                    callback(new Error("Error al generar la miniatura de la imagen"));
                });
        } // for

        console.log("contador: " + contador);
        if (contador == images.length) {
            callback();
        }
    } catch (err) {
        console.log("generateThumbnails error: " + err.message);
        callback(new Error("Error al generar la miniatura de la imagen"));
    }
};