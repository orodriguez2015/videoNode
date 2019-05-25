var express = require('express');
var uploadController = require('../controllers/uploadImageController.js');
var albumController = require('../controllers/albumController.js');
var userController = require('../controllers/userController.js');
var fotoController = require('../controllers/fotoController.js');
var configController = require('../controllers/ConfigController.js');
var permissionsController = require('../controllers/permisosUsuarioController.js');
var videoController = require('../controllers/VideoController.js');
var uploadVideoController = require('../controllers/UploadVideoController.js');
var router = express.Router();


router.get('/', function(req, res, next) {
    res.redirect("/albums");
});

// GET /album. Carga de la pantalla de upload de imágenes
router.get("/album/upload", userController.isAuthenticatedUser, uploadController.uploadImageScreen);

/** 
 * GET /album. Recupera las fotografías de un determinado álbum
 */
router.get("/album", albumController.getImagesFromAlbum);


/**
 * POST /upload.
 * Permite subir imágenes al servidor
 */
router.post("/upload", userController.isAuthenticatedUser, uploadController.uploadImageFile);

/**
 * Autoload para la carga de un álbum en la request
 */
router.param('idAlbum', albumController.load);

/**
 * Autoload para la carga de un álbum público en la request
 */
router.param('idAlbumPublico', albumController.loadAlbumPublico);

/**
 * Autoload para la carga de una foto en la request
 */
router.param('idPhoto', fotoController.load);

/**
 * Autoload para la carga de una foto en la request
 */
router.param('idUsuario', userController.load);

/**
 * Autoload para la carga de una videoteca en la request
 */
router.param('idVideoteca', videoController.load);

/**
 * Autoload para la carga de una video en la request
 */
router.param('idVideo', videoController.loadVideo);

/**
 * GET /album/create.
 * Renderiza la vista de alta de un álbum. Es necesario estar autenticado para acceder a esta vista
 */
router.get("/album/create", userController.isAuthenticatedUser, albumController.renderScreenCreateAlbum);

/**
 * GET /admin/albums => Recupera los diferentes álbumes fotográficos existentes
 */
router.get("/album/admin", userController.isAuthenticatedUser, albumController.renderScreenAlbumesAdministracion);


/**
 * GET /album/administracion => Recupera los álbumes de un determinado usuario.
 */
router.get("/album/administracion", userController.isAuthenticatedUser, albumController.getAlbumesAdministracion);

/**
 * GET /album.
 * Listado de los álbumes públicos de los usuarios
 */
router.get("/albums", albumController.getAlbumesPublicos);

/**
 * DELETE /album/:idAlbum
 */
router.delete("/album/:idAlbum(\\d+)", userController.isAuthenticatedUser, albumController.deleteAlbumTransactional);

/**
 * GET /album/:idAlbum. Recupera un álbum y se renderiza la vista de edición del mismo
 */
router.get("/album/:idAlbum(\\d+)", userController.isAuthenticatedUser, albumController.renderScreenEditAlbum);

/**
 * PUT /album/:idAlbum. Actualiza la información básica de un álbum en BBDD
 */
router.put("/album/:idAlbum(\\d+)", userController.isAuthenticatedUser, albumController.updateAlbum);

/**
 * GET /album/upload/:idAlbum. Renderiza la vista que permite subir fotografías a un álbum
 */
router.get("/album/upload/:idAlbum(\\d+)", userController.isAuthenticatedUser, albumController.renderScreenUploadImagesAlbum);

/**
 * GET /album/photo/:idAlbum. Renderiza la vista que lista la fotografías de un determinado álbum para su administración
 */
router.get("/album/photo/:idAlbum(\\d+)", userController.isAuthenticatedUser, albumController.getImagesFromAlbum);

/**
 * GET /album/public/photo/:idAlbum. Renderiza la vista que lista la fotografías de un determinado álbum para su visualización
 * en la parte pública de la aplicación
 */
router.get("/album/public/photo/:idAlbumPublico(\\d+)", albumController.getImagesFromAlbumPublico);

/**
 * POST /album.
 * Alta de un álbum en base de datos
 */
router.post("/album", userController.isAuthenticatedUser, albumController.altaAlbum);


/**
 * DELETE /photo/:idPhoto
 * Borra una fotografía de la base de datos y del disco
 */
router.delete("/photo/:idPhoto(\\d+)", userController.isAuthenticatedUser, fotoController.deletePhoto);


/**
 * DELETE /photo/multiple
 * Borra una fotografía de la base de datos y del disco
 */
router.delete("/photo/multiple", userController.isAuthenticatedUser, fotoController.deleteFotoMultipleTransaccional);


/**
 * POST /photo/visible/:idPhoto
 * Cambia el estado de visibilidad de una foto dentro de un álbum para su visualización en la parte pública del sistema
 */
router.post("/photo/visible/:idPhoto(\\d+)", userController.isAuthenticatedUser, fotoController.setPublishPhotoTransactional);


