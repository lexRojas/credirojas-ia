/*
  Warnings:

  - You are about to drop the column `interesExtraordinario` on the `pagos` table. All the data in the column will be lost.
  - Added the required column `interesMoratorio` to the `pagos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pagos` DROP COLUMN `interesExtraordinario`,
    ADD COLUMN `interesMoratorio` FLOAT NOT NULL;
