var httpUtil = require("../util/HttpResponseUtil.js");
var crypt = require("../util/Encrypt.js");
var tiposActivo = require("../util/Activo.js");
var configUpload = require("../config/config_upload.json");
var permisosController = require("./permisosUsuarioController.js");
var database = require('../db/DatabaseMysql.js');


/**
 * Renderiza la vista que contiene la página de autenticación
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.renderLogin = function(req, res, next) {
    res.render("users/login", { layout: false });
};



/**
 * Función de autoload para cargar un usuario en la request.
 * También sirve para realizar un control de errores
 * @param req: Objeto request
 * @param res: Objeto response
 * @param next: Objeto next
 * @param idUsuario: Identificador del usuario
 */
exports.load = function(req, res, next, idUsuario) {
    var sql = "SELECT * FROM Users WHERE ID=" + idUsuario;

    var db = new database.DatabaseMysql();

    db.query(sql).then(resultado => {
        db.close();
        req.Usuario = resultado[0];
        next();
    }).catch(err => {
        db.close();
        console.log("Error al recuperar el usuario de id " + idUsuario + " de la BBDD: " + err.message);
        next(err);
    });

};


/**
 * Renderiza la pantalla de edición de un determinado usuario
 *  @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.renderScreenUpdateUser = function(req, res, next) {
    var msgPermiso = 'No dispones de permiso para editar un usuario. Contacta con el administrador';
    var salida = permisosController.comprobarPermiso(req, res, 2, function() {
        res.render("users/update", { errors: {}, usuario: req.Usuario });
    }, function(msg) {
        // Error
        res.render("errorPermiso", { message: (msg != undefined) ? msg : msgPermiso });
    });


};


/**
  * Función encargada de autenticar un usuario contra la base de datos
  * @param req: Objeto Request
  * @param res: Objeto Response
  * @param req: Objeto next
  * @return {status:[CODIGO],descStatus:[DESCRIPCION]}
          [CODIGO] puede tomar los valores: 0 => OK, 1=> Error al ejecutar sql, 2 => Error técnico
  */
 exports.autenticar = function(req, res, next) {
    var login = req.body.username;
    var password = req.body.password;
    var encrypted = crypt.encriptarSha1(password);

    var db = new database.DatabaseMysql();   

    var sql = "SELECT ID,NOMBRE,APELLIDO1,APELLIDO2,EMAIL,LOGIN,ACTIVO,ROOT FROM Users WHERE LOGIN='" + login + "' AND PASSWORD='" + encrypted + "'";
    console.log("sql: " + sql);

    var salida = { status: 2, descStatus: 'No existe el usuario' };

    db.query(sql).then(resultados=>{
        console.log("resultados: " + JSON.stringify(resultados));

        db.close();

        if (resultados != undefined && resultados.length == 1) {

            if (resultados[0].ACTIVO == 0) {
                // Cuenta de usuario desactivado
                salida = { status: 3, descStatus: 'Cuenta de usuario desactivada', path: req.session.path };
            } else {
                // Existe la cuenta de usuario en base de datos
                salida = { status: 0, descStatus: 'OK', path: req.session.path };
                // Se almacena el login de usuario en la sesión
                req.session.usuario = resultados[0];
                req.session.usuario.config = {
                    num_max_files_upload: configUpload.num_max_files_upload
                }
            }
        }
        
        httpUtil.devolverJSON(res, salida);

    }).catch(err=>{
        console.log("Se ha producido un error: " + err.message);
        db.close();
        salida = { status: 1, descStatus: err.message, path: req.session.path };
        httpUtil.devolverJSON(res, salida);
    });

};


/**
  * Función encargada de comprobar si ya existe un usuario con un determinado login y/o email en BBDD
  * @param req: Objeto Request
  * @param res: Objeto Response
  * @param req: Objeto next
  * @return {status:[CODIGO],descStatus:[DESCRIPCION]}
          [CODIGO] puede tomar los valores: 0 => OK, 1=> Error al ejecutar sql, 2 => Error técnico
  */