/**
 * Incrementa el contador de visualización de una determinada fotografía
 * POST /photo/visualized/:idPhoto
 */
router.post("/photo/visualized/:idPhoto(\\d+)", userController.isAuthenticatedUser,fotoController.incrementarContadorVisualizacion);

/**
 * GET /login
 * Renderiza la vista correspondiente a la pantalla de login
 */
router.get("/login", userController.renderLogin);

/**
 * POST /login
 * Permite autenticar un usuario y devuelve un JSON con el mensaje
 * de éxito o de fracaso
 */
router.post("/login", userController.autenticar);

/**
 * GET /logout
 * Cierra la sesión del usuario
 */
router.get("/logout", userController.logout);


/**
 * GET /profile
 * Carga la pantalla con los datos del usuario para que puede proceder a su edición
 */
router.get("/profile", userController.isAuthenticatedUser, userController.renderUserProfile);

/**
 * PUT /user/profile/:idUsuario
 * Modifica los datos de un usuario en base de datos
 */
router.put("/user/profile/:idUsuario(\\d+)", userController.isAuthenticatedUser, userController.updateUserProfile);

/**
 * PUT /user//:idUsuario
 * Modifica los datos de un usuario en base de datos
 */
router.put("/user/:idUsuario(\\d+)", userController.isAuthenticatedUser, userController.updateUser);


/**
 * GET /user/new
 * Renderiza la vista de alta de usuario
 */
router.get("/user/new", userController.isAuthenticatedUser, userController.renderNuevoUsuario);


/**
 * Comprueba si existe un usuario en BBDD con un determinado datos
 */

router.post("/user/exists", userController.isAuthenticatedUser, userController.existsUserWithLoginEmail);

/**
 * Comprueba si existe un usuario en BD con un determinado login
 * POST /user/existsLogin
 */
router.post("/user/existsLogin", userController.isAuthenticatedUser, userController.existsLogin);


/**
 * Comprueba si existe un usuario en BD con un determinado login y que además no se de un determinado usuario
 * POST /user/existsLoginAnotherUser
 */
router.post("/user/existsLoginAnotherUser", userController.isAuthenticatedUser, userController.existsLoginAnotherUser);


/**
 * Comprueba si existe un usuario en BD con un determinado email
 * POST /user/existsEmail
 */
router.post("/user/existsEmail", userController.isAuthenticatedUser, userController.existsEmail);


/**
 * Comprueba si existe un usuario en BD con un determinado email, y que además no sea un determinado usuario
 * POST /user/existsEmailAnotherUser
 */
router.post("/user/existsEmailAnotherUser", userController.isAuthenticatedUser, userController.existsEmailAnotherUser);


/**
 * Graba un usuario en BBDD
 * POST /user
 */
router.post("/user", userController.isAuthenticatedUser, userController.saveUser);


/**
 * Renderiza la pantalla de administración de usuarios
 * GET /users
 */
router.get("/users", userController.isAuthenticatedUser, userController.renderUsersAdministrationScreen);


/**
 * Petición de desactivar o activar la cuenta de un usuario
 * POST /user/disableUser
 */
router.post("/user/disableUserAccount", userController.isAuthenticatedUser, userController.disableUserAccount);



/**
 * Recupera la lista de usuarios que hay en BBDD
 * GET /users/administration
 */
router.get("/users/administration", userController.isAuthenticatedUser, userController.getUsersAdministracion);


/**
 * Renderiza la vista de edición de un usuario
 * GET /user/idUsuario
 */
router.get("/users/:idUsuario(\\d+)", userController.isAuthenticatedUser, userController.renderScreenUpdateUser);


/**
 * Renderiza la vista de asignación de permisos a un usuario
 * GET /users/permissions/:idUsuario
 */
router.get("/users/permissions/:idUsuario(\\d+)", userController.isAuthenticatedUser, permissionsController.renderPermisosScreen);

/**
 * Recuperar una colección con los permisos que se pueden asignar a un usuario
 * GET /users/permissions/administration
 */
router.get("/users/permissions/administration/:idUsuario(\\d+)", userController.isAuthenticatedUser, permissionsController.getPermissionsAdministration);


/**
 * Permite asignar un determinado permiso a un usuario determinado
 * POST /users/permissions/:idUsuario
 */
router.post("/users/permissions/:idUsuario(\\d+)", userController.isAuthenticatedUser, permissionsController.asignarPermiso);


/**
 * Comprueba si un usuario autenticado tiene asignado un determinado permiso
 * POST /users/permission/validation
 */
router.post("/users/permission/validation", userController.isAuthenticatedUser, permissionsController.comprobarPermisoAjax);




/**
 * GET /config/installationFinished
 * Solicitud de renderización de la pantalla que indi a que la instalación ha finalizado
 */
router.get("/config/installationFinished", configController.renderScreenInstallationFinished);



