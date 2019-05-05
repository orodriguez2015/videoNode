CREATE TABLE foto.`video` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `extension` varchar(10) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `fecha_alta` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime DEFAULT NULL,
  `fecha_baja` datetime DEFAULT NULL,
  `usuario_baja` varchar(255) DEFAULT NULL,
  `usuario_modificacion` varchar(255) DEFAULT NULL,
  `publico` int(1) NOT NULL,
  `id_videoteca` int(11) NOT NULL,
  PRIMARY KEY(id),
  CONSTRAINT `video_ibfk_3` FOREIGN KEY (`id_videoteca`) REFERENCES `videoteca` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `video_ibfk_4` FOREIGN KEY (`id_usuario`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=UTF8;