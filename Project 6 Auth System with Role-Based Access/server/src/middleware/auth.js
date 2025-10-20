const jwt = require('jsonwebtoken');

// Verifies the Bearer access token and attaches { id, role } to req.user
const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, data: null, message: 'Access token required' });
  }

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, data: null, message: 'Invalid or expired token' });
  }
};

// Usage: authorize('ADMIN') or authorize('ADMIN', 'USER')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      data: null,
      message: `Requires role: ${roles.join(' or ')}`
    });
  }
  next();
};

module.exports = { authenticate, authorize };