/**
 * GET /config/userAdmin
 * Solicitud de validación de conexión a la BBDD desde el proceso de instalación
 */
router.get("/config/userAdmin", configController.renderScreenConfiguracionUsuarioAdministrador);


/**
 * GET /config/paso1
 * Carga de la pantalla con el paso 1 de proceso de instalaciónse pSolicitud de validación de conexión a la BBDD desde el proceso de instalación
 */
router.get("/config/paso1", configController.renderPaso1);


/**
 * GET /config/paso2
 * Carga de la pantalla con el paso 2 de proceso de instalaciónse pSolicitud de validación de conexión a la BBDD desde el proceso de instalación
 */
router.get("/config/paso2", configController.renderPaso2);

/**
 * GET /config/paso3
 * Carga de la pantalla con el paso 3 de proceso de instalaciónse pSolicitud de validación de conexión a la BBDD desde el proceso de instalación
 */
router.get("/config/paso3", configController.renderPaso3);

/**
 * POST /config/comprobarConexionBD
 * Solicitud de validación de conexión a la BBDD desde el proceso de instalación
 */
router.post("/config/comprobarConexionBD", configController.comprobarConexionBD);


/**
 * POST /config/checkExistenceTables
 * Solicitud de validación de conexión a la BBDD desde el proceso de instalación
 */
router.post("/config/comprobarExistenciaTablas", configController.comprobarExistenciaTablas);

/**
 * POST /config/createTsblesDatabase
 * Solicitud de alta de las tablas del sistema en la base de datos
 */
router.post("/config/createTablesDatabase", configController.createTablesDatabases);


/**
 * Mostrar las videotecas del usuario
 */
router.get("/videotecas",userController.isAuthenticatedUser,videoController.showVideotecas);

/** 
 * GET /videoteca/nueva . Carga la pagina de creación de una nueva videoteca
*/
router.get("/videoteca/nueva",userController.isAuthenticatedUser,videoController.nuevaVideoteca);


/**
 * POST /videoteca/comprobarRutaCarpetaUsuario
 * Guardar videoteca en BBDD
 */
router.post("/videoteca/comprobarRutaCarpetaUsuario",userController.isAuthenticatedUser,videoController.comprobarRutaVideoteca);

/**
 * POST /videoteca/guardar
 * Guardar videoteca en BBDD
 */
router.post("/videoteca/guardar",userController.isAuthenticatedUser,videoController.saveVideoteca);


/**
 * GET /videoteca/administracion
 * Recupera las videotecas de un usuario
 */
router.get("/videotecas/administracion",userController.isAuthenticatedUser,videoController.getVideotecasAdministracion);


/**
 * GET /videoteca/:idVideoteca
 * Recupera los datos de una videoteca
 */
router.get("/videotecas/:idVideoteca(\\d+)",userController.isAuthenticatedUser,videoController.getVideotecasAdministracion);


/**
 * GET /videoteca/videos/:idVideoteca
 * Recupera el listado de vídeos que componen la videoteca
 */
router.get("/videoteca/videos/:idVideoteca(\\d+)",userController.isAuthenticatedUser,videoController.showVideos);


/**
 * DELETE /videoteca/:idVideoteca
 * Permite eliminar una determinada videoteca de la BBDD
 */
router.delete("/videoteca/:idVideoteca(\\d+)",userController.isAuthenticatedUser,videoController.deleteVideoteca);


/**
 * GET /videoteca/:idVideoteca
 * Recupera la pantalla de edición de una videoteca
 */
router.get("/videoteca/:idVideoteca(\\d+)",userController.isAuthenticatedUser,videoController.edicionVideoteca);


/**
 * PUT /videoteca/:idVideoteca
 * Editar una videoteca en BBDD
 */
router.put("/videoteca/:idVideoteca(\\d+)",userController.isAuthenticatedUser,videoController.editarVideoteca);



/**
 * POST /videoteca/comprobarRutaOtraVideotecaUsuario
 * Guardar videoteca en BBDD
 */
router.post("/videoteca/comprobarRutaOtraVideotecaUsuario",userController.isAuthenticatedUser,videoController.comprobarRutaOtraVideotecaUsuario);


/**
 * GET /videoteca/upload.
 * Carga la pantalla a través de la cual se pueden subir vídeos al servidor
 */
router.get("/videoteca/upload/:idVideoteca(\\d+)", userController.isAuthenticatedUser, videoController.uploadVideoScreen);


/**
 * POST /upload/video/:idVideoteca
 * Permite subir videos al servidor
 */
router.post("/upload/video/:idVideoteca(\\d+)", userController.isAuthenticatedUser, uploadVideoController.uploadVideoFile);


/**
 * DELETE /video/:idVideo
 * Permite eliminar un determinado videoteca de la BBDD
 */
router.delete("/video/:idVideo(\\d+)",userController.isAuthenticatedUser,videoController.deleteVideo);



module.exports = router;