exports.existsUserWithLoginEmail = function(req, res, next) {
    var db = new database.DatabaseMysql();
    var login = req.body.login;
    var email = req.body.email;
    var resultado = {};

    /*
     * sql para comprobar si ya existe un usuario con un determinado login o con un email
     */
    var sqlLogin = "SELECT COUNT(*) AS NUM FROM Users WHERE LOGIN='" + login + "'";
    var sqlEmail = "SELECT COUNT(*) AS NUM FROM Users WHERE EMAIL='" + email + "'";

    console.log("sqllogin: " + sqlLogin);
    console.log("sqlEmail: " + sqlEmail);
    console.log("*****************");

    db.query(sqlLogin).then(results,err=>{
        if(err) {
            db.close();
            resultado.status = 4;
            resultado.descStatus = "Se ha producido un error al comprobar el login en BBDD";
            httpUtil.devolverJSON(res, resultado);
        }else
        if (results != undefined && results.length == 1 && results[0].NUM >= 1) {
            console.log("existe un usuario en BD con el login " + login);
            db.close();
            resultado.status = 1;
            resultado.descStatus = "El login esta siendo utilizado por otro usuario";
            httpUtil.devolverJSON(res, resultado);
        } else {
            return db.query(sqlEmail);
        }

    }).then(results,err=>{

        db.close();
        if (err) {
            resultado.status = 3;
            resultado.descStatus = "Se ha producido un error al comprobar el email en BBDD";
            httpUtil.devolverJSON(res, resultado);

        } else {

            if (results != undefined && results.length == 1 && results[0].NUM >= 1) {
                console.log("existe un usuario en BD con el email " + email);
                resultado.status = 2;
                resultado.descStatus = "El email esta siendo utilizado por otro usuario";

            } else {
                // No se encuentra el login ni el email en BBDD
                resultado.status = 0;
                resultado.descStatus = "OK";
            }

            httpUtil.devolverJSON(res, resultado);
        }


    }).catch(err=>{
        db.close();
        console.log("Se ha producido un error al comprobar la existencia de un usuario con login y mail: " + err.message);
    })
    


};





/**
  * Función encargada de actualizar un usuario en base de datos
  * @param req: Objeto Request
  * @param res: Objeto Response
  * @param req: Objeto next
  * @return {status:[CODIGO],descStatus:[DESCRIPCION]}
          [CODIGO] puede tomar los valores: 0 => OK, 1=> Error al ejecutar sql, 2 => Error técnico
  */
exports.updateUserProfile = function(req, res, next) {
    var db = new database.DatabaseMysql();
    var id = req.body.id;
    var nombre = req.body.nombre;
    var apellido1 = req.body.apellido1;
    var apellido2 = req.body.apellido2;
    var email = req.body.email;
    var login = req.body.login;
    var password = req.body.password;

    var resultado = {
        status: -1,
        descStatus: 'OK'
    };


    var SQL = "UPDATE Users SET LOGIN='" + login + "',NOMBRE='" + nombre + "', " +
        "APELLIDO1='" + apellido1 + "',APELLIDO2='" + apellido2 + "'," +
        "EMAIL='" + email + "',UPDATEDAT=NOW()";

    if (password != undefined && password.length >= 1) {
        SQL = SQL + ",PASSWORD='" + crypt.encriptarSha1(password) + "'"
    }
    SQL = SQL + " WHERE ID=" + id;

    console.log(SQL);
    db.query(SQL).then(result=>{
        db.close();

        console.log("Datos del usuario actualizados");
        resultado.status = 0;
        resultado.descStatus = "OK";

        /**
         * Se actualiza el contenido de la variable de sesión usuario
         */
        req.session.usuario.ID = id;
        req.session.usuario.NOMBRE = nombre;
        req.session.usuario.LOGIN = login;
        req.session.usuario.APELLIDO1 = apellido1;
        req.session.usuario.APELLIDO2 = apellido2;
        req.session.usuario.EMAIL = email;

        httpUtil.devolverJSON(res, resultado);


    }).catch(err=>{
        console.log("Se ha producido un error al actualizar el perfil de un usuario: " + err.message);
        db.close();

        resultado.status = 1;
        resultado.descStatus = "Error al actualizar el usuario " + err.message;
        httpUtil.devolverJSON(res, resultado);

    });

};





/**
  * Función encargada de actualizar un usuario en base de datos
  * @param req: Objeto Request
  * @param res: Objeto Response
  * @param req: Objeto next
  * @return {status:[CODIGO],descStatus:[DESCRIPCION]}
          [CODIGO] puede tomar los valores: 0 => OK, 1=> Error al ejecutar sql, 2 => Error técnico
  */
