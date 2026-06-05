/*
  Warnings:

  - You are about to drop the column `geofencingEnabled` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "geofencingEnabled",
ADD COLUMN     "geofencing_enabled" BOOLEAN NOT NULL DEFAULT false;
