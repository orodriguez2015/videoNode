var httpUtil = require('../util/HttpResponseUtil.js');
var stringUtil = require('../util/StringUtil.js');
var constantes = require('../config/constantes.json');
var path = require('path');
var fileUtil = require('../util/FileUtils.js');
var config = fileUtil.getContentConfigBBDDFile();

var database = require('../db/DatabaseMysql.js');
var configurationException = require('../util/ConfigurationException.js');
var mysql = require('mysql');

var i18n = require('i18n');

// Tipos de SQL a ejecutar
var SQL_USERS_TYPE = 0;
var SQL_ALBUMS_TYPE = 1;
var SQL_FOTO_TYPE = 2;
var SQL_USER_ADMIN_INSERT = 3;
var SQL_CONFIGURACION_TYPE = 4;
var SQL_PERMISOS_TYPE = 5;
var SQL_PERMISOS_USUARIO_TYPE = 6;
var PERMISO_ALTA_USUARIO = 7;
var PERMISO_EDICION_USUARIO = 8;
var PERMISO_BAJA_USUARIO = 9;
var PERMISO_ALTA_ALBUM = 10;
var PERMISO_EDICION_ALBUM = 11;
var PERMISO_BAJA_ALBUM = 12;


/**
 * Renderiza la pantalla del primer paso de la instalación
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.renderPaso1 = function(req, res, next) {
    res.render("config/paso1");
}


/**
 * Renderiza la pantalla de instalación en la que se solicita la información de conexión a la BBDD
 * @param req Objeto request
 * @param res Objeto response
 * @param next Objeto next
 */
exports.renderPaso2 = function(req, res, next) {
    var configuracion = fileUtil.getContentConfigBBDDFile();
    res.render("config/paso2", { errors: [], configBBDD: configuracion });
};


/**
 * Renderiza la pantalla en la que se informa al usuario de que se informará al usuario
 * de que será necesario crear la base de datos
 * @param req Objeto request
 * @param res Objeto response
 * @param next Objeto next
 */
exports.renderPaso3 = function(req, res, next) {
    res.render("config/paso3", { errors: [] });
};


/**
 * Comprueba si la instalación es correcta
 * @param {Request} req 
 * @param {Response} res 
 * @param {next} next 
 */
