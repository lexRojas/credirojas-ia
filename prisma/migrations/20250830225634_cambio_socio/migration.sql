/*
  Warnings:

  - You are about to drop the column `apellido` on the `socio` table. All the data in the column will be lost.
  - You are about to drop the column `rolId` on the `socio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `socio` DROP COLUMN `apellido`,
    DROP COLUMN `rolId`,
    ADD COLUMN `cedula` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `socio_cedula_idx` ON `socio`(`cedula`);