exports.updateUser = function(req, res, next) {

    var id = req.body.id;
    var nombre = req.body.nombre;
    var apellido1 = req.body.apellido1;
    var apellido2 = req.body.apellido2;
    var email = req.body.email;
    var login = req.body.login;
    var password = req.body.password;
    var db = new database.DatabaseMysql();

    var resultado = {
        status: -1,
        descStatus: 'OK'
    };

    var SQL = "UPDATE Users SET LOGIN='" + login + "',NOMBRE='" + nombre + "', " +
        "APELLIDO1='" + apellido1 + "',APELLIDO2='" + apellido2 + "'," +
        "EMAIL='" + email + "',UPDATEDAT=NOW()";

    if (password != undefined && password.length >= 1) {
        SQL = SQL + ",PASSWORD='" + crypt.encriptarSha1(password) + "'"
    }
    SQL = SQL + " WHERE ID=" + id;

    console.log(SQL);

    db.query(SQL).then(results=>{
        db.close();
        resultado.status = 0;
        resultado.descStatus = "OK";
        httpUtil.devolverJSON(res, resultado);

    }).catch(err=>{
        db.close();
        resultado.status = 1;
        resultado.descStatus = "Error al actualizar el usuario";
        httpUtil.devolverJSON(res, resultado);
    });
};


/**
 * Comprueba si existe un usuario con un determinado login
 * @param req: Objecto Request
 * @param res: Objeto Response
 * @param next: Objeto Next 
 */
exports.existsLogin = function(req, res, next) {
    var login = req.body.login;
    var db = new database.DatabaseMysql();

    var respuesta = {
        status: 1
    };

    var sql = "SELECT COUNT(*) AS NUM FROM Users WHERE LOGIN='" + login + "'";
    console.log(sql);

    db.query(sql).then(resultados=>{
        db.close();
        console.log("resultados: " + JSON.stringify(resultados));
        var numero = resultados[0].NUM;

        if (numero == 0) {
            // No existe el login
            respuesta.status = 0;
            respuesta.descStatus = "No existe el login";
        } else {
            // Existe el login
            respuesta.status = 3;
            respuesta.descStatus = "Existe el login";
        }

        httpUtil.devolverJSON(res, respuesta);

    }).catch(err=>{
        console.log("Error al comprobar la existencia del login de un usuario: " + err.message);
        db.close();
        respuesta.status = 1;
        respuesta.descStatus = "Error al comprobar existencia login en BBDD: " + err.message;
        httpUtil.devolverJSON(res, respuesta);

    });

};





/**
 * Comprueba si existe un usuario con un determinado login
 * @param req: Objecto Request
 * @param res: Objeto Response
 * @param next: Objeto Next 
 */
exports.existsLoginAnotherUser = function(req, res, next) {

    var login = req.body.login;
    var idUsuario = req.body.idUsuario;
    var respuesta = {
        status: 1
    };

    var db = new database.DatabaseMysql();

    console.log("existsLoginAnotherUser login: " + login + ", idUsuario: " + idUsuario);

    var sql = "SELECT COUNT(*) AS NUM FROM Users WHERE LOGIN='" + login + "' AND ID!=" + idUsuario;
    console.log("sql: " + sql);

    db.query(sql).then(resultados=>{
        db.close();
        var numero = resultados[0].NUM;

        if (numero == 0) {
            // No existe el login
            respuesta.status = 0;
            respuesta.descStatus = "No existe el login";
        } else {
            // Existe el login
            respuesta.status = 3;
            respuesta.descStatus = "Existe el login";
        }

        httpUtil.devolverJSON(res, respuesta);

    
    }).catch(err=>{
    
        db.close();
        respuesta.status = 1;
        respuesta.descStatus = "Error al comprobar existencia login en BBDD: " + err.message;
        httpUtil.devolverJSON(res, respuesta);
        
    });

};



/**
 * Comprueba si existe un usuario con un determinado email en BBDD
 * @param req: Objecto Request
 * @param res: Objeto Response
 * @param next: Objeto Next 
 */
