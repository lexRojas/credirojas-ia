-- DropForeignKey
ALTER TABLE `accion` DROP FOREIGN KEY `Accion_socioId_fkey`;

-- DropForeignKey
ALTER TABLE `pagos` DROP FOREIGN KEY `Pagos_prestamoId_fkey`;

-- DropForeignKey
ALTER TABLE `pagos` DROP FOREIGN KEY `Pagos_socioId_fkey`;

-- DropForeignKey
ALTER TABLE `prestamo` DROP FOREIGN KEY `Prestamo_socioId_fkey`;

-- DropForeignKey
ALTER TABLE `socio` DROP FOREIGN KEY `Socio_rolId_fkey`;

-- DropForeignKey
ALTER TABLE `solicitudes` DROP FOREIGN KEY `Solicitudes_socioId_fkey`;

-- DropForeignKey
ALTER TABLE `votacion` DROP FOREIGN KEY `Votacion_socioId_fkey`;

-- DropForeignKey
ALTER TABLE `votacion` DROP FOREIGN KEY `Votacion_solicitudId_fkey`;

-- AddForeignKey
ALTER TABLE `socio` ADD CONSTRAINT `socio_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `rol`(`idRol`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accion` ADD CONSTRAINT `accion_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prestamo` ADD CONSTRAINT `prestamo_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_prestamoId_fkey` FOREIGN KEY (`prestamoId`) REFERENCES `prestamo`(`idPrestamo`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitudes` ADD CONSTRAINT `solicitudes_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votacion` ADD CONSTRAINT `votacion_socioId_fkey` FOREIGN KEY (`socioId`) REFERENCES `socio`(`idSocio`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votacion` ADD CONSTRAINT `votacion_solicitudId_fkey` FOREIGN KEY (`solicitudId`) REFERENCES `solicitudes`(`idSolicitud`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `accion` RENAME INDEX `Accion_socioId_idx` TO `accion_socioId_idx`;

-- RenameIndex
ALTER TABLE `pagos` RENAME INDEX `Pagos_prestamoId_idx` TO `pagos_prestamoId_idx`;

-- RenameIndex
ALTER TABLE `pagos` RENAME INDEX `Pagos_socioId_idx` TO `pagos_socioId_idx`;

-- RenameIndex
ALTER TABLE `prestamo` RENAME INDEX `Prestamo_socioId_idx` TO `prestamo_socioId_idx`;

-- RenameIndex
ALTER TABLE `solicitudes` RENAME INDEX `Solicitudes_socioId_idx` TO `solicitudes_socioId_idx`;

-- RenameIndex
ALTER TABLE `variables` RENAME INDEX `Variables_descripcion_key` TO `variables_descripcion_key`;

-- RenameIndex
ALTER TABLE `votacion` RENAME INDEX `Votacion_socioId_idx` TO `votacion_socioId_idx`;

-- RenameIndex
ALTER TABLE `votacion` RENAME INDEX `Votacion_solicitudId_idx` TO `votacion_solicitudId_idx`;
