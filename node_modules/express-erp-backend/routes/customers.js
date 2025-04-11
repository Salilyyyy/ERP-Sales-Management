const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Create a new customer
router.post('/', async (req, res) => {
  const {
    organization,
    name,
    tax,
    phoneNumber,
    email,
    introduce,
    postalCode,
    bonusPoints,
    notes,
    address,
  } = req.body;
  try {
    const customer = await prisma.customers.create({
      data: {
        organization,
        name,
        tax,
        phoneNumber,
        email,
        introduce,
        postalCode,
        bonusPoints,
        notes,
        address,
      },
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customers.findMany();
    res.status(200).json(customers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single customer by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await prisma.customers.findUnique({
      where: { ID: parseInt(id) },
    });
    if (customer) {
      res.status(200).json(customer);
    } else {
      res.status(404).json({ error: 'Customer not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a customer by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    organization,
    name,
    tax,
    phoneNumber,
    email,
    introduce,
    postalCode,
    bonusPoints,
    notes,
    address,
  } = req.body;
  try {
    const customer = await prisma.customers.update({
      where: { ID: parseInt(id) },
      data: {
        organization,
        name,
        tax,
        phoneNumber,
        email,
        introduce,
        postalCode,
        bonusPoints,
        notes,
        address,
      },
    });
    res.status(200).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a customer by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.customers.delete({
      where: { ID: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
