/*
  Warnings:

  - A unique constraint covering the columns `[taskId]` on the table `Approval` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Approval_taskId_key" ON "Approval"("taskId");
