const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', roleMiddleware('admin'), settingsController.getAll);
router.get('/group/:grup', roleMiddleware('admin'), settingsController.getByGroup);
router.get('/:key', roleMiddleware('admin'), settingsController.getByKey);
router.post('/', roleMiddleware('admin'), settingsController.update);
router.put('/:key', roleMiddleware('admin'), settingsController.update);
router.delete('/:key', roleMiddleware('admin'), settingsController.delete);

module.exports = router;
