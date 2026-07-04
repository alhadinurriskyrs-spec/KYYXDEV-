const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', roleMiddleware('admin', 'pimpinan', 'pelapor', 'pramubakti'), performanceController.getAll);
router.get('/ranking', roleMiddleware('admin', 'pimpinan', 'pelapor'), performanceController.getRanking);
router.get('/stats', roleMiddleware('admin', 'pimpinan', 'pelapor'), performanceController.getStats);
router.get('/my-performance', performanceController.getMyPerformance);
router.get('/pramubakti/:pramubakti_id', roleMiddleware('admin', 'pimpinan', 'pelapor'), performanceController.getByPramubakti);
router.get('/:id', roleMiddleware('admin', 'pimpinan', 'pelapor', 'pramubakti'), performanceController.getById);
router.post('/', roleMiddleware('admin'), performanceController.create);
router.put('/:id', roleMiddleware('admin'), performanceController.update);
router.delete('/:id', roleMiddleware('admin'), performanceController.delete);

module.exports = router;
