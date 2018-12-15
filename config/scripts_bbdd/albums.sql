CREATE TABLE `albums` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) DEFAULT NULL,
  `fechaAlta` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` datetime DEFAULT NULL,
  `idUsuario` int(11) NOT NULL,
  `publico` int(11) NOT NULL,
  `descripcion` varchar(225) NOT NULL,
  `idUsuarioMod` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `albums_ibfk_2` (`idUsuarioMod`),
  KEY `albums_ibfk_1` (`idUsuario`),
  CONSTRAINT `albums_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `albums_ibfk_2` FOREIGN KEY (`idUsuarioMod`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=UTF8