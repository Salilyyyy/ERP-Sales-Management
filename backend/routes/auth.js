const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/auth.service');

const router = express.Router();

const registrationValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
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
    console.error("Register error:", error);
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
    console.error("Login error:", error);
    if (error.message === 'Invalid email or password') {
      res.status(401).json({ error: error.message });
    } else if (error.code === 'P2021' || error.code === 'P2002') {
      res.status(500).json({ error: 'Database connection error' });
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

router.get('/login', (req, res) => {
  res.status(405).json({
    message: 'This endpoint requires a POST request with JSON body. Please use POST /auth/login instead.'
  });
});

router.get('/register', (req, res) => {
  res.status(405).json({
    message: 'This endpoint requires a POST request with JSON body. Please use POST /auth/register instead.'
  });
});

module.exports = router;
