const { verifyToken } = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  const { valid, decoded, error } = verifyToken(token);

  if (!valid) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  try {
    // Get user data including userType
    const user = await prisma.users.findUnique({
      where: { ID: decoded.userId },
      select: {
        ID: true,
        userType: true,
        email: true,
        name: true,
        status: true
      }
    });

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Attach user info to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  authenticateToken,
};
