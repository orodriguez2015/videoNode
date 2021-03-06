var httpUtil = require('../util/HttpResponseUtil.js');
var path = require('path');
var fileUtil = require('../util/FileUtils.js');
var constantes = require('../config/constantes.json');
var config = fileUtil.getContentConfigBBDDFile();
var database = require('../db/DatabaseMysql.js');
var stringUtil = require('../util/StringUtil.js');


/**
 * Renderiza la pantalla que muestra un listado de los vídeos
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.showVideos = function(req,res,next) {
    var videoteca = req.Videoteca;
    var db = new database.DatabaseMysql();

    if(videoteca!=null && videoteca!=undefined) {
        var sql = "select id,nombre,extension,ruta_relativa,publico from video where id_videoteca=" + videoteca.id;
        console.log(sql);

        db.query(sql).then(resultado => {
            db.close();
            res.render("videos/videos",{videos:resultado,videoteca:videoteca,errors:{}});
        })
        .catch(err => {
            console.log("Error al recuperar videos de la videoteca de id " + videoteca.id + ": " + err.message);
            db.close();
            next(err);
        });
    }   
};



/**
 * Renderiza la pantalla que muestra un listado de los vídeos públicos de una determinada videoteca
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.showVideosPublicos = function(req,res,next) {
    var videoteca = req.Videoteca;
    var db = new database.DatabaseMysql();

    if(videoteca!=null && videoteca!=undefined) {
        var sql = "select id,nombre,extension,ruta_relativa,publico from video where publico=1 and id_videoteca=" + videoteca.id;
        console.log(sql);

        db.query(sql).then(resultado => {
            db.close();
            res.render("videos/videosPublicos",{videos:resultado,videoteca:videoteca,errors:{}});
        })
        .catch(err => {
            console.log("Error al recuperar videos publicos de la videoteca de id " + videoteca.id + ": " + err.message);
            db.close();
            next(err);
        });
    }   
};

/**
 * Renderiza la pantalla que muestra un listado de los videotecas públicas
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.showVideotecasPublicas = function(req,res,next) {    
    var db = new database.DatabaseMysql();
    
    var sql = "select v.id,v.nombre,v.ruta,v.ruta_completa,v.idUsuario,DATE_FORMAT(v.fechaAlta,'%d/%m/%Y %T') as fechaAlta,u.nombre as nombreUsuario,u.apellido1 as apellidoUsuario1 " + 
              "from videoteca v inner join Users u on (v.idUsuario = u.id) " + 
              "where publico=1";

    console.log(sql);

    db.query(sql).then(resultado => {
        db.close();
        res.render("videos/videotecasPublicas",{videotecas:resultado,errors:{}});
    })
    .catch(err => {
        console.log("Error al recuperar videoteca publicas: " + videoteca.id + ": " + err.message);
        db.close();
        next(err);
    });
    
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
 * Renderiza la vista de selección de imágenes para el nuevo albúm fotográfico
 * @param req: Objeto Request
 * @param res: Objeto Response
 * @param req: Objeto next
 */
exports.uploadVideoScreen = function(req, res, next) {
    var videoteca = req.Videoteca;    
    res.render("videos/uploadVideos",{videoteca:videoteca,errors:{}});
};


/**
 * Función de autoload para cargar un álbum en la request.
 * También sirve para realizar un control de errores
 * @param req: Objeto request
 * @param res: Objeto response
 * @param next: Objeto next
 * @param idVideoteca: Id de la videoteca
 */
exports.load = function(req, res, next, idVideoteca) { 
    var db = new database.DatabaseMysql();
    var sql = "select * from videoteca where id=" + idVideoteca;
    console.log("load sql: " + sql);

    db.query(sql).then(resultado => {
        db.close();
        var dato = resultado[0];
        req.Videoteca = dato;
        next();
    })
    .catch(err => {
        console.log("Error al recuperar la videoteca de id " + idVideoteca + " de la BBDD: " + err.message);
        db.close();
        next(err);
    });
};


