// Load environment variables from .env if present
try {
  require('dotenv').config();
} catch (e) {}

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// API Route Registry (Works seamlessly on Hostinger & local Node)
const apiRoutes = {
  '/api/auth/login': require('./api/auth/login'),
  '/api/auth/verify-otp': require('./api/auth/verify-otp'),
  '/api/auth/resend-otp': require('./api/auth/resend-otp'),
  '/api/auth/me': require('./api/auth/me')
};

const server = http.createServer(async (req, res) => {
  let reqUrl = req.url.split('?')[0];

  // Helper to adapt Node http res to express-like json() & status()
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return res;
  };

  // 1. Check if route matches an API endpoint
  if (apiRoutes[reqUrl]) {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (e) {
        req.body = bodyData;
      }
      try {
        await apiRoutes[reqUrl](req, res);
      } catch (err) {
        console.error('API Error:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    });
    return;
  }

  // 2. Static File Serving
  if (reqUrl === '/' || reqUrl === '') reqUrl = '/index.html';
  if (!path.extname(reqUrl)) {
    if (fs.existsSync(path.join(__dirname, reqUrl + '.html'))) {
      reqUrl += '.html';
    }
  }

  const filePath = path.join(__dirname, reqUrl);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 Not Found</h1><p>${reqUrl} does not exist.</p>`);
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const url = `http://127.0.0.1:${PORT}/index.html`;
  console.log(`\n======================================================`);
  console.log(`  🚀 NexGen C2C Skills Server is LIVE! (Hostinger & Local Ready)`);
  console.log(`  🌐 Website URL: ${url}`);
  console.log(`  👑 Admin Portal: http://127.0.0.1:${PORT}/admin.html`);
  console.log(`  🛡️ Auth APIs: /api/auth/login | /api/auth/verify-otp`);
  console.log(`======================================================\n`);
});
