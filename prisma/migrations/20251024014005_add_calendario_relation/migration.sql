/*
  Warnings:

  - A unique constraint covering the columns `[fecha]` on the table `calendario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `factor` to the `calendario` table without a default value. This is not possible if the table is not empty.
  - Made the column `fechaReal` on table `pagos` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `calendario` ADD COLUMN `factor` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `pagos` MODIFY `fechaReal` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `calendario_fecha_key` ON `calendario`(`fecha`);

-- AddForeignKey
ALTER TABLE `accion` ADD CONSTRAINT `accion_fecha_fkey` FOREIGN KEY (`fecha`) REFERENCES `calendario`(`fecha`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_fechaReal_fkey` FOREIGN KEY (`fechaReal`) REFERENCES `calendario`(`fecha`) ON DELETE RESTRICT ON UPDATE CASCADE;
