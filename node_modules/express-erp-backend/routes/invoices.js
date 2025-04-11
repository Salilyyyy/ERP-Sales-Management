const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Create a new invoice
router.post('/', async (req, res) => {
  const { promotionID, customerID, exportTime, paymentMethod, tax } = req.body;
  try {
    const invoice = await prisma.invoices.create({
      data: {
        promotionID,
        customerID,
        exportTime,
        paymentMethod,
        tax,
      },
    });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoices.findMany();
    res.status(200).json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single invoice by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await prisma.invoices.findUnique({
      where: { ID: parseInt(id) },
    });
    if (invoice) {
      res.status(200).json(invoice);
    } else {
      res.status(404).json({ error: 'Invoice not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update an invoice by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { promotionID, customerID, exportTime, paymentMethod, tax } = req.body;
  try {
    const invoice = await prisma.invoices.update({
      where: { ID: parseInt(id) },
      data: {
        promotionID,
        customerID,
        exportTime,
        paymentMethod,
        tax,
      },
    });
    res.status(200).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an invoice by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.invoices.delete({
      where: { ID: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
