const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/pramubakti', roleMiddleware('admin', 'pimpinan', 'pelapor'), reportController.generatePramubaktiReport);
router.get('/attendance', roleMiddleware('admin', 'pimpinan', 'pelapor'), reportController.generateAttendanceReport);
router.get('/tasks', roleMiddleware('admin', 'pimpinan', 'pelapor'), reportController.generateTaskReport);
router.get('/performance', roleMiddleware('admin', 'pimpinan', 'pelapor'), reportController.generatePerformanceReport);

module.exports = router;
