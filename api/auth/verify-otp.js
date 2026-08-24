const { getConfig, verifyOTP, generateToken } = require('../../lib/auth-service');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }
    const { email, otp } = body || {};

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP are required.' });
    }

    const config = getConfig();
    if (email.trim().toLowerCase() !== config.adminEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized email address.' });
    }

    const verification = verifyOTP(config.adminEmail, otp);
    if (!verification.valid) {
      return res.status(401).json({ success: false, message: verification.message });
    }

    // Generate secure session token
    const token = generateToken({
      email: config.adminEmail,
      role: 'super_admin'
    });

    return res.status(200).json({
      success: true,
      message: '2-Step Verification successful. Access granted.',
      token,
      admin: {
        email: config.adminEmail,
        role: 'Super Administrator',
        authenticatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Verify OTP API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during verification.' });
  }
};
