const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const router = express.Router();

const SALT_ROUNDS = 10;

// Validation middleware
const userValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('address').notEmpty(),
  body('phoneNumber').notEmpty(),
  body('department').notEmpty(),
  body('IdentityCard').notEmpty(),
  body('userType').notEmpty(),
  body('birthday').isISO8601().toDate(),
];

// Create a new user
router.post('/', userValidation, async (req, res) => {
  const {
    address,
    image,
    email,
    password,
    birthday,
    phoneNumber,
    department,
    IdentityCard,
    userType,
    createAt,
    status,
  } = req.body;
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Hash password if provided
    if (password) {
      req.body.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const user = await prisma.users.create({
      data: {
        address,
        image,
        email,
        password: req.body.password,
        birthday,
        phoneNumber,
        department,
        IdentityCard,
        userType,
        createAt: new Date(),
        status: status || 'ACTIVE',
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        ID: true,
        address: true,
        image: true,
        email: true,
        birthday: true,
        phoneNumber: true,
        department: true,
        IdentityCard: true,
        userType: true,
        createAt: true,
        status: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a single user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.users.findUnique({
      where: { ID: parseInt(id) },
      select: {
        ID: true,
        address: true,
        image: true,
        email: true,
        birthday: true,
        phoneNumber: true,
        department: true,
        IdentityCard: true,
        userType: true,
        createAt: true,
        status: true,
      },
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a user by ID
router.put('/:id', userValidation, async (req, res) => {
  const { id } = req.params;
  const {
    address,
    image,
    email,
    password,
    birthday,
    phoneNumber,
    department,
    IdentityCard,
    userType,
    createAt,
    status,
  } = req.body;
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Hash password if provided
    if (password) {
      req.body.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const updateData = { ...req.body };
    delete updateData.createAt; // Prevent createAt from being updated

    const user = await prisma.users.update({
      where: { ID: parseInt(id) },
      data: updateData,
      select: {
        ID: true,
        address: true,
        image: true,
        email: true,
        birthday: true,
        phoneNumber: true,
        department: true,
        IdentityCard: true,
        userType: true,
        createAt: true,
        status: true,
      },
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.users.delete({
      where: { ID: parseInt(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
