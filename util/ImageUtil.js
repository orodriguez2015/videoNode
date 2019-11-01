var fs = require('fs')
var probe = require('probe-image-size');
var StringUtil = require('./StringUtil.js');
var FileUtils  = require('./FileUtils.js');
var constantes = require('../config/constantes.json');
var miniatura = require('image-thumbnail');


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
 * Genera una imagen en miniatura para cada imagen de un array de string que contienen las rutas a las imagenes
 * ya existentes en disco
 * @param {Array} images Array con la ruta en disco de las imágenes para las que se genera la miniatura
 * @param {Function} callback Callback que se invoca cuando ha ocurrido un error, o bien cuando ya ha finalizado la generación de las 
 * miniaturas en disco
 */
exports.generarMiniaturaImagenes = async function(images, callback) { 
    console.log("Generando miniaturas de imágenes");
    let options = { percentage: 25, responseType: 'buffer' ,width: constantes.ANCHO_MINIATURA_IMAGEN, height:constantes.ALTO_MINIATURA_IMAGEN};
    
    try {
        var contador = 0;
        
        for (i = 0; images != undefined && i < images.length; i++) {
            await miniatura(images[i], options).then(buffer=>{
                console.log("miniatura generada para imagen = " + images[i]);
                var listFichero = FileUtils.extraerNombreExtension(images[i]);
                var nombre = listFichero[0];
                var extension = listFichero[1];    
                /*
                 * Se genera la ruta de la miniatura
                 */

                var rutaMiniatura = nombre + constantes.EXTENSION_IMAGEN_MINIATURA + constantes.PUNTO + extension;               
                /*
                 *  Se crea un fichero vacio para la miniatura
                 */
                var open = fs.openSync(rutaMiniatura, "w");
                fs.writeFileSync(rutaMiniatura,buffer);
                contador++;

            }).catch(err=>{
                console.log("Error al generar miniatura de " + images[i] + " = " + err.message);
                callback(new Error("Error al generar miniatura de " + images[i] + " = " + err.message));
            });

        }// for

        if(contador==images.length) {
            console.log("Generadas todas las miniaturas")
            callback();
        }
        console.log("Fin de la generación miniaturas de imágenes");
    } catch (err) {
        console.error(err);
        callback(new Error("Se ha producido un error al generar las miniaturas de las imágenes"));
    }
};