const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Create a new detail stockin
router.post('/', async (req, res) => {
  const { StockinID, productID, quantity, unitPrice } = req.body;
  try {
    const detailStockin = await prisma.detailStockins.create({
      data: {
        StockinID,
        productID,
        quantity,
        unitPrice,
      },
    });
    res.status(201).json(detailStockin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all detail stockins
router.get('/', async (req, res) => {
  try {
    const detailStockins = await prisma.detailStockins.findMany();
    res.status(200).json(detailStockins);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single detail stockin by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const detailStockin = await prisma.detailStockins.findUnique({
      where: { ID: parseInt(id) },
    });
    if (detailStockin) {
      res.status(200).json(detailStockin);
    } else {
      res.status(404).json({ error: 'Detail stockin not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a detail stockin by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { StockinID, productID, quantity, unitPrice } = req.body;
  try {
    const detailStockin = await prisma.detailStockins.update({
      where: { ID: parseInt(id) },
      data: {
        StockinID,
        productID,
        quantity,
        unitPrice,
      },
    });
    res.status(200).json(detailStockin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a detail stockin by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.detailStockins.delete({
      where: { ID: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
