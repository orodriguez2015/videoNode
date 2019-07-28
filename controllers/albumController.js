var httpUtil = require('../util/HttpResponseUtil.js');
var userController = require('./userController.js');
var constantes = require('../config/constantes.json');
var configUpload = require('../config/config_upload.json');
var fileUtil = require('../util/FileUtils.js');
var path = require('path');
var permisosController = require('./permisosUsuarioController.js');

var config = require('../config/config_bbdd.json');
var database = require('../db/DatabaseMysql.js');

/**
 * Configuración de acceso a la BBDD
 */
var configuration = {
    host: config.mysql_server,
    user: config.mysql_user,
    password: config.mysql_pass,
    database: config.mysql_db_name
}


/**
 * Renderiza la vista correspondiente a la pantalla de inicio
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.pantallaInicio = function(req,res,next) {
    res.render("inicio/index");
}

/**
 * Renderiza la vista de alta de un álbum fotográfico
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.renderScreenCreateAlbum = function(req, res, next) {

    var msgPermiso = 'No dispones de permiso para crear un nuevo álbum. Contacta con el administrador';

    var salida = permisosController.comprobarPermiso(req, res, 4, function() {
        res.render("album/create", { errors: {} });
    }, function(msg) {
        // Error
        res.render("errorPermiso", { message: (msg != undefined) ? msg : msgPermiso });
    });

};


/**
 * Renderiza la vista de edición de un álbum fotográfico que previamente ha sido
 * recuperado de la base de datos
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.renderScreenEditAlbum = function(req, res, next) {

    var msgPermiso = 'No dispones de permiso para editar un álbum. Contacta con el administrador';
    var salida = permisosController.comprobarPermiso(req, res, 5, function() {
        res.render("album/edit", { errors: {}, album: req.Album });
    }, function(msg) {
        // Error
        res.render("errorPermiso", { message: (msg != undefined) ? msg : msgPermiso });
    });

};


/**
 * Renderiza la vista que permite subir las imágenes a un álbum fotográfico
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.renderScreenUploadImagesAlbum = function(req, res, next) {

    var msgPermiso = 'No dispones de permiso para editar un álbum. Contacta con el administrador';

    var salida = permisosController.comprobarPermiso(req, res, 4, function() {
        res.render("album/uploadImages", { errors: {}, album: req.Album, config: { num_max_files_upload: configUpload.num_max_files_upload } });
    }, function(msg) {
        // Error
        res.render("errorPermiso", { message: (msg != undefined) ? msg : msgPermiso });
    });

};


/**
 * Función de autoload para cargar un álbum en la request.
 * También sirve para realizar un control de errores
 * @param req: Objeto request
 * @param res: Objeto response
 * @param next: Objeto next
 * @param idAlbum: Identificador del álbum
 */
exports.load = function(req, res, next, idAlbum) {
    // Se comprueba si existe la sesión de usuario, en caso contrario, se hace
    // una redirección hacia la pantalla de login
    userController.checkLogin(req, res, next);
    var idUsuario = req.session.usuario.ID;
    var db = new database.DatabaseMysql();

    var sql = "SELECT * FROM albums WHERE ID=" + idAlbum + " AND IDUSUARIO=" + idUsuario;
    console.log("load sql: " + sql);


    db.query(sql).then(resultado => {
            db.close();
            req.Album = resultado[0];
            next();
        })
        .catch(err => {

            console.log("Error al recuperar el álbum de id " + idAlbum + " de la BBDD: " + err.message);
            db.close();
            next(err);

        });
};


/**
 * Función de autoload para cargar un álbum en la request.
 * También sirve para realizar un control de errores
 * @param req: Objeto request
 * @param res: Objeto response
 * @param next: Objeto next
 * @param idAlbum: Identificador del álbum
 */
exports.loadAlbumPublico = function(req, res, next, idAlbumPublico) {
    var sql = "SELECT * FROM albums WHERE ID=" + idAlbumPublico;
    console.log("load sql: " + sql);

    var db = new database.DatabaseMysql();

    db.query(sql).then(resultado => {
            db.close();
            req.AlbumPublico = resultado[0];
            next();
        })
        .catch(err => {

            db.close();
            console.log("Error al recuperar el álbum de id " + idAlbumPublico + " de la BBDD: " + err.message);
            next(err);

        });
};



