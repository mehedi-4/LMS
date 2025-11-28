/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.0.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: course_db
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
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `cid` bigint(20) NOT NULL AUTO_INCREMENT,
  `course_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `instructor_id` bigint(20) NOT NULL,
  PRIMARY KEY (`cid`),
  KEY `instructor_id` (`instructor_id`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `instructor` (`tid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `course` VALUES
(17,'Data Structure','Learn Data Structure',10.00,2),
(18,'DBMS','Database',15.00,3),
(19,'Computer Acrhitechture','seg',10.00,3),
(20,'Theory of Computation','adfk adfkjl',30.00,2);
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `course_lecture`
--

DROP TABLE IF EXISTS `course_lecture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_lecture` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `course_id` bigint(20) NOT NULL,
  `lecture_number` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `video_path` varchar(512) NOT NULL,
  `video_original_name` varchar(255) DEFAULT NULL,
  `video_mime` varchar(128) DEFAULT NULL,
  `video_size` bigint(20) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_course_lecture` (`course_id`,`lecture_number`),
  CONSTRAINT `fk_lecture_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`cid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_lecture`
--

LOCK TABLES `course_lecture` WRITE;
/*!40000 ALTER TABLE `course_lecture` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `course_lecture` VALUES
(7,17,1,'Lecture 1','/uploads/videos/1764066765384-194735087.mp4','snapsave-app_778986108505475_hd.mp4','video/mp4',5038148,'2025-11-25 16:32:45'),
(8,17,2,'Lecture 2','/uploads/videos/1764066765397-757909584.mp4','snapsave-app_1225900576015944_hd.mp4','video/mp4',2078260,'2025-11-25 16:32:45'),
(9,18,1,'Lecture 1','/uploads/videos/1764067338412-387253569.mp4','The 1975 - About You (Official).mp4','video/mp4',6618614,'2025-11-25 16:42:18'),
(10,18,2,'Lecture 2','/uploads/videos/1764067338427-221712234.mp4','snapsave-app_778986108505475_hd.mp4','video/mp4',5038148,'2025-11-25 16:42:18'),
(11,18,3,'Lecture 3','/uploads/videos/1764067338437-260486077.mp4','snapsave-app_1225900576015944_hd.mp4','video/mp4',2078260,'2025-11-25 16:42:18'),
(12,19,1,'foreplay','/uploads/videos/1764068505156-617651120.mp4','snapsave-app_778986108505475_hd.mp4','video/mp4',5038148,'2025-11-25 17:01:45'),
(13,19,2,'actual segs','/uploads/videos/1764068505279-151376627.mp4','snapsave-app_1225900576015944_hd.mp4','video/mp4',2078260,'2025-11-25 17:01:45'),
(14,20,1,'lec 1','/uploads/videos/1764102817952-784615854.mp4','The 1975 - About You (Official).mp4','video/mp4',6618614,'2025-11-26 02:33:38'),
(15,20,2,'lec 2','/uploads/videos/1764102817988-138647507.mp4','snapsave-app_778986108505475_hd.mp4','video/mp4',5038148,'2025-11-26 02:33:38');
/*!40000 ALTER TABLE `course_lecture` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `course_manifest`
--

DROP TABLE IF EXISTS `course_manifest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_manifest` (
  `course_id` bigint(20) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `stored_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`course_id`),
  CONSTRAINT `fk_manifest_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`cid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_manifest`
--

LOCK TABLES `course_manifest` WRITE;
/*!40000 ALTER TABLE `course_manifest` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `course_manifest` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `course_material`
--

DROP TABLE IF EXISTS `course_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_material` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `lecture_id` bigint(20) NOT NULL,
  `material_type` varchar(128) NOT NULL,
  `file_path` varchar(512) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_material_lecture` (`lecture_id`),
  CONSTRAINT `fk_material_lecture` FOREIGN KEY (`lecture_id`) REFERENCES `course_lecture` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_material`
--

LOCK TABLES `course_material` WRITE;
/*!40000 ALTER TABLE `course_material` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `course_material` VALUES
(7,7,'image/png','/uploads/materials/1764066765394-585411010.png','wallhaven-d6j79o.png','2025-11-25 16:32:45'),
(8,8,'image/png','/uploads/materials/1764066765401-759763549.png','Generated Image November 15, 2025 - 5_30AM.png','2025-11-25 16:32:45'),
(9,9,'application/pdf','/uploads/materials/1764067338427-370886803.pdf','API-Project_251121_080310.pdf','2025-11-25 16:42:18'),
(10,10,'application/pdf','/uploads/materials/1764067338435-928858941.pdf','Chapter1.pdf','2025-11-25 16:42:18'),
(11,11,'image/jpeg','/uploads/materials/1764067338443-763245752.jpg','pple-carplay-ios-26-4000x2182-23294.jpg','2025-11-25 16:42:18'),
(12,12,'image/jpeg','/uploads/materials/1764068505166-811005303.jpg','macos-tahoe-26-5k-6016x6016-22672.jpg','2025-11-25 17:01:45'),
(13,12,'application/pdf','/uploads/materials/1764068505180-4232921.pdf','Chapter1.pdf','2025-11-25 17:01:45'),
(14,12,'application/zip','/uploads/materials/1764068505181-33495280.zip','LMS.zip','2025-11-25 17:01:45'),
(15,13,'image/png','/uploads/materials/1764068505282-587432232.png','wallhaven-d6j79o.png','2025-11-25 17:01:45'),
(16,14,'image/png','/uploads/materials/1764102817976-899334832.png','Generated Image November 15, 2025 - 5_30AM.png','2025-11-26 02:33:38'),
(17,14,'image/jpeg','/uploads/materials/1764102817981-326488434.jpg','ios-26-apple-4000x2182-23300.jpg','2025-11-26 02:33:38'),
(18,15,'image/png','/uploads/materials/1764102817998-46077309.png','wallhaven-d6j79o.png','2025-11-26 02:33:38');
/*!40000 ALTER TABLE `course_material` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `enrollment`
--

DROP TABLE IF EXISTS `enrollment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollment` (
  `eid` bigint(20) NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) NOT NULL,
  `course_id` bigint(20) NOT NULL,
  `enrollment_date` datetime DEFAULT current_timestamp(),
  `tid` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`eid`),
  UNIQUE KEY `unique_enrollment` (`student_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `enrollment_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`uid`) ON DELETE CASCADE,
  CONSTRAINT `enrollment_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `course` (`cid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollment`
--

LOCK TABLES `enrollment` WRITE;
/*!40000 ALTER TABLE `enrollment` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `enrollment` VALUES
(1,5,20,'2025-11-28 01:52:15',NULL),
(2,7,19,'2025-11-28 01:53:23',NULL),
(3,6,18,'2025-11-28 01:54:49',NULL),
(4,6,17,'2025-11-28 01:54:54',NULL),
(5,5,17,'2025-11-28 02:06:01',NULL),
(6,7,20,'2025-11-28 14:38:16',NULL),
(7,5,18,'2025-11-28 14:58:58',NULL);
/*!40000 ALTER TABLE `enrollment` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `instructor`
--

DROP TABLE IF EXISTS `instructor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor` (
  `tid` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `payment_setup` tinyint(1) DEFAULT 0,
  `bank_acc_no` varchar(30) DEFAULT NULL,
  `bank_secret_key` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`tid`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor`
--

LOCK TABLES `instructor` WRITE;
/*!40000 ALTER TABLE `instructor` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `instructor` VALUES
(2,'mish13','1234',1,'1234567890123458','741236'),
(3,'iz','1234',1,'1234567890123459','456468'),
(4,'ss','1234',1,'1234567890123458','456468'),
(5,'mm','1234',1,'1236','123');
/*!40000 ALTER TABLE `instructor` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `student` (
  `uid` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `payment_setup` tinyint(1) DEFAULT 0,
  `bank_acc_no` varchar(30) DEFAULT NULL,
  `bank_secret_key` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

LOCK TABLES `student` WRITE;
/*!40000 ALTER TABLE `student` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `student` VALUES
(4,'mehedi4','1234',0,NULL,NULL),
(5,'rehan56','1234',1,'0123456789012345','458721'),
(6,'tarti52','1234',1,'0123456789012346','932145'),
(7,'hadis6','1234',1,'0123456789012347','932145');
/*!40000 ALTER TABLE `student` ENABLE KEYS */;
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

-- Dump completed on 2025-11-28 14:59:46
