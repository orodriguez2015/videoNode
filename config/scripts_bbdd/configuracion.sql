CREATE TABLE `configuracion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `servidor_bbdd` varchar(50) DEFAULT NULL,
  `nombre_bbdd` varchar(50) DEFAULT NULL,
  `usuario_bbdd` varchar(50) DEFAULT NULL,
  `password_bbdd` varchar(50) DEFAULT NULL,
  `fecha_instalacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado_instalacion` int(11) not null,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8
