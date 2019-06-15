var httpUtil = require('../util/HttpResponseUtil.js');

var lista = new Array();
var t1 = {
    titulo: "Tarea 1",
    responsable: "Óscar Rodríguez Brea",
    prioridad: "Alta"
}

var t2 = {
    titulo: "Tarea 2",
    responsable: "Sandra Rodríguez Brea",
    prioridad: "Alta"
};

var t3 = {
    titulo: "Tarea 3",
    responsable: "Mónica Alvaredo",
    prioridad: "Media"
};


lista.push(t1);
lista.push(t2);
lista.push(t3);


/**
 * Guardar tarea en la lista de tarea
 */
exports.guardarTarea = function(req,res,next) {
    var titulo = req.body.titulo;
    var responsable = req.body.responsable;
    var prioridad = req.body.prioridad;

    console.log("guardarTarea titulo = " + titulo + ", res= " + responsable + ", pri = " + prioridad);

    if(titulo!=undefined && responsable!=undefined && prioridad!=undefined) {
        var obj = {
            titulo: titulo,
            responsable: responsable,
            prioridad: prioridad
        }

        lista.push(obj);

        httpUtil.devolverJSON(res,{status:0,descStatus:'OK'});
    }else {
        httpUtil.devolverJSON(res,{status:-1,descStatus:'KO'});
    }

};




/**
 * Método que devuelve un JSON formado con datos de tareas. 
 * Se utiliza simplemente para realizar pruebas de invocación de un servicio RESt
 * desde una aplicación REACT JS o ANGULAr
 */
exports.getTareas = function(req,res,next) {
    console.log("getTareas init");
    console.log("getTareas salida = " + JSON.stringify(lista));

    /**
     * Se puede activar cors con las siguientes valores en la cabecera de la response, o bien usar
     * el middleware cors para añadir en el router index.js
     */

     /*
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    */

    httpUtil.devolverJSON(res,lista);

    //res.writeHead(200, {"Content-Type": "application/json"});
    // res.write(JSON.stringify(lista));
    // res.end();
};

