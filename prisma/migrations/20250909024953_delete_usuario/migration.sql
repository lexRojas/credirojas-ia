/*
  Warnings:

  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `socio` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `socio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `socio` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `usuario` DROP FOREIGN KEY `usuario_idSocio_fkey`;

-- DropForeignKey
ALTER TABLE `usuario` DROP FOREIGN KEY `usuario_rolId_fkey`;

-- AlterTable
ALTER TABLE `socio` ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `rolId` INTEGER NULL,
    ADD COLUMN `username` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `usuario`;

-- CreateIndex
CREATE UNIQUE INDEX `socio_username_key` ON `socio`(`username`);

-- AddForeignKey
ALTER TABLE `socio` ADD CONSTRAINT `socio_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `rol`(`idRol`) ON DELETE SET NULL ON UPDATE CASCADE;
