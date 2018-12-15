var httpUtil = require('../util/HttpResponseUtil.js');
var config_upload = require('../config/config_upload.json');
var constantes = require('../config/constantes.json');
var fileUtil = require('../util/FileUtils.js');
var path = require('path');
var database = require('../db/DatabaseMysql.js');

/**
 * Carga en la request una determinada fotografía
 * @param req: Objeto request
 * @param res: Objeto response
 * @param next: Objeto next
 * @param idPhoto: Identificador de la fotografía
 */
exports.load = function(req, res, next, idPhoto) {

    var db = new database.DatabaseMysql();
    var sql = "select id,nombre,ruta,alto,ancho,tipomime,idAlbum,numeroVisualizaciones from foto  where id=" + idPhoto;

    db.query(sql).then(foto => {

        console.log("load() foto: " + JSON.stringify(foto))
        db.close();
        req.Foto = foto[0];
        next();

    }).catch(err => {
        db.close();
        console.log("Se ha producido un error al cargar al recuperar la fotografía de id " + idPhoto + " de la BBDD: " + err.message);
        next(err);
    });

};


/**
 * Borra una determinada fotografía de un álbum y de la ruta en disco en el que se 
 * encuentra almacenado
 * @param req: Objeto request
 * @param res: Objeto response
 * @param next: Objeto next
 * @param idPhoto: Identificador de la fotografía
 */
exports.deletePhoto = function(req, res, next) {
    var foto = req.Foto;
    var user = req.session.usuario;

    var db = new database.DatabaseMysql();

    try {
        if (foto != undefined && user != undefined) {
            // Se procede a eliminar la foto de disco
            var path = __dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + config_upload.path_upload_photo + user.ID + constantes.FILE_SEPARATOR + foto.idAlbum + constantes.FILE_SEPARATOR + foto.nombre;
            console.log("path: " + path);

            if (!fileUtil.existsFile(path)) {
                console.log("No existe la fotografia a eliminar en el path: " + path);
                httpUtil.devolverJSON(res, { status: 1, descStatus: "No existe la fotografia a eliminar en el path: " + path });
            } else {

                if (fileUtil.deleteFile(path) != 0) {
                    console.log("Se ha producido un error al eliminar la fotografia del disco en el path: " + path);
                    httpUtil.devolverJSON(res, { status: 2, descStatus: "Se ha producido un error al eliminar la fotografia del disco en el path: " + path });
                } else {

                    // Se procede a eliminar el archivo de base de datos
                    var sql = "delete from foto where id=" + foto.id;
                    console.log(sql);

                    db.query(sql).then(foto => {
                        db.close();
                        console.log("Se ha eliminado la fotografía");
                        httpUtil.devolverJSON(res, { status: 0, descStatus: "Fotografía eliminada" });

                    }).catch(err => {
                        db.close();
                        console.log("Se ha eliminado la fotografía");
                        httpUtil.devolverJSON(res, { status: 3, descStatus: "Se ha producido un error al eliminar la fotografia de la BBDD: " + err.message });
                    });

                } // else

            } // else
        }
    } catch (err) {
        console.log("Se ha producido un error técnico al eliminar una fotografía: " + err.message);
        httpUtil.devolverJSON(res, { status: 2, descStatus: "Se ha producido un error técnico al eliminar una fotografía: " + err.message });
    }

};




/**
 * Borra una fotografía de la base de datos y del disco. La fotografía tiene que estar
 * alojada dentro del directorio del usuario autenticado y dentro del álbum.
 * La operación tiene que ser transaccional
 * @param req: Objeto request
 * @param res: Objeto response
 * @param next: Objeto next
 */
