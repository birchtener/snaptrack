/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `Student` table. All the data in the column will be lost.
  - Added the required column `added_by` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "deleted_at",
ADD COLUMN     "added_by" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
