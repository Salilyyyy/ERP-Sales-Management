const express = require('express');
const cors = require('cors'); // ✅ Thêm dòng này
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { authenticateToken } = require('./middleware/auth');

const prisma = new PrismaClient();
const app = express();

// ✅ Cấu hình CORS trước các middleware khác
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.json());

const port = process.env.PORT || 5000;

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
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

// Public routes
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