/**
 * Alta de un álbum en base de datos
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.altaAlbum = function(req, res, next) {
    var nombre = req.body.nombre;
    var descripcion = req.body.descripcion;
    var publico = req.body.publico;
    var idUsuario = req.session.usuario.ID;
    var idPublico = (publico == "true") ? 1 : 0;

    var sql = "INSERT INTO albums(nombre,idUsuario,publico,descripcion) VALUES('" + nombre + "'," + idUsuario + "," +
        idPublico + ",'" + descripcion + "')";

    console.log("sql: " + sql);

    var db = new database.DatabaseMysql();
    db.query(sql).then(resultado => {
            db.close();
            httpUtil.devolverJSON(res, { status: 0, descStatus: "OK" });
        })
        .catch(err => {
            db.close();
            console.log("Error al dar de alta el álbum en bd: " + err.message);
            httpUtil.devolverJSON(res, { status: 1, descStatus: "Error al dar de alta el álbum en bd: " + err.message });

        });
};


/**
 * Permite editar la información básica de un álbum
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.updateAlbum = function(req, res, next) {

    var params = req.params;
    var idAlbum = params.idAlbum;
    var nombre = req.body.nombre;
    var descripcion = req.body.descripcion;
    var publico = req.body.publico;
    var idUsuario = req.session.usuario.ID;
    var idPublico = (publico == "true") ? 1 : 0;

    var sql = "UPDATE albums SET nombre='" + nombre + "',descripcion='" + descripcion + "',fechaModificacion=now(),publico=" + idPublico +
        ",idUsuarioMod=" + idUsuario + " WHERE id=" + idAlbum;

    console.log("sql: " + sql);


    var db = new database.DatabaseMysql();
    db.query(sql).then(resultado => {
            console.log("result: " + JSON.stringify(resultado));
            db.close();
            httpUtil.devolverJSON(res, { status: 0, descStatus: "OK" });
        })
        .catch(err => {
            db.close();
            console.log("Error al editar un álbum fotográfico: " + err.message);
            httpUtil.devolverJSON(res, { status: 1, descStatus: "Error al editar el álbum: " + err.message });

        });
};



/**
 * Recupera los álbumes de un determinado usuario para proceder a su administración
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.renderScreenAlbumesAdministracion = function(req, res, next) {
    var user = req.session.usuario;

    var sql = "SELECT ID,NOMBRE,DESCRIPCION,PUBLICO,DATE_FORMAT(FECHAALTA,'%d/%m/%Y %T') AS FECHAALTA FROM albums WHERE IDUSUARIO=" + user.ID +
        " ORDER BY FECHAALTA DESC";

    console.log("sql: " + sql);

    var db = new database.DatabaseMysql();

    db.query(sql).then(resultados => {
            console.log("result: " + JSON.stringify(resultados));
            db.close();
            res.render("album/albumAdmin", { albumes: resultados });
        })
        .catch(err => {
            db.close();
            console.log("Se ha producido un error al recuperar las fotos de la BBDD: " + err.message);

        });

};



/**
 * Recupera los álbumes fotográficos pertenecientes a un determinado usuarios. Recibe la petición por AJAX y Devuelve
 * el resultado al formato más adecuado para mostrarlo en un datatable de JQuery
 * @param req Objeto Request
 * @param res Objeto Response
 * @param req Objeto next
 */
