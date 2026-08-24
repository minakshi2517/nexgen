const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory OTP storage with TTL
const otpStore = new Map();

// Helper: Get sanitized environment config
function getConfig() {
  return {
    adminEmail: (process.env.ADMIN_EMAIL || 'admin@nexgen.com').trim().toLowerCase(),
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
    jwtSecret: process.env.JWT_SECRET || 'nexgen_secure_fallback_secret_2026',
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '465', 10),
    smtpSecure: process.env.SMTP_SECURE !== 'false',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    emailFrom: process.env.EMAIL_FROM || process.env.SMTP_USER || 'NexGen Security <security@nexgenc2c.com>'
  };
}

// Create Nodemailer Transporter
function createTransporter() {
  const config = getConfig();
  if (!config.smtpUser || !config.smtpPass) {
    return null;
  }
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  });
}

// Generate 6-digit random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Email
async function sendOTPEmail(targetEmail, otp) {
  const config = getConfig();
  const transporter = createTransporter();

  // Save OTP in store (valid for 5 minutes)
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore.set(targetEmail.toLowerCase(), { otp, expiresAt, attempts: 0 });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FAF7F2; margin: 0; padding: 30px 15px; }
        .card { max-width: 520px; margin: 0 auto; background: #07152B; border: 1px solid #C5A059; border-radius: 12px; padding: 40px 30px; color: #FAF7F2; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.3); }
        .logo { font-size: 24px; font-weight: 800; color: #FAF7F2; letter-spacing: 1px; margin-bottom: 8px; }
        .logo span { color: #C5A059; }
        .badge { display: inline-block; background: rgba(197,160,89,0.15); border: 1px solid rgba(197,160,89,0.4); color: #D8B775; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-bottom: 20px; text-transform: uppercase; }
        h2 { font-size: 20px; margin: 10px 0 15px 0; color: #FFFFFF; font-weight: 700; }
        p { color: #E8DCC8; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0; }
        .otp-box { background: rgba(255,255,255,0.06); border: 2px dashed #C5A059; border-radius: 10px; padding: 18px; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #FFFFFF; margin: 0 auto 25px auto; font-family: monospace; }
        .warning { font-size: 12px; color: #D8B775; margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; }
        .footer { font-size: 11px; color: rgba(232,220,200,0.6); margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">NEXGEN <span>C2C SKILLS</span></div>
        <div class="badge">Two-Factor Authentication</div>
        <h2>Admin Security Verification</h2>
        <p>A login request was initiated for the NexGen Executive Admin Dashboard. Enter the one-time verification code below to authorize this session:</p>
        
        <div class="otp-box">${otp}</div>
        
        <p style="font-size:13px; color:#D8B775;">⏱️ This code will expire in <strong>5 minutes</strong>.</p>
        
        <div class="warning">
          If you did not request this login, please change your master password immediately.
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} NexGen C2C Skills Platform. All Rights Reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: config.emailFrom,
        to: targetEmail,
        subject: `🔒 ${otp} is your NexGen Admin 2-Step Verification Code`,
        text: `Your NexGen Admin 2FA verification code is: ${otp}. It expires in 5 minutes.`,
        html: emailHtml
      });
      console.log(`[AUTH-EMAIL] Real 2FA OTP sent successfully to: ${targetEmail}`);
      return { sent: true, method: 'smtp' };
    } catch (err) {
      console.error(`[AUTH-EMAIL-ERROR] Failed to send email via SMTP:`, err.message);
      // In case SMTP credentials fail or are misconfigured, fall back to console output so admin is never locked out during setup
      console.log(`[AUTH-FALLBACK-OTP] >>> YOUR OTP IS: ${otp} <<<`);
      return { sent: false, error: err.message, fallbackOtp: otp };
    }
  } else {
    // If SMTP not yet configured in environment variables, output to server log
    console.log(`\n======================================================`);
    console.log(`  🔐 [DEV/SETUP MODE] 2FA OTP for ${targetEmail}`);
    console.log(`  🔑 OTP Code: ${otp}`);
    console.log(`  💡 Set SMTP_USER and SMTP_PASS in .env / Hostinger to send real emails.`);
    console.log(`======================================================\n`);
    return { sent: true, method: 'dev-log', devOtp: otp };
  }
}

// Verify OTP
function verifyOTP(targetEmail, enteredOtp) {
  const record = otpStore.get(targetEmail.toLowerCase());
  if (!record) {
    return { valid: false, message: 'No active OTP found or code expired. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(targetEmail.toLowerCase());
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (record.attempts >= 5) {
    otpStore.delete(targetEmail.toLowerCase());
    return { valid: false, message: 'Too many invalid attempts. Please request a new OTP.' };
  }

  if (record.otp.trim() !== enteredOtp.toString().trim()) {
    record.attempts += 1;
    return { valid: false, message: `Invalid OTP code. ${5 - record.attempts} attempts remaining.` };
  }

  // OTP verified successfully
  otpStore.delete(targetEmail.toLowerCase());
  return { valid: true };
}

// Simple JWT generation without native compile issues
function generateToken(payload) {
  const config = getConfig();
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', config.jwtSecret)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

// Validate JWT
function verifyToken(token) {
  if (!token) return null;
  const config = getConfig();
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', config.jwtSecret)
    .update(`${header}.${body}`)
    .digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

module.exports = {
  getConfig,
  generateOTP,
  sendOTPEmail,
  verifyOTP,
  generateToken,
  verifyToken
};
