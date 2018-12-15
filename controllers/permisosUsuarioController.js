var httpUtil = require('../util/HttpResponseUtil.js');
var stringUtil = require('../util/StringUtil.js');
var database = require('../db/DatabaseMysql.js');

/**
 * Renderiza la vista de permisos a asignar a un usuario
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.renderPermisosScreen = function(req, res, next) {
    res.render('users/permisos', { errors: {}, user: req.Usuario });
};


/**
 * Asigna e elimina un permiso a un determinado usuario
 * @param {Request} req 
 * @param {Response} res 
 * @param {Next} next 
 */
exports.asignarPermiso = function(req, res, next) {
    // Se recuperan los datos del usuario de la request
    var user = req.Usuario;
    var idPermiso = req.body.idPermiso;
    var valorPermiso = req.body.valorPermiso;
    var db = new database.DatabaseMysql();


    var sql = "";
    if (valorPermiso != undefined && valorPermiso == 1) {
        sql = "INSERT INTO PERMISOS_USUARIO(IDUSUARIO,IDPERMISO) VALUES(" + user.id + "," + idPermiso + ")";
    } else {
        sql = "DELETE FROM PERMISOS_USUARIO WHERE IDUSUARIO=" + user.id + " AND IDPERMISO=" + idPermiso;
    }

    console.log("SQL: " + sql);


    db.query(sql).then(result => {

        db.close();
        var resultado = {
            status: 0,
            descStatus: "OK",
            idPermiso: idPermiso,
            valorPermiso: valorPermiso
        };

        httpUtil.devolverJSON(res, resultado);


    }).catch(err => {
        console.log("Error al asignar/desasignar permiso en BBDD: " + err.message);

        db.close();
        var resultado = {
            status: -2,
            descStatus: "Error al insertar los permisos en BBDD: " + e.message
        };

        httpUtil.devolverJSON(res, resultado);
    });
};


/**
 * Recupera la lista de permisos que se pueden asignar a un usuario junto con la lista de los ya asignados
 * @param {req}  Objeto request
 * @param {res}  Objeto response
 * @param {next} Objeto next
 */
exports.getPermissionsAdministration = function(req, res, next) {

    var user = req.Usuario;

    var columnas = ['ID', 'PERMISO'];
    // Se recuperan los parámetros enviados del datatable en la petición AJAX
    var search = req.query.search;
    var limit = req.query.length;
    var draw = req.query.draw;
    var start = req.query.start;
    var columns = req.query.columns;
    var order = req.query.order;
    var idColumnOrden;
    var tipoOrden;
    var db = new database.DatabaseMysql();

    if (order != undefined && order.length == 1) {
        tipoOrden = order[0]['dir'];
        idColumnOrden = order[0]['column'];
    }

    console.log("tipoOrden: " + tipoOrden + ", idColumn: " + idColumnOrden);
    console.log("search: " + search.value);

    var sqlNumTotal = "SELECT COUNT(*) AS NUM FROM permisos"
    var sql = "SELECT P.ID,P.PERMISO,(SELECT COUNT(*) FROM PERMISOS_USUARIO WHERE IDUSUARIO=" + user.id + " AND IDPERMISO=P.ID) AS HAS_PERMISSION_USER FROM PERMISOS P";

    if (search != undefined && search.value.length > 0) {
        var valor = search.value;

        sql = sql + " WHERE ";

        if (stringUtil.isNumber(valor)) {
            // Si el valor por el que se hace la búsqueda se puede filtrar por el campo id de permiso
            sql = sql + " P.ID LIKE ('%" + valor + "%') OR ";
        }

        sql = sql + " P.PERMISO LIKE ('%" + valor + "%')";
        console.log("sql: " + sql);
    }

    console.log("sqlActivo: " + sql);
    var orderBy = " ORDER BY ID ASC";
    if (idColumnOrden != undefined && tipoOrden != undefined) {
        orderBy = " ORDER BY " + columnas[idColumnOrden] + " " + tipoOrden;
    }

    sql = sql + orderBy;
    sql = sql + " LIMIT " + limit + " OFFSET " + start;

    var numTotal = 0;
    db.query(sqlNumTotal).then(resultados => {
            if (resultados != undefined && resultados.length >= 1) {
                numTotal = resultados[0].NUM;
                return db.query(sql);
            }

        })
        .then(permisos => {
            console.log("permisos: " + JSON.stringify(permisos));
            var listadoFinal = [];
            console.log(sql);

            /** Se devuelve los resultados de la BBDD en un array para que
                pueda ser mostrado en un datatable de JQuery correctamente */
            for (var i = 0; permisos != undefined && i < permisos.length; i++) {
                var aux = [];
                aux.push(permisos[i].ID);
                aux.push(permisos[i].PERMISO);
                aux.push(permisos[i].HAS_PERMISSION_USER);
                listadoFinal.push(aux);
            };


            var salida = {
                'recordsTotal': numTotal,
                'recordsFiltered': numTotal,
                'data': listadoFinal
            }
            httpUtil.devolverJSON(res, salida);

        })
        .catch(err => {
            console.log("Error al obtener los permisos de usuario de BBDD: " + err.message);
        });

};




