CREATE TABLE `videoteca` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `ruta` varchar(125) NOT NULL,
  `ruta_completa` varchar(255) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `fechaAlta` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT NULL,
  `fechaBaja` datetime DEFAULT NULL,
  `publico` int(11) NOT NULL,
  PRIMARY KEY(id),
  KEY `video_ibfk_1` (`idUsuario`),
  CONSTRAINT `video_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=UTF8;