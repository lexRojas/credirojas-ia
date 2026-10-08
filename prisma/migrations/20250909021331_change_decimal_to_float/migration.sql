/*
  Warnings:

  - You are about to alter the column `valor` on the `variables` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,4)` to `Float`.

*/
-- AlterTable
ALTER TABLE `variables` MODIFY `valor` FLOAT NOT NULL;
