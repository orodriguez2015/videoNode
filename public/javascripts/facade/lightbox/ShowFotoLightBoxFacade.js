
/**
 * Clase ShowFotoLightBoxFacade utilizada para mostrar una fotografía en su tamaño original en una capa, sobre la 
 * que además se puede avanzar y retroceder a la fotografía siguiente o anterior a la actual.
 * 
 * <a href="mailto:oscar.rodriguezbrea@gmail.com">Óscar Rodríguez</a>
 */
class ShowFotoLightBoxFacade {

    /**
     * Constructor
     */
    constructor() {

        $(document).bind('keydown', function(e) {
            switch (e.which) {
                case 27:
                    {
                        // Tecla ESC
                        ShowFotoLightBoxFacade.close();
                        break;
                    };
        
                case 39:
                    {
                        // Tecla dirección derecha
                        ShowFotoLightBoxFacade.avanzar(1);
                        break;
                    };
        
                case 37:
                    {
                        // Tecla dirección izquierda
                        ShowFotoLightBoxFacade.avanzar(-1);
                        break;
                    };
        
            } // switch
        });

        this.fotos;
        this.indiceFotoActual;
    }


    /**
     * Permite establecer un array de String que contiene la ruta de la fotografía original en el servidor.
     * Obligatorio invocar a este método
     * 
     * @param {Array} fotos: Colección con la ruta original de cada fotografía
     */
    static setFotos(fotos) {

        if(fotos!=null) {
            if(typeof(fotos)=='string') {
                var datos = fotos.split(",");
                this.fotos = datos;
            }   
        }
    }


    /**
     * Muestra una Oculta el modalLightBox en el que se muestra un fotografía
     * @param {Integer} indice: Indice de la fotografía en la colección de fotografías
     */
    static show(indice){
        if(indice!=null && indice!=undefined && this.fotos!=undefined) {

            this.indiceFotoActual = parseInt(indice);
            var ruta = this.fotos[indice];
            /**
             * Se carga el template html en el div con la clase CSS modal-foto
             */
            $('.modal-foto').load('/templates/lightbox/lightbox.html', function() {
                // Se muestra el div que contendrá
                $('#modalLightBox').css("display","block");
                // Se establece el src de la imagen a mostrar
                $('#imagen').attr('src',ruta);                    
                // Se actualiza la leyenda con la fotografia actual y el número total de fotos
                ShowFotoLightBoxFacade.actualizarLeyendaFotografias();

            });
        }
    }// show


    /**
     * Actualiza la leyenda [FOTO_ACTUAL]/[NUMERO_TOTAL_FOTOS] que se muestra en la esquina
     * superior izquierda, cuando se visualiza una determinada fotografía en tamaño original
     */
    static actualizarLeyendaFotografias() {
        // Muestra el número de fotografía actual
        $('#fotoActual').html(parseInt(this.indiceFotoActual) + 1);
        // Muestra el número total de fotos
        $('#totalFotos').html(ShowFotoLightBoxFacade.getNumTotalFotos());
    }


    /**
     * Devuelve el número total de fotografías
     * @return Número total de fotografías o cero sino se se ha establecido la colección con los nombres de las mismas
     */
    static getNumTotalFotos() {
        let total =0;
        if(this.fotos!=null && this.fotos!=undefined) {
            total = this.fotos.length;
        }
        return total;
    }



    /**
     * Avanza o retrocede a la fotografía siguiente o anterior
     * @param {Integer} param: Valores que puede tomar: 1 para foto siguiente y -1 para la anterior
     */
    static avanzar(param) {
        if(param!=null && param!=undefined && this.fotos!=null && this.fotos!=undefined)  {
            let indice = parseInt(this.indiceFotoActual) + parseInt(param);
            if(indice >=0 && indice<ShowFotoLightBoxFacade.getNumTotalFotos()) {
                this.indiceFotoActual = indice;
                $('#imagen').attr('src',this.fotos[indice]);
                ShowFotoLightBoxFacade.actualizarLeyendaFotografias();
            }// if
        }// if
    }

    /**
     * Oculta el modalLightBox en el que se muestra un fotografía
     */
    static close() { 
        $('#modalLightBox').css("display","none");
    }// close

}
new ShowFotoLightBoxFacade();