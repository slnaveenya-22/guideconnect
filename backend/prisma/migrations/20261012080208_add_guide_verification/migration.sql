-- CreateTable
CREATE TABLE `GuideVerification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guideProfileId` INTEGER NOT NULL,
    `govIdUrl` VARCHAR(191) NOT NULL,
    `credentialsUrl` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `status` ENUM('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejectionReason` TEXT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `reviewedBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GuideVerification_guideProfileId_key`(`guideProfileId`),
    INDEX `GuideVerification_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GuideVerification` ADD CONSTRAINT `GuideVerification_guideProfileId_fkey` FOREIGN KEY (`guideProfileId`) REFERENCES `GuideProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuideVerification` ADD CONSTRAINT `GuideVerification_reviewedBy_fkey` FOREIGN KEY (`reviewedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