exports.instalacionCorrecta = function(respuesta) {

    var config = fileUtil.getContentConfigBBDDFile();

    var db = new database.DatabaseMysql();

    console.log("instalacionCorrecta configuracion BD: " + JSON.stringify(config));

    var resultado = {
        status: 0,
        descStatus: 'OK'
    };

    if (config == undefined || config == null || stringUtil.isEmpty(config.mysql_server) ||
        stringUtil.isEmpty(config.mysql_db_name) || stringUtil.isEmpty(config.mysql_user) ||
        stringUtil.isEmpty(config.mysql_pass)) {

        resultado.status = 1;
        resultado.descStatus = "Datos configuracion incorrectos en config_bbdd.json";
        respuesta(resultado);

    } else {
        // Se comprueba si hay conexión a la BBDD, en caso contrario, hay que lanzar el proceso de instalación

        /*
         * Se procede a ejecutar las queries sobre las tablas del sistema para comprobar si existen las tablas
         * que usa la aplicación
         */
        var schemaName = config.mysql_db_name;
        var sqlUsers = getQueryExistsTable(constantes.TABLE_USERS, schemaName);
        var sqlAlbums = getQueryExistsTable(constantes.TABLE_ALBUMS, schemaName);
        var sqlFoto = getQueryExistsTable(constantes.TABLE_FOTO, schemaName);
        var sqlConfiguracion = getQueryExistsTable(constantes.TABLE_CONFIGURACION, schemaName);
        var sqlPermisos = getQueryExistsTable(constantes.TABLE_PERMISOS, schemaName);
        var sqlPermisosUsuario = getQueryExistsTable(constantes.TABLE_PERMISOS_USUARIOS, schemaName);

        var contador = 0;
        db.query(sqlUsers)
            .then(resultado => {

                // Se procede a comprobar si existe la tabla Users
                console.log("resultado: " + JSON.stringify(resultado));

                console.log(" 1. COMPROBAR SI EXIST LA TABLA Users: " + JSON.stringify(resultado));
                if (resultado != undefined && resultado.length > 0 && resultado[0].NOMBRE_TABLA != null) {
                    console.log(" 1. Existe la tabla Users");
                    contador++;
                    return db.query(sqlAlbums);
                } else {
                    console.log(" 1. No existe la tabla Users");
                }

            }).then(resultado => {

                if (resultado != undefined && resultado.length > 0 && resultado[0].NOMBRE_TABLA != null) {
                    /**
                     * Existe la tabla Albums, se comprueba si existe la tabla Albums
                     */
                    contador++;
                    console.log(" 2. Existe la tabla Albums");
                    return db.query(sqlFoto);
                } else {
                    console.log(" 2. No existe la tabla Albums");
                }
            })
            .then(resultado => {
                if (resultado != undefined && resultado.length > 0 && resultado[0].NOMBRE_TABLA != null) {
                    /**
                     * Existe la tabla foto, se comprueba si existe la tabla configuracion
                     */
                    console.log(" 3. Existe la tabla foto");
                    contador++;
                    return db.query(sqlConfiguracion);
                } else {
                    console.log(" 3. No existe la tabla foto");
                }
            })

           .then(resultado => {
            if (resultado != undefined && resultado.length > 0 && resultado[0]!=undefined && resultado[0].NOMBRE_TABLA != null) {
                /**
                 * Existe la tabla configuracion, se comprueba si existe la tabla configuracion
                 */
                console.log(" 4. Existe la tabla configuracion");
                contador++;

                console.log("sqlPermisos: " + sqlPermisos);
                return db.query(sqlPermisos);
            } else {
                console.log(" 4. No existe la tabla configuracion");
            
            } // else
        })

       .then(resultado => {
            console.log("Comprobacion de existencia de la tabla Permisos");
            console.log("resultado: " + JSON.stringify(resultado));
            if (resultado != null && resultado != undefined && resultado[0]!=undefined && resultado[0].NOMBRE_TABLA=="permisos") {
                console.log(" 5. Existe la tabla Permisos");
                contador++;
                return db.query(sqlPermisosUsuario);
            } else {
                console.log(" 5. No existe la tabla Permisos");
            }
        })

        .then(resultado => {
            console.log("Comprobacion de existencia de la tabla permisos_usuario");
            console.log("resultado permisos_usuario: " + JSON.stringify(resultado));
            console.log("contador: " + contador);

            db.close();
            if (resultado != null && resultado != undefined && resultado[0]!=undefined && resultado[0].NOMBRE_TABLA=="permisos_usuario") {
                console.log(" 6. Existe la tabla permisos_usuario");
                contador++;
                
                if (contador == 6) {
                    var res = {}
                    res.status = 0;
                    res.descStatus = "OK";
                    respuesta(res);

                } else
                if (contador > 0 && contador < 4) {
                    resultado.status = 3;
                    resultado.descStatus = "No existe alguna de las tablas de base de datos";
                } else
                if (contador == 0) {
                    resultado.status = 4;
                    resultado.descStatus = "No existe ninguna tabla";
                }

                
                respuesta(resultado);

            } else {
                console.log(" 6. No existe la tabla permisos_usuario");
                
                console.log("Se ha cerrado la conexión a la BBDD");
                var resultado = {};

                if (contador > 0 && contador < 6) {
                    resultado.status = 3;
                    resultado.descStatus = "Algunas de las tablas están dadas de alta pero no todas";
                    console.log("comprobarInstalacion2 resultado: " + JSON.stringify(resultado));
                    respuesta(resultado);
                } else
                if (contador == 0) {
                    resultado.status = 4;
                    resultado.descStatus = "No existe ninguna tabla";
                    console.log("comprobarInstalacion2 resultado: " + JSON.stringify(resultado));
                    respuesta(resultado);
                }
            } // else

            
        })
        .catch(err => {
            console.log("Se ha producido un error: " + err.message);

            db.close();
            console.log("Se cierra la conexión a la BBDD");

            var resultado = {};
            resultado.status = 2;
            resultado.descStatus = err.message;

            console.log(" JSON resultado ejecucion queries: " + JSON.stringify(resultado));
            respuesta(resultado);

        });
    }
}



/**
 * Comprueba que se pueda establecer conexión a la BBDD con la información proporcionada por el usuario
 * @param req Objeto request
 * @param res Objeto response
 * @param next Objeto next
 */
