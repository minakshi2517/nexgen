const { getConfig, generateOTP, sendOTPEmail } = require('../../lib/auth-service');

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
    const { email } = body || {};

    const config = getConfig();
    if (!email || email.trim().toLowerCase() !== config.adminEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized email address.' });
    }

    const otp = generateOTP();
    const emailResult = await sendOTPEmail(config.adminEmail, otp);

    return res.status(200).json({
      success: true,
      message: `A fresh 6-digit OTP has been sent to ${config.adminEmail}.`,
      devMode: emailResult.method === 'dev-log',
      devOtp: emailResult.devOtp || null
    });
  } catch (error) {
    console.error('Resend OTP API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while resending OTP.' });
  }
};
