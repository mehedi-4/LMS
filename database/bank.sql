/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.0.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: bank
-- ------------------------------------------------------
-- Server version	12.0.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `from_account_no` varchar(50) DEFAULT NULL,
  `to_account_no` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_type` enum('debit','credit') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_from_account` (`from_account_no`),
  KEY `idx_to_account` (`to_account_no`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `transactions` VALUES
(1,'0123456789012345','9999999999999999',30.00,'debit','Course payment to LMS','2025-11-27 19:52:15'),
(2,'9999999999999999','1234567890123458',15.00,'credit','Course revenue share (50%)','2025-11-27 19:52:15'),
(3,'0123456789012347','9999999999999999',10.00,'debit','Course payment to LMS','2025-11-27 19:53:23'),
(4,'9999999999999999','1234567890123459',5.00,'credit','Course revenue share (50%)','2025-11-27 19:53:23'),
(5,'0123456789012346','9999999999999999',15.00,'debit','Course payment to LMS','2025-11-27 19:54:49'),
(6,'9999999999999999','1234567890123459',7.50,'credit','Course revenue share (50%)','2025-11-27 19:54:49'),
(7,'0123456789012346','9999999999999999',10.00,'debit','Course payment to LMS','2025-11-27 19:54:54'),
(8,'9999999999999999','1234567890123458',5.00,'credit','Course revenue share (50%)','2025-11-27 19:54:54'),
(9,'0123456789012345','9999999999999999',10.00,'debit','Course payment to LMS','2025-11-27 20:06:01'),
(10,'9999999999999999','1234567890123458',5.00,'credit','Course revenue share (50%)','2025-11-27 20:06:01'),
(11,'0123456789012347','9999999999999999',30.00,'debit','Course payment to LMS','2025-11-28 08:38:16'),
(12,'9999999999999999','1234567890123458',15.00,'credit','Course revenue share (50%)','2025-11-28 08:38:16'),
(13,'0123456789012345','9999999999999999',15.00,'debit','Course payment to LMS','2025-11-28 08:58:58'),
(14,'9999999999999999','1234567890123459',7.50,'credit','Course revenue share (50%)','2025-11-28 08:58:58');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `uid` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `account_no` char(16) NOT NULL,
  `secret_key` char(6) NOT NULL,
  `balance` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `account_no` (`account_no`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES
(1,'Rehan','0123456789012345','458721',145.00),
(2,'Tarit','0123456789012346','932145',175.00),
(3,'Hadis','0123456789012347','932145',160.00),
(4,'LMS','9999999999999999','932145',60.00),
(5,'Mishal','1234567890123458','741236',40.00),
(6,'IZ','1234567890123459','456468',20.00),
(8,'Shifat','1234567890123460','123455',0.00),
(9,'Masum','1234567890123461','123456',0.00);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-11-28 15:00:04
