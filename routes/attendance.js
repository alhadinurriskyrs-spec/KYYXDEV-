const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `attendance_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.use(authMiddleware);

router.post('/clock-in', upload.single('foto'), attendanceController.clockIn);
router.post('/clock-out', upload.single('foto'), attendanceController.clockOut);
router.get('/', roleMiddleware('admin', 'pimpinan', 'pelapor', 'pramubakti'), attendanceController.getAll);
router.get('/today', roleMiddleware('admin', 'pimpinan', 'pelapor', 'pramubakti'), attendanceController.getTodayAttendance);
router.get('/recap/monthly', roleMiddleware('admin', 'pimpinan', 'pelapor'), attendanceController.getMonthlyRecap);
router.get('/recap/yearly', roleMiddleware('admin', 'pimpinan', 'pelapor'), attendanceController.getYearlyRecap);
router.get('/:id', roleMiddleware('admin', 'pimpinan', 'pelapor', 'pramubakti'), attendanceController.getById);
router.put('/:id', roleMiddleware('admin'), attendanceController.update);
router.delete('/:id', roleMiddleware('admin'), attendanceController.delete);

module.exports = router;