exports.getAlbumesAdministracion = function(req, res, next) {
    var user = req.session.usuario;

    var columnas = ['ID', 'NOMBRE', 'DESCRIPCION', 'PUBLICO', 'FECHAALTA'];
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


    var sqlAlbums = "SELECT ID,NOMBRE,DESCRIPCION,PUBLICO,DATE_FORMAT(FECHAALTA,'%d/%m/%Y %T') AS FECHAALTA FROM albums WHERE IDUSUARIO=" + user.ID
    if (search != undefined && search.value.length > 0) {
        var valor = search.value;
        sqlAlbums = sqlAlbums + " AND (ID LIKE ('%" + valor + "%') OR NOMBRE LIKE('%" + valor + "%') OR DESCRIPCION LIKE ('%" + valor + "%') OR FECHAALTA LIKE ('%" + valor + "%'))";
    }

    var orderBy = " ORDER BY FECHAALTA DESC";
    if (idColumnOrden != undefined && tipoOrden != undefined) {
        orderBy = " ORDER BY " + columnas[idColumnOrden] + " " + tipoOrden;
    }

    sqlAlbums = sqlAlbums + orderBy;
    sqlAlbums = sqlAlbums + " LIMIT " + limit + " OFFSET " + start;
    console.log("sqlAlbums: " + sqlAlbums);


    var sqlNumTotal = "SELECT COUNT(*) AS NUM FROM albums WHERE IDUSUARIO=" + user.ID;
    var db = new database.DatabaseMysql();


    var listadoFinal = new Array();
    db.query(sqlAlbums).then(albumes => {
        console.log("1- albumes: " + JSON.stringify(albumes));

        if (albumes != null && albumes != undefined) {

            /** Se devuelve los resultados de la BBDD en un array para que
                pueda ser mostrado en un datatable de JQuery correctamente */
            for (var i = 0; albumes != undefined && i < albumes.length; i++) {
                var aux = [];
                aux.push(albumes[i].ID);
                aux.push(albumes[i].NOMBRE);
                aux.push(albumes[i].DESCRIPCION);
                aux.push(albumes[i].PUBLICO);
                aux.push(albumes[i].FECHAALTA);
                listadoFinal.push(aux);
            };

            return db.query(sqlNumTotal);
        } // if

    }).then(resultado => {
        console.log("2- resultado: " + JSON.stringify(resultado));

        db.close();

        if (resultado != null && resultado != undefined && resultado[0] != undefined) {

            var numTotal = resultado[0].NUM;
            var salida = {
                'recordsTotal': numTotal,
                'recordsFiltered': numTotal,
                'data': listadoFinal
            }
            httpUtil.devolverJSON(res, salida);

        }
    }).catch(err => {
        console.log("Error al recuperar listado álbumes: " + err.message);

    });
}


/**
 * Elimina un determinado álbum de la base de datos. Se comprueba además que el propietario
 * del álbum sea del usuario que está realizando la petición
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 * @return Respuesta en formato JSON
 */
exports.deleteAlbumTransactional = function(req, res, next) {
    var user = req.session.usuario;
    var idAlbum = req.Album.id;
    var db = new database.DatabaseMysql();

    db.beginTransaction().then(correcto => {
            console.log("beginTransaction: " + JSON.stringify(correcto));
            if (correcto != null && correcto != undefined) {
                // Se ha iniciado la transacción
                var sql = "DELETE FROM albums WHERE ID=" + idAlbum + " AND IDUSUARIO=" + user.ID;
                return db.query(sql);
            }

        }).then(resultado => {
            console.log("borrar albums: " + JSON.stringify(resultado));
            if (resultado != null && resultado.affectedRows == 1) {

                // Si se ha eliminado el álbum de BBDD, se procede a eliminarlo también del disco

                var dirPathAlbum = __dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + configUpload.path_upload_photo +
                    +user.ID + constantes.FILE_SEPARATOR + idAlbum;

                var directorioUsuario = __dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + configUpload.path_upload_photo + user.ID;

                console.log("dirPathAlbum: " + dirPathAlbum);
                console.log("directorioUsuario: " + directorioUsuario);

                try {
                    fileUtil.deleteFolderRecursive(dirPathAlbum);
                    console.log("album borrado en BBDD y disco correctamente");

                    if (!fileUtil.directoryHasContent(directorioUsuario)) {
                        // Si el directorio del usuario no tiene otros álbumes o ficheros, 
                        // se elimina el directorio para que no permanezca vacío en el disco
                        fileUtil.deleteFolderRecursive(directorioUsuario);
                    }

                    db.commitTransaction().then(res => {
                        db.close();
                        console.log("rollback transaccion: " + JSON.stringify(res));
                        httpUtil.devolverJSON(res, { status: 0, descStatus: "OK" });
                    }).catch(err => {
                        console.log("error commit transaccion: " + err.message);
                        db.close();
                        httpUtil.devolverJSON(res, { status: 0, descStatus: "OK" });
                    });


                } catch (err) {

                    db.rollbackTransaction().then(res => {
                        db.close();
                        console.log("rollback transaccion: " + JSON.stringify(res));
                        httpUtil.devolverJSON(res, { status: 4, descStatus: "Error al eliminar álbum del disco: " + err.message });
                    }).catch(err => {
                        db.close();
                        console.log("ERROR rollback transaccion: " + err.message);
                        httpUtil.devolverJSON(res, { status: 4, descStatus: "Error al eliminar álbum del disco: " + err.message });
                    });
                }

            }

        })
        .catch(err => {

            console.log("Error general: " + err.message);
            conexion.end();
            httpUtil.devolverJSON(res, { status: 2, descStatus: "Error al iniciar transacción a BBDD: " + err.message });
        });


};




