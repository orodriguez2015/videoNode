/**
 * Función que comprueba si un cadena de caracteres está vacia o su longitud es cero
 * @param data Cadena de caracteres a comprobar
 * @return boolean
 */
exports.isEmpty = function(data) {
    var salida = false;

    try {
        if (data == null || data == undefined || data == "" || data.length == 0) {
            salida = true;
        }
    } catch (err) {
        salida = false;

    }

    return salida;
};


/**
 * Comprueba si una determinada cadena de caracteres contiene un valor numérico
 * @param {data} Cadena de caracteres de la cual se comprueba si es un número
 * @return True si es un número y false en caso contrario
 */
exports.isNumber = function(data) {
    var exito = false;

    if (data != null && data != undefined && !isNaN(data)) {
        exito = true;
    }

    return exito;
};