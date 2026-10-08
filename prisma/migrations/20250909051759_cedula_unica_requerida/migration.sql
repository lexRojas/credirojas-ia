/*
  Warnings:

  - A unique constraint covering the columns `[cedula]` on the table `socio` will be added. If there are existing duplicate values, this will fail.
  - Made the column `cedula` on table `socio` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `socio` MODIFY `cedula` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `socio_cedula_key` ON `socio`(`cedula`);
