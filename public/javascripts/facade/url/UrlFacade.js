function UrlFacade() {

  /**
    * Función que devuelve un objeto con los parámetros de la url
    * junto con sus valores
    */
  this.getUrlParams = function () {
    var loc = document.location.href;
    var getString = loc.split('?')[1];
    if(getString!=null && getString!=undefined) {
      var GET = getString.split('&');
      var get = {};//this object will be filled with the key-value pairs and returned.

      for(var i = 0, l = GET.length; i < l; i++){
          var tmp = GET[i].split('=');
          get[tmp[0]] = unescape(decodeURI(tmp[1]));
      }// for
    }//if
    return get;
  };


  /**
    * Función que recupera el valor de un determinado parámetro adjuntado a una
    * url por GET
    */
  this.getParameterByName = function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };


  /**
   * Recarga la pantalla actual con el parámetro de idioma que se indique por parámetro
   * @param lang Idioma en que se quiera recargar la pantalla
   */
  this.recargarPantallaIdioma = function(lang) {
    
    if(lang!=undefined && lang!=null && lang!="") {
        var url = window.location.href;
        // Se obtiene los parámetros de la url que se pasan por GET
        var urlParams = this.getUrlParams();

        if(urlParams!=null && urlParams!=undefined && urlParams['lang']!=undefined) {    
          // Se sustituye la propiedad/atributo "lang" con el nuevo valor
          urlParams.lang = lang;
          
          var parametros_get = "";
          var contador = 0;

          for(p in urlParams) {
  
            if(contador==0) {
              parametros_get += "?" + p + "=" + urlParams[p];
            } else {
              parametros_get += "&" + p + "=" + urlParams[p];
            }
            contador++;
          }// for

          
          var datosUrl = url.split("?");
          window.location.href = datosUrl[0] + parametros_get;

        }else {
           // No hay parámetros por GEt en la url, se añade el parámetro lang
           window.location.href = url + "?lang=" + lang;
        }
    }// if
  }// recargarPantallaIdioma

};

var urlFacade = new UrlFacade();
