const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { sendEmail } = require('./mail.service');
const crypto = require('crypto');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

class AuthService {
  static async requestPasswordReset(email) {
    try {
      console.log('Starting password reset request for:', email);

      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        console.log('User not found:', email);
        throw new Error('User not found');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await prisma.users.update({
        where: { email },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const emailHtml = `
<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  </head>
  <body style="font-family: Arial, sans-serif;">
    <div style="display: block; margin: auto; max-width: 600px;" class="main">
      <h1 style="font-size: 24px; font-weight: bold; color: #3b4d35; margin-top: 20px; text-align: center;">
        Đặt lại mật khẩu ERP System
      </h1>
      <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
        <p style="color: #666; line-height: 1.6;">Xin chào,</p>
        <p style="color: #666; line-height: 1.6;">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #3b4d35; color: white; 
                    padding: 12px 24px; text-decoration: none; 
                    border-radius: 5px; font-weight: bold;">
            Đặt lại mật khẩu
          </a>
        </div>
        <p style="color: #666; line-height: 1.6;">
          Hoặc sử dụng đường dẫn sau:
        </p>
        <p style="background: #eee; padding: 10px; border-radius: 4px; word-break: break-all;">
          ${resetLink}
        </p>
        <p style="color: #666; line-height: 1.6;">
          Đường dẫn này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, 
          vui lòng bỏ qua email này.
        </p>
      </div>
      <div style="padding-top: 20px; color: #999; font-size: 12px; text-align: center;">
        <p>Email này được gửi tự động, vui lòng không trả lời.</p>
      </div>
    </div>
  </body>
</html>`;

      console.log('Sending password reset email');
      const emailResult = await sendEmail(
        email,
        'Đặt lại mật khẩu - ERP System',
        emailHtml
      );
      console.log('Email result:', emailResult);

      return {
        success: true,
        message: 'Email đặt lại mật khẩu đã được gửi',
        debug: emailResult
      };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  static async resetPassword(token, newPassword) {
    try {
      const user = await prisma.users.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

      await prisma.users.update({
        where: { ID: user.ID },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return { 
        success: true,
        message: 'Mật khẩu đã được đặt lại thành công' 
      };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  static async login(email, password) {
    try {
      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      const token = generateToken(user.ID);
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async register(userData) {
    try {
      const { email, password, ...otherData } = userData;

      const existingUser = await prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const user = await prisma.users.create({
        data: {
          ...otherData,
          email,
          password: hashedPassword,
          createAt: new Date(),
          status: 'ACTIVE',
        },
      });

      const token = generateToken(user.ID);
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
}

module.exports = AuthService;
