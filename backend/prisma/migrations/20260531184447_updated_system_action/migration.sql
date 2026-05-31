/*
  Warnings:

  - The values [archive_event,update_membership] on the enum `SystemAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SystemAction_new" AS ENUM ('create_student', 'update_student', 'delete_student', 'create_event', 'update_event', 'delete_event', 'add_member', 'update_member', 'remove_member', 'create_workspace', 'update_workspace');
ALTER TABLE "SystemLog" ALTER COLUMN "action" TYPE "SystemAction_new" USING ("action"::text::"SystemAction_new");
ALTER TYPE "SystemAction" RENAME TO "SystemAction_old";
ALTER TYPE "SystemAction_new" RENAME TO "SystemAction";
DROP TYPE "public"."SystemAction_old";
COMMIT;