exports.deletePhotoTransactional = function(req, res, next) {
    var foto = req.Foto;
    var user = req.session.usuario;
    var db = new database.DatabaseMysql();

    try {

        console.log("deleteFoto foto: " + JSON.stringify(foto) + ", user: " + JSON.stringify(user));


        if (foto != undefined && user != undefined) {


            db.beginTransaction().then(resultado => {

                console.log("beginTransaction.resultado: " + JSON.stringify(resultado));

                var sql = "delete from foto where id=" + foto.id;
                console.log(sql);
                return db.query(sql);

            }).then(results => {
                console.log("results: " + JSON.stringify(results));
                if (results != undefined && results != null && results.affectedRows == 1) {


                    // Se procede a eliminar la foto de disco
                    var path = __dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + config_upload.path_upload_photo + user.ID + constantes.FILE_SEPARATOR + foto.idAlbum + constantes.FILE_SEPARATOR + foto.nombre;
                    console.log("ruta foto servidor: " + path);

                    if (!fileUtil.existsFile(path)) {
                        /**
                         * No existe el fichero en disco => Se aborta la transacción para que no quede
                         * eliminada la fotografía en BBDD
                         */

                        db.rollbackTransaction().then(resultado => {
                            db.close();
                            console.log("No existe la fotografia a eliminar en el path: " + path);
                            httpUtil.devolverJSON(res, { status: 3, descStatus: "No existe la fotografia a eliminar en el path: " + path });
                        }).catch(err => {
                            db.close();
                            console.log("Error al realizar rollback: " + err.message);
                            console.log("No existe la fotografia a eliminar en el path: " + path);
                            httpUtil.devolverJSON(res, { status: 3, descStatus: "No existe la fotografia a eliminar en el path: " + path });
                        })

                    } else {

                        if (fileUtil.deleteFile(path) != 0) {
                            // Rollback contra la BBDD
                            db.rollbackTransaction().then(resultado => {
                                db.close();
                                console.log("Se ha producido un error al eliminar la fotografia del disco en el path: " + path);
                                httpUtil.devolverJSON(res, { status: 4, descStatus: "Se ha producido un error al eliminar la fotografia del disco en el path: " + path });

                            }).catch(err => {

                                db.close();
                                console.log("Error al realizar rollback: " + err.message);
                                console.log("Se ha producido un error al eliminar la fotografia del disco en el path: " + path);
                                httpUtil.devolverJSON(res, { status: 4, descStatus: "Se ha producido un error al eliminar la fotografia del disco en el path: " + path });
                            });
                        } else {

                            db.commitTransaction().then(results => {
                                console.log('Transacción completa');
                                db.close();
                                httpUtil.devolverJSON(res, { status: 0, descStatus: "OK" });
                            }).catch(err => {
                                console.log('Error al confirmar transacción');
                                db.rollbackTransaction();
                                db.close();
                                console.log('Transaction Complete.');

                            });
                        } // else

                    } // if results
                }

            }).catch(err => {
                console.log("Se ha producido un error: " + err.message);
                db.close();
                db.rollbackTransaction();
                httpUtil.devolverJSON(res, { status: 2, descStatus: "Se ha producido un error al eliminar la fotografia de la BBDD: " + err.message });

            });


        }

    } catch (err) {
        console.log("Error técnico: " + err.message);
        httpUtil.devolverJSON(res, { status: 6, descStatus: "Se ha producido un error técnico: " + err.getMessage() });
    }
};





/**
 * Borra un conjunto de fotografías de la base de datos y del disco. Las fotografías tiene que estar
 * alojada dentro del directorio del usuario autenticado y dentro del álbum.
 * La operación tiene que ser transaccional
 * @param req: Objeto request
 * @param res: Objeto response
 * @param next: Objeto next
 */
exports.deleteFotoMultipleTransaccional = function(req, res, next) {
    var seleccionados = req.seleccionados;
    var user = req.session.usuario;
    var db = new database.DatabaseMysql();

    try {

        console.log("deleteFotoMultipleTransaccional: " + JSON.stringify(seleccionados) + ", user: " + JSON.stringify(user));

        if (seleccionados != undefined && user != undefined) {

            db.beginTransaction().then(resultado => {

                console.log("beginTransaction.resultado: " + JSON.stringify(resultado));

                var sql = "delete from foto where id in (" +  ")";
                console.log(sql);
                return db.query(sql);

            }).then(results => {
                console.log("results: " + JSON.stringify(results));
                if (results != undefined && results != null && results.affectedRows == 1) {


                    // Se procede a eliminar la foto de disco
                    var path = __dirname + constantes.FILE_SEPARATOR + constantes.PARENT_DIR + config_upload.path_upload_photo + user.ID + constantes.FILE_SEPARATOR + foto.idAlbum + constantes.FILE_SEPARATOR + foto.nombre;
                    console.log("ruta foto servidor: " + path);

                    if (!fileUtil.existsFile(path)) {
                        /**
                         * No existe el fichero en disco => Se aborta la transacción para que no quede
                         * eliminada la fotografía en BBDD
                         */

                        db.rollbackTransaction().then(resultado => {
                            db.close();
                            console.log("No existe la fotografia a eliminar en el path: " + path);
                            httpUtil.devolverJSON(res, { status: 3, descStatus: "No existe la fotografia a eliminar en el path: " + path });
                        }).catch(err => {
                            db.close();
                            console.log("Error al realizar rollback: " + err.message);
                            console.log("No existe la fotografia a eliminar en el path: " + path);
                            httpUtil.devolverJSON(res, { status: 3, descStatus: "No existe la fotografia a eliminar en el path: " + path });
                        })

                    } else {

                        if (fileUtil.deleteFile(path) != 0) {
                            // Rollback contra la BBDD
                            db.rollbackTransaction().then(resultado => {
                                db.close();
                                console.log("Se ha producido un error al eliminar la fotografia del disco en el path: " + path);
                                httpUtil.devolverJSON(res, { status: 4, descStatus: "Se ha producido un error al eliminar la fotografia del disco en el path: " + path });

                            }).catch(err => {

                                db.close();
                                console.log("Error al realizar rollback: " + err.message);
                                console.log("Se ha producido un error al eliminar la fotografia del disco en el path: " + path);
                                httpUtil.devolverJSON(res, { status: 4, descStatus: "Se ha producido un error al eliminar la fotografia del disco en el path: " + path });
                            });
                        } else {

                            db.commitTransaction().then(results => {
                                console.log('Transacción completa');
                                db.close();
                                httpUtil.devolverJSON(res, { status: 0, descStatus: "OK" });
                            }).catch(err => {
                                console.log('Error al confirmar transacción');
                                db.rollbackTransaction();
                                db.close();
                                console.log('Transaction Complete.');

                            });
                        } // else

                    } // if results
                }

            }).catch(err => {
                console.log("Se ha producido un error: " + err.message);
                db.close();
                db.rollbackTransaction();
                httpUtil.devolverJSON(res, { status: 2, descStatus: "Se ha producido un error al eliminar la fotografia de la BBDD: " + err.message });

            });


        }

    } catch (err) {
        console.log("Error técnico: " + err.message);
        httpUtil.devolverJSON(res, { status: 6, descStatus: "Se ha producido un error técnico: " + err.getMessage() });
    }
};




