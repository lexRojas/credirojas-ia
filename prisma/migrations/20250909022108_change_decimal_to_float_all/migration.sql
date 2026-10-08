/*
  Warnings:

  - You are about to alter the column `monto_colones` on the `accion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,4)` to `Float`.
  - You are about to alter the column `monto` on the `pagos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,4)` to `Float`.
  - You are about to alter the column `interesOrdinario` on the `pagos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,4)` to `Float`.
  - You are about to alter the column `monto` on the `prestamo` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,4)` to `Float`.
  - You are about to alter the column `saldoCapital` on the `prestamo` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,4)` to `Float`.
  - You are about to alter the column `saldoInteresOrdinario` on the `prestamo` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,4)` to `Float`.
  - You are about to alter the column `saldoInteresMoratorio` on the `prestamo` table. The data in that column could be lost. The data in that column will be cast from `Decimal(14,4)` to `Float`.
  - Made the column `interesExtraordinario` on table `pagos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `montoAccion` on table `socio` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `accion` MODIFY `monto_colones` FLOAT NOT NULL;

-- AlterTable
ALTER TABLE `pagos` MODIFY `monto` FLOAT NOT NULL,
    MODIFY `interesOrdinario` FLOAT NOT NULL,
    MODIFY `interesExtraordinario` FLOAT NOT NULL;

-- AlterTable
ALTER TABLE `prestamo` MODIFY `monto` FLOAT NOT NULL,
    MODIFY `saldoCapital` FLOAT NOT NULL,
    MODIFY `saldoInteresOrdinario` FLOAT NOT NULL,
    MODIFY `saldoInteresMoratorio` FLOAT NOT NULL;

-- AlterTable
ALTER TABLE `socio` MODIFY `montoAccion` FLOAT NOT NULL;
