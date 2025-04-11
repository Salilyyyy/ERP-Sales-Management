const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Create a new post office
router.post('/', async (req, res) => {
  const { address, name, phoneNumber, email } = req.body;
  try {
    const postOffice = await prisma.postOffices.create({
      data: {
        address,
        name,
        phoneNumber,
        email,
      },
    });
    res.status(201).json(postOffice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all post offices
router.get('/', async (req, res) => {
  try {
    const postOffices = await prisma.postOffices.findMany();
    res.status(200).json(postOffices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single post office by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const postOffice = await prisma.postOffices.findUnique({
      where: { ID: parseInt(id) },
    });
    if (postOffice) {
      res.status(200).json(postOffice);
    } else {
      res.status(404).json({ error: 'Post office not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a post office by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { address, name, phoneNumber, email } = req.body;
  try {
    const postOffice = await prisma.postOffices.update({
      where: { ID: parseInt(id) },
      data: {
        address,
        name,
        phoneNumber,
        email,
      },
    });
    res.status(200).json(postOffice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a post office by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.postOffices.delete({
      where: { ID: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
