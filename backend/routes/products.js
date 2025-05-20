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
    const product = await prisma.product.create({
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
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isArchived: false
      },
      include: {
        productCategory: true,
        supplier: true
      },
    });
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single product by ID with category name
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { ID: parseInt(id) },
      include: {
        productCategory: true,
        supplier: true
      },
    });
    if (product) {
      res.status(200).json({
        success: true,
        data: product
      });
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
    const product = await prisma.product.update({
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
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Archive a product by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.update({
      where: { ID: parseInt(id) },
      data: { isArchived: true }
    });

    res.status(200).json({
      success: true,
      message: 'Product archived successfully'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
