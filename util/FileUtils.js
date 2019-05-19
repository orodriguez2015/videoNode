var fs = require('fs');
var path = require('path');
var mime = require('../config/mimetypes.json');
var constantes = require('../config/constantes.json');
var configUpload = require("../config/config_upload.json");



/**
 * Comprueba si existe un determinado fichero en el disco
 * @return 0 => OK
 *         1 => Path al archivo vacía
 *         2 => Error al eliminar el archivo
 */
exports.existsFile = function(pathFile) {
    var salida = false;

    if (pathFile) {
        try {
            salida = fs.existsSync(pathFile);
        } catch (err) {
            salida = false;
            console.error("Error al comprobar la existencia del archivo " + pathFile + " en disco: " + err.message);
        }
    }
    return salida;
};


/**
 * Elimina un determinado fichero de disco
 * @return 0 => OK
 *         1 => Path al archivo vacía
 *         2 => Error al eliminar el archivo
 */
exports.deleteFile = function(pathFile) {
    var salida = 1;

    if (pathFile) {
        try {
            fs.unlinkSync(pathFile);
            salida = 0;
        } catch (err) {
            salida = 2;
            console.log("deleteFile error: " + JSON.stringify(err));
            console.error("Error al borrar el archivo " + pathFile + " de disco: " + err.message);
        }
    }
    return salida;
};



/**
 * Elimina varios archivos del disco
 * @param fileList Array con los nombre de los archivos a eliminar
 * @return 0 => OK
 *         1 => Path al archivo vacía
 *         2 => Error al eliminar el archivo
 */
exports.deleteFileList = function(fileList) {
    var salida = false;

    try {
        for (i = 0; fileList != undefined && i < fileList.length; i++) {
            this.deleteFile(fileList[i]);
        }

        salida = true;
    } catch (err) {
        console.log("Error al borrar la lista de ficheros: " + err.message);
        salida = false;
    }

    return salida;
};



/**
 * Lee el contenido de un fichero y lo devuelve el contenido del archivo, que puede ser texto o contenido en binario
 * @param path Ruta al archivo en disco
 * @return Contenido del archivo
 */
exports.readFile = function(path) {
    var file;

    try {
        if (this.existsFile(path)) {
            file = fs.readFileSync(path);

        }
    } catch (err) {
        console.log("Error al leer el archivo: " + err.message);
    }

    return file;
};



/**
 * Lee el contenido del fichero de configuración JSON de base de datos, y devuelve el contenido como un objeto.
 * Esto se puede hacer porque el contenido del fichero es un archivo en formato JSON
 * @return Contenido del archivo JSON en formato objeto
 */
exports.getContentConfigBBDDFile = function() {
    var content;
    try {
        var path = __dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.CONFIG_BBDD;
        if (path != null && path != undefined) {
            var text = this.readFile(path);
            content = JSON.parse(text);
        }

    } catch (err) {
        console.log("Error al leer el archivo config_bbdd.json: " + err.message);
    }
    return content;
};


/**
 * Comprueba si un tipo mime se corresponde con uno de los tipos mime válidos
 * para archivos de imagen
 * @param type Tipo mime a comprobar
 */
exports.isMimeTypeImage = function(type) {
    var salida = false;

    try {
        if (mime.mimetypes.indexOf(type) != -1) {
            salida = true;
        }

    } catch (err) {
        console.error("Error al comprobar si el tipo mime es de una imagen: " + err.message);
    }

    return salida;
};


/**
 * Crea un directorio sino existe
 * @param dir Nombre del directorio/carpeta a crear
 */
exports.mkdirSync = function(dir) {

    if (dir != undefined && !fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};


/**
 * Borra un directorio de manera recursiva junto con todo su contenido
 * @param path: Ruta del directorio a eliminar
 */
exports.deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function(file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


/**
 * Comprueba si un directorio tiene contenido, bien archivos o bien subdirectorios
 * @param path Ruta del directorio
 */
exports.directoryHasContent = function(path) {
    var exito = false;

    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        var contador = 0;
        fs.readdirSync(path).forEach(function(file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory() || fs.lstatSync(curPath).isFile()) {
                contador++;
            }
        });
    }

    if (contador >= 1) {
        exito = true;
    }
    return exito;
};


/**
 * Crea o sobreescribe un determinado archivo con un determinado texto
 * @param ruta Ruta al archivo en disco
 * @param texto Texto a escribir enel archivo
 * @throws err Se lanza error en el caso de que se haya producido algún error
 */
exports.saveFile = function(ruta, texto) {
    try {
        var numBytes = fs.writeFileSync(ruta, texto);

    } catch (err) {
        console.log("Error al grabar el fichero de configuración de base de datos: " + err.message);
        throw err;
    }
};


/**
 * Extrae el nombre y extensión de un String que contiene el nombre del fichero
 * @param fichero Nombre del fichero junto con su extensión
 * @return Array asociativo:  "nombre" => nombre del archivo, "extension" => Extensión del archivo
 */
