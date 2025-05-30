const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/auth.service');
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/forgot-password', 
  [body('email').isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      const result = await AuthService.requestPasswordReset(email);
      
      res.json({
        success: true,
        message: 'Email đặt lại mật khẩu đã được gửi. Mời kiểm tra hộp thư của bạn.',
        previewUrl: result.debug?.previewUrl
      });
    } catch (error) {      
      if (error.message === 'User not found') {
        return res.status(404).json({ 
          error: 'Email không tồn tại trong hệ thống' 
        });
      }

      return res.status(500).json({ 
        error: 'Đã xảy ra lỗi khi gửi email',
        details: error.message
      });
    }
});

router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const user = await prisma.users.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'INVALID_RESET_TOKEN',
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    res.json({ 
      valid: true,
      message: 'Token hợp lệ'
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ 
      error: 'SERVER_ERROR',
      message: 'Đã xảy ra lỗi khi xác thực token' 
    });
  }
});

router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, newPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword);
      res.json(result);
    } catch (error) {      
      if (error.message === 'Invalid or expired reset token') {
        return res.status(400).json({ 
          error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' 
        });
      }
      
      res.status(500).json({ 
        error: 'Đã xảy ra lỗi khi đặt lại mật khẩu' 
      });
    }
});

router.post('/login', 
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, rememberMe } = req.body;
      const result = await AuthService.login(email, password, rememberMe);
      res.json(result);
    } catch (error) {      
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({ 
          error: 'Email hoặc mật khẩu không đúng' 
        });
      }
      
      res.status(500).json({ 
        error: 'Đã xảy ra lỗi khi đăng nhập' 
      });
    }
});

router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty().trim(),
    body('phoneNumber').notEmpty(),
    body('department').notEmpty(),
    body('IdentityCard').notEmpty(),
    body('userType').notEmpty(),
    body('birthday').isISO8601().toDate(),
    body('address').notEmpty().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error) {      
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({ 
          error: 'Email đã được sử dụng' 
        });
      }
      
      res.status(500).json({ 
        error: 'Đã xảy ra lỗi khi đăng ký' 
      });
    }
});

module.exports = router;
