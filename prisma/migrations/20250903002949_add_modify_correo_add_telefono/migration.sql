/*
  Warnings:

  - A unique constraint covering the columns `[correo]` on the table `socio` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `socio` ADD COLUMN `telefono` VARCHAR(191) NULL,
    ALTER COLUMN `correo` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `socio_correo_key` ON `socio`(`correo`);
