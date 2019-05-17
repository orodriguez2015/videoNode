CREATE TABLE `video` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(225) NOT NULL,
  `extension` varchar(15) NOT NULL,
  `publico` int(1) NOT NULL,
  `id_videoteca` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_alta` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario_idx` (`id_usuario`),
  KEY `id_videoteca_idx` (`id_videoteca`),
  CONSTRAINT `id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `id_videoteca` FOREIGN KEY (`id_videoteca`) REFERENCES `videoteca` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=UTF8;