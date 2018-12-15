/**
 * Fachada para la modal LightBoxFacade
 * @author <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
function LightBoxFacade() {

    var slideIndex = 1;

    /**
     * Función que abre la ventana modal
     */
    this.openModal = function() {
        document.getElementById('myModal').style.display = "block";
    };


    /**
     * Función que abre la ventana modal
     * @param {Integer} id Id de la fotografía
     */
    this.openModalNuevo = function(id) {
        document.getElementById('myModal').style.display = "block";
        if (id != undefined) {

            fotoFacade.photoDisplayed(id, function(data) {
                    if (data != null && data.status == 0) {
                        // función de éxito que actualiza el campo con el numero de visualizaciones 
                        // de la fotografía
                        $('#visto' + data.idFoto).html(data.numero);
                    }

                },
                function(error) {
                    // función de error vacía
                });

        }
    };




    /**
     * Función que abre la ventana modal
     */
    this.closeModal = function() {
        document.getElementById('myModal').style.display = "none";
    };

    /**
     * Avanza o retrocede una fotografía
     * @param n Índice de la fotografía
     */
    this.plusSlides = function(n) {
        this.showSlides(slideIndex += n);
    };

    /**
     * Establece la fotografía Actualiza
     * @param n Índice de la fotografía
     */
    this.currentSlide = function(n) {
        this.showSlides(slideIndex = n);
    }

    /**
     * Establece la fotografía a mostrar
     * @param n Índice de la fotografía a mostrar
     */
    this.showSlides = function(n) {
        var i;
        var slides = document.getElementsByClassName("mySlides");
        //var dots        = document.getElementsByClassName("demo");
        var captionText = document.getElementById("caption");

        if (n > slides.length) {
            slideIndex = 1
        }

        if (n < 1) {
            slideIndex = slides.length
        }

        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }

        slides[slideIndex - 1].style.display = "block";

    }

}

var lightBoxFacade = new LightBoxFacade();


/*
 * Se detecta cuando se ha pulsado la tecla ESC para cerrar la modal y avanzar/retroceder de
 * fotografía
 */
$(document).bind('keydown', function(e) {
    switch (e.which) {
        case 27:
            {
                // Tecla ESC
                lightBoxFacade.closeModal();
                break;
            };

        case 39:
            {
                // Tecla dirección derecha
                lightBoxFacade.plusSlides(1);
                break;
            };

        case 37:
            {
                // Tecla dirección izquierda
                lightBoxFacade.plusSlides(-1);
                break;
            };

    } // switch
});