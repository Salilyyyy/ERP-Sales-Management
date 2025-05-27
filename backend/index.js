require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { authenticateToken } = require('./middleware/auth');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['query', 'info', 'warn', 'error']
});
const app = express();

app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.log('Request has timed out.');
    res.status(408).send('Request has timed out');
  });
  next();
});

// Middleware
// Configure CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://erp-sales-management.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(bodyParser.json({
  limit: '10mb'
}));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});


// ROUTES
const authRouter = require('./routes/auth');
const promotionsRouter = require('./routes/promotions');
const invoicesRouter = require('./routes/invoices');
const invoiceDetailsRouter = require('./routes/invoiceDetails');
const productsRouter = require('./routes/products');
const productCategoriesRouter = require('./routes/productCategories');
const suppliersRouter = require('./routes/suppliers');
const customersRouter = require('./routes/customers');
const shipmentsRouter = require('./routes/shipments');
const postOfficesRouter = require('./routes/postOffices');
const usersRouter = require('./routes/users');
const stockinsRouter = require('./routes/stockins');
const detailStockinsRouter = require('./routes/detailStockins');
const testRouter = require('./routes/test');

// PUBLIC ROUTES
app.use('/auth',authRouter);
app.use('/test', testRouter);

// PROTECTED ROUTES
app.use('/promotions', authenticateToken, promotionsRouter);
app.use('/invoices', authenticateToken, invoicesRouter);
app.use('/invoice-details', authenticateToken, invoiceDetailsRouter);
app.use('/products', authenticateToken, productsRouter);
app.use('/product-categories', authenticateToken, productCategoriesRouter);
app.use('/suppliers', authenticateToken, suppliersRouter);
app.use('/customers', authenticateToken, customersRouter);
app.use('/shipments', authenticateToken, shipmentsRouter);
app.use('/post-offices', authenticateToken, postOfficesRouter);
app.use('/users', authenticateToken, usersRouter);
app.use('/stockins', authenticateToken, stockinsRouter);
app.use('/detail-stockins', authenticateToken, detailStockinsRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  
  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: 'Database operation failed',
      details: err.message
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.message
    });
  }

  // Handle other errors
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const port = process.env.PORT || 10000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    try {
      const count = await prisma.postOffices.count();
      console.log(`Found ${count} post offices in database`);
    } catch (queryError) {
      console.error('❌ Failed to query post offices:', queryError);
      throw queryError;
    }

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    process.exit(1);
  }
}

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

// Swagger docs
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
startServer();
console.log("👉 DATABASE_URL:", process.env.DATABASE_URL);

module.exports = app;
