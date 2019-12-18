/**
 * Borra el contenido de una determinada posición de un array
 * @param {Array} lista : Array en el que se elimina el elemento
 * @param {Integer} posicion Posición del array a eliminar
 */
exports.removeElementPositionArray = function(lista, posicion) {

    var StringUtil = require("./StringUtil.js");
    if(StringUtil.isNumber(posicion) && Array.isArray(lista)) {
        lista.splice(posicion,1); // Se elimina el elemento que está en "posición"

    }else {
        throw new Error("Revise los parámetros de entrada")
    }
}


/**
 * Borra el contenido de una determinada posición de un array
 * @param {Array} lista : Array en el que se elimina el elemento
 * @param {Integer} posicion Posición del array a eliminar
 */
exports.removeElementArray = function(lista, elemento) {

    if(StringUtil.isNumber(posicion) && Array.isArray(lista)) {
        let pos = lista.indexOf(elemento);
        lista.splice(pos,1); // Se elimina el elemento que está en "pos"

    }else {
        throw new Error("Revise los parámetros de entrada")
    }
}