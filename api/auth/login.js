const { getConfig, generateOTP, sendOTPEmail } = require('../../lib/auth-service');

module.exports = async (req, res) => {
  // Set CORS headers
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
    const { email, password } = body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and Master Password are required.' });
    }

    const config = getConfig();

    // Verify authorized admin email and password
    const isEmailValid = email.trim().toLowerCase() === config.adminEmail;
    const isPasswordValid = password === config.adminPassword;

    if (!isEmailValid || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Only the authorized administrator email and password can initiate 2FA.'
      });
    }

    // Credentials valid: generate and dispatch 2FA OTP
    const otp = generateOTP();
    const emailResult = await sendOTPEmail(config.adminEmail, otp);

    return res.status(200).json({
      success: true,
      message: `A 6-digit 2FA verification code has been sent to ${config.adminEmail}.`,
      targetEmail: config.adminEmail,
      devMode: emailResult.method === 'dev-log',
      devOtp: emailResult.devOtp || null
    });
  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
};
