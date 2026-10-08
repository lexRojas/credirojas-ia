/*
  Warnings:

  - You are about to drop the column `nombre` on the `socio` table. All the data in the column will be lost.
  - Added the required column `nombre_socio` to the `Socio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `socio` DROP COLUMN `nombre`,
    ADD COLUMN `nombre_socio` VARCHAR(191) NOT NULL;
