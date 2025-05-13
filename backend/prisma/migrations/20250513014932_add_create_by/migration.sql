/*
  Warnings:

  - You are about to drop the `Products` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creatorID` to the `Invoices` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DetailStockins" DROP CONSTRAINT "DetailStockins_productID_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceDetails" DROP CONSTRAINT "InvoiceDetails_productID_fkey";

-- DropForeignKey
ALTER TABLE "Invoices" DROP CONSTRAINT "Invoices_promotionID_fkey";

-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_produceCategoriesID_fkey";

-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_supplierID_fkey";

-- DropForeignKey
ALTER TABLE "Shipments" DROP CONSTRAINT "Shipments_postOfficeID_fkey";

-- AlterTable
ALTER TABLE "Invoices" ADD COLUMN     "creatorID" INTEGER NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "promotionID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Shipments" ADD COLUMN     "district" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "recipientAddress" TEXT,
ADD COLUMN     "recipientName" TEXT,
ADD COLUMN     "recipientPhone" TEXT,
ADD COLUMN     "ward" TEXT,
ALTER COLUMN "postOfficeID" DROP NOT NULL,
ALTER COLUMN "receiverName" DROP NOT NULL,
ALTER COLUMN "receiverPhone" DROP NOT NULL,
ALTER COLUMN "size" DROP NOT NULL,
ALTER COLUMN "shippingCost" DROP NOT NULL,
ALTER COLUMN "payer" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "birthday" DROP NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "department" DROP NOT NULL,
ALTER COLUMN "IdentityCard" DROP NOT NULL;

-- DropTable
DROP TABLE "Products";

-- CreateTable
CREATE TABLE "Product" (
    "ID" SERIAL NOT NULL,
    "produceCategoriesID" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "image" TEXT,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "supplierID" INTEGER NOT NULL,
    "origin" TEXT NOT NULL,
    "inPrice" DOUBLE PRECISION NOT NULL,
    "outPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("ID")
);

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_creatorID_fkey" FOREIGN KEY ("creatorID") REFERENCES "Users"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_promotionID_fkey" FOREIGN KEY ("promotionID") REFERENCES "Promotions"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceDetails" ADD CONSTRAINT "InvoiceDetails_productID_fkey" FOREIGN KEY ("productID") REFERENCES "Product"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_produceCategoriesID_fkey" FOREIGN KEY ("produceCategoriesID") REFERENCES "ProductCategories"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierID_fkey" FOREIGN KEY ("supplierID") REFERENCES "Suppliers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipments" ADD CONSTRAINT "Shipments_postOfficeID_fkey" FOREIGN KEY ("postOfficeID") REFERENCES "PostOffices"("ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailStockins" ADD CONSTRAINT "DetailStockins_productID_fkey" FOREIGN KEY ("productID") REFERENCES "Product"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;
