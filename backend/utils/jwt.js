const jwt = require('jsonwebtoken');

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h', 
  algorithm: 'HS256',
  issuer: 'erp-sales-management',
};

/**
 * Generate a JWT token for a user
 * @param {number} userId - The user's ID
 * @returns {string} The generated JWT token
 */
const generateToken = (userId) => {
  if (!userId) {
    throw new Error('User ID is required to generate token');
  }

  return jwt.sign(
    { 
      userId,
      timestamp: Date.now() 
    }, 
    JWT_CONFIG.secret, 
    {
      expiresIn: JWT_CONFIG.expiresIn,
      algorithm: JWT_CONFIG.algorithm,
      issuer: JWT_CONFIG.issuer,
    }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Object} Object containing validation result and decoded token or error
 */
const verifyToken = (token) => {
  if (!token) {
    return { valid: false, error: 'Token is required' };
  }

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret, {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: JWT_CONFIG.issuer,
    });

    return { 
      valid: true, 
      decoded,
      expiresAt: new Date(decoded.exp * 1000).toISOString()
    };
  } catch (error) {
    return { 
      valid: false, 
      error: error.message,
      errorType: error.name 
    };
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_CONFIG,
};
