-- CreateTable
CREATE TABLE `Variables` (
    `idVariable` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(14, 4) NOT NULL,

    UNIQUE INDEX `Variables_descripcion_key`(`descripcion`),
    PRIMARY KEY (`idVariable`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rol` (
    `idRol` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idRol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Socio` (
    `idSocio` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `fechaNacimiento` DATETIME(3) NULL,
    `fechaIngreso` DATETIME(3) NULL,
    `fechaSalida` DATETIME(3) NULL,
    `montoAccion` DECIMAL(14, 4) NULL,
    `multiplicador` INTEGER NULL,
    `rolId` INTEGER NULL,

    PRIMARY KEY (`idSocio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Accion` (
    `idAccion` INTEGER NOT NULL AUTO_INCREMENT,
    `socioId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `monto` DECIMAL(14, 4) NOT NULL,
    `cantidadAcciones` INTEGER NOT NULL,
    `periodo` VARCHAR(191) NULL,
    `pesoMultiplicador` INTEGER NULL,

    INDEX `Accion_socioId_idx`(`socioId`),
    PRIMARY KEY (`idAccion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prestamo` (
    `idPrestamo` INTEGER NOT NULL AUTO_INCREMENT,
    `socioId` INTEGER NOT NULL,
    `monto` DECIMAL(14, 4) NOT NULL,
    `plazo` INTEGER NOT NULL,
    `motivo` VARCHAR(191) NULL,
    `modalidad` ENUM('ALEMAN', 'FRANCES') NOT NULL,
    `saldoCapital` DECIMAL(14, 4) NOT NULL,
    `saldoInteresOrdinario` DECIMAL(14, 4) NOT NULL,
    `saldoInteresMoratorio` DECIMAL(14, 4) NOT NULL,

    INDEX `Prestamo_socioId_idx`(`socioId`),
    PRIMARY KEY (`idPrestamo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pagos` (
    `idPago` INTEGER NOT NULL AUTO_INCREMENT,
    `socioId` INTEGER NOT NULL,
    `prestamoId` INTEGER NULL,
    `fechaProyectada` DATETIME(3) NOT NULL,
    `fechaReal` DATETIME(3) NULL,
    `diasAtraso` INTEGER NULL,
    `monto` DECIMAL(14, 4) NOT NULL,
    `interesOrdinario` DECIMAL(14, 4) NOT NULL,
    `tipoCuota` ENUM('ORDINARIA', 'ADICIONAL') NOT NULL,
    `interesExtraordinario` DECIMAL(14, 4) NULL,

    INDEX `Pagos_socioId_idx`(`socioId`),
    INDEX `Pagos_prestamoId_idx`(`prestamoId`),
    PRIMARY KEY (`idPago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Solicitudes` (
    `idSolicitud` INTEGER NOT NULL AUTO_INCREMENT,
    `socioId` INTEGER NOT NULL,
    `fechaSolicitud` DATETIME(3) NOT NULL,
    `detalle` VARCHAR(191) NULL,
    `aprobada` BOOLEAN NOT NULL DEFAULT false,
    `fechaAprobacion` DATETIME(3) NULL,
    `cerrada` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Solicitudes_socioId_idx`(`socioId`),
    PRIMARY KEY (`idSolicitud`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Votacion` (
    `idVoto` INTEGER NOT NULL AUTO_INCREMENT,
    `socioId` INTEGER NOT NULL,
    `solicitudId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `hora` VARCHAR(191) NULL,
    `observacion` VARCHAR(191) NULL,

    INDEX `Votacion_socioId_idx`(`socioId`),
    INDEX `Votacion_solicitudId_idx`(`solicitudId`),
    PRIMARY KEY (`idVoto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Socio` ADD CONSTRAINT `Socio_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `Rol`(`idRol`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accion` ADD CONSTRAINT `Accion_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `Socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestamo` ADD CONSTRAINT `Prestamo_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `Socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pagos` ADD CONSTRAINT `Pagos_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `Socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pagos` ADD CONSTRAINT `Pagos_prestamoId_fkey` FOREIGN KEY (`prestamoId`) REFERENCES `Prestamo`(`idPrestamo`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Solicitudes` ADD CONSTRAINT `Solicitudes_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `Socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Votacion` ADD CONSTRAINT `Votacion_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `Socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Votacion` ADD CONSTRAINT `Votacion_solicitudId_fkey` FOREIGN KEY (`solicitudId`) REFERENCES `Solicitudes`(`idSolicitud`) ON DELETE CASCADE ON UPDATE CASCADE;
