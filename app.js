var express = require('express');
var partials = require('express-partials');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var methodOverride = require('method-override');
var configController = require('./controllers/ConfigController.js');
var i18n = require('i18n');
var constantes = require('./config/constantes.json');

/**
 * Inclusión de los ficheros de rutas
 */
var index = require('./routes/index');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Se instala el middleware express-partials. Se instala después de definir
// el mecanismo de vistas y ejs de express-partials, sino no funciona.
// hay que crear en views, un archivo layout.ejs con la estructura que tendrán
// todas las páginas
app.use(partials());


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Necesario indicar un nombre al cookieParser para poder utilizar las sesiones
app.use(cookieParser('album'));
app.use(express.static(path.join(__dirname, 'public')));

// Se habilita el uso de sesiones de usuario
app.use(session());


// Se instala el middleware y se indica el nombre utilizado para
// encapsular el método POST por el que sea, en este caso suele ser por PUT.
// HTML5 no permite el envio de formularios por PUT, sólo por POST o por GET.
// De ahí que se haga esto
app.use(methodOverride('_method'));



/**
 * CONFIGURACION DE INTERNACIONALIZACIÓN
 */

i18n.configure({
    // Configuración de los locales aceptados
    locales:['es', 'en'],
  
    // Directorio que contiene los archivos json correspondinentes a cada locale
    directory: __dirname + '/locales',
    
    // Locale por defecto
    defaultLocale: constantes.IDIOMA_DEFECTO,

    // Si se cambia un json se hace un autoreload
    autoReload: true,
    
    // Nombre de la cookie que contiene el valor del locale utilizado en la aplicación
    cookie: 'lang',
  });

app.use(i18n.init);


/**
 * COMPROBACIÓN DEL PARÁMETRO LANG en la request para que se cargue un idioma u otro
 */
app.use(function(req, res, next) {
    // Se obtiene el parámetro "lang" que pueda ir en la url por GET
    var lang = req.query.lang;

    // Se almacena el idioma por defecto en la sesión
    if(req.session.lang==undefined) {
        req.session.lang = constantes.IDIOMA_DEFECTO;
    }
    // Se establece el locale en la request
    req.setLocale(req.session.lang);
    
    if(lang!=null && lang!=undefined && i18n.getLocales().indexOf(lang)!=-1) {
        req.setLocale(lang);
        req.session.lang = lang;
    }

    next();
});




/*
 *  Helpers dinamicos para almacenar en la sesión del usuario, la ruta de la que
 * procede, para reenviar la misma una vez que se ha autenticado.
 */ 
app.use(function(req, res, next) {

    console.log('Comprobación de sesiones');
    // Si no existe lo inicializa
    if (!req.session.path) {
        req.session.path = '/';
    }

    /**
     * Se almacena en la sesión del usuario, el path desde el que ha hecho
     * la petición, siempre y cuando la petición no sea las indicadas en el match
     */
    console.log("req.path: " + req.path);
    console.log("=====> req.session.path: " + req.session.path);

    if (!req.path.match(/\/login|\/logout|\/assets|\/idioma/)) {
        req.session.path = req.path;
        console.log("SESSION PATH: " + req.session.path);
    }

    req.session.mimeVideoAceptadas = constantes.TIPOS_MIME_VIDEO_ACEPTADAS;

    // Hacer visible req.session en las vistas
    res.locals.session = req.session;
    next();
});




/**
 * Se comprueba si es necesario instalar la aplicación, comprobando
 * que exista la base de datos
 * @param req Request
 * @param res Response 
 * @param next next
 *
app.use(function(req, res, next) {
    console.log("COMPROBAR INSTALACION INIT");

    var PATH_CONFIG = req.path.match(/\/config/);
    console.log("  PATH_CONFIG: " + PATH_CONFIG);

    configController.instalacionCorrecta(function(resultado) {

        console.log("app.js - resultado comprobacionInstalacion: " + JSON.stringify(resultado));
        if (resultado != null) {

            if (resultado.status == 0) {
                next();
            } else
            if (resultado.status == 1 || resultado.status == 2 || resultado.status == 3 || resultado.status == 4 || resultado == 5) {
                if (PATH_CONFIG != null && PATH_CONFIG.length > 0) {
                    next();
                } else {
                    res.render("config/paso1", { errors: [] });
                }
            }
        } // if

        console.log("COMPROBAR INSTALACION END");
    });
});
*/

app.use('/', index);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;