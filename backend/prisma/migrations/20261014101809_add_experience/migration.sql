-- CreateTable
CREATE TABLE `Experience` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guideProfileId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` ENUM('FOOD', 'HERITAGE', 'SHOPPING', 'CULTURE', 'SIGHTSEEING', 'NATURE', 'OTHER') NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `durationMinutes` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `maxGroupSize` INTEGER NOT NULL,
    `languages` JSON NOT NULL,
    `images` JSON NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Experience_city_idx`(`city`),
    INDEX `Experience_category_idx`(`category`),
    INDEX `Experience_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Experience` ADD CONSTRAINT `Experience_guideProfileId_fkey` FOREIGN KEY (`guideProfileId`) REFERENCES `GuideProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
