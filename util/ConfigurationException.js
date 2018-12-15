/**
 * Clase ConfigurationException que hereda de la clase Error
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class ConfigurationException extends Error {

    /**
     * Constructor
     * @param {Integer} codigo: Código de error
     * @param {String} mensaje: Mensaje de error
     */
    constructor(codigo, mensaje) {
        super(mensaje);

        this.codigo = codigo;
        this.mensaje = mensaje;

    }


    /**
     * Devuelve el código de error
     * @returns {Integer}
     */
    getCodigoError() {
        return this.codigo;
    }

    getMensajeError() {
        return this.mensaje;
    }

}


exports.ConfigurationException = ConfigurationException;