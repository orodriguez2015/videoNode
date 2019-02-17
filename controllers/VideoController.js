var httpUtil = require('../util/HttpResponseUtil.js');
var path = require('path');
var fileUtil = require('../util/FileUtils.js');
var constantes = require('../config/constantes.json');
var config = fileUtil.getContentConfigBBDDFile();
var database = require('../db/DatabaseMysql.js');

/**
 * Renderiza la pantalla que muestra un listado de los vídeos
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.showVideos = function(req,res,next) {
    var videoteca = req.Videoteca;
    res.render("videos/videos",{videoteca:videoteca,errors:{}});
};


/**
 * Renderiza la pantalla que muestra un listado de los vídeos
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.showVideotecas = function(req,res,next) {
    res.render("videos/videotecas");
};

/**
 * Renderiza la pantalla que muestra la pantalla de alta de una videoteca
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.nuevaVideoteca = function(req,res,next) {
    res.render("videos/nuevaVideoteca");
};



/**
 * Renderiza la pantalla de edición de una determinada videoteca
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.edicionVideoteca = function(req,res,next) {
    var videoteca = req.Videoteca;
    res.render("videos/editarVideoteca",{videoteca:videoteca,errors:{}});
};


/**
 * Función de autoload para cargar un álbum en la request.
 * También sirve para realizar un control de errores
 * @param req: Objeto request
 * @param res: Objeto response
 * @param next: Objeto next
 * @param idAlbum: Identificador del álbum
 */
exports.load = function(req, res, next, idVideoteca) {
    var idUsuario = req.session.usuario.ID;
    var db = new database.DatabaseMysql();

    var sql = "select * from videoteca where id=" + idVideoteca + " and idUsuario=" + idUsuario;
    console.log("load sql: " + sql);

    db.query(sql).then(resultado => {
        db.close();
        req.Videoteca = resultado[0];
        next();
    })
    .catch(err => {
        console.log("Error al recuperar la videoteca de id " + idVideoteca + " de la BBDD: " + err.message);
        db.close();
        next(err);
    });
};


/**
 * Comprueba que exista la ruta Almacena una videoteca en base de datos
 * @param {request} req
 * @param {response} res
 * @param {next} next
 *
exports.comprobarRutaVideoteca = function(req,res,next) {
    var carpeta = req.body.carpeta;
    var idUsuario = req.session.usuario.ID;
    var resultado = {
        status: 0,
        descStatus: "OK"
    };

    console.log("comprobarRutaVideoteca");
    console.log("idUsuario: " + idUsuario + ", carpeta: " + carpeta);


    if(carpeta==null || carpeta==undefined) {
        resultado.status = 2;
        resultado.descStatus = "Es necesario indicar una ruta en la que alojar los vídeos";
    }else {
        console.log("dirActual: " + __dirname);

        var rutaCompleta = path.join(__dirname, constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR 
            + constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO  + 
            constantes.FILE_SEPARATOR + idUsuario + constantes.FILE_SEPARATOR + carpeta);
        
            console.log("rutaCompleta: " + rutaCompleta);

        if(!fileUtil.existsFile(rutaCompleta)) {
            console.log("No existe el archivo " + rutaCompleta);
            resultado.status = 0;
            resultado.descStatus = "No existe la carpeta de usuario";

           // fileUtil.mkdirSync(rutaCompleta);
            console.log("se ha creado la carpeta : " + rutaCompleta);
        } else {
            console.log("Existe la carpeta: " + rutaCompleta);
            resultado.status = 1;
            resultado.descStatus = "Existe la carpeta de usuario. Se debe seleccionar otra";
        }
    }

    // Se devuelve la respuesta en formato JSON
    httpUtil.devolverJSON(res,resultado);
};
*/



