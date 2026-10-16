/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `authProvider` VARCHAR(191) NOT NULL DEFAULT 'LOCAL',
    ADD COLUMN `googleId` VARCHAR(191) NULL,
    MODIFY `passwordHash` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_googleId_key` ON `User`(`googleId`);
