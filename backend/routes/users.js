const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const router = express.Router();
const SALT_ROUNDS = 10;

// Kiểm tra ID hợp lệ
const isValidId = (id) => {
  const num = Number(id);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
};

// Validation middleware
const userValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('name').notEmpty(),
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
    name,
    address,
    image,
    email,
    password,
    birthday,
    phoneNumber,
    department,
    IdentityCard,
    userType,
    status,
  } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const user = await prisma.users.create({
      data: {
        name,
        address,
        image,
        email,
        password: hashedPassword,
        birthday,
        phoneNumber,
        department,
        IdentityCard,
        userType,
        createAt: new Date(),
        status: status || 'ACTIVE',
      },
    });

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
        name: true,
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
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const user = await prisma.users.findUnique({
      where: {
        ID: Number(id),
      },
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
        name: true,
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
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
    }

    delete updateData.createAt;

    const user = await prisma.users.update({
      where: { ID: Number(id) },
      data: updateData,
      select: {
        ID: true,
        name: true,
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
  if (!isValidId(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    await prisma.users.delete({
      where: { ID: Number(id) },
    });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