/**
 * Permite indicar si una fotografía es o no pública
 * @param req: Objeto request
 * @param res: Objeto response
 * @param next: Objeto next
 */
exports.setPublishPhotoTransactional = function(req, res, next) {
    var foto = req.Foto;
    var user = req.session.usuario;
    var publico = req.body.publico;

    console.log("setPublishPhotoTransactional publico: " + publico);


    if (foto != undefined && user != undefined && publico != undefined) {
        var db = new database.DatabaseMysql();

        // Ruta de la imagen una vez modificada la visibilidad de la imagen
        var iPublico = 0;
        if (publico == "true") {
            iPublico = 1;
        }

        var sql = "UPDATE foto SET PUBLICO=" + iPublico + " WHERE ID=" + foto.id;
        console.log(sql);

        db.query(sql).then(results => {
            console.log('Se ha cambiado la visibilidad de la foto');
            db.close();
            httpUtil.devolverJSON(res, { status: 0, descStatus: "OK", idPhoto: foto.id, publico: iPublico });

        }).catch(err => {
            db.close();
            console.log("Se ha producido un error al establecer la visibilidad de la fotografía: " + err.message);
            httpUtil.devolverJSON(res, { status: 2, descStatus: "Se ha producido un error al establecer la visibilidad de la fotografía: " + err.message });
        });

    } // if


};


/**
 * Incrementar el contador de visualización de una fotografía. Se incrementa
 * cuando el usuario selecciona la fotografía para verla en su tamaño original
 * @param req Objeto request
 * @param res Objeto response
 * @param next Objeto next
 */
exports.incrementarContadorVisualizacion = function(req, res, next) {
    var foto = req.Foto;
    var idFoto = req.param.id;
    var db = new database.DatabaseMysql();

    console.log("incrementarContadorVisualizacion idFoto: " + foto.id);

    try {
        if (foto != undefined && foto.id != undefined) {
            // Se ha establecido conexión con la BBDD.
            // Se inicia transacción a la BBDD

            var numeroVisualizaciones = foto.numeroVisualizaciones + 1;

            var sql = "UPDATE FOTO SET NUMEROVISUALIZACIONES =" + numeroVisualizaciones + " WHERE ID = " + foto.id;
            console.log(sql);

            db.query(sql).then(results => {
                db.close();
                httpUtil.devolverJSON(res, { status: 0, descStatus: "OK", idFoto: foto.id, numero: numeroVisualizaciones });

            }).catch(err => {
                db.close();
                console.log("Se ha producido un error al incrementar contador visualizaciones de la foto " + foto.ID + " : " + err.message);
                httpUtil.devolverJSON(res, { status: 1, descStatus: "Se ha producido un error al incrementar contador visualizaciones de la foto " + foto.ID + " : " + err.message });

            });


        }
    } catch (err) {
        console.log("Error técnico: " + err.message);
        httpUtil.devolverJSON(res, { status: 4, descStatus: "Se ha producido un error técnico: " + err.getMessage() });
    }

};