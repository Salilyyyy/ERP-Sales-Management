const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { authenticateToken } = require('./middleware/auth');

const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://erp-system.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

const port = process.env.PORT || 5000;

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

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

// Base path prefix for all routes
const router = express.Router();

// Mount all routes on the router
router.use('/auth', authRouter);
router.use('/promotions', authenticateToken, promotionsRouter);
router.use('/invoices', authenticateToken, invoicesRouter);
router.use('/invoice-details', authenticateToken, invoiceDetailsRouter);
router.use('/products', authenticateToken, productsRouter);
router.use('/product-categories', authenticateToken, productCategoriesRouter);
router.use('/suppliers', authenticateToken, suppliersRouter);
router.use('/customers', authenticateToken, customersRouter);
router.use('/shipments', authenticateToken, shipmentsRouter);
router.use('/post-offices', authenticateToken, postOfficesRouter);
router.use('/users', authenticateToken, usersRouter);
router.use('/stockins', authenticateToken, stockinsRouter);
router.use('/detail-stockins', authenticateToken, detailStockinsRouter);
router.use('/test', testRouter);

// Mount the router under /api
app.use('/api', router);

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
