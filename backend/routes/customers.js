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
    ward,
    district,
    city
  } = req.body;
  const parsedBonusPoints = bonusPoints ? parseInt(bonusPoints) : 0;
  const fullAddress = `${address}${ward ? `, ${ward}` : ''}${district ? `, ${district}` : ''}${city ? `, ${city}` : ''}`;
  try {
    const customer = await prisma.customers.create({
      data: {
        organization,
        name: name ? name : "Unknown",
        tax: tax,
        phoneNumber: phoneNumber,
        email,
        introduce,
        postalCode,
        bonusPoints: parsedBonusPoints,
        notes,
        address: fullAddress,
      },
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all customers
router.get('/', async (req, res) => {
  console.log('GET /customers request received');
  try {
    console.log('Attempting to fetch customers from database...');
    const customers = await prisma.customers.findMany({
      include: {
        Invoices: true
      }
    });
    
    console.log(`Found ${customers.length} customers:`, customers);

    if (!customers) {
      console.error('Database returned null or undefined');
      return res.status(500).json({ error: 'Database returned no data' });
    }

    if (!Array.isArray(customers)) {
      console.error('Database returned non-array:', typeof customers);
      return res.status(500).json({ error: 'Invalid data format from database' });
    }

    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Database constraint violation' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.status(500).json({ 
      error: 'Internal server error fetching customers',
      details: error.message
    });
  }
});

// Get a single customer by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await prisma.customers.findUnique({
      where: { ID: parseInt(id) },
      include: {
        Invoices: true
      }
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
    ward,
    district,
    city
  } = req.body;
  const updatedFullAddress = `${address}, ${ward}, ${district}, ${city}`;

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
        address: updatedFullAddress,
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

// Delete multiple customers
router.post('/delete-multiple', async (req, res) => {
  const { ids } = req.body;
  try {
    await prisma.$transaction(
      ids.map(id => 
        prisma.customers.delete({
          where: { ID: parseInt(id) }
        })
      )
    );
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Export customers
router.get('/export', async (req, res) => {
  try {
    const customers = await prisma.customers.findMany({
      include: {
        Invoices: true
      }
    });
    res.status(200).json(customers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
