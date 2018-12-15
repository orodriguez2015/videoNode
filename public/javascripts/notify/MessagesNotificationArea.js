/**
  * Constructor
  */
function MessagesArea() {
};


/**
  * Muestra un mensaje de error
  * @param msg: Mensaje a mostrar
  */
MessagesArea.prototype.showMessageError = function (msg) {
    if(msg!=undefined && $.trim(msg)!='') {
      $.notify(msg, "error");
    }
};

/**
  * Muestra un mensaje de éxito
  * @param msg: Mensaje a mostrar
  */
MessagesArea.prototype.showMessageSuccess = function(msg) {
    if(msg!=undefined && $.trim(msg)!='') {
      var p = $.notify(msg, "success");
    }
};


/**
  * Muestra un mensaje de warning
  * @param msg: Mensaje a mostrar
  */
MessagesArea.prototype.showMessageWarning = function(msg) {
    if(msg!=undefined && $.trim(msg)!='') {
      $.notify(msg, "warning");
    }
};

// Única instancia de la clase
var messagesArea = new MessagesArea();
