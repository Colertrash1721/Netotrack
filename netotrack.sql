-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: netotrack
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `concurrentsroutes`
--

DROP TABLE IF EXISTS `concurrentsroutes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `concurrentsroutes` (
  `idRoute` int NOT NULL AUTO_INCREMENT,
  `routeName` varchar(100) NOT NULL,
  `Startlatitud` varchar(50) NOT NULL,
  `Startlongitud` varchar(50) NOT NULL,
  `Endlatitud` varchar(50) NOT NULL,
  `Endlongitud` varchar(50) NOT NULL,
  PRIMARY KEY (`idRoute`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `concurrentsroutes`
--

LOCK TABLES `concurrentsroutes` WRITE;
/*!40000 ALTER TABLE `concurrentsroutes` DISABLE KEYS */;
INSERT INTO `concurrentsroutes` VALUES (1,'prueba','18.488455498553684','-69.98641906348897','18.511883747254743','-69.98951850530833'),(2,'pru','18.420616363823896','-68.9501659893516','18.450553929449292','-68.9634029894454'),(3,'Puerto plata','18.453949497006644','-69.98169525379316','18.4302248929231','-70.00388967484179'),(4,'ESC group hasta la junta municipal','18.488453044798362','-69.98604298024134','18.83117957832828','-69.94751013467838'),(5,'Caucedo al puerto de la Romana','18.42788762111156','-69.63292428882072','18.41643977452897','-68.95766670626547'),(6,'Puerto hacia puerto de la romana','18.414076452858314','-70.02079536015','18.41605151080274','-68.95779537363984'),(7,'Desde Juan Dolio hasta la romana','18.431719278018686','-69.39445908192471','18.417366795430294','-68.95767023462241'),(8,'Desde la romana hasta el puerto de haina','18.435348487134302','-69.64356331912882','18.415195260823328','-70.02044483739338'),(9,'Aila-SanPedroZF','18.428826884621234','-69.67381896031763','18.45189159662699','-69.28929320652784'),(10,'HatoMayor-Prueba','18.773869195869292','-69.26904311125968','18.591534731709338','-69.68989043297844');
/*!40000 ALTER TABLE `concurrentsroutes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deviceinroutes`
--

DROP TABLE IF EXISTS `deviceinroutes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deviceinroutes` (
  `idRute` int NOT NULL AUTO_INCREMENT,
  `rute_Name` varchar(100) NOT NULL,
  `device_Name` varchar(50) DEFAULT NULL,
  `Startlatitud` varchar(50) NOT NULL,
  `Startlongitud` varchar(50) NOT NULL,
  `Endlatitud` varchar(50) NOT NULL,
  `Endlongitud` varchar(50) NOT NULL,
  `creationDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idRute`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deviceinroutes`
--

LOCK TABLES `deviceinroutes` WRITE;
/*!40000 ALTER TABLE `deviceinroutes` DISABLE KEYS */;
INSERT INTO `deviceinroutes` VALUES (2,'','8044500502','18.482415080056562','-69.7273710527553','18.480944047369146','-68.71821744299845','2025-04-02 18:17:14'),(3,'','8044500207','18.483893678127533','-69.97885217970065','18.455725952977005','-69.58162775343112','2025-04-02 18:20:46'),(4,'','8044500209','18.47764040041527','-69.73815959411155','18.437444302262847','-69.35042690131125','2025-04-08 20:55:15');
/*!40000 ALTER TABLE `deviceinroutes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login`
--

DROP TABLE IF EXISTS `login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login` (
  `idUser` int NOT NULL AUTO_INCREMENT,
  `NameUser` varchar(50) NOT NULL,
  `passwordUser` varchar(255) DEFAULT NULL,
  `emailUser` varchar(50) NOT NULL,
  `creationdate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `lastConnection` date DEFAULT NULL,
  PRIMARY KEY (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login`
--

LOCK TABLES `login` WRITE;
/*!40000 ALTER TABLE `login` DISABLE KEYS */;
INSERT INTO `login` VALUES (1,'Sarah','$2b$10$rt6.c6H7d4n3W3GfUdQdCuOs8dXue6ViQKHrRilIlkndgzP9bAiqm','Stevenrobinsoncruz3@gmail.com',NULL,NULL),(2,'Steven','$2b$05$z2S6/MrXni3JYMiq9ovPsuW.2DhchnYkuU2CbCIjXAS0TDNHhiYPS','Stevenrobinsoncruz3@gmail.com','2025-03-06 18:18:24',NULL),(3,'Steven Cruz','$2b$10$IriDLJQqT2kLmCXliitclO2E3AwrUSMA3q8r/jUwENxZMwR/M4yzK','Stevenrobinsoncruz3@gmail.com','2025-03-07 12:43:51',NULL),(4,'Steven Cruz1','$2b$10$eiLnp7Hcus6gmJjhDK6ffePmHZ3nGbXkzxy/9eCrlRs1Rr5pzosDC','Stevenrobinsoncruz3@gmail.com','2025-03-07 13:03:54',NULL),(5,'Steven Cruz12','$2b$10$m7KYfGQ4Z804hY5.Tk3wBeK3kF8P/BvLbTp/jIs02Nkn9cadsyCz.','Stevenrobinsoncruz3@gmail.com','2025-03-07 13:37:31',NULL),(6,'Sarah Martinez','$2b$10$.gRVz76F59cRIsTrsdt.2.psW9OTRYy/iKO6hED.U1WPkFPPFo7Xa','sarahmartinez@gmail.com','2025-03-07 13:47:51',NULL),(7,'Sarah Martinez12','$2b$10$z4TIbzAjyZWGSlFgseOY.O/EcbY.6g.u306iCNDMynFfJjjeh4YFW','sarahmartinez@gmail.com','2025-03-07 13:48:37',NULL),(8,'Sarah123','$2b$10$i0H9rYboQBgaLNcHAjV2Yucg1aJnLbp9FqSGgVFdXVsimkF3vD7S6','sarahmartinez@gmail.com','2025-03-07 13:57:03',NULL),(9,'Sarita12','$2b$10$tk2rmT8RY62b7Msu1VB8G..3BVCRIXTN55CPzJvebSYC384G5BQDG','sarahmartinez@gmail.com','2025-03-07 14:01:22',NULL),(10,'Miesposa','$2b$10$Fv4GcMau37RI4Rab48nvI.erdNB1/U.KU20r9oAqweGrntGefHIjW','robinsoncruzandujar3@gmail.com','2025-03-07 18:49:29',NULL);
/*!40000 ALTER TABLE `login` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-15 17:46:55
