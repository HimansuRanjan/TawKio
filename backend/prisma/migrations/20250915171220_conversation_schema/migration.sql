/*
  Warnings:

  - A unique constraint covering the columns `[lastMessageId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'SEEN');

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_senderId_fkey";

-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "isGroup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "lastMessageId" TEXT;

-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "callDuration" INTEGER,
ADD COLUMN     "status" "public"."MessageStatus" NOT NULL DEFAULT 'SENT';

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_lastMessageId_key" ON "public"."Conversation"("lastMessageId");

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "public"."Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
