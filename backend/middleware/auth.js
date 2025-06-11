const jwt = require('jsonwebtoken');

// Middleware to verify any logged-in user
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
    req.user = decoded; // decoded contains { userId, role, username }
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(400).json({ msg: 'Invalid token.' });
  }
};

// Middleware to allow only admins
const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
