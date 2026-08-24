const { verifyToken } = require('../../lib/auth-service');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ authenticated: false, message: 'Invalid or expired session token.' });
    }

    return res.status(200).json({
      authenticated: true,
      admin: {
        email: decoded.email,
        role: decoded.role || 'Super Administrator'
      }
    });
  } catch (error) {
    return res.status(500).json({ authenticated: false, message: 'Error checking session.' });
  }
};
