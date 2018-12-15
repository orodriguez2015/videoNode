$(function() {

    var ul = $('#upload ul');

    var tpl;
    /*
    var tpl = $('<li class="working"><input type="text" value="0" data-width="55" data-height="55"'+
                ' data-fgColor="#0788a5" data-readOnly="1" data-bgColor="#3e4043" /><p></p><span></span></li>');
                */
    $('#drop a').click(function() {
        // Simulate a click on the file input button
        // to show the file browser dialog
        $(this).parent().find('input').click();
    });




    // Initialize the jQuery File Upload plugin
    $('#upload').fileupload({


        // This element will accept file drag/drop uploading
        dropZone: $('#drop'),

        // This function is called when a file is added to the queue;
        // either via the browse button, or via drag/drop:
        add: function(e, data) {

            var ficheros = $("#upl")[0].files;

            console.log("ficheros seleccinados: " + JSON.stringify(ficheros));
            for (p in ficheros) {
                console.log("propiedad: " + p);
                console.log("ficheros item: " + ficheros.item);
                console.log("ficheros lengt: " + ficheros.length);

            }


            tpl = $('<li class="working"><input type="text" value="0" data-width="55" data-height="55"' +
                ' data-fgColor="#0788a5" data-readOnly="1" data-bgColor="#3e4043" /><p></p><span></span></li>');

            // Append the file name and file size
            tpl.find('p').text(data.files[0].name).append('<i> ' + formatFileSize(data.files[0].size) + '</i>');

            // Add the HTML to the UL element
            data.context = tpl.appendTo(ul);



            // Initialize the knob plugin
            tpl.find('input').knob();

            // Listen for clicks on the cancel icon
            tpl.find('span').click(function() {

                if (tpl.hasClass('working')) {
                    jqXHR.abort();
                }

                tpl.fadeOut(function() {
                    tpl.remove();
                });

            });

            // Automatically upload the file once it is added to the queue
            //var jqXHR = data.submit();
        },

        progress: function(e, data) {
            // Calculate the completion percentage of the upload
            var progress = parseInt(data.loaded / data.total * 100, 10);
            // Update the hiddDoen input field and trigger a change
            // so that the jQuery knob plugin knows to update the dial
            data.context.find('input').val(progress).change();

            if (progress == 100) {
                data.context.removeClass('working');
            }
        },


        /**
         * Función invocada en caso de fallo de envío al servidor
         * @param e
         * @param data
         */
        fail: function(e, data) {
            var respuesta = data.jqXHR.responseText;

            if (respuesta != undefined) {
                var res = JSON.parse(data.jqXHR.responseText);

                var codError = res.status;
                var descError = res.descStatus;
                console.log("res.status: " + res.status);
                console.log("res.descStatus: " + res.descStatus);


                if (res.status == 6) {
                    // Tipo MIME de archivo no váListado
                    tpl.find('p').text('');
                    tpl.find('p').text(data.files[0].name).append('<i> Sólo se permite subir imágenes</i>');

                } else
                if (res.status == 5) {
                    // El fichero ya existe en el servidor

                    //tpl.find('p').text(data.files[0].name).append('<i> El fichero ya existe en el servidor</i>');


                    try {
                        tpl.find('p').text('');
                        var dato = tpl.find('p').text(data.files[0].name);
                        dato.append('<i> El fichero ya existe en el servidor</i>');
                    } catch (Err) {
                        console.log("error: " + Err.message);
                    }

                    //data.context.addClass('error');
                }

            } // if
            // Something has gone wrong!
            data.context.addClass('error');
        },

        /**
         * Función invocada en caso de éxito
         * @param data Respuesta del servidor
         */
        success: function(data) {
            console.log("success data: " + JSON.stringify(data));
        }

    });


    // Prevent the default action when a file is dropped on the window
    $(document).on('drop dragover', function(e) {
        e.preventDefault();
    });

    // Helper function that formats the file sizes
    function formatFileSize(bytes) {
        if (typeof bytes !== 'number') {
            return '';
        }

        if (bytes >= 1000000000) {
            return (bytes / 1000000000).toFixed(2) + ' GB';
        }

        if (bytes >= 1000000) {
            return (bytes / 1000000).toFixed(2) + ' MB';
        }

        return (bytes / 1000).toFixed(2) + ' KB';
    }

});