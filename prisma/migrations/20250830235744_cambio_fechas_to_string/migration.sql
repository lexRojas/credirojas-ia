-- AlterTable
ALTER TABLE `accion` MODIFY `fecha` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `pagos` MODIFY `fechaProyectada` VARCHAR(191) NOT NULL,
    MODIFY `fechaReal` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `socio` MODIFY `fechaNacimiento` VARCHAR(191) NULL,
    MODIFY `fechaIngreso` VARCHAR(191) NULL,
    MODIFY `fechaSalida` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `solicitudes` MODIFY `fechaSolicitud` VARCHAR(191) NOT NULL,
    MODIFY `fechaAprobacion` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `votacion` MODIFY `fecha` VARCHAR(191) NOT NULL;
