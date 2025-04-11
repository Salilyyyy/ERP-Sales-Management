const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Create a new shipment
router.post('/', async (req, res) => {
  const {
    invoiceID,
    postOfficeID,
    receiverName,
    receiverPhone,
    sendTime,
    receiveTime,
    size,
    shippingCost,
    payer,
    address,
  } = req.body;
  try {
    const shipment = await prisma.shipments.create({
      data: {
        invoiceID,
        postOfficeID,
        receiverName,
        receiverPhone,
        sendTime,
        receiveTime,
        size,
        shippingCost,
        payer,
        address,
      },
    });
    res.status(201).json(shipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all shipments
router.get('/', async (req, res) => {
  try {
    const shipments = await prisma.shipments.findMany();
    res.status(200).json(shipments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single shipment by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const shipment = await prisma.shipments.findUnique({
      where: { ID: parseInt(id) },
    });
    if (shipment) {
      res.status(200).json(shipment);
    } else {
      res.status(404).json({ error: 'Shipment not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a shipment by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    invoiceID,
    postOfficeID,
    receiverName,
    receiverPhone,
    sendTime,
    receiveTime,
    size,
    shippingCost,
    payer,
    address,
  } = req.body;
  try {
    const shipment = await prisma.shipments.update({
      where: { ID: parseInt(id) },
      data: {
        invoiceID,
        postOfficeID,
        receiverName,
        receiverPhone,
        sendTime,
        receiveTime,
        size,
        shippingCost,
        payer,
        address,
      },
    });
    res.status(200).json(shipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a shipment by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.shipments.delete({
      where: { ID: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
