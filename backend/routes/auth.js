const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/auth.service');
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { ID: req.user.id },
      select: {
        ID: true,
        email: true,
        address: true,
        phoneNumber: true,
        department: true,
        IdentityCard: true,
        userType: true,
        birthday: true,
        status: true,
        createAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users', authenticateToken, async (req, res) => {
  try {
    const requestingUser = await prisma.users.findUnique({
      where: { ID: req.user.id },
    });

    if (requestingUser.userType !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const users = await prisma.users.findMany({
      select: {
        ID: true,
        email: true,
        address: true,
        phoneNumber: true,
        department: true,
        IdentityCard: true,
        userType: true,
        birthday: true,
        status: true,
        createAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const registrationValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('address').notEmpty(),
  body('phoneNumber').notEmpty(),
  body('department').notEmpty(),
  body('IdentityCard').notEmpty(),
  body('userType').notEmpty(),
  body('birthday').isISO8601().toDate(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', registrationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'User with this email already exists') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;
