/*
  Warnings:

  - A unique constraint covering the columns `[participantHash]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "participantHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_participantHash_key" ON "public"."Conversation"("participantHash");
