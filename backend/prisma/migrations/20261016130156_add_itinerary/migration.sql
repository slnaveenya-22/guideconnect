-- CreateTable
CREATE TABLE `Itinerary` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Itinerary_bookingId_key`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItineraryItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itineraryId` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `startTime` VARCHAR(191) NULL,
    `endTime` VARCHAR(191) NULL,
    `locationName` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ItineraryItem_itineraryId_idx`(`itineraryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItinerarySuggestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itineraryId` INTEGER NOT NULL,
    `touristId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `locationName` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `guideResponse` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ItinerarySuggestion_itineraryId_idx`(`itineraryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Itinerary` ADD CONSTRAINT `Itinerary_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItineraryItem` ADD CONSTRAINT `ItineraryItem_itineraryId_fkey` FOREIGN KEY (`itineraryId`) REFERENCES `Itinerary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItinerarySuggestion` ADD CONSTRAINT `ItinerarySuggestion_itineraryId_fkey` FOREIGN KEY (`itineraryId`) REFERENCES `Itinerary`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItinerarySuggestion` ADD CONSTRAINT `ItinerarySuggestion_touristId_fkey` FOREIGN KEY (`touristId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
