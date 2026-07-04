const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../public/index.html');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sistem Informasi Manajemen Pramubakti BPS</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; color: #333; }
          .container { background: white; padding: 3rem; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; max-width: 600px; }
          .logo { width: 100px; height: 100px; background: #1e3a5f; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
          .logo svg { width: 60px; height: 60px; fill: white; }
          h1 { color: #1e3a5f; margin-bottom: 0.5rem; font-size: 1.8rem; }
          .subtitle { color: #666; margin-bottom: 2rem; font-size: 1.1rem; }
          .btn { display: inline-block; padding: 14px 40px; background: #1e3a5f; color: white; text-decoration: none; border-radius: 30px; font-weight: 600; transition: all 0.3s; margin: 0.5rem; }
          .btn:hover { background: #2d5a87; transform: translateY(-2px); }
          .info { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #eee; }
          .contact { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem; }
          .contact-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
          <h1>Sistem Informasi Manajemen Pramubakti BPS</h1>
          <p class="subtitle">Badan Pusat Statistik - Sistem Manajemen Terintegrasi</p>
          <a href="/masuk" class="btn">Masuk ke Sistem</a>
          <div class="info">
            <h3>Bantuan</h3>
            <div class="contact">
              <div class="contact-item">📱 085188791564</div>
              <div class="contact-item">📸 @kyy_sql</div>
              <div class="contact-item">💬 @KYYSTARBOYY</div>
              <div class="contact-item">📧 alhadinurriskyrs@gmail.com</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

router.get('/masuk', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.get('/landing', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = router;
