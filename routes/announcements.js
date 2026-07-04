const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', roleMiddleware('admin', 'pimpinan', 'pelapor', 'pramubakti'), announcementController.getAll);
router.get('/:id', roleMiddleware('admin', 'pimpinan', 'pelapor', 'pramubakti'), announcementController.getById);
router.post('/', roleMiddleware('admin'), announcementController.create);
router.put('/:id', roleMiddleware('admin'), announcementController.update);
router.delete('/:id', roleMiddleware('admin'), announcementController.delete);
router.patch('/:id/pin', roleMiddleware('admin'), announcementController.togglePin);

module.exports = router;
