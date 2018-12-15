var mysql = require('mysql');
var fileUtil = require("../util/FileUtils.js");
var config = fileUtil.getContentConfigBBDDFile(); // Archivo de configuración de base de datos

/**
 * Clase DatabaseMysql que obtiene conexión a la base de datos al instanciar la clase, y que 
 * dispone de métodos para ejecutar query y cerrar la conexión a la BBDD
 * 
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class DatabaseMysql {

    /**
     * Constructor que obtiene una conexión a la BBDD si esta no se le es proporcionada
     * por parámetro de entrada
     * @param {configuracion} Configuracion de acceso a la BBDD. En el caso de que se pase tiene que tener la siguiente estructura
     * {host: [host],user:[user],password:[password],database:[database]}
     */
    constructor(configuracion) {
            var configurationSingleConnection = {};

            if (configuracion == null || configuracion == undefined) {
                configurationSingleConnection = {
                    host: config.mysql_server,
                    user: config.mysql_user,
                    password: config.mysql_pass,
                    database: config.mysql_db_name
                }
            } else {

                configurationSingleConnection = {
                    host: configuracion.host,
                    user: configuracion.user,
                    password: configuracion.password,
                    database: configuracion.database
                }
            }

            this.connection = mysql.createConnection(configurationSingleConnection);
        } // constructor

    /**
     * Devuelve la conexión a la BBDD
     * @return Connection
     */
    getConnection() {
        return this.connection;
    }

    /**
     * Iniciar transacción
     */
    beginTransaction() {
        return new Promise((resolver, rechazar) => {
            this.connection.beginTransaction(function(err) {
                if (err) {
                    return rechazar(err);
                }
                resolver(true);
            });
        });
    }


    /**
     * Commit transacción
     */
    commitTransaction() {
        return new Promise((resolver, rechazar) => {
            this.connection.commit(function(err) {
                if (err) {
                    return rechazar(err);
                }
                resolver();
            });
        });
    }


    /**
     * Rollback transacción
     */
    rollbackTransaction() {
        return new Promise((resolver, rechazar) => {
            this.connection.rollback(function(err) {
                if (err) {
                    return rechazar(err);
                }
                resolver();
            });
        });
    }

    /**
     * Ejecuta una query y devuelve una promesa
     * @param {String} sql String con la query a ejecutar 
     * @param {Array} args Array con los argumentos que se pasan a la  query sql
     */
    query(sql, args) {
        return new Promise((resolver, rechazar) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err) {
                    return rechazar(err);
                }
                resolver(rows);
            });
        });
    }

    /**
     * Cierra la conexión a la base de datos y devuelve una promesa
     */
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

exports.DatabaseMysql = DatabaseMysql;