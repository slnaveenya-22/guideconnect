/*
  Warnings:

  - You are about to drop the column `guideProfileId` on the `Availability` table. All the data in the column will be lost.
  - Added the required column `experienceId` to the `Availability` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Availability` DROP FOREIGN KEY `Availability_guideProfileId_fkey`;

-- DropIndex
DROP INDEX `Availability_guideProfileId_idx` ON `Availability`;

-- AlterTable
ALTER TABLE `Availability` DROP COLUMN `guideProfileId`,
    ADD COLUMN `experienceId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `Availability_experienceId_idx` ON `Availability`(`experienceId`);

-- AddForeignKey
ALTER TABLE `Availability` ADD CONSTRAINT `Availability_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `Experience`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
