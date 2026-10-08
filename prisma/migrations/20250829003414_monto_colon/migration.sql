/*
  Warnings:

  - You are about to drop the column `monto` on the `accion` table. All the data in the column will be lost.
  - Added the required column `monto_colones` to the `accion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `accion` DROP COLUMN `monto`,
    ADD COLUMN `monto_colones` DECIMAL(14, 4) NOT NULL;