/**
 * Función que se invoca para comprueba si un usuario tiene un determinado permiso. Se utiliza para ser invocada a través
 * de una llamada AJAX
 * @param {Request} req 
 * @param {Response} res 
 * @param {Next} next 
 */
exports.comprobarPermisoAjax = function(req, res, next) {
    var idPermiso = req.body.idPermiso;
    var sesion = req.session;
    var user = sesion.usuario;
    var idUsuario = user.ID;
    var db = new database.DatabaseMysql();

    var respuesta = {
        status: 1,
        descStatus: 'No dispone del permiso'
    }

    if (user.ROOT == 1) {
        respuesta.status = 0;
        respuesta.descStatus = 'El usuario tiene permiso';
        httpUtil.devolverJSON(res, respuesta); // Si el usuario es ROOT se permite continuar
    } else {

        sql = "SELECT COUNT(*) AS NUM FROM PERMISOS_USUARIO WHERE IDUSUARIO=" + idUsuario + " AND IDPERMISO=" + idPermiso;
        console.log("SQL: " + sql);

        db.query(sql).then(result => {

            var salida = 1;
            db.close();
            if (result != undefined && result[0].NUM == 1) {
                // El usuario tiene permiso
                respuesta.status = 0;
                respuesta.descStatus = 'El usuario tiene permiso';
                httpUtil.devolverJSON(res, respuesta); // Si el usuario es ROOT se permite continuar
            } else {
                
                // El usuario no tiene permiso
                respuesta.status = 1;
                respuesta.descStatus = 'El usuario no tiene permiso';
                httpUtil.devolverJSON(res, respuesta); // Si el usuario es ROOT se permite continuar
            }

        }).catch(err => {
            console.log("Se ha producido un error al comprobar si un usuario tiene permiso de id: " + idPermiso + ": " + err.message);
            db.close();
            respuesta.status = 2;
            respuesta.descStatus = 'Error al comprobar si un usuario tiene permiso';
            httpUtil.devolverJSON(res, respuesta);

        });

    } // else
};


/**
 * Comprueba si un usuario autenticado tiene un determinado permiso para acceder a un deerminado recurso/pantalla
 * @param {request}   Objeto request
 * @param {response}  Objeto response
 * @param {idPermiso} Id del permiso
 * @param {onSuccess} Función onSuccess que se ejecuta en caso de que el usuario tenga permiso. Debe contener la redirección a la pantalla correspondiente
 * @param {onError}   Función onError que se ejecuta en caso de error y cuando el usuario no tiene permiso
 */
exports.comprobarPermiso = function(req, res, idPermiso, onSuccess, onError) {
    var sesion = req.session;
    var user = sesion.usuario;
    var idUsuario = user.ID;

    var db = new database.DatabaseMysql();

    if (user.ROOT == 1) {
        db.close();
        onSuccess(); // Si el usuario es ROOT se permite continuar y se ejecuta el callback de éxito
    } else {

        sql = "SELECT COUNT(*) AS NUM FROM PERMISOS_USUARIO WHERE IDUSUARIO=" + idUsuario + " AND IDPERMISO=" + idPermiso;
        console.log("SQL: " + sql);

        db.query(sql).then(result => {
            db.close();

            if (result != undefined && result[0] != undefined && result[0].NUM == 1) {
                onSuccess(); // Si el usuario es ROOT se permite continuar y se ejecuta el callback de éxito
            } else {
                onError(); // No tiene permiso, entonces se invoca al callback de error
            }

        }).catch(err => {
            db.close();
            console.log("Se ha producido un error al verificar los permisos del usuario: " + err.message);
            onError("Se ha producido un error al verificar los permisos del usuario: " + err.message);
        });

    } // else
};