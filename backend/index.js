require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { authenticateToken } = require('./middleware/auth');

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());


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

app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const port = process.env.PORT || 10000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
}
// Swagger docs
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
startServer();
console.log("👉 DATABASE_URL:", process.env.DATABASE_URL);

module.exports = app;