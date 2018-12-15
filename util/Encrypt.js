/**
  * Función que obtiene el hash sha1 de un determinado texto que se pase como parámetro
  * @param password: Password de la que se obtendrá el hash SHA1
  * @return SHA1 de la password
  */
exports.encriptarSha1 = function(password) {
    var crypto  = require('crypto');

    var sha1 = crypto.createHash('sha1');
    var d = sha1.update(password).digest('hex');

    return d;
}
