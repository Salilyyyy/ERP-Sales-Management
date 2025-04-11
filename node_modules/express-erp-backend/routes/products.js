const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Create a new product
router.post('/', async (req, res) => {
  const {
    produceCategoriesID,
    unit,
    image,
    name,
    weight,
    length,
    width,
    height,
    supplierID,
    origin,
    inPrice,
    outPrice,
    quantity,
    title,
    description,
  } = req.body;
  try {
    const product = await prisma.products.create({
      data: {
        produceCategoriesID,
        unit,
        image,
        name,
        weight,
        length,
        width,
        height,
        supplierID,
        origin,
        inPrice,
        outPrice,
        quantity,
        title,
        description,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.products.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.products.findUnique({
      where: { ID: parseInt(id) },
    });
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a product by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    produceCategoriesID,
    unit,
    image,
    name,
    weight,
    length,
    width,
    height,
    supplierID,
    origin,
    inPrice,
    outPrice,
    quantity,
    title,
    description,
  } = req.body;
  try {
    const product = await prisma.products.update({
      where: { ID: parseInt(id) },
      data: {
        produceCategoriesID,
        unit,
        image,
        name,
        weight,
        length,
        width,
        height,
        supplierID,
        origin,
        inPrice,
        outPrice,
        quantity,
        title,
        description,
      },
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a product by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.products.delete({
      where: { ID: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
