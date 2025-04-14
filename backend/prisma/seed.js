const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
}

async function main() {
  console.log('Cleaning database...');
  await cleanDatabase();
  console.log('Database cleaned');

  // Create Product Categories
  const productCategories = await Promise.all([
    prisma.productCategories.create({
      data: {
        name: 'Electronics',
        information: 'Electronic devices and accessories',
      },
    }),
    prisma.productCategories.create({
      data: {
        name: 'Clothing',
        information: 'Fashion items and accessories',
      },
    }),
    prisma.productCategories.create({
      data: {
        name: 'Books',
        information: 'Physical and digital books',
      },
    }),
    prisma.productCategories.create({
      data: {
        name: 'Home & Garden',
        information: 'Items for home and garden',
      },
    }),
    prisma.productCategories.create({
      data: {
        name: 'Sports',
        information: 'Sports equipment and accessories',
      },
    }),
  ]);

  // Create Suppliers
  const suppliers = await Promise.all([
    prisma.suppliers.create({
      data: {
        name: 'Tech Solutions Inc',
        address: '123 Tech Street, Silicon Valley, CA',
        phoneNumber: '555-0101',
        email: 'contact@techsolutions.com',
        postalCode: '94025',
        representative: 'John Smith',
        phoneNumberRep: '555-0106',
      },
    }),
    prisma.suppliers.create({
      data: {
        name: 'Fashion Forward Ltd',
        address: '456 Fashion Ave, New York, NY',
        phoneNumber: '555-0102',
        email: 'info@fashionforward.com',
        postalCode: '10001',
        representative: 'Sarah Johnson',
        phoneNumberRep: '555-0107',
      },
    }),
    prisma.suppliers.create({
      data: {
        name: 'Book World Publishers',
        address: '789 Book Lane, Boston, MA',
        phoneNumber: '555-0103',
        email: 'sales@bookworld.com',
        postalCode: '02108',
        representative: 'Michael Brown',
        phoneNumberRep: '555-0108',
      },
    }),
    prisma.suppliers.create({
      data: {
        name: 'Home Essentials Co',
        address: '321 Home Road, Chicago, IL',
        phoneNumber: '555-0104',
        email: 'orders@homeessentials.com',
        postalCode: '60601',
        representative: 'Emily Davis',
        phoneNumberRep: '555-0109',
      },
    }),
    prisma.suppliers.create({
      data: {
        name: 'Sports Gear Pro',
        address: '654 Sports Blvd, Miami, FL',
        phoneNumber: '555-0105',
        email: 'info@sportsgearpro.com',
        postalCode: '33101',
        representative: 'David Wilson',
        phoneNumberRep: '555-0110',
      },
    }),
  ]);

  // Create Products
  const products = await Promise.all([
    prisma.products.create({
      data: {
        produceCategoriesID: productCategories[0].ID,
        unit: 'piece',
        name: 'Smartphone X',
        weight: 0.5,
        length: 15,
        width: 7,
        height: 1,
        supplierID: suppliers[0].ID,
        origin: 'China',
        inPrice: 500,
        outPrice: 800,
        quantity: 100,
        title: 'Latest Smartphone Model',
        description: 'High-end smartphone with advanced features',
      },
    }),
    prisma.products.create({
      data: {
        produceCategoriesID: productCategories[1].ID,
        unit: 'piece',
        name: 'Classic T-Shirt',
        weight: 0.2,
        length: 30,
        width: 20,
        height: 1,
        supplierID: suppliers[1].ID,
        origin: 'Vietnam',
        inPrice: 10,
        outPrice: 25,
        quantity: 200,
        title: 'Premium Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt',
      },
    }),
    prisma.products.create({
      data: {
        produceCategoriesID: productCategories[2].ID,
        unit: 'piece',
        name: 'Business Strategy Book',
        weight: 0.8,
        length: 23,
        width: 15,
        height: 2,
        supplierID: suppliers[2].ID,
        origin: 'USA',
        inPrice: 15,
        outPrice: 30,
        quantity: 50,
        title: 'Business Strategy Guide',
        description: 'Comprehensive business strategy guide',
      },
    }),
    prisma.products.create({
      data: {
        produceCategoriesID: productCategories[3].ID,
        unit: 'piece',
        name: 'Smart LED Bulb',
        weight: 0.1,
        length: 6,
        width: 6,
        height: 10,
        supplierID: suppliers[3].ID,
        origin: 'China',
        inPrice: 8,
        outPrice: 20,
        quantity: 150,
        title: 'Smart Home LED Bulb',
        description: 'WiFi-enabled smart LED bulb',
      },
    }),
    prisma.products.create({
      data: {
        produceCategoriesID: productCategories[4].ID,
        unit: 'piece',
        name: 'Professional Soccer Ball',
        weight: 0.5,
        length: 22,
        width: 22,
        height: 22,
        supplierID: suppliers[4].ID,
        origin: 'Pakistan',
        inPrice: 20,
        outPrice: 45,
        quantity: 75,
        title: 'Professional Grade Soccer Ball',
        description: 'FIFA approved soccer ball',
      },
    }),
  ]);

  // Create Customers
  const customers = await Promise.all([
    prisma.customers.create({
      data: {
        organization: 'Tech Corp',
        name: 'John Smith',
        tax: 'TAX987654',
        phoneNumber: '555-0201',
        email: 'john@techcorp.com',
        introduce: 'Leading technology company',
        postalCode: '10001',
        bonusPoints: 1000,
        notes: 'Premium customer',
        address: '789 Business Ave, New York, NY',
      },
    }),
    prisma.customers.create({
      data: {
        organization: 'Fashion Retail',
        name: 'Sarah Johnson',
        tax: 'TAX654321',
        phoneNumber: '555-0202',
        email: 'sarah@fashionretail.com',
        introduce: 'Fashion retail chain',
        postalCode: '10002',
        bonusPoints: 800,
        notes: 'Regular customer',
        address: '456 Retail Street, New York, NY',
      },
    }),
    prisma.customers.create({
      data: {
        organization: 'Book Store',
        name: 'Michael Brown',
        tax: 'TAX321654',
        phoneNumber: '555-0203',
        email: 'michael@bookstore.com',
        introduce: 'Independent bookstore',
        postalCode: '10003',
        bonusPoints: 500,
        notes: 'Local business',
        address: '123 Book Lane, New York, NY',
      },
    }),
    prisma.customers.create({
      data: {
        organization: 'Home Decor',
        name: 'Emily Davis',
        tax: 'TAX147258',
        phoneNumber: '555-0204',
        email: 'emily@homedecor.com',
        introduce: 'Home decoration store',
        postalCode: '10004',
        bonusPoints: 600,
        notes: 'Interior design business',
        address: '321 Decor Road, New York, NY',
      },
    }),
    prisma.customers.create({
      data: {
        organization: 'Sports Club',
        name: 'David Wilson',
        tax: 'TAX258369',
        phoneNumber: '555-0205',
        email: 'david@sportsclub.com',
        introduce: 'Sports equipment retailer',
        postalCode: '10005',
        bonusPoints: 750,
        notes: 'Sports equipment supplier',
        address: '654 Sports Street, New York, NY',
      },
    }),
  ]);

  // Create Users
  const users = await Promise.all([
    prisma.users.create({
      data: {
        address: '123 Admin Street, New York, NY',
        email: 'admin@company.com',
        password: 'hashed_password_1', // In real app, use proper password hashing
        birthday: new Date('1990-01-01'),
        phoneNumber: '555-0301',
        department: 'Administration',
        IdentityCard: 'ID123456',
        userType: 'admin',
        createAt: new Date(),
        status: 'active',
      },
    }),
    prisma.users.create({
      data: {
        address: '456 Manager Ave, New York, NY',
        email: 'manager@company.com',
        password: 'hashed_password_2',
        birthday: new Date('1992-02-02'),
        phoneNumber: '555-0302',
        department: 'Management',
        IdentityCard: 'ID234567',
        userType: 'manager',
        createAt: new Date(),
        status: 'active',
      },
    }),
    prisma.users.create({
      data: {
        address: '789 Staff Road, New York, NY',
        email: 'staff1@company.com',
        password: 'hashed_password_3',
        birthday: new Date('1995-03-03'),
        phoneNumber: '555-0303',
        department: 'Sales',
        IdentityCard: 'ID345678',
        userType: 'staff',
        createAt: new Date(),
        status: 'active',
      },
    }),
    prisma.users.create({
      data: {
        address: '321 Employee Lane, New York, NY',
        email: 'staff2@company.com',
        password: 'hashed_password_4',
        birthday: new Date('1998-04-04'),
        phoneNumber: '555-0304',
        department: 'Inventory',
        IdentityCard: 'ID456789',
        userType: 'staff',
        createAt: new Date(),
        status: 'active',
      },
    }),
    prisma.users.create({
      data: {
        address: '654 Worker Blvd, New York, NY',
        email: 'staff3@company.com',
        password: 'hashed_password_5',
        birthday: new Date('2000-05-05'),
        phoneNumber: '555-0305',
        department: 'Customer Service',
        IdentityCard: 'ID567890',
        userType: 'staff',
        createAt: new Date(),
        status: 'active',
      },
    }),
  ]);

  // Create Post Offices
  const postOffices = await Promise.all([
    prisma.postOffices.create({
      data: {
        name: 'Main Post Office',
        address: '123 Post Street, New York, NY',
        phoneNumber: '555-0401',
        email: 'main@postoffice.com',
      },
    }),
    prisma.postOffices.create({
      data: {
        name: 'Downtown Branch',
        address: '456 Downtown Ave, New York, NY',
        phoneNumber: '555-0402',
        email: 'downtown@postoffice.com',
      },
    }),
    prisma.postOffices.create({
      data: {
        name: 'Uptown Branch',
        address: '789 Uptown Road, New York, NY',
        phoneNumber: '555-0403',
        email: 'uptown@postoffice.com',
      },
    }),
    prisma.postOffices.create({
      data: {
        name: 'Midtown Branch',
        address: '321 Midtown Lane, New York, NY',
        phoneNumber: '555-0404',
        email: 'midtown@postoffice.com',
      },
    }),
    prisma.postOffices.create({
      data: {
        name: 'Suburban Branch',
        address: '654 Suburban Blvd, New York, NY',
        phoneNumber: '555-0405',
        email: 'suburban@postoffice.com',
      },
    }),
  ]);

  // Create Promotions
  const promotions = await Promise.all([
    prisma.promotions.create({
      data: {
        name: 'Summer Sale',
        dateCreate: new Date(),
        dateEnd: new Date('2024-08-31'),
        type: 'percentage',
        value: 20,
        minValue: 100,
        quantity: 100,
      },
    }),
    prisma.promotions.create({
      data: {
        name: 'Black Friday',
        dateCreate: new Date(),
        dateEnd: new Date('2024-11-29'),
        type: 'percentage',
        value: 30,
        minValue: 200,
        quantity: 50,
      },
    }),
    prisma.promotions.create({
      data: {
        name: 'Holiday Special',
        dateCreate: new Date(),
        dateEnd: new Date('2024-12-31'),
        type: 'fixed',
        value: 50,
        minValue: 300,
        quantity: 75,
      },
    }),
    prisma.promotions.create({
      data: {
        name: 'New Year Sale',
        dateCreate: new Date(),
        dateEnd: new Date('2025-01-31'),
        type: 'percentage',
        value: 25,
        minValue: 150,
        quantity: 80,
      },
    }),
    prisma.promotions.create({
      data: {
        name: 'Spring Clearance',
        dateCreate: new Date(),
        dateEnd: new Date('2024-05-31'),
        type: 'fixed',
        value: 30,
        minValue: 100,
        quantity: 60,
      },
    }),
  ]);

  // Create Invoices
  const invoices = await Promise.all([
    prisma.invoices.create({
      data: {
        promotionID: promotions[0].ID,
        customerID: customers[0].ID,
        exportTime: new Date(),
        paymentMethod: 'credit_card',
        tax: 80,
      },
    }),
    prisma.invoices.create({
      data: {
        promotionID: promotions[1].ID,
        customerID: customers[1].ID,
        exportTime: new Date(),
        paymentMethod: 'bank_transfer',
        tax: 60,
      },
    }),
    prisma.invoices.create({
      data: {
        promotionID: promotions[2].ID,
        customerID: customers[2].ID,
        exportTime: new Date(),
        paymentMethod: 'cash',
        tax: 40,
      },
    }),
    prisma.invoices.create({
      data: {
        promotionID: promotions[3].ID,
        customerID: customers[3].ID,
        exportTime: new Date(),
        paymentMethod: 'credit_card',
        tax: 70,
      },
    }),
    prisma.invoices.create({
      data: {
        promotionID: promotions[4].ID,
        customerID: customers[4].ID,
        exportTime: new Date(),
        paymentMethod: 'bank_transfer',
        tax: 50,
      },
    }),
  ]);

  // Create Invoice Details
  const invoiceDetails = await Promise.all([
    prisma.invoiceDetails.create({
      data: {
        invoiceID: invoices[0].ID,
        productID: products[0].ID,
        unitPrice: 800,
        quantity: 2,
        notes: 'Priority shipping',
      },
    }),
    prisma.invoiceDetails.create({
      data: {
        invoiceID: invoices[1].ID,
        productID: products[1].ID,
        unitPrice: 25,
        quantity: 10,
        notes: 'Bulk order',
      },
    }),
    prisma.invoiceDetails.create({
      data: {
        invoiceID: invoices[2].ID,
        productID: products[2].ID,
        unitPrice: 30,
        quantity: 5,
        notes: 'Gift wrapping requested',
      },
    }),
    prisma.invoiceDetails.create({
      data: {
        invoiceID: invoices[3].ID,
        productID: products[3].ID,
        unitPrice: 20,
        quantity: 15,
        notes: 'Express delivery',
      },
    }),
    prisma.invoiceDetails.create({
      data: {
        invoiceID: invoices[4].ID,
        productID: products[4].ID,
        unitPrice: 45,
        quantity: 8,
        notes: 'Team order',
      },
    }),
  ]);

  // Create Shipments
  const shipments = await Promise.all([
    prisma.shipments.create({
      data: {
        invoiceID: invoices[0].ID,
        postOfficeID: postOffices[0].ID,
        receiverName: 'John Smith',
        receiverPhone: '555-0201',
        sendTime: new Date(),
        receiveTime: new Date(Date.now() + 86400000), // Tomorrow
        size: 'medium',
        shippingCost: 25,
        payer: 'sender',
        address: '789 Business Ave, New York, NY',
      },
    }),
    prisma.shipments.create({
      data: {
        invoiceID: invoices[1].ID,
        postOfficeID: postOffices[1].ID,
        receiverName: 'Sarah Johnson',
        receiverPhone: '555-0202',
        sendTime: new Date(),
        receiveTime: new Date(Date.now() + 172800000), // Day after tomorrow
        size: 'large',
        shippingCost: 35,
        payer: 'receiver',
        address: '456 Retail Street, New York, NY',
      },
    }),
    prisma.shipments.create({
      data: {
        invoiceID: invoices[2].ID,
        postOfficeID: postOffices[2].ID,
        receiverName: 'Michael Brown',
        receiverPhone: '555-0203',
        sendTime: new Date(),
        receiveTime: new Date(Date.now() + 259200000), // 3 days later
        size: 'small',
        shippingCost: 15,
        payer: 'sender',
        address: '123 Book Lane, New York, NY',
      },
    }),
    prisma.shipments.create({
      data: {
        invoiceID: invoices[3].ID,
        postOfficeID: postOffices[3].ID,
        receiverName: 'Emily Davis',
        receiverPhone: '555-0204',
        sendTime: new Date(),
        receiveTime: new Date(Date.now() + 345600000), // 4 days later
        size: 'medium',
        shippingCost: 25,
        payer: 'receiver',
        address: '321 Decor Road, New York, NY',
      },
    }),
    prisma.shipments.create({
      data: {
        invoiceID: invoices[4].ID,
        postOfficeID: postOffices[4].ID,
        receiverName: 'David Wilson',
        receiverPhone: '555-0205',
        sendTime: new Date(),
        receiveTime: new Date(Date.now() + 432000000), // 5 days later
        size: 'large',
        shippingCost: 40,
        payer: 'sender',
        address: '654 Sports Street, New York, NY',
      },
    }),
  ]);

  // Create Stock Ins
  const stockins = await Promise.all([
    prisma.stockins.create({
      data: {
        stockinDate: new Date(),
        notes: 'Initial stock',
      },
    }),
    prisma.stockins.create({
      data: {
        stockinDate: new Date(),
        notes: 'Monthly restock',
      },
    }),
    prisma.stockins.create({
      data: {
        stockinDate: new Date(),
        notes: 'Emergency restock',
      },
    }),
    prisma.stockins.create({
      data: {
        stockinDate: new Date(),
        notes: 'Seasonal stock',
      },
    }),
    prisma.stockins.create({
      data: {
        stockinDate: new Date(),
        notes: 'Special order',
      },
    }),
  ]);

  // Create Detail Stock Ins
  const detailStockins = await Promise.all([
    prisma.detailStockins.create({
      data: {
        StockinID: stockins[0].ID,
        productID: products[0].ID,
        quantity: 50,
        unitPrice: 500,
      },
    }),
    prisma.detailStockins.create({
      data: {
        StockinID: stockins[1].ID,
        productID: products[1].ID,
        quantity: 100,
        unitPrice: 10,
      },
    }),
    prisma.detailStockins.create({
      data: {
        StockinID: stockins[2].ID,
        productID: products[2].ID,
        quantity: 75,
        unitPrice: 15,
      },
    }),
    prisma.detailStockins.create({
      data: {
        StockinID: stockins[3].ID,
        productID: products[3].ID,
        quantity: 200,
        unitPrice: 8,
      },
    }),
    prisma.detailStockins.create({
      data: {
        StockinID: stockins[4].ID,
        productID: products[4].ID,
        quantity: 50,
        unitPrice: 20,
      },
    }),
  ]);

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Clean up the database connection
    await prisma.$disconnect();
    console.log('Database connection closed');
  });
