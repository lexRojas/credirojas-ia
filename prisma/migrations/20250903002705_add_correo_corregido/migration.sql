/*
  Warnings:

  - You are about to drop the column `correo` on the `accion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `accion` DROP COLUMN `correo`;

-- AlterTable
ALTER TABLE `socio` ADD COLUMN `correo` VARCHAR(191) NOT NULL DEFAULT 'xxx@xxx.com';
