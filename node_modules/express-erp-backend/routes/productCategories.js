const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Create a new product category
router.post('/', async (req, res) => {
  const { name, information } = req.body;
  try {
    const productCategory = await prisma.productCategories.create({
      data: {
        name,
        information,
      },
    });
    res.status(201).json(productCategory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all product categories
router.get('/', async (req, res) => {
  try {
    const productCategories = await prisma.productCategories.findMany();
    res.status(200).json(productCategories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single product category by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const productCategory = await prisma.productCategories.findUnique({
      where: { ID: parseInt(id) },
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
  const { name, information } = req.body;
  try {
    const productCategory = await prisma.productCategories.update({
      where: { ID: parseInt(id) },
      data: {
        name,
        information,
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

module.exports = router;