exports.comprobarConexionBD = function(req, res, next) {
    var db = new database.DatabaseMysql();

    var servidor = req.body.servidor;
    var basedatos = req.body.basedatos;
    var usuariobd = req.body.usuariobd;
    var passwordbd = req.body.passwordbd;

    var resultado = {
        status: -1
    };

    console.log("comprobarConexionBD INIT");
    if (servidor == undefined || basedatos == undefined || usuariobd == undefined || passwordbd == undefined) {
        console.log(" Configuración de base de datos incompleta");
        resultado.status = 1;
        resultado.descStatus = "Configuración de base de datos incompleta";

        console.log(" comprobarConexionBD: " + JSON.stringify(resultado));
        httpUtil.devolverJSON(res, resultado);
    } else {

        var config_connection = {
            host: servidor,
            database: basedatos,
            user: usuariobd,
            password: passwordbd
        }

        var connection = mysql.createConnection(config_connection);

        if (connection != null && connection != undefined) {

            connection.connect(function(err) {
                if (err) {
                    console.log("No se ha podido establecer conexión a la BBDD: " + err.message);
                    resultado.status = 2;
                    resultado.descStatus = "Se ha producido un error al obtener conexión con la BBDD: " + err.message;
                    console.log(" comprobarConexionBD: " + JSON.stringify(resultado));
                    connection.end();
                } else {

                    // Si el flag es correcto => Se ha obtenido conexión con los datos introducidos por el usuario
                    console.log(" Se ha establecido conexion con la BBDD");
                    req.session.configuracion_bbdd = config_connection;

                    resultado.status = 0;
                    resultado.descStatus = "OK";
                    console.log(" comprobarConexionBD: " + JSON.stringify(resultado));
                    connection.end();
                }

                httpUtil.devolverJSON(res, resultado);
            });

        } else {

            resultado.status = 2;
            resultado.descStatus = "Se ha producido un error al obtener conexión con la BBDD: " + err.message;
            console.log(" comprobarConexionBD: " + JSON.stringify(resultado));
            httpUtil.devolverJSON(res, resultado);
        }

    }
    console.log("comprobarConexionBD END");
};


/**
 * Comprueba la existencia de las tablas de base de datos que utiliza la aplicación, y por otra parte, escribe la configuración de la base de datos
 * en el fichero config_bbdd.json
 * @param req Objeto request
 * @param res Objeto response
 * @param next Objeto next
 */
exports.comprobarExistenciaTablas = function(req, res, next) {

    // Nombre de la base de datos/esquema
    var schemaName = config.mysql_db_name;
    var resultado = {
        status: -1
    }

    var configBaseDatos = req.session.configuracion_bbdd;

    console.log("comprobaExistenciasTablas ====>")

    try {
        var db = new database.DatabaseMysql(configBaseDatos);

        var sqlUsers = getQueryExistsTable(constantes.TABLE_USERS, schemaName);
        var sqlAlbums = getQueryExistsTable(constantes.TABLE_ALBUMS, schemaName);
        var sqlFoto = getQueryExistsTable(constantes.TABLE_FOTO, schemaName);
        var sqlConfig = getQueryExistsTable(constantes.TABLE_CONFIGURACION, schemaName);
        var sqlPermisos = getQueryExistsTable(constantes.TABLE_PERMISOS, schemaName);
        var sqlPermisosUsuarios = getQueryExistsTable(constantes.TABLE_PERMISOS_USUARIOS, schemaName);

        console.log("sqlUsers: " + sqlUsers);
        console.log("sqlAlbums: " + sqlAlbums);
        console.log("sqlFoto: " + sqlFoto);
        console.log("sqlConfiguracion: " + sqlConfig);
        console.log("sqlPermisos: " + sqlPermisos);
        console.log("sqlPermisosUsuarios: " + sqlPermisosUsuarios);

        db.query(sqlUsers).then(resultado => {

            if (resultado != undefined && resultado != null && resultado[0] != null && resultado[0].NOMBRE_TABLA == constantes.TABLE_USERS) {
                console.log("Existe la tabla Users");
                return db.query(sqlAlbums);
            } else {
                throw new configurationException.ConfigurationException(1, "No existe la tabla Users");

            }

        }).
        then(resultado => {

            if (resultado != undefined && resultado != null && resultado[0] != null && resultado[0].NOMBRE_TABLA == constantes.TABLE_ALBUMS) {
                console.log("Existe la tabla Albums");
                return db.query(sqlFoto);
            } else {
                throw new configurationException.ConfigurationException(2, "No existe la tabla Albums");

            }

        }).
        then(resultado => {

            if (resultado != undefined && resultado != null && resultado[0] != null && resultado[0].NOMBRE_TABLA == constantes.TABLE_FOTO) {
                console.log("Existe la tabla foto");
                return db.query(sqlConfig);
            } else {
                throw new configurationException.ConfigurationException(3, "No existe la tabla foto");
            }

        }).

        then(resultado => {

            db.close();
            if (resultado != undefined && resultado != null && resultado[0] != null && resultado[0].NOMBRE_TABLA == constantes.TABLE_CONFIGURACION) {
                console.log("Existe la tabla configuracion");

                resultado.status = 2;
                resultado.descStatus = "Existen las tablas en la base de datos";
                httpUtil.devolverJSON(res, resultado);

            } else {
                throw new configurationException.ConfigurationException(4, "No existe la tabla configuracion");
            }

        }).
        catch(err => {

            db.close();
            console.log("error: " + JSON.stringify(err));
            console.log("Se ha producido el siguiente error: " + err.message);
            console.log("Se ha producido el siguiente error code: " + err.getCodigoError());
            console.log("Se ha producido el siguiente error: " + err.getMensajeError());

            resultado.status = 0;
            resultado.descStatus = "No existen las tablas en la base de datos";
            httpUtil.devolverJSON(res, resultado);
        });



    } catch (Err) {
        console.log("Se ha producido un error al obtener conexión a la BBDD: " + err.message);

        resultado.status = 1;
        resultado.descStatus = "Error al obtener una conexión a la BBDD";
        httpUtil.devolverJSON(res, resultado);
    }

};



