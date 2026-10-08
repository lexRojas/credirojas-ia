-- CreateTable
CREATE TABLE `calendario` (
    `idCalendario` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` VARCHAR(191) NOT NULL,
    `periodo` VARCHAR(191) NOT NULL,
    `mes` VARCHAR(191) NOT NULL,
    `pagado` BOOLEAN NOT NULL DEFAULT false,

    INDEX `calendario_fecha_idx`(`fecha`),
    PRIMARY KEY (`idCalendario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
