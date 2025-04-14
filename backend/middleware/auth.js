const { verifyToken } = require('../utils/jwt');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  const { valid, decoded, error } = verifyToken(token);

  if (!valid) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = { id: decoded.userId }; // Attach user ID to request object
  next();
};

module.exports = {
  authenticateToken,
};
