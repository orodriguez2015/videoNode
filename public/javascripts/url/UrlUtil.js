/**
  * Clase UrlUtil con utilidades para el manejo de url´s
  * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
  */
function UrlUtil() {

  /**
    * Recupera la url de la página que está visualizando en el momento
    * actual en el servidor, y permite extraer una de la variables que se adjunta
    * a la url por GET
    * @param variable: Nombre de la variable a recuperar
    */
  this.getQueryVariable = function(variable) {
     var query = window.location.search.substring(1);
     var vars = query.split("&");
     for (var i=0;i<vars.length;i++) {
             var pair = vars[i].split("=");
             if(pair[0] == variable){return pair[1];}
     }
     return(false);
  }

}// UrlUtil

var urlUtil = new UrlUtil();
