const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.use(authenticateToken);

// Create a new product category
router.post('/', async (req, res) => {
  const { name, unit, status, promotion, tax, description, notes } = req.body;
  try {
    const productCategory = await prisma.productCategories.create({
      data: {
        name,
        unit,
        status,
        promotion,
        tax,
        description,
        notes,
      },
    });
    res.status(201).json(productCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all product categories with their related products
router.get('/', async (req, res) => {
  try {
    const productCategories = await prisma.productCategories.findMany({
      include: {
        Products: true,
      },
    });
    res.status(200).json(productCategories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single product category by ID with its related products
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const productCategory = await prisma.productCategories.findUnique({
      where: { ID: parseInt(id) },
      include: {
        Products: true,
      },
    });
    if (productCategory) {
      res.status(200).json(productCategory);
    } else {
      res.status(404).json({ error: 'Product category not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a product category by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, unit, status, promotion, tax, description, notes } = req.body;
  try {
    const productCategory = await prisma.productCategories.update({
      where: { ID: parseInt(id) },
      data: {
        name,
        unit,
        status,
        promotion,
        tax,
        description,
        notes,
      },
    });
    res.status(200).json(productCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a product category by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const products = await prisma.product.findMany({
      where: { produceCategoriesID: parseInt(id) },
      select: { ID: true }
    });
    const productIds = products.map(p => p.ID);

    await prisma.$transaction(async (tx) => {
      await tx.detailStockins.deleteMany({
        where: { productID: { in: productIds } }
      });

      await tx.invoiceDetails.deleteMany({
        where: { productID: { in: productIds } }
      });

      await tx.product.deleteMany({
        where: { produceCategoriesID: parseInt(id) }
      });

      await tx.productCategories.delete({
        where: { ID: parseInt(id) }
      });
    });

    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete multiple product categories by IDs
router.post('/delete-multiple', async (req, res) => {
  const { ids } = req.body;
  try {
    const products = await prisma.product.findMany({
      where: {
        produceCategoriesID: {
          in: ids.map(id => parseInt(id))
        }
      },
      select: { ID: true }
    });
    const productIds = products.map(p => p.ID);

    await prisma.$transaction(async (tx) => {
      await tx.detailStockins.deleteMany({
        where: { productID: { in: productIds } }
      });

      await tx.invoiceDetails.deleteMany({
        where: { productID: { in: productIds } }
      });

      await tx.product.deleteMany({
        where: {
          produceCategoriesID: {
            in: ids.map(id => parseInt(id))
          }
        }
      });

      await tx.productCategories.deleteMany({
        where: {
          ID: {
            in: ids.map(id => parseInt(id))
          }
        }
      });
    });

    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API Get products by category
router.get('/categories/:categoryId', async (req, res) => {
  const { categoryId } = req.params;
  try {
    const productCategory = await prisma.productCategories.findUnique({
      where: { ID: parseInt(categoryId) },
      include: {
        Products: true,
      },
    });
    if (productCategory) {
      res.status(200).json(productCategory);
    } else {
      res.status(404).json({ error: 'Danh mục sản phẩm không tồn tại' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
