const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'], credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pramubaktiRoutes = require('./routes/pramubakti');
const attendanceRoutes = require('./routes/attendance');
const taskRoutes = require('./routes/tasks');
const performanceRoutes = require('./routes/performance');
const reportRoutes = require('./routes/reports');
const announcementRoutes = require('./routes/announcements');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const landingRoutes = require('./routes/landing');

// Import database
const db = require('./config/database');

// Import services
const NotificationService = require('./services/notificationService');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pramubakti', pramubaktiRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/landing', landingRoutes);

// Landing page
app.use('/', express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'sehat', timestamp: new Date() }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' }));

// Cron job untuk notifikasi tenggat waktu
cron.schedule('0 * * * *', async () => {
  console.log('Menjalankan cek notifikasi tenggat waktu...');
  await NotificationService.checkTaskDeadlines();
});

// Sync database and start server
db.sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database berhasil disinkronkan');
    
    // Run seeders if needed
    const { seedDatabase } = require('./seeders/init');
    await seedDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server berjalan pada port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error sinkronisasi database:', err);
    process.exit(1);
  });

module.exports = app;
