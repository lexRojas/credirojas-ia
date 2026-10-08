-- CreateTable
CREATE TABLE `auxiliarContable` (
    `idAuxiliar` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` VARCHAR(191) NOT NULL,
    `tipoMovimiento` INTEGER NOT NULL DEFAULT 1,
    `monto` DOUBLE NOT NULL DEFAULT 0,
    `nota` VARCHAR(191) NOT NULL,

    INDEX `auxiliarContable_fecha_idx`(`fecha`),
    PRIMARY KEY (`idAuxiliar`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
