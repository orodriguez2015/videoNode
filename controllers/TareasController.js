
/**
 * Método que devuelve un JSON formado con datos de tareas. 
 * Se utiliza simplemente para realizar pruebas de invocación de un servicio RESt
 * desde una aplicación REACT JS o ANGULAr
 */
exports.getTareas = function(req,res,next) {
    console.log("getTareas init");
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

    //lista.clear();
    
    

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
    res.writeHead(200, {"Content-Type": "application/json"});
    
    res.write(JSON.stringify(lista));
    res.end();
};

