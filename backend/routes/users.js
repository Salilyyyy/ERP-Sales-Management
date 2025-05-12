const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../services/mail.service');

const prisma = new PrismaClient();
const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
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
  body('department').notEmpty(),
  body('userType').notEmpty(),
  // Make other fields optional
  body('address').optional(),
  body('phoneNumber').optional(),
  body('IdentityCard').optional(),
  body('birthday').optional().isISO8601().toDate(),
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

// Send invitation email
router.post('/send-invitation', async (req, res) => {
  const { email, name, userId } = req.body;

  try {
    // Generate a unique reset token
    const resetToken = bcrypt.hashSync(Date.now().toString(), SALT_ROUNDS).replace(/[/]/g, '_');
    
    // Update user with reset token
    await prisma.users.update({
      where: { ID: userId },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) 
      }
    });

    // Send invitation email
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  </head>
  <body style="font-family: Arial, sans-serif;">
    <div style="display: block; margin: auto; max-width: 600px;" class="main">
      <h1 style="font-size: 24px; font-weight: bold; color: #3b4d35; margin-top: 20px; text-align: center;">
        Chào mừng đến với ERP System
      </h1>
      <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
        <p style="color: #666; line-height: 1.6;">Xin chào ${name},</p>
        <p style="color: #666; line-height: 1.6;">
          Bạn đã được mời tham gia hệ thống ERP. Để bắt đầu sử dụng, vui lòng thiết lập mật khẩu cho tài khoản của bạn.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #3b4d35; color: white; 
                    padding: 12px 24px; text-decoration: none; 
                    border-radius: 5px; font-weight: bold;">
            Thiết lập mật khẩu
          </a>
        </div>
        <p style="color: #666; line-height: 1.6;">
          Hoặc sử dụng đường dẫn sau:
        </p>
        <p style="background: #eee; padding: 10px; border-radius: 4px; word-break: break-all;">
          ${resetUrl}
        </p>
        <p style="color: #666; line-height: 1.6;">
          Đường dẫn này sẽ hết hạn sau 24 giờ. 
        </p>
      </div>
      <div style="padding-top: 20px; color: #999; font-size: 12px; text-align: center;">
        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
      </div>
    </div>
  </body>
</html>
    `;

    await sendEmail(
      email,
      'Welcome to ERP System ',
      html
    );

    res.status(200).json({ message: 'Invitation email sent successfully' });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation email' });
  }
});

module.exports = router;
