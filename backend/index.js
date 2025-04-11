const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { authenticateToken } = require('./middleware/auth');
require('dotenv').config();

let prisma;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.error("Failed to initialize Prisma client:", error);
  process.exit(1);
}

const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://erp-sales-management.vercel.app',
    'https://erp-sales-management.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

// Swagger Docs
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Middleware xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Load routes
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

// Public route
app.use('/auth', authRouter);

// Protected routes
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
app.use('/test', testRouter);

// Khởi chạy server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
