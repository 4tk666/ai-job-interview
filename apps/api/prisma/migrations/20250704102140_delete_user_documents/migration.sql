/*
  Warnings:

  - You are about to drop the `user_documents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_documents" DROP CONSTRAINT "user_documents_user_id_fkey";

-- DropTable
DROP TABLE "user_documents";

-- DropEnum
DROP TYPE "DocumentType";
