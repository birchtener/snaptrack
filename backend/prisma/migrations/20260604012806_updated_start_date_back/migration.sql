/*
  Warnings:

  - Made the column `start_date` on table `events` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "events" ALTER COLUMN "start_date" SET NOT NULL;
