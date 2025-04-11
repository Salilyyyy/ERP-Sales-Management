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
const port = process.env.PORT || 10000;

// CORS cấu hình cho frontend local và Vercel
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://erp-sales-management.vercel.app',
    'https://erp-system-api.vercel.app'
  ],
  credentials: true
}));

app.use(bodyParser.json());


app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/api/health', (req, res) => {
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
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/promotions', authenticateToken, promotionsRouter);
app.use('/api/invoices', authenticateToken, invoicesRouter);
app.use('/api/invoice-details', authenticateToken, invoiceDetailsRouter);
app.use('/api/products', authenticateToken, productsRouter);
app.use('/api/product-categories', authenticateToken, productCategoriesRouter);
app.use('/api/suppliers', authenticateToken, suppliersRouter);
app.use('/api/customers', authenticateToken, customersRouter);
app.use('/api/shipments', authenticateToken, shipmentsRouter);
app.use('/api/post-offices', authenticateToken, postOfficesRouter);
app.use('/api/users', authenticateToken, usersRouter);
app.use('/api/stockins', authenticateToken, stockinsRouter);
app.use('/api/detail-stockins', authenticateToken, detailStockinsRouter);
app.use('/api/test', testRouter);

// Khởi chạy server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