exports.existsEmail = function(req, res, next) {
    var email = req.body.email;
    var respuesta = {
        status: 1
    };

    var db = new database.DatabaseMysql();

    var sql = "SELECT COUNT(*) AS NUM FROM Users WHERE EMAIL='" + email + "'";
    console.log(sql);
    db.query(sql).then(resultados=>{
        db.close();
        var numero = resultados[0].NUM;

        if (numero == 0) {
            // No existe el email
            respuesta.status = 0;
            respuesta.descStatus = "No existe el email";
        } else {
            // Existe el email
            respuesta.status = 3;
            respuesta.descStatus = "Existe el email";
        }

        httpUtil.devolverJSON(res, respuesta);

    }).catch(err=>{
        console.log("Error al comprobar la existencia del mail: " + err.message);
        db.close();
        respuesta.status = 1;
        respuesta.descStatus = "Error al comprobar existencia del email en BBDD: " + err.message;
        httpUtil.devolverJSON(res, respuesta);

    })

};





/**
 * Comprueba si existe un usuario con un determinado email en BBDD, y que además
 * no tenga un determinado id de usuario
 * @param req: Objecto Request
 * @param res: Objeto Response
 * @param next: Objeto Next 
 */
exports.existsEmailAnotherUser = function(req, res, next) {
    var email = req.body.email;
    var idUsuario = req.body.idUsuario;
    var respuesta = {
        status: 1
    };

    var db = new database.DatabaseMysql();
    var sql = "SELECT COUNT(*) AS NUM FROM Users WHERE EMAIL='" + email + "' AND ID!=" + idUsuario;
    console.log(sql);

    db.query(sql).then(resultados=>{
    
        db.close();
        var numero = resultados[0].NUM;

        if (numero == 0) {
            // No existe el email
            respuesta.status = 0;
            respuesta.descStatus = "No existe el email";
        } else {
            // Existe el email
            respuesta.status = 3;
            respuesta.descStatus = "Existe el email";
        }

        httpUtil.devolverJSON(res, respuesta);

    }).catch(err=>{
        db.close();
        console.log("Error al comprobar la existencia del mail para otro usuario: " + err.message);
        respuesta.status = 1;
        respuesta.descStatus = "Error al comprobar existencia del email en BBDD: " + err.message;
        httpUtil.devolverJSON(res, respuesta);
    });
};




/**
  * Función encargada de activar o desactivar un usuario en base de datos
  * @param req: Objeto Request
  * @param res: Objeto Response
  * @param req: Objeto next
  * @return {status:[CODIGO],descStatus:[DESCRIPCION]}
          [CODIGO] puede tomar los valores: 0 => OK, 1=> Error al insert usuario sql, 2 => Error al obtener conexión a la BBDD
  */
exports.disableUserAccount = function(req, res, next) {
    var idUsuario = req.body.idUsuario;
    var activo = req.body.activo;
    var resultado = {
        status: -1,
        descStatus: 'OK'
    };

    var db = new database.DatabaseMysql();

    var SQL;
    if (activo == 1) {
        SQL = "UPDATE Users SET ACTIVO=" + activo + ",FECHABAJA=NULL WHERE ID=" + idUsuario;
    } else {
        SQL = "UPDATE Users SET ACTIVO=" + activo + ",FECHABAJA=now() WHERE ID=" + idUsuario;
    }

    console.log(SQL)

    db.query(SQL).then(resultados=>{
        db.close();
        resultado.status = 0;
        resultado.descStatus = "OK";
        httpUtil.devolverJSON(res, resultado);

    }).catch(err=>{
        db.close();
        console.log("Error al activar/desactivar usuario en la BBDD: " + err.message);
        resultado.status = 1;
        resultado.descStatus = "Error al activar/desactivar usuario en la BBDD: " + err.message;
        httpUtil.devolverJSON(res, resultado);

    }) ;
};


/**
  * Función encargada de grabar un usuario en base de datos
  * @param req: Objeto Request
  * @param res: Objeto Response
  * @param req: Objeto next
  * @return {status:[CODIGO],descStatus:[DESCRIPCION]}
          [CODIGO] puede tomar los valores: 0 => OK, 1=> Error al insert usuario sql, 2 => Error al obtener conexión a la BBDD
  */
