const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    const tablenames = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
}

async function createProductCategories() {
  try {
    const categoryData = [
      {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        unit: 'piece',
        status: 'active',
        promotion: '0',
        tax: '10',
        notes: 'Core electronics category'
      },
      {
        name: 'Clothing',
        description: 'Fashion items and accessories',
        unit: 'piece',
        status: 'active',
        promotion: '0',
        tax: '10',
        notes: 'Fashion category'
      },
      {
        name: 'Books',
        description: 'Physical and digital books',
        unit: 'piece',
        status: 'active',
        promotion: '0',
        tax: '5',
        notes: 'Books and publications'
      },
      {
        name: 'Home & Garden',
        description: 'Items for home and garden',
        unit: 'piece',
        status: 'active',
        promotion: '0',
        tax: '8',
        notes: 'Home and garden supplies'
      },
      {
        name: 'Sports',
        description: 'Sports equipment and accessories',
        unit: 'piece',
        status: 'active',
        promotion: '0',
        tax: '8',
        notes: 'Sports and fitness equipment'
      }
    ];

    const categories = [];
    for (const data of categoryData) {
      const category = await prisma.productCategories.create({ data });
      categories.push(category);
    }
    return categories;
  } catch (error) {
    console.error('Error creating product categories:', error);
    throw error;
  }
}

async function createSuppliers() {
  try {
    const supplierData = [
      {
        name: 'Tech Solutions Inc',
        address: '123 Tech Street, Silicon Valley, CA',
        phoneNumber: '555-0101',
        email: 'contact@techsolutions.com',
        postalCode: '94025',
        representative: 'John Smith',
        phoneNumberRep: '555-0106',
      },
      {
        name: 'Fashion Forward Ltd',
        address: '456 Fashion Ave, New York, NY',
        phoneNumber: '555-0102',
        email: 'info@fashionforward.com',
        postalCode: '10001',
        representative: 'Sarah Johnson',
        phoneNumberRep: '555-0107',
      },
      {
        name: 'Book World Publishers',
        address: '789 Book Lane, Boston, MA',
        phoneNumber: '555-0103',
        email: 'sales@bookworld.com',
        postalCode: '02108',
        representative: 'Michael Brown',
        phoneNumberRep: '555-0108',
      },
      {
        name: 'Home Essentials Co',
        address: '321 Home Road, Chicago, IL',
        phoneNumber: '555-0104',
        email: 'orders@homeessentials.com',
        postalCode: '60601',
        representative: 'Emily Davis',
        phoneNumberRep: '555-0109',
      },
      {
        name: 'Sports Gear Pro',
        address: '654 Sports Blvd, Miami, FL',
        phoneNumber: '555-0105',
        email: 'info@sportsgearpro.com',
        postalCode: '33101',
        representative: 'David Wilson',
        phoneNumberRep: '555-0110',
      }
    ];

    const suppliers = [];
    for (const data of supplierData) {
      const supplier = await prisma.suppliers.create({ data });
      suppliers.push(supplier);
    }
    return suppliers;
  } catch (error) {
    console.error('Error creating suppliers:', error);
    throw error;
  }
}

async function createProducts(categories, suppliers) {
  try {
    const productData = [
      {
        unit: 'piece',
        name: 'Smartphone X',
        weight: 0.5,
        length: 15,
        width: 7,
        height: 1,
        productCategory: {
          connect: { ID: categories[0].ID }
        },
        supplier: {
          connect: { ID: suppliers[0].ID }
        },
        origin: 'China',
        inPrice: 500,
        outPrice: 800,
        quantity: 100,
        title: 'Latest Smartphone Model',
        description: 'High-end smartphone with advanced features',
      },
      {
        unit: 'piece',
        name: 'Classic T-Shirt',
        weight: 0.2,
        length: 30,
        width: 20,
        height: 1,
        productCategory: {
          connect: { ID: categories[1].ID }
        },
        supplier: {
          connect: { ID: suppliers[1].ID }
        },
        origin: 'Vietnam',
        inPrice: 10,
        outPrice: 25,
        quantity: 200,
        title: 'Premium Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt',
      },
      {
        unit: 'piece',
        name: 'Business Strategy Book',
        weight: 0.8,
        length: 23,
        width: 15,
        height: 2,
        productCategory: {
          connect: { ID: categories[2].ID }
        },
        supplier: {
          connect: { ID: suppliers[2].ID }
        },
        origin: 'USA',
        inPrice: 15,
        outPrice: 30,
        quantity: 50,
        title: 'Business Strategy Guide',
        description: 'Comprehensive business strategy guide',
      },
      {
        unit: 'piece',
        name: 'Smart LED Bulb',
        weight: 0.1,
        length: 6,
        width: 6,
        height: 10,
        productCategory: {
          connect: { ID: categories[3].ID }
        },
        supplier: {
          connect: { ID: suppliers[3].ID }
        },
        origin: 'China',
        inPrice: 8,
        outPrice: 20,
        quantity: 150,
        title: 'Smart Home LED Bulb',
        description: 'WiFi-enabled smart LED bulb',
      },
      {
        unit: 'piece',
        name: 'Professional Soccer Ball',
        weight: 0.5,
        length: 22,
        width: 22,
        height: 22,
        productCategory: {
          connect: { ID: categories[4].ID }
        },
        supplier: {
          connect: { ID: suppliers[4].ID }
        },
        origin: 'Pakistan',
        inPrice: 20,
        outPrice: 45,
        quantity: 75,
        title: 'Professional Grade Soccer Ball',
        description: 'FIFA approved soccer ball',
      }
    ];

    const products = [];
    for (const data of productData) {
      const product = await prisma.product.create({ data });
      products.push(product);
    }
    return products;
  } catch (error) {
    console.error('Error creating products:', error);
    throw error;
  }
}

