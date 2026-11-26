const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUser, createUser, updateUser, toggleUserStatus,
  deleteUser, getPlatformAnalytics, getNotifications, markNotificationRead
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/analytics/platform', protect, authorize('admin', 'super_admin'), getPlatformAnalytics);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:notifId/read', protect, markNotificationRead);

router.get('/', protect, authorize('admin', 'super_admin'), getAllUsers);
router.post('/', protect, authorize('admin', 'super_admin'), createUser);
router.get('/:id', protect, authorize('admin', 'super_admin'), getUser);
router.put('/:id', protect, authorize('admin', 'super_admin'), updateUser);
router.put('/:id/toggle-status', protect, authorize('admin', 'super_admin'), toggleUserStatus);
router.delete('/:id', protect, authorize('super_admin'), deleteUser);

module.exports = router;