/**
 * Comprueba que exista la ruta Almacena una videoteca en base de datos
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.comprobarRutaVideoteca = function(req,res,next) {
    var carpeta = req.body.carpeta;
    var idUsuario = req.session.usuario.ID;
    var db = new database.DatabaseMysql();
    var resultado = {
        status: 0,
        descStatus: "OK"
    };

    console.log("comprobarRutaVideoteca carpeta = " + carpeta);

    if(carpeta==null || carpeta==undefined) {
        resultado.status = 2;
        resultado.descStatus = "Es necesario indicar una ruta en la que alojar los vídeos";
        // Se devuelve la respuesta en formato JSON
        httpUtil.devolverJSON(res,resultado);
    }else {
        
        var DIRECTORIO_VIDEO = constantes.DIRECTORIO_VIDEO;
        console.log("comprobarRutaVideoteca DIRECTORIO_VIDEO = " + DIRECTORIO_VIDEO);

        var CARPETA_VIDEOS = path.join(__dirname, constantes.FILE_SEPARATOR + ".." + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR 
        + constantes.DIRECTORIO_VIDEO + constantes.FILE_SEPARATOR + idUsuario +  constantes.FILE_SEPARATOR+ carpeta);

        console.log("comprobarRutaVideoteca CARPETA_VIDEOS = " + CARPETA_VIDEOS);

        if(!fileUtil.existsFile(CARPETA_VIDEOS)) {
            console.log("No existe el directorio " + carpeta + " en el servidor");
            resultado.status = 3 ;
            resultado.descStatus = "No existe el directorio en el servidor";
            // Se devuelve la respuesta en formato JSON
            httpUtil.devolverJSON(res,resultado);

        } else {
            /**
             * Existe el directorio => Se comprueba si pertenece a la videoteca de otro usuario
             */
            var sql = "SELECT COUNT(*) AS NUM FROM VIDEOTECA WHERE RUTA ='" + CARPETA_VIDEOS + "'";
            console.log(sql);

            db.query(sql).then(numero=>{

                db.close();

                if(numero!=undefined && numero.length>=1 && numero[0].NUM>=1) {
                    resultado.status = 1;
                    resultado.descStatus = "El directorio está asociado a otra videoteca"; 
                    // Se devuelve la respuesta en formato JSON
                    httpUtil.devolverJSON(res,resultado);

                } else {
                    resultado.status = 0;
                    resultado.descStatus = "OK"; 
                    // Se devuelve la respuesta en formato JSON
                    httpUtil.devolverJSON(res,resultado);
                }

            }).catch(err=>{
                db.close();
                console.log("Error al comprobar existencia de directorio videos de usuario en BBDD: " + err.message);
                resultado.status = 2;
                resultado.descStatus = "Error al comprobar existencia de directorio videos de usuario en BBDD: " + err.message;
                // Se devuelve la respuesta en formato JSON
                httpUtil.devolverJSON(res,resultado);

            });
        }
    }

   
};

/**
 * Almacena una videoteca en base de datos
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.saveVideoteca = function(req,res,next) {
    var db = new database.DatabaseMysql();
    var nombre = req.body.nombre;
    var carpeta = req.body.carpeta;
    var publico = req.body.publico;
    var idUsuario = req.session.usuario.ID;

    console.log("publico: " + publico);

    if(nombre!=undefined && carpeta!=undefined && nombre!='' && carpeta!='') {

        var rutaDirectorioVideosPadre = path.join(__dirname, constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR 
            + constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO  + 
            constantes.FILE_SEPARATOR + idUsuario);

        var rutaDirectorioVideoteca = path.join(__dirname, constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR 
            + constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO  + 
            constantes.FILE_SEPARATOR + idUsuario + constantes.FILE_SEPARATOR + carpeta);

        console.log("rutaDirectorioVideosPadre = " + rutaDirectorioVideosPadre);
        console.log("rutaDirectorioVideoteca = " + rutaDirectorioVideoteca);

        if(!fileUtil.existsFile(rutaDirectorioVideosPadre)) {
            console.log("No existe directorio: " + rutaDirectorioVideosPadre + ", se crea");
            // Se crea el directorio padre
            fileUtil.mkdirSync(rutaDirectorioVideosPadre);
            fileUtil.mkdirSync(rutaDirectorioVideoteca);
        }else {

            console.log("Existe directorio: " + rutaDirectorioVideosPadre);

            if(!fileUtil.existsFile(rutaDirectorioVideoteca)) {
                console.log("No existe directorio: " + rutaDirectorioVideoteca + ", se crea");
                // Se crea el directorio padre
                fileUtil.mkdirSync(rutaDirectorioVideoteca);
            }
        }


        var sql = "INSERT INTO VIDEOTECA(nombre,ruta,idUsuario,publico) VALUES ('" + nombre + "','" + rutaDirectorioVideoteca + "'," + idUsuario + "," + publico +  ")";
        console.log("sql: " + sql);
        db.query(sql).then(resultado =>{
    
            var resultado = {
                status: 0, descStatus: 'OK'
            };

            httpUtil.devolverJSON(res,resultado);

        }) .catch(err => {
            console.log('Error al insertar videoteca: ' + err.message);

            var resultado = {
                status: 1, descStatus: 'Error al insertar videoteca: ' + err.message
            };

            httpUtil.devolverJSON(res,resultado);

        });
    }
    
};



/**
 * Recupera los videotecas de un determinado usuario. Recibe la petición por AJAX y Devuelve
 * el resultado al formato más adecuado para mostrarlo en un datatable de JQuery
 * @param req Objeto Request
 * @param res Objeto Response
 * @param req Objeto next
 */
