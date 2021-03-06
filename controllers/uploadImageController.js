// Se incorpora el archivo de configuración con las rutas
var configUpload = require('../config/config_upload.json');
var constantes = require('../config/constantes.json');
var database = require('../db/DatabaseMysql.js');
// Upload de ficheros usando el middleware formidable
var formidable = require('formidable');

// Middleware para poder ejecutar consultas contra la BBDD MySql
// Middleware que contiene operaciones de utilidad en el manejo de ficheros
var fileUtils = require('../util/FileUtils.js');
// Middleware que contiene operaciones de utilidad en el manejo de ficheros
var httpResponse = require('../util/HttpResponseUtil.js');
// Middleware path
var path = require('path');
var fs = require("fs");
// Generación de un thumbnail
var ImageUtil = require("../util/ImageUtil.js");
var ArrayUtil = require("../util/ArrayUtil.js");




/**
 * Renderiza la vista de selección de imágenes para el nuevo albúm fotográfico
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.uploadImageScreen = function(req, res, next) {
    res.render("upload/upload", { errors: {} });
};


/**
 * Renderiza la vista de selección de imágenes para el nuevo albúm fotográfico
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.uploadImageFile = function(req, res, next) {
    var form = new formidable.IncomingForm();
    var idAlbum = req.query.idAlbum;

    console.log("idAlbum subido: " + idAlbum);
    // Se indica cual es el directorio de destino

    form.uploadDir = __dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + configUpload.path_upload_photo;
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
            var upload_dir = path.join(__dirname, ".." + configUpload.path_upload_photo);
            var name = file.name;
            var carpetaUsuario = upload_dir + req.session.usuario.ID;
            var carpetaAlbum = upload_dir + req.session.usuario.ID + constantes.FILE_SEPARATOR + idAlbum;
            CARPETA_ALBUM = carpetaAlbum;


            try {
                // Se comprueba si existe primero la carpeta store dentro de la carpeta public, sino existe hay que crearlo
                var carpetaStore = path.join(__dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR +
                    constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_STORE);

                var carpetaStoreFoto = path.join(__dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR +
                    constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_STORE + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_FOTO);

                var existsCarpetaStore = fileUtils.existsFile(carpetaStore);
                var existsCarpetaFoto = fileUtils.existsFile(carpetaStoreFoto);

                /**
                 * Sino exist la carpeta store y/o la subcarpeta photo dentro de store, hay que crearlas
                 */
                if (!existsCarpetaFoto || !existsCarpetaStore) {
                    console.log("No existe carpetaStore se crea");
                    // Se crea la subcarpeta store
                    fileUtils.mkdirSync(carpetaStore);

                    console.log("No existe carpeta store/foto se crea");
                    // Se crea la subcarpeta photo dentro de la carpeta stotre
                    fileUtils.mkdirSync(carpetaStoreFoto);

                }

                /**
                 * Se crea la carpeta del usuario en el caso de que no exista
                 */
                fileUtils.mkdirSync(carpetaUsuario);

                /**
                 * Se crea la carpeta del álbum dentro de la carpeta del usuario sino existe
                 */
                fileUtils.mkdirSync(carpetaAlbum);


            } catch (err) {
                console.log("Error al crear las carpetas del álbum y/o usuario: " + err.message);

                var err = new Error("Error al crear las carpetas del álbum y/o usuario: " + err.message);
                err.codError = 7;
                form.emit('error', err);
            }


            // Ruta en el que se alojará el archivo
            var pathAux = carpetaAlbum + constantes.FILE_SEPARATOR + file.name;
            var datos = fileUtils.extraerNombreExtension(file.name);
            var nombreFicheroMiniatura = datos[0] + constantes.THUMB + constantes.PUNTO + datos[1];
            var pathImagenMiniatura = carpetaAlbum + constantes.FILE_SEPARATOR + nombreFicheroMiniatura;

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
                rutaRelativaArchivoServidor = configUpload.relative_path_show_photo + req.session.usuario.ID + "/" + idAlbum + "/" + file.name;
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
                resultadoProceso.nombre = fichero.name // nombre de la imagen

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

                /**
                 * Si el fichero es una imagen y no existe se añade en los arrays correspondientes para su proceso
                 */
                if (resultadoProceso.status == 0) {
                    var RUTA_IMAGEN_DISCO = CARPETA_ALBUM + constantes.FILE_SEPARATOR + fichero.name;
                    var PATH_RELATIVO_ARCHIVO = ImageUtil.getRutaRelativaAlbum(idAlbum,req.session.usuario.ID) + fichero.name;
                   
                    /**
                     *  Se obtienen las dimensiones de la imagen
                     */    
                    var dimensions = ImageUtil.getTamanoImagen(RUTA_IMAGEN_DISCO);
                    var widthFile = dimensions.ancho;
                    var heightFile = dimensions.alto;                

                    var NOMBRE_MINIATURA = ImageUtil.getNombreMiniatura(fichero.name);
                    var RUTA_RELATIVA_MINIATURA_SERVIDOR = CARPETA_ALBUM + constantes.FILE_SEPARATOR + NOMBRE_MINIATURA;
                    var PATH_RELATIVO_MINIATURA = ImageUtil.getRutaRelativaAlbum(idAlbum,req.session.usuario.ID) + NOMBRE_MINIATURA;

                    resultadoProceso.miniatura = NOMBRE_MINIATURA;
                    resultadoProceso.ancho  = widthFile;  // ancho de la imagen
                    resultadoProceso.alto   = heightFile; // alto de la imagen
                    resultadoProceso.ruta   = RUTA_IMAGEN_DISCO; // ruta de la imagen en el servidor
                    resultadoProceso.rutaRelativaImagen = PATH_RELATIVO_ARCHIVO; // Ruta relativa de la imagen en el servidor para mostrarla
                    
                    resultadoProceso.tipoMime = fichero.type;
                    resultadoProceso.idAlbum  = idAlbum;
                    resultadoProceso.idUsuario = idUsuario;
                    resultadoProceso.rutaMiniatura = RUTA_RELATIVA_MINIATURA_SERVIDOR; 
                    resultadoProceso.rutaRelativaMiniatura = PATH_RELATIVO_MINIATURA; // Ruta relativa miniatura en el servidor para mostrarla
                    resultadoProceso.fechaAlta = new Date();
                
                } else {
                    /**
                     * Se borra el fichero subido al servidor, para que no quede alojado en el disco ya que o no es una imagen, o ya 
                     * existe en el servidor
                     */
                    fileUtils.deleteFile(fichero.path);
                }

                resultadoFicherosProcesados.push(resultadoProceso);
            }
        } // for


        /**
         * Si hay ficheros se procede a insertar la información en BBDD y se generan las imágenes
         * en miniatura
         */
        if (resultadoFicherosProcesados.length == 0) {
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
                ImageUtil.generarMiniaturaImagenes(resultadoFicherosProcesados, function(err,registros) {
                    // El parámetro err indica que se ha producido un error, y el parámetro registros contiene las imágenes
                    // que se van a guardar en BBDD, que no tienen porque ser todas las que ha subido el usuario/a, puesto que 
                    // el procesamiento de alguna fotografía puede terminar en error

                    if (err) {
                        /**
                         * No se han generado las miniaturas => Se borran de disco las fotografías de disco
                         */
                        try {
                            fileUtils.deleteFileListProcesados(resultadoFicherosProcesados);
                        }catch(err) {

                        }
                        db.close();
                        var salida = { status: -3, descStatus: "Error al generar las miniaturas de las imagenes en disco",proceso:resultadoFicherosProcesados };
                        httpResponse.devolverJSON(res, salida);

                    } else {
                        if(registros.length==0) {
                            console.log("No hay imagenes que eliminar");
                            db.rollbackTransaction();
                            db.close();
                            var salida = { status: -5, descStatus: "Las fotografías seleccionadas presentan errores y no se ha adjuntado ninguna al álbum",proceso:resultadoFicherosProcesados};
                            httpResponse.devolverJSON(res, salida);

                        }else {

                            /**
                             * Se inserta en BBDD registros con los datos de cada imagen y su miniatura generada
                             */
                            db.query(sql,[registros]).then(data=>{
                                db.commitTransaction();
                                db.close();
                                var salida = { status: 0, descStatus: "OK", proceso: resultadoFicherosProcesados };
                                httpResponse.devolverJSON(res, salida);
                            }).catch(err=>{
                                console.log("Se ha producido un error al insertar fotos en BBDD: " + err.message);
                                db.rollbackTransaction();
                                db.close();
    
                                // Eliminar todas las fotografías que se hayan subido y miniaturas generadas
                                fileUtils.deleteFileListProcesados(resultadoFicherosProcesados);

                                var salida = { status: -1, descStatus: "Error al insertar en BBDD los datos de las fotografías: " + err.message, proceso:resultadoFicherosProcesados };
                                httpResponse.devolverJSON(res, salida);
                            });
                        }// else
                    }// else
                });

            }).catch(err=>{
                console.log("Se ha producido un error: " + err.message);
                db.close();

                // Se eliminan las imagenes subidas por el usuario de disco
                fileUtils.deleteFileListProcesados(resultadoFicherosProcesados);
    
                // Se devuelve un JSON con la respuesta al servidor
                httpUtil.devolverJSON(res, {
                    status: -4,
                    descStatus: "Error al iniciar transacción a BBDD: " + err.message
                });

            });     
        }
    });
};