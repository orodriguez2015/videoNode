CREATE TABLE `foto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `ruta` varchar(225) NOT NULL,
  `rutaMiniatura` varchar(225) NOT NULL,
  `alto` int(11) NOT NULL,
  `ancho` int(11) NOT NULL,
  `tipomime` varchar(45) DEFAULT NULL,
  `idAlbum` int(11) NOT NULL COMMENT 'Clave foránea que indica el álbum al que pertenece la fotografía',
  `fechaAlta` datetime NOT NULL,
  `idUsuario` int(11) DEFAULT NULL,
  `publico` int(11) NOT NULL DEFAULT '1',
  `numeroVisualizaciones` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idAlbumFk1` (`idAlbum`),
  KEY `fkIdUsuario_idx` (`idUsuario`),
  CONSTRAINT `fkIdUsuario` FOREIGN KEY (`idUsuario`) REFERENCES `Users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fkidAlbum` FOREIGN KEY (`idAlbum`) REFERENCES `albums` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=UTF8