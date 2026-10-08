-- DropForeignKey
ALTER TABLE `socio` DROP FOREIGN KEY `socio_rolId_fkey`;

-- DropIndex
DROP INDEX `socio_rolId_fkey` ON `socio`;

-- CreateTable
CREATE TABLE `usuario` (
    `idUsuario` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `rolId` INTEGER NULL,

    UNIQUE INDEX `usuario_username_key`(`username`),
    PRIMARY KEY (`idUsuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `rol`(`idRol`) ON DELETE SET NULL ON UPDATE CASCADE;
