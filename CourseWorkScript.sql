-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema CourseWorkDatabase
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema CourseWorkDatabase
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `CourseWorkDatabase` DEFAULT CHARACTER SET utf8 ;
USE `CourseWorkDatabase` ;

-- -----------------------------------------------------
-- Table `CourseWorkDatabase`.`student`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `CourseWorkDatabase`.`student` (
  `studentId` INT NOT NULL AUTO_INCREMENT,
  `firstName` VARCHAR(30) NOT NULL,
  `secondName` VARCHAR(30) NOT NULL,
  `group` VARCHAR(10) NOT NULL,
  `login` VARCHAR(62) NOT NULL,
  `password` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`studentId`),
  UNIQUE INDEX `login_UNIQUE` (`login` ASC) VISIBLE,
  UNIQUE INDEX `studentId_UNIQUE` (`studentId` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CourseWorkDatabase`.`courseWork`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `CourseWorkDatabase`.`courseWork` (
  `courseWorkId` INT NOT NULL AUTO_INCREMENT,
  `studentId` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `year` YEAR(4) NOT NULL,
  `headFirstName` VARCHAR(30) NOT NULL,
  `headSecondName` VARCHAR(30) NOT NULL,
  `taskText` MEDIUMTEXT NULL,
  `isConfirmedTaskText` TINYINT(1) NULL,
  `currentNote` LONGTEXT NULL,
  `linkToCode` VARCHAR(100) NULL,
  `presentation` MEDIUMTEXT NULL,
  `admittanceToProtection` TINYINT(1) NULL,
  `finalEvaluation` TINYINT(1) NULL,
  PRIMARY KEY (`courseWorkId`, `studentId`),
  UNIQUE INDEX `title_UNIQUE` (`title` ASC) VISIBLE,
  UNIQUE INDEX `courseWorkId_UNIQUE` (`courseWorkId` ASC) VISIBLE,
  INDEX `fk_courseWork_student_idx` (`studentId` ASC) VISIBLE,
  CONSTRAINT `fk_courseWork_student`
    FOREIGN KEY (`studentId`)
    REFERENCES `CourseWorkDatabase`.`student` (`studentId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CourseWorkDatabase`.`consultation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `CourseWorkDatabase`.`consultation` (
  `studentId` INT NOT NULL,
  `courseWorkId` INT NOT NULL,
  `date` DATE NOT NULL,
  `topic` MEDIUMTEXT NULL,
  PRIMARY KEY (`studentId`, `courseWorkId`, `date`),
  INDEX `fk_consultation_courseWork1_idx` (`courseWorkId` ASC, `studentId` ASC) VISIBLE,
  CONSTRAINT `fk_consultation_courseWork1`
    FOREIGN KEY (`courseWorkId` , `studentId`)
    REFERENCES `CourseWorkDatabase`.`courseWork` (`courseWorkId` , `studentId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CourseWorkDatabase`.`protection`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `CourseWorkDatabase`.`protection` (
  `studentId` INT NOT NULL,
  `courseWorkId` INT NOT NULL,
  `date` DATE NOT NULL,
  `isMainProtection` TINYINT(1) NOT NULL,
  `finalEvaluation` TINYINT(1) NULL,
  PRIMARY KEY (`studentId`, `courseWorkId`, `date`),
  INDEX `fk_beforeProtection_courseWork1_idx` (`courseWorkId` ASC, `studentId` ASC) VISIBLE,
  CONSTRAINT `fk_beforeProtection_courseWork1`
    FOREIGN KEY (`courseWorkId` , `studentId`)
    REFERENCES `CourseWorkDatabase`.`courseWork` (`courseWorkId` , `studentId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CourseWorkDatabase`.`professor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `CourseWorkDatabase`.`professor` (
  `professorId` INT NOT NULL AUTO_INCREMENT,
  `firstName` VARCHAR(30) NOT NULL,
  `secondName` VARCHAR(30) NOT NULL,
  `login` VARCHAR(60) NOT NULL,
  `password` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`professorId`),
  UNIQUE INDEX `professorId_UNIQUE` (`professorId` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `CourseWorkDatabase`.`protectionEvaluation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `CourseWorkDatabase`.`protectionEvaluation` (
  `studentId` INT NOT NULL,
  `courseWorkId` INT NOT NULL,
  `date` DATE NOT NULL,
  `professorId` INT NOT NULL,
  `evaluation` TINYINT(1) NULL,
  PRIMARY KEY (`studentId`, `courseWorkId`, `date`, `professorId`),
  INDEX `fk_beforeProtectionEvaluation_professor1_idx` (`professorId` ASC) VISIBLE,
  CONSTRAINT `fk_beforeProtectionEvaluation_beforeProtection1`
    FOREIGN KEY (`studentId` , `courseWorkId` , `date`)
    REFERENCES `CourseWorkDatabase`.`protection` (`studentId` , `courseWorkId` , `date`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_beforeProtectionEvaluation_professor1`
    FOREIGN KEY (`professorId`)
    REFERENCES `CourseWorkDatabase`.`professor` (`professorId`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