/**
 * Función de autoload para cargar un vídeo en la request.
 * @param req: Objeto request
 * @param res: Objeto response
 * @param next: Objeto next
 * @param idVideo: Id del vídeo
 */
exports.loadVideo = function(req, res, next, idVideo) {
    var idUsuario = req.session.usuario.ID;
    var db = new database.DatabaseMysql();

    var sql = "select * from video where id=" + idVideo + " and id_usuario=" + idUsuario;
    console.log("loadVideo sql: " + sql);

    db.query(sql).then(resultado => {
        db.close();
        var dato = resultado[0];
        req.Video = dato;
        next();
    })
    .catch(err => {
        console.log("Error al recuperar el vídeo de id " + idVideo + " de la BBDD: " + err.message);
        db.close();
        next(err);
    });
};



/**
 * Comprueba si existe una videoteca del usuario asociado a una videoteca ya existenteAlmacena una videoteca en base de datos
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
            var sql = "select count(*) as num from videoteca where ruta='" + carpeta + "'";
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
 * Comprueba si existe una videoteca del usuario con una determinada ruta asociada y que no tenga un
 * determinado idVideoteca
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.comprobarRutaOtraVideotecaUsuario = function(req,res,next) {
    var idVideoteca = req.body.idVideoteca;
    var carpeta = req.body.carpeta; 
    var idUsuario = req.session.usuario.ID;
    var db = new database.DatabaseMysql();
    var resultado = {
        status: 0,
        descStatus: "OK"
    };

    console.log("comprobarRutaOtraVideoteca idUsuario = " + idUsuario);
    console.log("comprobarRutaOtraVideoteca idVideoteca = " + idVideoteca);
    console.log("comprobarRutaOtraVideoteca carpeta = " + carpeta);

    if(carpeta==null || carpeta==undefined || idVideoteca==null || idVideoteca==undefined) {
        resultado.status = 2;
        resultado.descStatus = "Es necesario indicar la carpeta y el idVideoteca en la que alojar los vídeos";
        // Se devuelve la respuesta en formato JSON
        httpUtil.devolverJSON(res,resultado);
    }else {
        
            /**
             * Existe el directorio => Se comprueba si pertenece a la videoteca de otro usuario
             */
            var sql = "select count(*) as num from videoteca where ruta ='" + carpeta + "' and id!=" + idVideoteca;
            console.log(sql);

            db.query(sql).then(numero=>{

                db.close();

                if(numero!=undefined && numero.length>=1 && numero[0].NUM>=1) {
                    resultado.status = 1;
                    resultado.descStatus = "La carpeta está asociado a otra videoteca del usuario"; 
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
                console.log("Error al comprobar existencia de la carpeta de videoteca de usuario en BBDD: " + err.message);
                resultado.status = 3;
                resultado.descStatus = "Error al comprobar existencia de la carpeta de videoteca de usuario en BBDD: " + err.message;
                // Se devuelve la respuesta en formato JSON
                httpUtil.devolverJSON(res,resultado);

            });
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

        var rutaDirectorioVideos = path.join(__dirname, constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR 
            + constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO);

        var rutaDirectorioVideosPadre = path.join(__dirname, constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR 
            + constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO  + 
            constantes.FILE_SEPARATOR + idUsuario);

        var rutaDirectorioVideoteca = path.join(__dirname, constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR 
            + constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO  + 
            constantes.FILE_SEPARATOR + idUsuario + constantes.FILE_SEPARATOR + carpeta);

        console.log("rutaDirectorioVideos = " + rutaDirectorioVideos);
        console.log("rutaDirectorioVideosPadre = " + rutaDirectorioVideosPadre);
        console.log("rutaDirectorioVideoteca = " + rutaDirectorioVideoteca);


        if(!fileUtil.existsFile(rutaDirectorioVideos)) {

            console.log("No existe directorio: " + rutaDirectorioVideosPadre + ", se crea");
            // Se crea el directorio padre
            fileUtil.mkdirSync(rutaDirectorioVideos);
            fileUtil.mkdirSync(rutaDirectorioVideosPadre);
            fileUtil.mkdirSync(rutaDirectorioVideoteca);

        }else
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


        var sql = "INSERT INTO videoteca(nombre,ruta,ruta_completa,idUsuario,publico) VALUES ('" + nombre + "','" + carpeta + "','" +  rutaDirectorioVideoteca + "'," + idUsuario + "," + publico +  ")";
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

    console.log("deleteVideoteca idVideoteca = " + videoteca.id);

    // Se abre transacción
    db.beginTransaction().then(correcto=>{
        
       /*
        * Se cuenta el número total de videotecas del usuario
        */
        var sql = "delete from videoteca where id=" + videoteca.id;
        console.log("sql =" + sql);

        db.query(sql).then(consulta => {
           console.log("Videoteca " + videoteca.id + " eliminada de bbdd");

           console.log("Se procede a borrar los videos de la ruta = " + videoteca.ruta_completa);
           /*
            * Se procede a borrar la carpeta de la videoteca de forma recursiva
            */
           fileUtil.deleteFolderRecursive(videoteca.ruta_completa);

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
}




/**
 * Almacena una videoteca en base de datos
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.editarVideoteca = function(req,res,next) {
    var db = new database.DatabaseMysql();
    var idVideoteca = req.body.idVideoteca;
    var nombre = req.body.nombre;
    var carpeta = req.body.carpeta;
    var publico = req.body.publico;
    var idUsuario = req.session.usuario.ID;
    var videoteca = req.Videoteca;


    console.log("editarVideoteca nombre =  " + nombre + ", carpeta = " + carpeta + ", publico = " + publico + ",idUsuario = " + idUsuario);
    console.log("editarVideoteca idVideoteca =  " + videoteca.id);

    console.log("publico: " + publico);

    if(nombre!=undefined && carpeta!=undefined && nombre!='' && carpeta!='') {

        var cambioCarpeta  = false;
        if(carpeta!=videoteca.ruta) {
            cambioCarpeta = true;
        }

        console.log("carpeta videoteca=  " + carpeta);
        console.log("videoteca.ruta = " + videoteca.ruta);
        console.log("cambioCarpeta = " + cambioCarpeta);

        var ruta_nueva = '';
        var ruta_relativa_nueva = '';
        var ruta_original = videoteca.ruta_completa;
        console.log("ruta_original = " + ruta_original);

        var sql = "update videoteca set nombre='" + nombre + "'" ;
        
        if(cambioCarpeta) {
            ruta_nueva = path.join(__dirname, constantes.FILE_SEPARATOR + constantes.PARENT_DIR + constantes.FILE_SEPARATOR 
                + constantes.DIRECTORIO_PUBLIC + constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO  + 
                constantes.FILE_SEPARATOR + idUsuario + constantes.FILE_SEPARATOR + carpeta);

            ruta_relativa_nueva = constantes.FILE_SEPARATOR + constantes.DIRECTORIO_VIDEO + constantes.FILE_SEPARATOR + idUsuario + constantes.FILE_SEPARATOR + carpeta
    
            /*
             * Si hay cambio de carpeta, hay que recalcular la nueva ruta completa en disco
            */
            sql = sql  + ",ruta='" + carpeta + "',ruta_completa='" + ruta_nueva + "'";
        }
        
        sql = sql + ",publico=" + publico + ",fechaModificacion=NOW() where id =" + videoteca.id;
        console.log("sql: " + sql);

        if(!cambioCarpeta) {
            // Sólo se actualiza la videoteca y no hay cambio de ruta ni en la videoteca ni en los vídeos
            console.log("2");
            db.query(sql).then(salida =>{
                // No hay cambio carpeta, por tanto no hay que actualizar la ruta de los vídeos
                db.commitTransaction().then(salida=>{
                    console.log("Confirmando transaccion 2");
                    db.close();
                    var resultado = {
                        status: 0, descStatus: 'OK'
                    };

                    httpUtil.devolverJSON(res,resultado);
                });
            }).catch(err=>{
                console.log("Se ha producido un error al actualizar la videoteca = " + err.message);
                db.rollbackTransaction().then(salida=>{
                    db.close();
                    var resultado = {
                        status: 2, descStatus: 'Se ha producido un error'
                    };
    
                    httpUtil.devolverJSON(res,resultado);
                });
            });
        } else {
            // Como hay cambio de carpeta en la que se alojan los vídeos en el servidor, hay 
            // que modificar la ruta absoluta y relativa de los vídeos que componen la videoteca

            db.beginTransaction().then(correcto => {

                return db.query(sql);
                
              }).then(resultado =>{
      
                   /*
                    * Es necesario actualizar la rutas de los vídeos de las videotecas  
                    */
                  let SQL_VIDEOS = "select id,nombre from video where id_videoteca=" + videoteca.id;
                  console.log("sql = " + SQL_VIDEOS);
                  return db.query(SQL_VIDEOS);
      
              }).then(videos=>{
                  console.log("Se han recuperado los videos de la videoteca " + videoteca.id);
                  console.log("Videos recuperados = " + JSON.stringify(videos));
      
                  var SQL_UPDATE_RUTA_VIDEOS = "update video set ruta_relativa= ?,ruta_absoluta= ? where id= ?";
                  var registro = new Array();
                  var registros = new Array();
              
                  /**
                   * Se actualiza la ruta relativa y absoluta de los vídeos de la videoteca
                   */
                  var contador = 0;
                  videos.map(function(video){
      
                      var pathRelativo = ruta_relativa_nueva + constantes.FILE_SEPARATOR + video.nombre;
                      var pathAbsoluto = ruta_nueva + constantes.FILE_SEPARATOR + video.nombre;
      
                      registro = [pathRelativo,pathAbsoluto,video.id];
                      db.query(SQL_UPDATE_RUTA_VIDEOS,registro).then(correcto=>{
                          contador++;
                          
                      }).catch(errorUpdate=>{
                          console.log('Error al actualizar videoteca: ' + error.message);
      
                          db.rollbackTransaction().then(obj=>{
                              console.log("Abortando transaccion");
                              db.close();
                              var resultado = {
                                  status: 2, descStatus: 'Se ha producido un error'
                              };
              
                              httpUtil.devolverJSON(res,resultado);
                          });        
                      });
      
                  });
                          
              })
              .then(result=>{
                  console.log("Se han actualizado las ruta absoluta/relativa de los vídeos");
      
                  /**
                   * Se renombra el directorio de la videoteca en disco
                   */
                  if(cambioCarpeta) {
                      fileUtil.renombrarDirectorio(ruta_original,ruta_nueva);
                  }
      
                  /**
                   * Se confirma la transacción
                   */
                  db.commitTransaction().then(obj=>{
      
                      console.log("Confirmando transaccion");
                      db.close();
                      var resultado = {
                          status: 0, descStatus: 'OK'
                      };
      
                      httpUtil.devolverJSON(res,resultado);
                  });
      
              }).catch(error=>{
                  console.log('Error al actualizar videoteca: ' + error.message);
      
                  db.rollbackTransaction().then(obj=>{
                      console.log("Abortando transaccion");
                      db.close();
                      var resultado = {
                          status: 2, descStatus: 'Se ha producido un error'
                      };
      
                      httpUtil.devolverJSON(res,resultado);
                  });      
              });

        }// else
    }
};



/**
 * Comprueba si existe un video asociado a una videoteca tanto en BBDD como en video
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.existeVideo = function(req,res,next) {

    var db = new database.DatabaseMysql();
    var nombre = req.body.nombre;
    var videoteca = req.Videoteca;

    console.log("existeVideo nombre = " + nombre);

    if(nombre!=null && nombre.length>0) {

        var sql = "select count(*) as num from video where id_videoteca= ? and nombre= ?";
        var registro = [videoteca.id,nombre];
       

        db.query(sql,registro).then(resultado=>{
            var salida = {
                status:0,
                descStatus: 'OK'
            }

            console.log("resultado = " + JSON.stringify(resultado));
            if(resultado[0].num>=1) {
                // Existe en base de datos
                salida.status = 1;
                salida.descStatus = 'Existe el vídeo en la videoteca';
            }

            db.close();
            httpUtil.devolverJSON(res,salida);

        }).catch(error=>{
            console.log("Error al comprobar si existe el video = "  + error.messsage);
            db.close();

            var salida = {
                status:2,
                descStatus: 'Error al comprobar si existe vídeo en la videoteca ' + error.message 
            }

            httpUtil.devolverJSON(res,salida);
        });

    }// if

};




/**
 * Elimina un video de la base de datos y del disco
 * @param req Objeto Request
 * @param res Objeto Response
 * @param req Objeto next
 */
exports.deleteVideo = function(req, res, next) {
    var db = new database.DatabaseMysql();
    var video = req.Video;
    var resultado = {};

    console.log("deleteVideo init");

    // Se abre transacción
    db.beginTransaction().then(correcto=>{
        var ruta = video.ruta_absoluta;
        console.log("Ruta video a borrar en disco: " + ruta);

       /*
        * Se cuenta el número total de videotecas del usuario
        */
        var sql = "DELETE FROM video WHERE id=" + video.id;
        console.log("sql =" + sql);

        db.query(sql).then(consulta => {
           console.log("Video " + video.id + " eliminado de bbdd");

           console.log("Se procede a borrar los videos de la ruta = " + ruta);
           /*
            * Se procede a borrar la carpeta de la videoteca de forma recursiva
            */
           fileUtil.deleteFile(ruta);
        
           console.log("Video borrada de disco");
        
           db.commitTransaction().then(correcto =>{
                db.close();
                resultado.status= 0;
                resultado.descStatus = "OK";
                httpUtil.devolverJSON(res,resultado);

            }).catch(err => {
                console.log("Error al confirmar transacción de borrado de video: " + err.message);

                db.rollbackTransaction().then(correcto =>{
                    db.close();
                    resultado.status= 2;
                    resultado.descStatus = "Error al confirmar transacción";
                    httpUtil.devolverJSON(res, resultado);
                });
            });;
            
        }).catch(error=> {
            console.log("Error al eliminar video de id = " + video.id + " de BBDD: " + error.message);

            db.rollbackTransaction().then(correcto =>{
                db.close();

                resultado.status= 3;
                resultado.descStatus = "Error al eliminar video de id = " + videoteca.id + " de bbdd: " + error.message;
                httpUtil.devolverJSON(res,resultado);
                
            });           
        });

    }).catch(err=>{
        console.log("Error al abrir transacción para borrar una video: " + err.message);

        resultado.status= 1;
        resultado.descStatus = "Error al abrir transacción para borrar una video: " + err.message;
        httpUtil.devolverJSON(res,resultado);
    });
};




/**
 * Permite indicar si un vídeo es o no público
 * @param req: Objeto request
 * @param res: Objeto response
 * @param next: Objeto next
 */
exports.publicarVideo = function(req, res, next) {
    var video = req.Video;
    var user = req.session.usuario;
    var publico = req.body.publico;

    console.log("publicarVideo publico: " + publico);


    if (video != undefined && user != undefined && publico != undefined) {
        var db = new database.DatabaseMysql();

        var sql = "UPDATE video SET publico=" + publico + " where id=" + video.id;
        console.log(sql);

        db.query(sql).then(results => {
            console.log('Se ha cambiado la visibilidad del vídeo');
            db.close();
            httpUtil.devolverJSON(res, { status: 0, descStatus: "OK", id: video.id, publico: publico });

        }).catch(err => {
            db.close();
            console.log("Se ha producido un error al establecer la visibilidad del vídeo: " + err.message);
            httpUtil.devolverJSON(res, { status: 1, descStatus: "Se ha producido un error al establecer la visibilidad del vídeo: " + err.message });
        });

    } // if


};