async function createCustomers() {
  try {
    const customerData = [
      {
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
      {
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
      {
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
      {
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
      {
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
      }
    ];

    const customers = [];
    for (const data of customerData) {
      const customer = await prisma.customers.create({ data });
      customers.push(customer);
    }
    return customers;
  } catch (error) {
    console.error('Error creating customers:', error);
    throw error;
  }
}

async function createUsers() {
  try {
    const userData = [
      {
        name: 'Admin User',
        address: '123 Admin Street, New York, NY',
        email: 'admin@company.com',
        password: 'hashed_password_1',
        birthday: new Date('1990-01-01'),
        phoneNumber: '555-0301',
        department: 'Administration',
        IdentityCard: 'ID123456',
        userType: 'admin',
        createAt: new Date(),
        status: 'active',
      },
      {
        name: 'Manager User',
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
      {
        name: 'Sales Staff',
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
      {
        name: 'Inventory Staff',
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
      {
        name: 'Customer Service Staff',
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
      {
        name: 'Sally',
        address: '654 Worker Blvd, New York, NY',
        email: 'hgiang140302@gmail.com',
        password: 'Qhuong@2008',
        birthday: new Date('2000-05-05'),
        phoneNumber: '555-0305',
        department: 'Customer Service',
        IdentityCard: 'ID343344',
        userType: 'admin',
        createAt: new Date(),
        status: 'active',
      }
    ];

    const users = [];
    for (const data of userData) {
      const user = await prisma.users.create({ data });
      users.push(user);
    }
    return users;
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
}

async function createPostOffices() {
  try {
    const postOfficeData = [
      {
        name: 'Main Post Office',
        address: '123 Post Street, New York, NY',
        phoneNumber: '555-0401',
        email: 'main@postoffice.com',
      },
      {
        name: 'Downtown Branch',
        address: '456 Downtown Ave, New York, NY',
        phoneNumber: '555-0402',
        email: 'downtown@postoffice.com',
      },
      {
        name: 'Uptown Branch',
        address: '789 Uptown Road, New York, NY',
        phoneNumber: '555-0403',
        email: 'uptown@postoffice.com',
      },
      {
        name: 'Midtown Branch',
        address: '321 Midtown Lane, New York, NY',
        phoneNumber: '555-0404',
        email: 'midtown@postoffice.com',
      },
      {
        name: 'Suburban Branch',
        address: '654 Suburban Blvd, New York, NY',
        phoneNumber: '555-0405',
        email: 'suburban@postoffice.com',
      }
    ];

    const postOffices = [];
    for (const data of postOfficeData) {
      const postOffice = await prisma.postOffices.create({ data });
      postOffices.push(postOffice);
    }
    return postOffices;
  } catch (error) {
    console.error('Error creating post offices:', error);
    throw error;
  }
}

async function createPromotions() {
  try {
    const promotionData = [
      {
        name: 'Summer Sale',
        dateCreate: new Date(),
        dateEnd: new Date('2024-08-31'),
        type: 'percentage',
        value: 20,
        minValue: 100,
        quantity: 100,
      },
      {
        name: 'Black Friday',
        dateCreate: new Date(),
        dateEnd: new Date('2024-11-29'),
        type: 'percentage',
        value: 30,
        minValue: 200,
        quantity: 50,
      },
      {
        name: 'Holiday Special',
        dateCreate: new Date(),
        dateEnd: new Date('2024-12-31'),
        type: 'fixed',
        value: 50,
        minValue: 300,
        quantity: 75,
      },
      {
        name: 'New Year Sale',
        dateCreate: new Date(),
        dateEnd: new Date('2025-01-31'),
        type: 'percentage',
        value: 25,
        minValue: 150,
        quantity: 80,
      },
      {
        name: 'Spring Clearance',
        dateCreate: new Date(),
        dateEnd: new Date('2024-05-31'),
        type: 'fixed',
        value: 30,
        minValue: 100,
        quantity: 60,
      }
    ];

    const promotions = [];
    for (const data of promotionData) {
      const promotion = await prisma.promotions.create({ data });
      promotions.push(promotion);
    }
    return promotions;
  } catch (error) {
    console.error('Error creating promotions:', error);
    throw error;
  }
}

async function createInvoices(customers, promotions) {
  try {
    const invoiceData = [
      {
        promotionID: promotions[0].ID,
        customerID: customers[0].ID,
        exportTime: new Date(),
        paymentMethod: 'credit_card',
        tax: 80,
      },
      {
        promotionID: promotions[1].ID,
        customerID: customers[1].ID,
        exportTime: new Date(),
        paymentMethod: 'bank_transfer',
        tax: 60,
      },
      {
        promotionID: promotions[2].ID,
        customerID: customers[2].ID,
        exportTime: new Date(),
        paymentMethod: 'cash',
        tax: 40,
      },
      {
        promotionID: promotions[3].ID,
        customerID: customers[3].ID,
        exportTime: new Date(),
        paymentMethod: 'credit_card',
        tax: 70,
      },
      {
        promotionID: promotions[4].ID,
        customerID: customers[4].ID,
        exportTime: new Date(),
        paymentMethod: 'bank_transfer',
        tax: 50,
      }
    ];

    const invoices = [];
    for (const data of invoiceData) {
      const invoice = await prisma.invoices.create({ data });
      invoices.push(invoice);
    }
    return invoices;
  } catch (error) {
    console.error('Error creating invoices:', error);
    throw error;
  }
}

async function createInvoiceDetails(invoices, products) {
  try {
    const invoiceDetailData = [
      {
        invoiceID: invoices[0].ID,
        productID: products[0].ID,
        unitPrice: 800,
        quantity: 2,
        notes: 'Priority shipping',
      },
      {
        invoiceID: invoices[1].ID,
        productID: products[1].ID,
        unitPrice: 25,
        quantity: 10,
        notes: 'Bulk order',
      },
      {
        invoiceID: invoices[2].ID,
        productID: products[2].ID,
        unitPrice: 30,
        quantity: 5,
        notes: 'Gift wrapping requested',
      },
      {
        invoiceID: invoices[3].ID,
        productID: products[3].ID,
        unitPrice: 20,
        quantity: 15,
        notes: 'Express delivery',
      },
      {
        invoiceID: invoices[4].ID,
        productID: products[4].ID,
        unitPrice: 45,
        quantity: 8,
        notes: 'Team order',
      }
    ];

    const invoiceDetails = [];
    for (const data of invoiceDetailData) {
      const detail = await prisma.invoiceDetails.create({ data });
      invoiceDetails.push(detail);
    }
    return invoiceDetails;
  } catch (error) {
    console.error('Error creating invoice details:', error);
    throw error;
  }
}

async function createShipments(invoices, postOffices) {
  try {
    const shipmentData = [
      {
        invoiceID: invoices[0].ID,
        postOfficeID: postOffices[0].ID,
        receiverName: 'John Smith',
        receiverPhone: '555-0201',
        sendTime: new Date(),
        receiveTime: new Date(Date.now() + 86400000),
        size: 'medium',
        shippingCost: 25,
        payer: 'sender',
        address: '789 Business Ave, New York, NY',
      },
      {
        invoiceID: invoices[1].ID,
        postOfficeID: postOffices[1].ID,
        receiverName: 'Sarah Johnson',
        receiverPhone: '555-0202',
        sendTime: new Date(),
        receiveTime: new Date(Date.now() + 172800000),
        size: 'large',
        shippingCost: 35,
        payer: 'receiver',
        address: '456 Retail Street, New York, NY',
      },
      {
        invoiceID: invoices[2].ID,
        postOfficeID: postOffices[2].ID,
        receiverName: 'Michael Brown',
        receiverPhone: '555-0203',
        sendTime: new Date(),
        receiveTime: new Date(Date.now() + 259200000),
        size: 'small',
        shippingCost: 15,
        payer: 'sender',
        address: '123 Book Lane, New York, NY',
      },
      {
        invoiceID: invoices[3].ID,
        postOfficeID: postOffices[3].ID,
        receiverName: 'Emily Davis',
        receiverPhone: '555-0204',
        sendTime: new Date(),
        receiveTime: new Date(Date.now() + 345600000),
        size: 'medium',
        shippingCost: 25,
        payer: 'receiver',
        address: '321 Decor Road, New York, NY',
      },
      {
        invoiceID: invoices[4].ID,
        postOfficeID: postOffices[4].ID,
        receiverName: 'David Wilson',
        receiverPhone: '555-0205',
        sendTime: new Date(),
        receiveTime: new Date(Date.now() + 432000000),
        size: 'large',
        shippingCost: 40,
        payer: 'sender',
        address: '654 Sports Street, New York, NY',
      }
    ];

    const shipments = [];
    for (const data of shipmentData) {
      const shipment = await prisma.shipments.create({ data });
      shipments.push(shipment);
    }
    return shipments;
  } catch (error) {
    console.error('Error creating shipments:', error);
    throw error;
  }
}

async function createStockins(suppliers) {
  try {
    const stockinData = [
      {
        stockinDate: new Date(),
        notes: 'Initial stock',
        supplierID: suppliers[0].ID,
      },
      {
        stockinDate: new Date(),
        notes: 'Monthly restock',
        supplierID: suppliers[1].ID,
      },
      {
        stockinDate: new Date(),
        notes: 'Emergency restock',
        supplierID: suppliers[2].ID,
      },
      {
        stockinDate: new Date(),
        notes: 'Seasonal stock',
        supplierID: suppliers[3].ID,
      },
      {
        stockinDate: new Date(),
        notes: 'Special order',
        supplierID: suppliers[4].ID,
      }
    ];

    const stockins = [];
    for (const data of stockinData) {
      const stockin = await prisma.stockins.create({ data });
      stockins.push(stockin);
    }
    return stockins;
  } catch (error) {
    console.error('Error creating stock ins:', error);
    throw error;
  }
}

async function createDetailStockins(stockins, products) {
  try {
    const detailStockinData = [
      {
        quantity: 50,
        unitPrice: 500,
        StockinID: stockins[0].ID,
        productID: products[0].ID,
      },
      {
        quantity: 100,
        unitPrice: 10,
        StockinID: stockins[1].ID,
        productID: products[1].ID,
      },
      {
        quantity: 75,
        unitPrice: 15,
        StockinID: stockins[2].ID,
        productID: products[2].ID,
      },
      {
        quantity: 200,
        unitPrice: 8,
        StockinID: stockins[3].ID,
        productID: products[3].ID,
      },
      {
        quantity: 50,
        unitPrice: 20,
        StockinID: stockins[4].ID,
        productID: products[4].ID,
      }
    ];

    const detailStockins = [];
    for (const data of detailStockinData) {
      const detail = await prisma.detailStockins.create({ data });
      detailStockins.push(detail);
    }
    return detailStockins;
  } catch (error) {
    console.error('Error creating detail stock ins:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting database seeding...');

    console.log('Cleaning database...');
    await cleanDatabase();
    console.log('Database cleaned');

    const categories = await createProductCategories();
    console.log('Product categories created');

    const suppliers = await createSuppliers();
    console.log('Suppliers created');

    const products = await createProducts(categories, suppliers);
    console.log('Products created');

    const customers = await createCustomers();
    console.log('Customers created');

    const users = await createUsers();
    console.log('Users created');

    const postOffices = await createPostOffices();
    console.log('Post offices created');

    const promotions = await createPromotions();
    console.log('Promotions created');

    const invoices = await createInvoices(customers, promotions);
    console.log('Invoices created');

    const invoiceDetails = await createInvoiceDetails(invoices, products);
    console.log('Invoice details created');

    const shipments = await createShipments(invoices, postOffices);
    console.log('Shipments created');

    const stockins = await createStockins(suppliers);
    console.log('Stock ins created');

    const detailStockins = await createDetailStockins(stockins, products);
    console.log('Detail stock ins created');

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
