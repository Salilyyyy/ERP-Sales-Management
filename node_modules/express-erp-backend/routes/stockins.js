const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Create a new stockin
router.post('/', async (req, res) => {
  const { stockinDate, notes } = req.body;
  try {
    const stockin = await prisma.stockins.create({
      data: {
        stockinDate,
        notes,
      },
    });
    res.status(201).json(stockin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all stockins
router.get('/', async (req, res) => {
  try {
    const stockins = await prisma.stockins.findMany();
    res.status(200).json(stockins);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single stockin by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const stockin = await prisma.stockins.findUnique({
      where: { ID: parseInt(id) },
    });
    if (stockin) {
      res.status(200).json(stockin);
    } else {
      res.status(404).json({ error: 'Stockin not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a stockin by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { stockinDate, notes } = req.body;
  try {
    const stockin = await prisma.stockins.update({
      where: { ID: parseInt(id) },
      data: {
        stockinDate,
        notes,
      },
    });
    res.status(200).json(stockin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a stockin by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.stockins.delete({
      where: { ID: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
