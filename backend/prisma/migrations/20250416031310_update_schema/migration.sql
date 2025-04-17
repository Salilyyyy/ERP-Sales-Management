-- AlterTable
ALTER TABLE "Invoices" ADD COLUMN     "isDelivery" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;