exports.saveUser = function(req, res, next) {
    var nombreUsuario = req.body.nombre;
    var apellido1 = req.body.apellido1;
    var apellido2 = req.body.apellido2;
    var email = req.body.email;
    var login = req.body.login;
    var password = req.body.password;

    var db = new database.DatabaseMysql();

    var resultado = {
        status: -1,
        descStatus: 'OK'
    };

    var passwordEncriptada = crypt.encriptarSha1(password);
    var SQL = "INSERT INTO Users(NOMBRE,APELLIDO1,APELLIDO2,EMAIL,LOGIN,PASSWORD) VALUES('" +
        nombreUsuario + "','" + apellido1 + "','" + apellido2 + "','" + email + "','" + login + "','" + passwordEncriptada + "')"

    console.log(SQL);


    db.query(SQL).then(resultados => {
        db.close();
        resultado.status = 0;
        resultado.descStatus = "OK";
        httpUtil.devolverJSON(res, resultado);
    }).catch(err => {
        db.close();
        resultado.status = 1;
        resultado.descStatus = "Error al insertar usuario en la BBDD: " + err.message;
        httpUtil.devolverJSON(res, resultado);
    });
};




/**
  * Función encargada de grabar un usuario en base de datos
  * @param req: Objeto Request
  * @param res: Objeto Response
  * @param req: Objeto next
  * @return {status:[CODIGO],descStatus:[DESCRIPCION]}
          [CODIGO] puede tomar los valores: 0 => OK, 1=> Error al insert usuario sql, 2 => Error al obtener conexión a la BBDD
  */
exports.deleteUser = function(req, res, next) {
    var id = req.body.idUsuario;

    var resultado = {
        status: -1,
        descStatus: 'OK'
    };

    var SQL = "DELETE FROM Users WHERE ID=" + id;
    console.log(SQL);

    var db = new database.DatabaseMysql();

    db.query(SQL).then(resultados => {
        db.close();
        resultado.status = 0;
        resultado.descStatus = "OK";
        httpUtil.devolverJSON(res, resultado);

    }).catch(err => {
        db.close();
        resultado.status = 1;
        resultado.descStatus = "Error al borrar el usuario de BBDD: " + err.message;
        httpUtil.devolverJSON(res, resultado);
    });

};


/**
 * Comprueba si el usuario se ha logueado en la aplicación, sino fuese así, entonces
 * se hace una redirección hacia la pantalla de login y en caso contrario, se continua
 * con la ejecución
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.isAuthenticatedUser = function(req, res, next) {
    console.log("isAuthenticatedUser: " + JSON.stringify(req.session.usuario));
    if (req.session != undefined && req.session.usuario != undefined) {
        console.log("isAuthenticatedUser sessión del usuario válida. Redirección al siguiente al siguiente middleware");
        next();
    } else {
        res.redirect("/login");
    }
};


/**
 * Comprueba si existe la sesión el objeto usuario
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.checkLogin = function(req, res, next) {
    if (req.session == undefined || req.session.usuario == undefined) {
        res.redirect('/login');
    }
};



/**
 * Renderiza la vista de administración de usuarios
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.renderUsersAdministrationScreen = function(req, res, next) {
    var user = req.session.usuario;

    res.render('users/users', { errors: [] });
};


/**
 * Recupera un listado de usuarios para proceder a la administración de los mismos. 
 * Recibe la petición por AJAX y devuelve el resultado al formato más adecuado para mostrarlo 
 * en un datatable de JQuery
 * @param req Objeto Request
 * @param res Objeto Response
 * @param req Objeto next
 */
