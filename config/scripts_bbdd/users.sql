CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `apellido1` varchar(255) DEFAULT NULL,
  `apellido2` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `activo` int(1) NOT NULL DEFAULT '1',
  `fechaBaja` datetime DEFAULT NULL,
  `root` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB