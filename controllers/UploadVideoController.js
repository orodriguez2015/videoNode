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

var videoController = require('../controllers/VideoController.js');
var stringUtil = require('../util/StringUtil.js');



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
    var extension;
    var rutaFichero;
    var mimeType;
    var tamanoFile;
    
    
    
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
        tamanoFile = file.size;

        var datosFicheros = fileUtils.extraerNombreExtension(nameFile);
    
        if(datosFicheros!=null && datosFicheros.length>0) {
            extension = datosFicheros[1];
        }

        var videoteca = req.Videoteca;
        var idVideoteca = req.Videoteca.id;
        var idUsuario = req.session.usuario.ID

        console.log("fileBegin nameFile = " + nameFile + " mime: " + mimeType + ", extension = " + extension + ", tamaño = " + tamanoFile);
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
         
            /**
             * Se comprueba si existe ya un fichero con el mismo nombre.
             * En ese caso, se lanza un error para que sea procesado
             */
            if (fileUtils.existsFile(pathAux)) {
                console.log("======> Existe el fichero " + pathAux + " en el servidor");

                /**
                 * Existe el fichero en el servidor, pero no se puede borrar en form.on('fileBegin') del disco hasta que haya finalizado
                 * la subida del fichero al servidor en form.on('end')
                 */
                file.existeEnServidor = true;
            
            } else{
                /*
                 * El fichero no existe en la videoteca, por tanto se establece la nueva ruta del fichero en disco asignado
                 * el valor adecuado en la propiedad file.path
                 */
                file.path = pathAux;
                rutaFichero = file.path;
            
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
        console.log("==========> obj error = " + JSON.stringify(err));
       
        console.log(" ===========> error =  " + err.message);
        devolverError({status:100,descStatus:'Se ha excedido el tamaño máximo de archivo',limite:form.maxFileSize});
    });


    /**
     * Se dispara cuando el archivo se ha guardado en disco
     */
    form.on('end', function() {
        // Si hay error, se devuelve un HTTP 500 con el código de error, ya que no funciona
        // el evento 'error' del middleware formidable
        var idUsuario = req.session.usuario.ID;
        var registros = new Array();
        
        try {
         
            /*
            * Se genera el array con los valores de las fotografías que se pasan en la query de inserción
            */
            for (i = 0; ficheros != undefined && i < ficheros.length; i++) {
                var fichero = ficheros[i];

                if (fichero != undefined) {

                    /**
                     * Si el fichero subido al servidor existe o no es una imagen
                     */
                    var ERROR_EXISTE_FICHERO = (fichero.existeEnServidor != undefined && fichero.existeEnServidor) ? true : false;
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
                    
                        console.log("Borrando ficheros[0].path =  " + ficheros[0].path);
                        /**
                         * Se borra el archivo subido al servidor puesto que ya existe
                         */
                        fileUtils.deleteFile(ficheros[0].path);
                        httpResponse.devolverJSON(res,resultadoProceso);
                    } else
                    if (ERROR_TIPO_MIME_FICHERO) {

                        /**
                          * Si el tipo mime del fichero no es una imagen
                          */
                        resultadoProceso.status = 2;
                        resultadoProceso.descStatus = "El fichero " + fichero.name + " no es de un tipo de archivo válido";
                         /**
                         * Se borra el archivo subido al servidor puesto que ya existe
                         */
                        fileUtils.deleteFile(ficheros[0].path);
                        httpResponse.devolverJSON(res,resultadoProceso);
                    } else {

                        try {

                            /**
                             * Se inserta los datos del video en base de datos
                             */
                            var video = {
                                nombre: nameFile,
                                extension: extension,
                                tamano: tamanoFile,
                                idUsuario: req.session.usuario.ID,
                                idVideoteca: req.Videoteca.id,
                                publico: 1,
                                fichero: ficheros[0]
                            };

                            /*
                             * Guardar vídeo en BBDD y redirigir a la salida
                             */
                            saveVideo(video,res);
                            

                        } catch(err) {
                            console.log(" Error al alojar el video " + rutaFichero + " en el servidor: " + err.message);
                            // Si se ha producido un error se borra el fichero del servidor
                            fileUtils.deleteFile(ficheros[0].path);
                        }

                    }// if

                } else {
                    console.log(" Se procede a borrar el fichero " + ficheros[i].path);
                    fileUtils.deleteFile(ficheros[i].path);
                }
            } // for

    }catch(err) {
        console.log("form.end - Error al procesar video " + err.message);
        fileUtils.deleteFile(rutaFichero);
    }
       
    });
};


/**
 * Función invocada para guardar un video en BBDD
 * @param {Object} video
 * @param {Response} response
 */
function saveVideo(video,response) {

    if(video!=null && video!=undefined) {
        var nombre = video.nombre;
        var extension = video.extension;
        var idVideoteca = video.idVideoteca;
        var idUsuario = video.idUsuario;
        var publico = video.publico;
        var fichero = video.fichero;

        if(!stringUtil.isEmpty(nombre) && !stringUtil.isEmpty(extension) && stringUtil.isNumber(idVideoteca) 
            && stringUtil.isNumber(idUsuario) && stringUtil.isNumber(publico)) {

            var db = new database.DatabaseMysql();

            db.beginTransaction().then(correcto=>{

                var sql = "INSERT INTO VIDEO(NOMBRE,EXTENSION,ID_USUARIO,PUBLICO,ID_VIDEOTECA,FECHA_ALTA) VALUES(?)";
                console.log(sql);

                var registro = [nombre,extension,idUsuario,publico,idVideoteca,new Date()];
                var registros = new Array();
                registros.push(registro);
                console.log("registro a insertar = " + JSON.stringify(registro));

                db.query(sql,registros).then(resultado=>{
                    console.log("Se ha insertado el vídeo en BBDD " + JSON.stringify(resultado));
                    
                    db.commitTransaction().then(res=>{
                        db.close();

                        devolverSalida(0,"OK",response);
    
                    }).catch(error=>{
                        console.log("Error al insertar el vídeo en BBDD " + error.messsage);

                        db.rollbackTransaction().then(res1=>{
                            db.close();
                            // Se elimina el fichero ya que se ha producido un error al insertar en BBDD
                            fileUtils.deleteFile(fichero.path);

                            devolverSalida(3,"Error al insertar video en BBDD",response);

                        }).catch(err2=>{
                            console.log("Error al realizar rollback = " + err2.message);
                        });
                    });
                    
                }).catch(errSql =>{
                    console.log("Se ha producido un error al insertar video en BBDD = " + errSql.message);
                    
                    db.rollbackTransaction().then(resultado=>{
                        db.close();
                        
                        // Se elimina el fichero ya que se ha producido un error al insertar en BBDD
                        fileUtils.deleteFile(fichero.path);

                        devolverSalida(3,"Error al insertar video en BBDD",response);

                    }).catch(err=>{
                        console.log("Se ha producido un error al realizar rollback = " + err.message);
                        db.close();

                        // Se elimina el fichero ya que se ha producido un error al insertar en BBDD
                        fileUtils.deleteFile(fichero.path);

                        devolverSalida(3,"Error al insertar video en BBDD",response);
                        
                    });
                });

            }).catch(err=>{
                console.log("Se ha producido un error al iniciar la transacción = " + err.message);
                db.close();

                // Se elimina el fichero ya que se ha producido un error al insertar en BBDD
                fileUtils.deleteFile(fichero.path);

                devolverSalida(3,"Error al insertar video en BBDD",response);

            });

        }// if


    }// if
}// saveVideo


/**
 * Devuelve la salida en formato JSON
 * @param {Integer} codStatus Código de estado
 * @param {String} descStatus Descripción de estado
 * @param {Response} response Response
 */
function devolverSalida(codStatus,descStatus,response) {
    var resultadoProceso = {};
    resultadoProceso.status = codStatus;
    resultadoProceso.descStatus = descStatus;
    httpResponse.devolverJSON(response,resultadoProceso);
}