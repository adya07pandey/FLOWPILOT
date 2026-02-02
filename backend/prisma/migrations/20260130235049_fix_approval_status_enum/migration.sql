/*
  SAFE migration: convert Approval.status from TEXT → ENUM
*/

-- 1️⃣ Create enum if it doesn't already exist
DO $$ BEGIN
  CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2️⃣ Alter column type USING cast (NO DATA LOSS)
ALTER TABLE "Approval"
ALTER COLUMN "status"
TYPE "ApprovalStatus"
USING "status"::"ApprovalStatus";
