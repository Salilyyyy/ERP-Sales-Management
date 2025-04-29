const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

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
        Products: true, // Bao gồm tất cả các sản phẩm liên quan đến danh mục
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
        Products: true, // Bao gồm tất cả các sản phẩm liên quan đến danh mục
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
    await prisma.productCategories.delete({
      where: { ID: parseInt(id) },
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
