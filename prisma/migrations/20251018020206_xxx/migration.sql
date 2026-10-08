-- DropForeignKey
ALTER TABLE `votaciontoken` DROP FOREIGN KEY `VotacionToken_idSolicitud_fkey`;

-- AddForeignKey
ALTER TABLE `votaciontoken` ADD CONSTRAINT `votaciontoken_idSolicitud_fkey` FOREIGN KEY (`idSolicitud`) REFERENCES `solicitudes`(`idSolicitud`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `votaciontoken` RENAME INDEX `VotacionToken_tokenHash_idx` TO `votaciontoken_tokenHash_idx`;
