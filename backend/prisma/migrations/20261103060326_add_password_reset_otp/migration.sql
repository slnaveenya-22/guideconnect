-- AlterTable
ALTER TABLE `User` ADD COLUMN `resetOtp` VARCHAR(191) NULL,
    ADD COLUMN `resetOtpExpiresAt` DATETIME(3) NULL;