exports.getVideotecasAdministracion = function(req, res, next) {
    var user = req.session.usuario;

    var columnas = ['id', 'nombre', 'ruta', 'publico', 'fechaAlta'];
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

    /*
     * Se recuperan las videotecas del usuario
     */
    var sqlAlbums = "select id,nombre,ruta,publico,DATE_FORMAT(fechaAlta,'%d/%m/%Y %T') as fechaAlta from videoteca where idUsuario=" + user.ID
    if (search != undefined && search.value.length > 0) {
        var valor = search.value;
        sqlAlbums = sqlAlbums + " and (id like ('%" + valor + "%') or nombre like('%" + valor + "%') or ruta like ('%" + valor + "%') or fechaAlta like ('%" + valor + "%'))";
    }

    var orderBy = " order by fechaAlta desc";
    if (idColumnOrden != undefined && tipoOrden != undefined) {
        orderBy = " ORDER BY " + columnas[idColumnOrden] + " " + tipoOrden;
    }

    sqlAlbums = sqlAlbums + orderBy;
    sqlAlbums = sqlAlbums + " limit " + limit + " offset " + start;
    console.log("sqlAlbums: " + sqlAlbums);


    /*
     * Se cuenta el número total de videotecas del usuario
     */
    var sqlNumTotal = "select count(*) as num from videoteca where idUsuario=" + user.ID;
    var db = new database.DatabaseMysql();


    var listadoFinal = new Array();
    db.query(sqlAlbums).then(albumes => {
        console.log("1- albumes: " + JSON.stringify(albumes));

        if (albumes != null && albumes != undefined) {

            /** Se devuelve los resultados de la BBDD en un array para que
                pueda ser mostrado en un datatable de JQuery correctamente */
            for (var i = 0; albumes != undefined && i < albumes.length; i++) {
                var aux = [];
                aux.push(albumes[i].id);
                aux.push(albumes[i].nombre);
                aux.push(albumes[i].ruta);
                aux.push(albumes[i].publico);
                aux.push(albumes[i].fechaAlta);
                listadoFinal.push(aux);
            };

            return db.query(sqlNumTotal);
        } // if

    }).then(resultado => {
        console.log("2- resultado: " + JSON.stringify(resultado));

        db.close();

        if (resultado != null && resultado != undefined && resultado[0] != undefined) {

            var numTotal = resultado[0].num;
            var salida = {
                'recordsTotal': numTotal,
                'recordsFiltered': numTotal,
                'data': listadoFinal
            }
            httpUtil.devolverJSON(res, salida);

        }
    }).catch(err => {
        console.log("Error al recuperar listado de videotecas: " + err.message);

    });
}




/**
 * Elimina una determinada videoteca de la base de datos y del disco
 * @param req Objeto Request
 * @param res Objeto Response
 * @param req Objeto next
 */
exports.deleteVideoteca = function(req, res, next) {
    var db = new database.DatabaseMysql();
    var videoteca = req.Videoteca;
    var resultado = {};

    console.log("deleteVideoteca init");

    console.log("deleteVideoteca idVideoteca = " + videoteca.id);

    // Se abre transacción
    db.beginTransaction().then(correcto=>{
        var ruta = videoteca.ruta;
        console.log("Ruta videoteca a borrar en disco: " + ruta);

       /*
        * Se cuenta el número total de videotecas del usuario
        */
        var sql = "DELETE FROM VIDEOTECA WHERE ID=" + videoteca.id;
        console.log("sql =" + sql);

        db.query(sql).then(consulta => {
           console.log("Videoteca " + videoteca.id + " eliminada de bbdd");

           console.log("Se procede a borrar los videos de la ruta = " + ruta);
           /*
            * Se procede a borrar la carpeta de la videoteca de forma recursiva
            */
           fileUtil.deleteFolderRecursive(ruta);

           console.log("Videoteca borrada de disco");
        
           db.commitTransaction().then(correcto =>{
                db.close();
                resultado.status= 0;
                resultado.descStatus = "OK";
                httpUtil.devolverJSON(res,resultado);

            }).catch(err => {
                console.log("Error al confirmar transacción de borrado de videoteca: " + err.message);

                db.rollbackTransaction().then(correcto =>{
                    db.close();
                    resultado.status= 2;
                    resultado.descStatus = "Error al confirmar transacción";
                    httpUtil.devolverJSON(res, resultado);
                });
            });;
            
        }).catch(error=> {
            console.log("Error al eliminar videoteca de id = " + videoteca.id + " de BBDD: " + error.message);

            db.rollbackTransaction().then(correcto =>{
                db.close();

                resultado.status= 3;
                resultado.descStatus = "Error al eliminar videoteca de id = " + videoteca.id + " de bbdd: " + error.message;
                httpUtil.devolverJSON(res,resultado);
                
            });           
        });

    }).catch(err=>{
        console.log("Error al abrir transacción para borrar una videoteca: " + err.message);

        resultado.status= 1;
        resultado.descStatus = "Error al abrir transacción para borrar una videoteca: " + err.message;
        httpUtil.devolverJSON(res,resultado);
    });

};

