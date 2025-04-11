const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Create a new promotion
router.post('/', async (req, res) => {
  const { name, dateCreate, dateEnd, type, value, minValue, quantity } = req.body;
  try {
    const promotion = await prisma.promotions.create({
      data: {
        name,
        dateCreate,
        dateEnd,
        type,
        value,
        minValue,
        quantity,
      },
    });
    res.status(201).json(promotion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all promotions
router.get('/', async (req, res) => {
  try {
    const promotions = await prisma.promotions.findMany();
    res.status(200).json(promotions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single promotion by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const promotion = await prisma.promotions.findUnique({
      where: { ID: parseInt(id) },
    });
    if (promotion) {
      res.status(200).json(promotion);
    } else {
      res.status(404).json({ error: 'Promotion not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a promotion by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, dateCreate, dateEnd, type, value, minValue, quantity } = req.body;
  try {
    const promotion = await prisma.promotions.update({
      where: { ID: parseInt(id) },
      data: {
        name,
        dateCreate,
        dateEnd,
        type,
        value,
        minValue,
        quantity,
      },
    });
    res.status(200).json(promotion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a promotion by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.promotions.delete({
      where: { ID: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
