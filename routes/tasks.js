const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const taskController = require('../controllers/taskController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `task_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.use(authMiddleware);

router.get('/', roleMiddleware('admin', 'pimpinan', 'pelapor', 'pramubakti'), taskController.getAll);
router.get('/my-tasks', taskController.getMyTasks);
router.get('/today', taskController.getTodayTasks);
router.get('/progress', roleMiddleware('admin', 'pimpinan', 'pelapor'), taskController.getProgress);
router.get('/:id', taskController.getById);
router.post('/', roleMiddleware('admin'), taskController.create);
router.put('/:id', roleMiddleware('admin'), taskController.update);
router.patch('/:id/status', taskController.updateStatus);
router.post('/:id/upload', upload.single('bukti'), taskController.uploadEvidence);
router.delete('/:id', roleMiddleware('admin'), taskController.delete);

module.exports = router;
