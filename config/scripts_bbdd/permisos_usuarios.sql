CREATE TABLE `permisos_usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` int(11) NOT NULL,
  `idPermiso` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `fkIdPUsuario_idx` (`idUsuario`),
  KEY `fkIdPermiso_idx` (`idPermiso`),
  CONSTRAINT `fkIdPUsuario` FOREIGN KEY (`idUsuario`) REFERENCES `Users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fkIdPermiso`  FOREIGN KEY (`idPermiso`) REFERENCES `permisos` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB