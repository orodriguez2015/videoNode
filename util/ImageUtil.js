var fs = require('fs')
var probe = require('probe-image-size');
var StringUtil = require('./StringUtil.js');
var FileUtils  = require('./FileUtils.js');
var constantes = require('../config/constantes.json');
var sharp     = require('sharp');


/**
 * Devuelve un objeto en el que se informa de la altura y anchura de una imagen
 * @param rutaFichero Ruta del fichero en disco
 * @return Objeto con los siguientes atributos:
 *          status: Los valores son 0 : OK, 1: No se ha informado la ruta en disco de la imagen, 2: No existe el archico con la imagen en disco
 *          descStatus: Descripción del estado
 *          alto: Altura de la imagen
 *          ancho: Ancho de la imagen
 */
exports.getTamanoImagen = function(rutaFichero) {
    var resultado = {};

    if(StringUtil.isEmpty(rutaFichero)) {
        resultado.status = 1;
        resultado.descStatus = "No se ha informado la ruta de la imagen en disco";
    } 
    else
    if(!FileUtils.existsFile(rutaFichero)) {
        resultado.status = 2;
        resultado.descStatus = "No existe la imagen en disco";
    }
    else {
        var data = fs.readFileSync(rutaFichero);
        var info = probe.sync(data);

        resultado.status = 0;
        resultado.descStatus = "OK";
        resultado.alto = info.height;
        resultado.ancho = info.width;
    }
    return resultado;
};


/**
 * Para el nombre de una imagen, se devuelve el nombre equivalente que se va a dar a su imagen en miniatura
 * @param {String} imagen Nombre de la imagen original
 * @return String con el nombre de la miniatura/thumbnail
 */
exports.getNombreMiniatura = function(imagen) {
    var NOMBRE_MINIATURA = null;
    if(imagen!=undefined && imagen!="") {
        var datos = FileUtils.extraerNombreExtension(imagen);
        NOMBRE_MINIATURA = datos[0] + constantes.THUMB + constantes.PUNTO + datos[1];
    }
    return NOMBRE_MINIATURA;
}


/**
 * Para el nombre de una imagen, se devuelve el nombre equivalente que se va a dar a su imagen en miniatura
 * @param {Integer} idAlbum Identificador del álbum
 * @return Ruta relativa del álbum en el disco del servidor
 */
exports.getRutaRelativaAlbum = function(idAlbum,idUsuario) {
    let CONFIG_UPLOAD = require('../config/config_upload.json');
    let salida;

    if(idAlbum!=undefined && StringUtil.isNumber(idAlbum) && idUsuario!=undefined && StringUtil.isNumber(idUsuario)) {
        salida = CONFIG_UPLOAD.relative_path_show_photo + idUsuario + constantes.FILE_SEPARATOR + idAlbum + constantes.FILE_SEPARATOR;
    }
    return salida;
}


/**
 * Genera una imagen en miniatura para cada imagen de un array de string que contienen las rutas a las imagenes
 * ya existentes en disco
 * @param {Array<Object>} images Array con objetos que contienen información de las imágenes subidas al servidor
 * @param {Function} callback Callback que se invoca cuando ha ocurrido un error, o bien cuando ya ha finalizado la generación de las 
 * miniaturas en disco. 
 */
exports.generarMiniaturaImagenes = async function(images, callback) { 
    console.log("Generando miniaturas de imágenes ====>");
    
    try {
        var registros = new Array();
    
        for (i = 0; images != undefined && i < images.length; i++) {
            let res = images[i];
            console.log("   Generando miniatura de imagen con ruta = " + res.ruta + ", status = " + res.status);

            if(res.status==0 && res.ruta!=undefined) {
                // Sólo se generan miniaturas para imágenes que no existan ya en el servidor
                await sharp(res.ruta)
                    .resize({
                        width:251, 
                        height:188
                    })
                    .toFile(res.rutaMiniatura)
                    .then(() => {

                        console.log("  Miniatura generada");
        
                        res.miniatura = "OK";
                        res.status = 0;
                        res.descStatus = "OK";

                        // Los campos de tipo datetime no pueden tomar el valor now() de mysql, se almacena en dicho campo el valor new Date()
                        var registro = [res.nombre, res.rutaRelativaImagen, res.rutaRelativaMiniatura, res.alto, res.ancho, res.tipoMime, res.idAlbum,res.fechaAlta, res.idUsuario];
                        registros.push(registro);    
        
                    }).catch(err=>{
                        /**
                         * TODO , NO GENERAR ERROR Y DEVOLVER EN UN ARRAY LAS IMAGENES PARA LAS QUE NO SE HA 
                         * GENERADO MINIATURA => PARA ELLAS HABRÁ QUE DAR DE BAJA TAMBIÉN LA IMAGEN ORIGINAL
                         */
                        console.log(" ===> Error al generar miniatura de " + res.nombre + ": " + err.message);
                        console.log("   ===> Se elimina imagen original = " + res.nombre);
                        FileUtils.deleteFile(res.ruta);
                        console.log("   ===> Se elimina miniatura generada = " + res.rutaMiniatura);
                        FileUtils.deleteFile(res.rutaMiniatura);
                        res.miniatura = "KO";
                        res.status = 3;
                        res.descStatus  = err.message;
                    });
            }// if
        }// for

        callback(null,registros);
        console.log("Fin de la generación miniaturas de imágenes <======");

    } catch (err) {
        callback(new Error("Se ha producido un error al generar las miniaturas de las imágenes"),null);
    }
};