/**
 * Operación que da de alta las tablas en la base de datos
 * @param req Objeto request
 * @param res Objeto response
 * @param next Objeto next
 */
exports.createTablesDatabases = function(req, res, next) {
    console.log("createTablesDatabases init ");
    var queries = new Array();
    var db = new database.DatabaseMysql();
        
    // Queries de comprobación de existencia de tablas, porque el DROP TABLE sobre una tabla 
    // que no existe da lugar a una excepción
    var SQL_CONFIGURACION = getQueryExistsTable('configuracion', config.mysql_db_name);
    var SQL_FOTO = getQueryExistsTable('foto', config.mysql_db_name);
    var SQL_ALBUM = getQueryExistsTable('albums', config.mysql_db_name);
    var SQL_USERS = getQueryExistsTable('Users', config.mysql_db_name);
    var SQL_PERMISOS = getQueryExistsTable('permisos', config.mysql_db_name);
    var SQL_PERMISOS_USUARIO = getQueryExistsTable('permisos_usuario', config.mysql_db_name);

        

         db.beginTransaction().then(resultado=>{
            db.query(SQL_CONFIGURACION).then(resultado=>{
                console.log("Comprobacion tabla configuracion: " + JSON.stringify(resultado));

                if (resultado != undefined && resultado.length > 0 && resultado[0]!=null && resultado[0].NOMBRE_TABLA=='configuracion') {
                    console.log(" 1. Existe la tabla configuración, se procede a borrarla borrar");
                    var query = 'DROP TABLE ' + config.mysql_db_name + '.configuracion';
                    console.log("query borrado: " + query);
                    return db.query(query);
                } else {
                    console.log(" 1. No existe la tabla configuración, por tanto no se borra");
                }

            }).then(resultado=>{
                console.log("Resultado borrado tabla configuracion: " + JSON.stringify(resultado));
                return db.query(SQL_FOTO);
                
            }).then(resultado=>{

                if (resultado != undefined && resultado.length > 0 && resultado[0]!=null && resultado[0].NOMBRE_TABLA=='foto') {
                    console.log(" 2. Existe la tabla foto, se procede a borrarla borrar");
                    var query = 'DROP TABLE ' + config.mysql_db_name + '.foto'
                    return db.query(query);
                } else {
                    console.log(" 2. No existe la tabla foto, por tanto no se borra");
                }

            })
            .then(resultado=>{
                console.log(JSON.stringify(resultado));
                return db.query(SQL_ALBUM);

            }).then(resultado=>{
                console.log(JSON.stringify(resultado));
                if (resultado != undefined && resultado.length > 0 && resultado[0]!=null && resultado[0].NOMBRE_TABLA=='albums') {
                    console.log(" 3. Existe la tabla album, se procede a borrarla borrar");
                    var query = 'DROP TABLE ' + config.mysql_db_name + '.albums'
                    return db.query(query);
                } else {
                    console.log(" 3. No existe la tabla album, por tanto no se borrar");
                }

            }).then(resultado=>{
                console.log(JSON.stringify(resultado));
                return db.query(SQL_PERMISOS_USUARIO);

            }).then(resultado=>{
                console.log(JSON.stringify(resultado));
                if (resultado != undefined && resultado.length > 0 && resultado[0]!=null && resultado[0].NOMBRE_TABLA=='permisos_usuario') {
                    console.log(" 4. Existe la tabla permisos, se procede a borrarla borrar");
                    var query = 'DROP TABLE ' + config.mysql_db_name + '.permisos_usuario'
                    return db.query(query);
                } else {
                    console.log(" 4. No existe la tabla permisos_usuario, por tanto no se borrar");
                }

            }).then(resultado=>{
                console.log("Resultado de borrado de la tabla permisos_usuario: " + JSON.stringify(resultado));
                return db.query(SQL_PERMISOS);

            }).then(resultado=>{
                console.log(JSON.stringify(resultado));
                if (resultado != undefined && resultado.length > 0 && resultado[0]!=null && resultado[0].NOMBRE_TABLA=='permisos') {
                    console.log(" 5. Existe la tabla permisos, se procede a borrarla borrar");
                    var query = 'DROP TABLE ' + config.mysql_db_name + '.permisos'
                    return db.query(query);
                } else {
                    console.log(" 5. No existe la tabla permisos, por tanto no se borrar");
                }


            }).then(resultado=>{
                console.log("resultado borrar tabla albums: " + JSON.stringify(resultado));
                return db.query(SQL_USERS);

            }).then(resultado=>{

                console.log("resultado borrar tabla users: " + JSON.stringify(resultado));
                if (resultado != undefined && resultado.length > 0 && resultado[0]!=null && resultado[0].NOMBRE_TABLA=='Users') {
                    console.log(" 4. Existe la tabla Users, se procede a borrarla borrar");
                    var query = 'DROP TABLE ' + config.mysql_db_name + '.Users'
                    return db.query(query);
                } else {
                    console.log(" 4. No existe la tabla Users, por tanto no se borrar");
                }


            }).then(resultado=>{

                var CONTADOR_TABLAS_CREADAS = 1;
                var createTableConfig = getQueryCreateTable(SQL_CONFIGURACION_TYPE);
                var createTableUsers = getQueryCreateTable(SQL_USERS_TYPE);
                var createUserAdmin = getQueryCreateTable(SQL_USER_ADMIN_INSERT);
                var createTableFoto = getQueryCreateTable(SQL_FOTO_TYPE);
                var createTableAlbums = getQueryCreateTable(SQL_ALBUMS_TYPE);
                var createTablePermisos = getQueryCreateTable(SQL_PERMISOS_TYPE);
                var createTablePermisosUsuario = getQueryCreateTable(SQL_PERMISOS_USUARIO_TYPE);
                
                var permisoAltaUsuario    = getQueryCreateTable(PERMISO_ALTA_USUARIO);
                var permisoEdicionUsuario = getQueryCreateTable(PERMISO_EDICION_USUARIO);
                var permisoBajaUsuario    = getQueryCreateTable(PERMISO_BAJA_USUARIO);
                var permisoAltaAlbum      = getQueryCreateTable(PERMISO_ALTA_ALBUM);
                var permisoEdicionAlbum   = getQueryCreateTable(PERMISO_EDICION_ALBUM);
                var permisoBajaAlbum      = getQueryCreateTable(PERMISO_BAJA_ALBUM);

              
      

                /**
                 * CREACIÓN DE LAS TABLA DE LA BASE DE DATOS
                 */
                db.query(createTableConfig).then(resultado=>{
                    return db.query(createTableUsers);
                   
                }).then(resultado=>{
                    return db.query(createUserAdmin);

                }).then(resultado=>{                        
                    CONTADOR_TABLAS_CREADAS++;
                    return db.query(createTableAlbums);

                }).then(resultado=>{
                    CONTADOR_TABLAS_CREADAS++;
                    return db.query(createTableFoto);

                }). then(resultado=>{
                    CONTADOR_TABLAS_CREADAS++;
                    return db.query(createTablePermisos);

                    // Inserción de permisos en la tabla de permisos
                }).then(resultado=>{
                    CONTADOR_TABLAS_CREADAS++;
                    return db.query(permisoAltaUsuario);

                
                }).then(resultado=>{

                    CONTADOR_TABLAS_CREADAS++;
                    return db.query(permisoEdicionUsuario);

                }).then(resultado=>{

                    CONTADOR_TABLAS_CREADAS++;
                    return db.query(permisoBajaUsuario);

                }).then(resultado=>{

                    CONTADOR_TABLAS_CREADAS++;
                    return db.query(permisoAltaAlbum);

                }).then(resultado=>{

                    CONTADOR_TABLAS_CREADAS++;
                    return db.query(permisoEdicionAlbum);
                }).then(resultado=>{

                    CONTADOR_TABLAS_CREADAS++;
                    return db.query(permisoBajaAlbum);

                }).then(resultado=>{
                    CONTADOR_TABLAS_CREADAS++;
                    return db.query(createTablePermisosUsuario);

                }).then(resultado=>{
                    CONTADOR_TABLAS_CREADAS++;
                    // Se inserta un registro con los datos de la instalación en la tabla configuración
                    var sql = "INSERT INTO " + config.mysql_db_name + ".CONFIGURACION(SERVIDOR_BBDD,NOMBRE_BBDD,USUARIO_BBDD,PASSWORD_BBDD,FECHA_INSTALACION,ESTADO_INSTALACION) VALUES('" + config.mysql_server + "','" + config.mysql_db_name + "','" + config.mysql_user +
                    "','" + config.mysql_pass + "',now(),1)";
                    console.log(sql);
                    return db.query(sql);

                }).then(resultado=>{

                    var resultado = {};

                    console.log("CONTADOR_TABLAS_CREADAS:  " + CONTADOR_TABLAS_CREADAS);
                                            
                    if(CONTADOR_TABLAS_CREADAS==12) {
                        console.log("TABLAS DE BASE DE DATOS CREADAS");

                        db.commitTransaction().then(respuesta=>{
                            db.close().then(respuesta=>{

                                resultado = {
                                    status: 0,
                                    descStatus: "OK"
                                };

                                httpUtil.devolverJSON(res, resultado);

                            });

                        });
                        
                    } else {

                        db.rollbackTransaction().then(res=>{
                            db.close().then(salida=>{
                                resultado = {
                                    status: 1,
                                    descStatus: mensajeError
                                };

                                httpUtil.devolverJSON(res, resultado);

                            });
                            
                        }).catch(err=>{
                            console.log("Error al realizar rollback BBDD: " + err.message);
                        });                                
                    }
                    

                })
                .catch(err=>{
                    console.log(" ====> ERROR AL CREAR BASE DE DATOS:  " + err.message);
                    console.log(" ====> Antes de deshacer la transacción");

                    db.rollbackTransaction(function(err) {
                        if(err) {
                            console.log(" ===> PROCESO INSTALACION: Error al rollback durante la creación de la BBDD: " + err.message);

                        }

                        console.log(" ===> PROCESO INSTALACION: Se hace rollback ===>  ")

                        db.close().then(salida=>{
                            console.log("Cerrada conexión a la BBDD ===>")
                            var resultado = {
                                status: 1,
                                descStatus: "Se ha producido un error en la creación de la BBDD"
                            };
    
                            httpUtil.devolverJSON(res, resultado);

                        });
                    });
                });


                
            }).catch(err=>{
                console.log("Se ha producido un error en la creación de las tablas: " + err.message);
                db.rollbackTransaction().then(respuesta=>{
                    db.close().then(respuesta =>{

                        var resultado = {
                            status: 1,
                            descStatus: "Se ha producido un error en la creación de la BBDD: " + err.message
                        };

                        httpUtil.devolverJSON(res, resultado);
                    });

                });
            });
            console.log("createTablesDatabases.END");


            }).catch(err=> {
                    console.log("Error al iniciar la transacción contra la BBDD: " + err.message);
                    console.log("createTablesDatabases.END");
                    var resultado = {};
                    resultado.status = 3;
                    resultado.descStatus = "Error al iniciar la transacción: " + err.message;
                    httpUtil.devolverJSON(res, resultado);
        
            });
    

};





