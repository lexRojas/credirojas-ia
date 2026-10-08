/*
  Warnings:

  - A unique constraint covering the columns `[idSocio]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `idSocio` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `usuario_idSocio_key` ON `usuario`(`idSocio`);

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_idSocio_fkey` FOREIGN KEY (`idSocio`) REFERENCES `socio`(`idSocio`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `usuario` RENAME INDEX `usuario_rolId_fkey` TO `usuario_rolId_idx`;