/**
 * Recupera las imágenes de un determinado álbum de la base de datos y pasa el control
 * a la vista que renderiza el resultado
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.getImagesFromAlbum = function(req, res, next) {

    var sql = "SELECT ID,NOMBRE,RUTA,RUTAMINIATURA,ALTO,ANCHO,TIPOMIME,DATE_FORMAT(FECHAALTA,'%d/%m/%Y %T') AS FECHAALTA,PUBLICO,NUMEROVISUALIZACIONES " +
        "FROM foto WHERE IDALBUM=" + req.Album.id;
    console.log("sql: " + sql);


    var db = new database.DatabaseMysql();

    db.query(sql).then(fotos => {
        db.close();
        res.render("album/albumPhotos", { errors: [], fotos: fotos, album: req.Album });
    }).catch(err => {
        db.close();
        console.log("Se ha producido un error al recuperar las fotos de la BBDD: " + err.message);
        res.render("album/albumPhotos", { errors: [err], album: {} });
    });

};



/**
 * Recupera los álbumes públicos de los usuarios, para que puedan ser listados en la
 * parte pública de la aplicación
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.getAlbumesPublicos = function(req, res, next) {
    var user = req.session.usuario;

    var db = new database.DatabaseMysql();


    var sql = "SELECT albums.ID AS ID,albums.NOMBRE AS NOMBRE,albums.DESCRIPCION AS DESCRIPCION,PUBLICO,DATE_FORMAT(FECHAALTA,'%d/%m/%Y %T') AS FECHAALTA, " +
        "Users.NOMBRE AS NOMBREUSUARIO,Users.APELLIDO1 AS APELLIDO1 " +
        " FROM albums,Users " +
        " WHERE PUBLICO=1 AND albums.IDUSUARIO = Users.ID" +
        " ORDER BY FECHAALTA DESC";

    db.query(sql).then(resultados => {
        db.close();
        console.log("resultados " + JSON.stringify(resultados));
        res.render("album/albumPublic", { albumes: resultados })

    }).
    catch(err => {
        db.close();
        console.log("Se ha producido un error al recuperar las fotos de la BBDD: " + err.message);
    });
};


/**
 * Recupera las imágenes públicas de un determinado álbum de la base de datos, y se
 * pasa el control a la vista que renderiza el resultado
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.getImagesFromAlbumPublico = function(req, res, next) {

    console.log(" getImagesFromAlbumPublico url original: " + req.originalUrl);

    var sql = "SELECT ID,NOMBRE,RUTA,RUTAMINIATURA,ALTO,ANCHO,TIPOMIME,DATE_FORMAT(FECHAALTA,'%d/%m/%Y %T') AS FECHAALTA,NUMEROVISUALIZACIONES " +
        "FROM foto WHERE PUBLICO=1 AND IDALBUM=" + req.AlbumPublico.id;
    console.log("sql: " + sql);

    var db = new database.DatabaseMysql();

    db.query(sql).then(fotos => {
        db.close();
        res.render("album/albumPhotosPublic", { errors: [], fotos: fotos, album: req.AlbumPublico });

    }).
    catch(err => {
        db.close();
        console.log("Se ha producido un error al recuperar las fotos de la BBDD: " + err.message);
        res.render("album/albumPhotosPublic", { errors: [err], album: {} });
    });


};