/**
 * Lee la query del archivo de creación de una tabla que se indique por parámetro
 * @param sqlCreateType Tipo de tabla que se quiere crear
 */
function getQueryCreateTable(sqlCreateType) {
    var ruta = __dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.CONFIG_SCRIPTS_DIR;

    switch (sqlCreateType) {
        case SQL_USERS_TYPE:
            {
                ruta = ruta + constantes.FILE_SEPARATOR + "users.sql";
                break;
            }

        case SQL_ALBUMS_TYPE:
            {
                ruta = ruta + constantes.FILE_SEPARATOR + "albums.sql";
                break;
            }

        case SQL_FOTO_TYPE:
            {
                ruta = ruta + constantes.FILE_SEPARATOR + "photo.sql";
                break;
            }

        case SQL_USER_ADMIN_INSERT:
            {
                ruta = ruta + constantes.FILE_SEPARATOR + "user_admin.sql";
                break;
            }


        case SQL_CONFIGURACION_TYPE:
            {
                ruta = ruta + constantes.FILE_SEPARATOR + "configuracion.sql";
                break;
            }

        case SQL_PERMISOS_TYPE:
            {
                ruta = ruta + constantes.FILE_SEPARATOR + "permisos.sql";
                break;
            }

        case SQL_PERMISOS_USUARIO_TYPE:
            {
                ruta = ruta + constantes.FILE_SEPARATOR + "permisos_usuarios.sql";
                break;
            }    

        case PERMISO_ALTA_USUARIO:
        {
            ruta = ruta + constantes.FILE_SEPARATOR + "permiso_alta_usuario.sql";
            break;
        }    


        case PERMISO_EDICION_USUARIO:
        {
            ruta = ruta + constantes.FILE_SEPARATOR + "permiso_edicion_usuario.sql";
            break;
        }    

        case PERMISO_BAJA_USUARIO:
        {
            ruta = ruta + constantes.FILE_SEPARATOR + "permiso_baja_usuario.sql";
            break;
        }    

        case PERMISO_ALTA_ALBUM:
        {
            ruta = ruta + constantes.FILE_SEPARATOR + "permiso_alta_album.sql";
            break;
        }    

        case PERMISO_EDICION_ALBUM:
        {
            ruta = ruta + constantes.FILE_SEPARATOR + "permiso_edicion_usuario.sql";
            break;
        }    

        case PERMISO_BAJA_ALBUM:
        {
            ruta = ruta + constantes.FILE_SEPARATOR + "permiso_baja_album.sql";
            break;
        }    

    } // switch

    return "" + fileUtil.readFile(ruta);
}



