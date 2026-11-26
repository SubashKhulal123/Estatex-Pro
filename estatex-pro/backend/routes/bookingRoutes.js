const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getAgentRequests, updateBookingStatus, getAllBookings, cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'super_admin'), getAllBookings);
router.post('/', protect, authorize('customer', 'admin', 'super_admin'), createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/agent-requests', protect, authorize('agent', 'property_manager', 'admin', 'super_admin'), getAgentRequests);
router.put('/:id/status', protect, authorize('agent', 'property_manager', 'admin', 'super_admin'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
