CREATE TABLE IF NOT EXISTS `cl_spawnselector` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `location_data` longtext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=375 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `cl_spawnselector` (`id`, `location_data`) VALUES
	(1, '{"locationText":"Hospital","iconColor":"rgb(51, 51, 51)","iconName":"fas fa-hospital","screenPosition":{"left":510,"resolution":{"height":1080,"width":1920},"top":571},"backgroundColor":"rgb(253, 92, 99)"}'),
	(2, '{"locationText":"Legion Square","iconColor":"rgb(51, 51, 51)","iconName":"fas fa-tree","screenPosition":{"left":477,"resolution":{"height":1080,"width":1920},"top":546},"backgroundColor":"#c3f2cb"}'),
	(3, '{"locationText":"Airport","iconColor":"rgb(51, 51, 51)","iconName":"fas fa-cart-flatbed-suitcase","screenPosition":{"left":167,"resolution":{"height":1080,"width":1920},"top":391},"backgroundColor":"rgb(200, 237, 253)"}'),
	(4, '{"locationText":"Mount Chiliad","iconColor":"rgb(51, 51, 51)","iconName":"fas fa-person-hiking","screenPosition":{"left":1520,"resolution":{"height":1080,"width":1920},"top":595},"backgroundColor":"rgb(129, 104, 2)"}'),
	(5, '{"locationText":"MRPD","iconColor":"rgb(51, 51, 51)","iconName":"fas fa-shield","screenPosition":{"left":454,"resolution":{"height":1080,"width":1920},"top":587},"backgroundColor":"rgb(124, 185, 232)"}');