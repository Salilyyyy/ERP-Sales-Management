-- First add the new columns
ALTER TABLE "ProductCategories" ADD COLUMN "unit" TEXT;
ALTER TABLE "ProductCategories" ADD COLUMN "status" TEXT;
ALTER TABLE "ProductCategories" ADD COLUMN "promotion" TEXT;
ALTER TABLE "ProductCategories" ADD COLUMN "tax" TEXT;
ALTER TABLE "ProductCategories" ADD COLUMN "description" TEXT;
ALTER TABLE "ProductCategories" ADD COLUMN "notes" TEXT;

-- Update the new columns with data from the information JSON
UPDATE "ProductCategories"
SET 
  "unit" = information::json->>'unit',
  "status" = information::json->>'status',
  "promotion" = information::json->>'promotion',
  "tax" = information::json->>'tax',
  "description" = information::json->>'description',
  "notes" = information::json->>'notes'
WHERE information IS NOT NULL;

-- Remove the information column
ALTER TABLE "ProductCategories" DROP COLUMN "information";
