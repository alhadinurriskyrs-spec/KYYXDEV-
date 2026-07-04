const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/stats', dashboardController.getStats);
router.get('/my-dashboard', dashboardController.getMyDashboard);
router.get('/calendar', dashboardController.getCalendar);

module.exports = router;
