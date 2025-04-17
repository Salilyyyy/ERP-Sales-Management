-- First add the name column
ALTER TABLE "Users" ADD COLUMN "name" TEXT;

-- Update existing records with a default name
UPDATE "Users" SET "name" = 'User ' || "ID"::text WHERE "name" IS NULL;

-- Make the column required
ALTER TABLE "Users" ALTER COLUMN "name" SET NOT NULL;
