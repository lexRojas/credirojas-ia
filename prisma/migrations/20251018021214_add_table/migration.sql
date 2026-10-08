-- CreateTable
CREATE TABLE `votacionToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tokenHash` VARCHAR(128) NOT NULL,
    `idSolicitud` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `votacionToken_tokenHash_idx`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `votacionToken` ADD CONSTRAINT `votacionToken_idSolicitud_fkey` FOREIGN KEY (`idSolicitud`) REFERENCES `solicitudes`(`idSolicitud`) ON DELETE CASCADE ON UPDATE CASCADE;
