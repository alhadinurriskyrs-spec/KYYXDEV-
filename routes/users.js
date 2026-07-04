const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', roleMiddleware('admin', 'pimpinan', 'pelapor'), userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', roleMiddleware('admin'), userController.createUser);
router.put('/:id', roleMiddleware('admin'), userController.updateUser);
router.delete('/:id', roleMiddleware('admin'), userController.deleteUser);
router.put('/profile/update', userController.updateProfile);

module.exports = router;
