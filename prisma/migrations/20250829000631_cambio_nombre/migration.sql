/*
  Warnings:

  - You are about to drop the column `nombre_socio` on the `socio` table. All the data in the column will be lost.
  - Added the required column `apellido` to the `Socio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Socio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `socio` DROP COLUMN `nombre_socio`,
    ADD COLUMN `apellido` VARCHAR(191) NOT NULL,
    ADD COLUMN `nombre` VARCHAR(191) NOT NULL;
