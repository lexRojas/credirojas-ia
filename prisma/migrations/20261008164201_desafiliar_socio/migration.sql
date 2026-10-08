-- AlterTable
ALTER TABLE `socio` ADD COLUMN `estadoSocio` ENUM('ACTIVO', 'DESAFILIADO') NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE `pagos` MODIFY `tipoCuota` ENUM('ORDINARIA', 'ADICIONAL', 'INCOBRABLE') NOT NULL;

-- CreateTable
CREATE TABLE `desafiliaciones` (
  `idDesafiliacion` INTEGER NOT NULL AUTO_INCREMENT,
  `socioId` INTEGER NOT NULL,
  `fechaSalida` VARCHAR(191) NOT NULL,
  `motivoSalida` ENUM('RENUNCIA', 'EXPULSION', 'FALLECIMIENTO') NOT NULL,
  `justificacionSalida` VARCHAR(191) NULL,
  `montoAcciones` DOUBLE NOT NULL,
  `montoDividendos` DOUBLE NOT NULL,
  `montoPrestamos` DOUBLE NOT NULL,
  `montoInteresOrdinario` DOUBLE NOT NULL,
  `montoInteresMoratorio` DOUBLE NOT NULL,
  `saldoDisponible` DOUBLE NOT NULL,
  `saldoPagado` DOUBLE NOT NULL,
  `saldoIncobrable` DOUBLE NOT NULL,
  `reporteId` VARCHAR(191) NULL,
  `observacion` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `desafiliaciones_socioId_idx`(`socioId`),
  INDEX `desafiliaciones_fechaSalida_idx`(`fechaSalida`),
  PRIMARY KEY (`idDesafiliacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `desafiliacionBeneficiarios` (
  `idBeneficiario` INTEGER NOT NULL AUTO_INCREMENT,
  `desafiliacionId` INTEGER NOT NULL,
  `nombre` VARCHAR(191) NOT NULL,
  `cedula` VARCHAR(191) NOT NULL,
  `montoPagado` DOUBLE NOT NULL,

  INDEX `desafiliacionBeneficiarios_desafiliacionId_idx`(`desafiliacionId`),
  PRIMARY KEY (`idBeneficiario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `incobrables` (
  `idIncobrable` INTEGER NOT NULL AUTO_INCREMENT,
  `socioId` INTEGER NOT NULL,
  `prestamoId` INTEGER NULL,
  `desafiliacionId` INTEGER NOT NULL,
  `fecha` VARCHAR(191) NOT NULL,
  `monto` DOUBLE NOT NULL,
  `montoCapital` DOUBLE NOT NULL DEFAULT 0,
  `montoInteresOrdinario` DOUBLE NOT NULL DEFAULT 0,
  `montoInteresMoratorio` DOUBLE NOT NULL DEFAULT 0,
  `motivo` VARCHAR(191) NOT NULL,
  `detalle` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `incobrables_socioId_idx`(`socioId`),
  INDEX `incobrables_prestamoId_idx`(`prestamoId`),
  INDEX `incobrables_desafiliacionId_idx`(`desafiliacionId`),
  INDEX `incobrables_fecha_idx`(`fecha`),
  PRIMARY KEY (`idIncobrable`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `desafiliaciones` ADD CONSTRAINT `desafiliaciones_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `desafiliacionBeneficiarios` ADD CONSTRAINT `desafiliacionBeneficiarios_desafiliacionId_fkey` FOREIGN KEY (`desafiliacionId`) REFERENCES `desafiliaciones`(`idDesafiliacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incobrables` ADD CONSTRAINT `incobrables_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incobrables` ADD CONSTRAINT `incobrables_prestamoId_fkey` FOREIGN KEY (`prestamoId`) REFERENCES `prestamo`(`idPrestamo`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incobrables` ADD CONSTRAINT `incobrables_desafiliacionId_fkey` FOREIGN KEY (`desafiliacionId`) REFERENCES `desafiliaciones`(`idDesafiliacion`) ON DELETE CASCADE ON UPDATE CASCADE;
