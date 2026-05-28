/*
  Warnings:

  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `event_log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `membership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_log` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "event_log" DROP CONSTRAINT "event_log_event_id_fkey";

-- DropForeignKey
ALTER TABLE "event_log" DROP CONSTRAINT "event_log_scanned_by_fkey";

-- DropForeignKey
ALTER TABLE "event_log" DROP CONSTRAINT "event_log_student_id_fkey";

-- DropForeignKey
ALTER TABLE "membership" DROP CONSTRAINT "membership_user_id_fkey";

-- DropForeignKey
ALTER TABLE "membership" DROP CONSTRAINT "membership_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "student" DROP CONSTRAINT "student_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "system_log" DROP CONSTRAINT "system_log_created_by_fkey";

-- DropForeignKey
ALTER TABLE "system_log" DROP CONSTRAINT "system_log_workspace_id_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isVerified";

-- DropTable
DROP TABLE "event";

-- DropTable
DROP TABLE "event_log";

-- DropTable
DROP TABLE "membership";

-- DropTable
DROP TABLE "student";

-- DropTable
DROP TABLE "system_log";

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'scanner',
    "user_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "id_card_code" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "scanned_by" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "action" "SystemAction" NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Membership_user_id_workspace_id_key" ON "Membership"("user_id", "workspace_id");

-- CreateIndex
CREATE INDEX "Student_id_card_code_idx" ON "Student"("id_card_code");

-- CreateIndex
CREATE UNIQUE INDEX "Student_workspace_id_id_card_code_key" ON "Student"("workspace_id", "id_card_code");

-- CreateIndex
CREATE INDEX "EventLog_event_id_timestamp_idx" ON "EventLog"("event_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "SystemLog_workspace_id_timestamp_idx" ON "SystemLog"("workspace_id", "timestamp" DESC);

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_scanned_by_fkey" FOREIGN KEY ("scanned_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemLog" ADD CONSTRAINT "SystemLog_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