exports.extraerNombreExtension = function(fichero) {
    var aux = new Array();

    try {
        if (fichero != null && fichero != undefined) {
            aux = fichero.split(constantes.PUNTO, fichero.lastIndexOf(constantes.PUNTO));
        }

    } catch (err) {
        console.log("Se ha producido un error al extraer el nombre y extensión del archivo " + fichero + ": " + e.message);
        throw err;
    }
    return aux;
};


/**
 * Devuelve un string con el contenido en formato JSON que tiene que tener el archivo de configuración
 * de base de datos
 * @param config Objeto que contiene los datos de configuración de la BBDD
 * @return String con los datos del fichero de configuración
 */
exports.configBBDDFileAsString = function(config) {
    var salida;
    if (config != null && config != undefined) {

        var SALTO_LINEA = "\r\n";
        salida = "{" +
            SALTO_LINEA +
            "\"mysql_server\":" + "\"" + config.host + "\"" + ", " +
            SALTO_LINEA +
            "\"mysql_db_name\":" + "\"" + config.database + "\"" + ", " +
            SALTO_LINEA +
            "\"mysql_user\":" + "\"" + config.user + "\"" + "," +
            SALTO_LINEA +
            "\"mysql_pass\":" + "\"" + config.password + "\"" +
            SALTO_LINEA + "}";
    }

    return salida;
};



/**
 * De un string con una determinada ruta en disco, recupera sólo el nombre de la última carpeta/directorio
 * @param ruta Ruta en disco
 * @return Nombre de la carpeta final
 */
exports.getNombreCarpeta = function(ruta) {
    var nombre = "";

    if(ruta!=null && ruta!="") {
        var index = ruta.lastIndexOf(constantes.FILE_SEPARATOR);
        if(index!=-1) {
            nombre = ruta.substring(index+1,ruta.length);
        }
        
    }// if

    return nombre;
};



/**
 * Renombrar un directorio
 * @param {String} oldPath Ruta antigua
 * @param {String} newPath Ruta nueva
 */
exports.renombrarDirectorio = function(oldPath,newPath) {

    if(this.existsFile(oldPath) && (newPath!=undefined && newPath!='')) {
        fs.renameSync(oldPath,newPath);
    }

};


/**
 * Lee el contenido de un directorio para quedarse con la ruta en disco del mismo
 * @param {videoteca} Objeto que representa un registro de la tabla videoteca
 */
exports.leerVideosVideoteca = function(videoteca) {
    var lista = new Array();

    if(videoteca!=undefined && videoteca!=null) {
        var idUsuario = videoteca.idUsuario;
    
        var rutaVideotecaRelativa = constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO + constantes.FILE_SEPARATOR + idUsuario + constantes.FILE_SEPARATOR + videoteca.ruta;
        var rutaVideotecaAbsoluta = videoteca.ruta_completa;

        if (fs.existsSync(rutaVideotecaAbsoluta) && fs.lstatSync(rutaVideotecaAbsoluta).isDirectory()) {
            
            fs.readdirSync(rutaVideotecaAbsoluta).forEach(function(file, index) {
                var rutaCompleta = rutaVideotecaAbsoluta + constantes.FILE_SEPARATOR + file;
                console.log("rutaCompleta = " + rutaCompleta);

                if (fs.lstatSync(rutaCompleta).isDirectory() || fs.lstatSync(rutaCompleta).isFile()) {

                    var index = file.lastIndexOf(constantes.PUNTO);
                    var extension = file.substring(index+1,file.length);
                    console.log("index = " + index + ", extension = " + extension);

                    if(esExtensionVideo(extension)) {
                    
                        var video = {
                            ruta: rutaVideotecaRelativa + constantes.FILE_SEPARATOR + file,
                            nombre: file
                        }

                        lista.push(video);
                        
                    }// if
                }// if
            });
        }// if

        console.log("leerVideoCarpeta lista = " + JSON.stringify(lista));
    }// if
    return lista;

};


/**
 * Comprueba si una cadena de caracteres representa una extensión de vídeo válida
 * @param extension 
 */
function esExtensionVideo(extension) {
    var salida = false;

    console.log("esExtensionVideo extension  " + extension);
    try {
        if(extension!=undefined && extension!=null && extension!='') {

            var extensionesAdmitidas = constantes.EXTENSION_VIDEO_ACEPTADAS;
            console.log("extensionesAdmitidas = " + extensionesAdmitidas);
            if(extensionesAdmitidas!=undefined && extensionesAdmitidas!=null) {
                var listaExtensiones = extensionesAdmitidas.split(",");
                salida = listaExtensiones.includes(extension.toUpperCase());

            }// if

        }// if

    }catch(err) {
        console.log("Error al comprobar extensión de vídeo = " + err.message);
    }

    console.log("esExtensionVideo return  " + salida);
    return salida;
}
