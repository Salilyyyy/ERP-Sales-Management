const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

let prisma;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.error("Prisma client initialization error:", error);
  throw new Error("Database connection error");
}
const SALT_ROUNDS = 10;

class AuthService {
  static async register(userData) {
    const { email, password, ...otherData } = userData;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user with hashed password
    const user = await prisma.users.create({
      data: {
        ...otherData,
        email,
        password: hashedPassword,
        createAt: new Date(),
        status: 'ACTIVE',
      },
    });

    // Generate token
    const token = generateToken(user.ID);

    // Return user data without password and include token
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async login(email, password) {
    try {
      // Find user by email
      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = generateToken(user.ID);

      // Return user data without password and include token
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error("Database operation error:", error);
      throw error;
    }
  }
}

module.exports = AuthService;
