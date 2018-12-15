var activo = require('../config/activo.json');


/**
 * Comprueba si un determinado valor se encuentra entre los valores válidos para realizar búsquedas
 * por usuarios activos 
 * @param type Valor por el que se realiza la búsqueda
 */
exports.isTypeUserActivePositive = function(type) {
    var exito = false;

    if (activo != undefined && activo.valores_usuarios_activo_positivo != undefined &&
        activo.valores_usuarios_activo_positivo.indexOf(type) != -1) {

        exito = true;
    }

    return exito;
};



/**
 * Comprueba si un determinado valor se encuentra entre los valores válidos para realizar búsquedas
 * por usuarios no activos
 * @param type Valor por el que se realiza la búsqueda
 */
exports.isTypeUserActiveNegative = function(type) {
    var exito = false;

    if (activo != undefined && activo.valores_usuarios_activo_negativo != undefined &&
        activo.valores_usuarios_activo_negativo.indexOf(type) != -1) {

        exito = true;
    }

    return exito;
};