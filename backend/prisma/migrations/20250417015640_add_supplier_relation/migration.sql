-- First add the column as nullable
ALTER TABLE "Stockins" ADD COLUMN "supplierID" INTEGER;

-- Update existing records with a default supplier ID (using ID 1 as default)
UPDATE "Stockins" SET "supplierID" = 1 WHERE "supplierID" IS NULL;

-- Make the column required
ALTER TABLE "Stockins" ALTER COLUMN "supplierID" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "Stockins" ADD CONSTRAINT "Stockins_supplierID_fkey" FOREIGN KEY ("supplierID") REFERENCES "Suppliers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;
