const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create a new supplier
router.post('/', async (req, res) => {
  const {
    address,
    name,
    postalCode,
    phoneNumber,
    email,
    representative,
    phoneNumberRep,
    taxId,
    country,
    notes,
  } = req.body;
  try {
    const supplier = await prisma.suppliers.create({
      data: {
        address,
        name,
        postalCode,
        phoneNumber,
        email,
        representative,
        phoneNumberRep,
        taxId,
        country,
        notes, 
      }
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await prisma.suppliers.findMany({
      include: {
        Products: true
      }
    });
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single supplier by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await prisma.suppliers.findUnique({
      where: { ID: parseInt(id) },
      include: {
        Products: true
      }
    });
      if (supplier) {
        res.status(200).json(supplier);
      } else {
        res.status(404).json({ error: 'Supplier not found' });
      }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a supplier by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    address,
    name,
    postalCode,
    phoneNumber,
    email,
    representative,
    phoneNumberRep,
    taxId,
    country,
    notes
  } = req.body;
  try {
    const supplier = await prisma.suppliers.update({
      where: { ID: parseInt(id) },
      data: {
        address,
        name,
        postalCode,
        phoneNumber,
        email,
        representative,
        phoneNumberRep,
        taxId,
        country,
      notes,
      },
    });
    res.status(200).json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a supplier by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check for existing products
    const productsCount = await prisma.product.count({
      where: { supplierID: parseInt(id) }
    });

    // Check for existing stockins
    const stockinsCount = await prisma.stockins.count({
      where: { supplierID: parseInt(id) }
    });

    if (productsCount > 0 || stockinsCount > 0) {
      return res.status(400).json({ 
        error: "Không thể xóa nhà cung cấp này vì có sản phẩm hoặc phiếu nhập kho liên quan. Vui lòng xóa các dữ liệu liên quan trước."
      });
    }

    await prisma.suppliers.delete({
      where: { ID: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
