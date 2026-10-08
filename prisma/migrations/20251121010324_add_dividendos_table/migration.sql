-- CreateTable
CREATE TABLE `dividendos` (
    `idDividendos` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` VARCHAR(191) NOT NULL,
    `monto` DOUBLE NOT NULL DEFAULT 0,
    `socioId` INTEGER NOT NULL,
    `periodo` VARCHAR(191) NOT NULL,
    `capitalizado` BOOLEAN NOT NULL DEFAULT false,
    `periodoBloqueado` BOOLEAN NOT NULL DEFAULT false,

    INDEX `dividendos_socioId_idx`(`socioId`),
    INDEX `dividendos_fecha_idx`(`fecha`),
    PRIMARY KEY (`idDividendos`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `dividendos` ADD CONSTRAINT `dividendos_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;
