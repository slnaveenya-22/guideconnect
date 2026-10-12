-- CreateTable
CREATE TABLE `GuideProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `bio` TEXT NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'India',
    `languages` JSON NOT NULL,
    `expertise` JSON NOT NULL,
    `yearsOfExperience` INTEGER NOT NULL DEFAULT 0,
    `hourlyRate` INTEGER NULL,
    `serviceAreas` JSON NOT NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `verificationStatus` ENUM('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'NOT_SUBMITTED',
    `avgRating` DOUBLE NOT NULL DEFAULT 0,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GuideProfile_userId_key`(`userId`),
    INDEX `GuideProfile_city_idx`(`city`),
    INDEX `GuideProfile_verificationStatus_idx`(`verificationStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GuideProfile` ADD CONSTRAINT `GuideProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
