-- CreateTable
CREATE TABLE `socioBeneficiarios` (
  `idBeneficiario` INTEGER NOT NULL AUTO_INCREMENT,
  `socioId` INTEGER NOT NULL,
  `cedula` VARCHAR(191) NOT NULL,
  `nombreCompleto` VARCHAR(191) NOT NULL,
  `parentesco` VARCHAR(191) NOT NULL,
  `tipoBeneficiario` ENUM('ORDINARIO', 'CONTINGENTE') NOT NULL,
  `porcentajeBeneficio` DOUBLE NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `socioBeneficiarios_socioId_tipoBeneficiario_cedula_key`(`socioId`, `tipoBeneficiario`, `cedula`),
  INDEX `socioBeneficiarios_socioId_idx`(`socioId`),
  INDEX `socioBeneficiarios_tipoBeneficiario_idx`(`tipoBeneficiario`),
  PRIMARY KEY (`idBeneficiario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `socioBeneficiarios` ADD CONSTRAINT `socioBeneficiarios_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;