/**
 * Función que comprueba si existe una determinada tabla en una base de datos
 * @param tableName Nombre de la tabla
 * @param schemaName Nombre del esquema de la BBDD
 * @param connection Conexión a la base de datos
 * @return True si existe y false en caso contrario
 */
function getQueryExistsTable(tableName, schemaName) {

    // Se comprueba si existe un usuario root y que tenga su cuenta de usuario activa
    var SQL = "SELECT TABLE_SCHEMA AS BD, TABLE_NAME AS NOMBRE_TABLA, CREATE_TIME AS FECHA_CREACION, ENGINE " +
        "FROM information_schema.tables " +
        "WHERE table_name like '" + tableName + "' AND table_schema='" + schemaName + "' " +
        "ORDER BY table_name DESC";

    return SQL;
};

/**
 * Renderiza la pantalla de instalación en la que se solicita el usuario administrador
 * @param req Objeto request
 * @param res Objeto response
 * @param next Objeto next
 */
exports.renderScreenConfiguracionUsuarioAdministrador = function(req, res, next) {
    res.render("config/infoUserAdmin", { errors: [] });
};


/**
 * Renderiza la pantalla de instalación finalizada
 * @param req Objeto request
 * @param res Objeto response
 * @param next Objeto next
 */
exports.renderScreenInstallationFinished = function(req, res, next) {
    res.render("config/installationFinished", { errors: [] });
};
