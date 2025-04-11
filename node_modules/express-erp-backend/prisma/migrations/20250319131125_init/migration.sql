-- CreateTable
CREATE TABLE "Promotions" (
    "ID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreate" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minValue" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Promotions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Invoices" (
    "ID" SERIAL NOT NULL,
    "promotionID" INTEGER NOT NULL,
    "customerID" INTEGER NOT NULL,
    "exportTime" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Invoices_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "InvoiceDetails" (
    "ID" SERIAL NOT NULL,
    "invoiceID" INTEGER NOT NULL,
    "productID" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "InvoiceDetails_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Products" (
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

    CONSTRAINT "Products_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "ProductCategories" (
    "ID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "information" TEXT,

    CONSTRAINT "ProductCategories_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Suppliers" (
    "ID" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "representative" TEXT NOT NULL,
    "phoneNumberRep" TEXT NOT NULL,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Customers" (
    "ID" SERIAL NOT NULL,
    "organization" TEXT,
    "name" TEXT NOT NULL,
    "tax" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "introduce" TEXT,
    "postalCode" TEXT NOT NULL,
    "bonusPoints" INTEGER NOT NULL,
    "notes" TEXT,
    "address" TEXT NOT NULL,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Shipments" (
    "ID" SERIAL NOT NULL,
    "invoiceID" INTEGER NOT NULL,
    "postOfficeID" INTEGER NOT NULL,
    "receiverName" TEXT NOT NULL,
    "receiverPhone" TEXT NOT NULL,
    "sendTime" TIMESTAMP(3) NOT NULL,
    "receiveTime" TIMESTAMP(3) NOT NULL,
    "size" TEXT NOT NULL,
    "shippingCost" DOUBLE PRECISION NOT NULL,
    "payer" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Shipments_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "PostOffices" (
    "ID" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "PostOffices_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Users" (
    "ID" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "image" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "IdentityCard" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Stockins" (
    "ID" SERIAL NOT NULL,
    "stockinDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Stockins_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "DetailStockins" (
    "ID" SERIAL NOT NULL,
    "StockinID" INTEGER NOT NULL,
    "productID" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DetailStockins_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_customerID_fkey" FOREIGN KEY ("customerID") REFERENCES "Customers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_promotionID_fkey" FOREIGN KEY ("promotionID") REFERENCES "Promotions"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceDetails" ADD CONSTRAINT "InvoiceDetails_invoiceID_fkey" FOREIGN KEY ("invoiceID") REFERENCES "Invoices"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceDetails" ADD CONSTRAINT "InvoiceDetails_productID_fkey" FOREIGN KEY ("productID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_produceCategoriesID_fkey" FOREIGN KEY ("produceCategoriesID") REFERENCES "ProductCategories"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_supplierID_fkey" FOREIGN KEY ("supplierID") REFERENCES "Suppliers"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipments" ADD CONSTRAINT "Shipments_invoiceID_fkey" FOREIGN KEY ("invoiceID") REFERENCES "Invoices"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipments" ADD CONSTRAINT "Shipments_postOfficeID_fkey" FOREIGN KEY ("postOfficeID") REFERENCES "PostOffices"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailStockins" ADD CONSTRAINT "DetailStockins_StockinID_fkey" FOREIGN KEY ("StockinID") REFERENCES "Stockins"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailStockins" ADD CONSTRAINT "DetailStockins_productID_fkey" FOREIGN KEY ("productID") REFERENCES "Products"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;
