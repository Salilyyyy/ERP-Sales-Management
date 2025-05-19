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
    address
  } = req.body;
  const parsedBonusPoints = bonusPoints ? parseInt(bonusPoints) : 0;
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
        address
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
        Invoices: {
          select: {
            ID: true,
            exportTime: true,
            paymentMethod: true,
            tax: true,
            total: true,
            isPaid: true,
            isDelivery: true
          }
        }
      }
    });
    
    console.log(`Found ${customers.length} customers:`, customers);

    if (!customers) {
      return res.status(500).json({ error: 'Database returned no data' });
    }

    if (!Array.isArray(customers)) {
      return res.status(500).json({ error: 'Invalid data format from database' });
    }

    res.status(200).json(customers);
  } catch (error) {
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

// Export customers  
router.get('/export', async (req, res) => {
  try {
    const customers = await prisma.customers.findMany({
      include: {
        Invoices: {
          select: {
            ID: true,
            exportTime: true,
            paymentMethod: true,
            tax: true,
            total: true,
            isPaid: true,
            isDelivery: true
          }
        }
      }
    });
    res.status(200).json(customers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get new customers in last month with details
router.get('/new-customers', async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const customers = await prisma.customers.findMany({
      where: {
        createdAt: {
          gte: oneMonthAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        ID: true,
        name: true,
        createdAt: true,
        email: true,
        phoneNumber: true
      }
    });

    res.status(200).json(customers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get new customers count in last month
router.get('/new-customers-count', async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const count = await prisma.customers.count({
      where: {
        createdAt: {
          gte: oneMonthAgo
        }
      }
    });

    res.status(200).json({ count });
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
      include: {
        Invoices: {
          select: {
            ID: true,
            exportTime: true,
            paymentMethod: true,
            tax: true,
            total: true,
            isPaid: true,
            isDelivery: true
          }
        }
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
    address
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
        address
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


module.exports = router;
