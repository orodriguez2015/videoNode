/**
  * Devuelve la salida en formato JSON. Es utilizada por la función saveVideo
  * @param {response} res: Objeto de tipo Response
  * @param {object} respuesta: Objeto que contiene la respuesta y que se
  *        convierte a JSON
  */
exports.devolverJSON = function(res,respuesta) {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(respuesta));
    res.end();
};


/**
  * Devuelve la salida en formato JSON indicando que se ha producido un error
  * @param res: Objeto de tipo Response
  * @param respuesta: Objeto que contiene la respuesta y que se
  *        convierte a JSON
  */
exports.devolverErrorJSON = function(res,respuesta) {
    res.header('Connection', 'close');
    res.writeHead(500, {"Content-Type": "application/json"});
    res.write(JSON.stringify(respuesta));
    res.end();
};