exports.getUsersAdministracion = function(req, res, next) {
    var user = req.session.usuario;
    var db = new database.DatabaseMysql();

    var columnas = ['ID', 'LOGIN', 'NOMBRE', 'APELLIDO1', 'APELLIDO2', 'EMAIL', 'ACTIVO', 'FECHAALTA', 'FECHABAJA'];
    // Se recuperan los parámetros enviados del datatable en la petición AJAX
    var search = req.query.search;
    var limit = req.query.length;
    var draw = req.query.draw;
    var start = req.query.start;
    var columns = req.query.columns;
    var order = req.query.order;
    var idColumnOrden;
    var tipoOrden;

    if (order != undefined && order.length == 1) {
        tipoOrden = order[0]['dir'];
        idColumnOrden = order[0]['column'];
    }

    console.log("tipoOrden: " + tipoOrden + ", idColumn: " + idColumnOrden);
    console.log("search: " + search.value);

    try {
        var sqlNumTotal = "SELECT COUNT(*) AS NUM FROM Users";

        var sql = "SELECT ID,LOGIN,NOMBRE,APELLIDO1,APELLIDO2,EMAIL,ACTIVO,DATE_FORMAT(CREATEDAT,'%d/%m/%Y %T') AS FECHAALTA,DATE_FORMAT(FECHABAJA,'%d/%m/%Y %T') AS FECHABAJA FROM Users";

        sql = sql + " WHERE ID!=" + req.session.usuario.ID;
        if (search != undefined && search.value.length > 0) {
            var valor = search.value;

            var sqlActivo;
            if (tiposActivo.isTypeUserActivePositive(valor)) {
                sqlActivo = " OR ACTIVO=1)";
            } else
            if (tiposActivo.isTypeUserActiveNegative(valor)) {
                sqlActivo = " OR ACTIVO=0)";
            }

            //sql = sql + " WHERE (ID LIKE ('%" + valor + "%') OR LOGIN LIKE ('%" + valor + "%') OR NOMBRE LIKE('%" + valor + "%') OR APELLIDO1 LIKE ('%" + valor + "%') " +
            sql = sql + " AND (ID LIKE ('%" + valor + "%') OR LOGIN LIKE ('%" + valor + "%') OR NOMBRE LIKE('%" + valor + "%') OR APELLIDO1 LIKE ('%" + valor + "%') " +
                " OR APELLIDO2 LIKE ('%" + valor + "%') OR EMAIL LIKE ('%" + valor + "%') OR DATE_FORMAT(CREATEDAT,'%d/%m/%Y %T') LIKE('%" + valor + "%') OR DATE_FORMAT(FECHABAJA,'%d/%m/%Y %T') LIKE('%" + valor + "%')";

            if (sqlActivo != undefined) {
                sql = sql + sqlActivo;
            } else sql = sql + ")";

            console.log("sql: " + sql);
        }

        console.log("sqlActivo: " + sql);
        var orderBy = " ORDER BY FECHAALTA DESC";
        if (idColumnOrden != undefined && tipoOrden != undefined) {
            orderBy = " ORDER BY " + columnas[idColumnOrden] + " " + tipoOrden;
        }

        sql = sql + orderBy;
        sql = sql + " LIMIT " + limit + " OFFSET " + start;

        var numTotal = 0;
        db.query(sqlNumTotal).then(resultados=>{
            console.log(sqlNumTotal);

            numTotal = resultados[0].NUM;
            console.log(sql);
            return db.query(sql);
            
        }).then(usuarios=>{
            db.close();

            var listadoFinal = [];

            /** Se devuelve los resultados de la BBDD en un array para que
            pueda ser mostrado en un datatable de JQuery correctamente */
            for (var i = 0; usuarios != undefined && i < usuarios.length; i++) {
                var aux = [];
                aux.push(usuarios[i].ID);
                aux.push(usuarios[i].LOGIN);
                aux.push(usuarios[i].NOMBRE);
                aux.push(usuarios[i].APELLIDO1);
                aux.push(usuarios[i].APELLIDO2);
                aux.push(usuarios[i].EMAIL);
                aux.push(usuarios[i].ACTIVO);
                aux.push(usuarios[i].FECHAALTA);
                aux.push(usuarios[i].FECHABAJA);
                listadoFinal.push(aux);
            };

            var salida = {
                'recordsTotal': numTotal,
                'recordsFiltered': numTotal,
                'data': listadoFinal
            }

            httpUtil.devolverJSON(res, salida);

        }).
        catch(err=>{
            console.log("Se ha producido un error: " + err.message);
            db.close();

        });

    } catch (Err) {
        console.log("Error: " + Err.message);
    }
};



/**
 * Función encargada de cerrar la sesión del usuario
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.logout = function(req, res, next) {
    if (req.session.usuario != null) {
        delete req.session.usuario;
        //dleete req.session.
    }
    res.redirect("/");
};


/**
 * Renderiza la vista de perfil del usuario, para que este puede modificarlo
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.renderUserProfile = function(req, res, next) {
    var query = req.query;
    var rlParam = query.rl; // Parámetro rl que se pasa por GET en la url
    res.render('users/profile', { errors: [], usuario: req.session.usuario, reload: rlParam });
};


/**
 * Renderiza la pantalla de alta de nuevo usuario 
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.renderNuevoUsuario = function(req, res, next) {

    var msgPermiso = 'No dispones de permiso para crear un nuevo usuario. Contacta con el administrador';

    var salida = permisosController.comprobarPermiso(req, res, 1, function() {
        res.render("users/nuevo", { errors: {} });
    }, function(msg) {
        // Error
        res.render("errorPermiso", { message: (msg != undefined) ? msg : msgPermiso });
    });

};