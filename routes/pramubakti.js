const express = require('express');
const router = express.Router();
const pramubaktiController = require('../controllers/pramubaktiController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', roleMiddleware('admin', 'pimpinan', 'pelapor', 'pramubakti'), pramubaktiController.getAll);
router.get('/stats', roleMiddleware('admin', 'pimpinan', 'pelapor'), pramubaktiController.getStats);
router.get('/:id', roleMiddleware('admin', 'pimpinan', 'pelapor', 'pramubakti'), pramubaktiController.getById);
router.get('/user/:userId', roleMiddleware('admin', 'pimpinan', 'pelapor'), pramubaktiController.getByUserId);
router.post('/', roleMiddleware('admin'), pramubaktiController.create);
router.put('/:id', roleMiddleware('admin'), pramubaktiController.update);
router.delete('/:id', roleMiddleware('admin'), pramubaktiController.delete);

module.exports = router;
