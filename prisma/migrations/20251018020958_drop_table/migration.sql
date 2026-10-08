/*
  Warnings:

  - You are about to drop the `votaciontoken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `votaciontoken` DROP FOREIGN KEY `votaciontoken_idSolicitud_fkey`;

-- DropTable
DROP TABLE `votaciontoken`;
