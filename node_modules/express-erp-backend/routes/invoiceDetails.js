const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Create a new invoice detail
router.post('/', async (req, res) => {
  const { invoiceID, productID, unitPrice, quantity, notes } = req.body;
  try {
    const invoiceDetail = await prisma.invoiceDetails.create({
      data: {
        invoiceID,
        productID,
        unitPrice,
        quantity,
        notes,
      },
    });
    res.status(201).json(invoiceDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all invoice details
router.get('/', async (req, res) => {
  try {
    const invoiceDetails = await prisma.invoiceDetails.findMany();
    res.status(200).json(invoiceDetails);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single invoice detail by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const invoiceDetail = await prisma.invoiceDetails.findUnique({
      where: { ID: parseInt(id) },
    });
    if (invoiceDetail) {
      res.status(200).json(invoiceDetail);
    } else {
      res.status(404).json({ error: 'Invoice detail not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update an invoice detail by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { invoiceID, productID, unitPrice, quantity, notes } = req.body;
  try {
    const invoiceDetail = await prisma.invoiceDetails.update({
      where: { ID: parseInt(id) },
      data: {
        invoiceID,
        productID,
        unitPrice,
        quantity,
        notes,
      },
    });
    res.status(200).json(invoiceDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an invoice detail by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.invoiceDetails.delete({
      where: { ID: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
