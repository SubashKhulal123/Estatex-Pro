const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Create booking
// @route   POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { propertyId, visitDate, visitTime, message } = req.body;
    
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const booking = await Booking.create({
      property: propertyId,
      customer: req.user.id,
      agent: property.agent,
      visitDate,
      visitTime,
      message
    });

    await booking.populate([
      { path: 'property', select: 'title address city thumbnail' },
      { path: 'customer', select: 'firstName lastName email phone' },
      { path: 'agent', select: 'firstName lastName email phone' }
    ]);

    // Notify customer
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        notifications: {
          message: `Your visit request for "${property.title}" has been submitted.`,
          type: 'info'
        }
      }
    });

    res.status(201).json({ success: true, message: 'Visit request submitted!', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer bookings
// @route   GET /api/bookings/my-bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('property', 'title address city thumbnail price')
      .populate('agent', 'firstName lastName email phone avatar')
      .sort('-createdAt');
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get agent booking requests
// @route   GET /api/bookings/agent-requests
const getAgentRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({ agent: req.user.id })
      .populate('property', 'title address city thumbnail price')
      .populate('customer', 'firstName lastName email phone avatar')
      .sort('-createdAt');
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (agent)
// @route   PUT /api/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const { status, agentNotes, rejectionReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (
      booking.agent.toString() !== req.user.id &&
      !['admin', 'super_admin'].includes(req.user.role)
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    booking.status = status;
    if (agentNotes) booking.agentNotes = agentNotes;
    if (rejectionReason) booking.rejectionReason = rejectionReason;
    await booking.save();

    await booking.populate([
      { path: 'property', select: 'title address city thumbnail' },
      { path: 'customer', select: 'firstName lastName email' }
    ]);

    // Notify customer
    const notifMsg = status === 'approved'
      ? `Your visit for "${booking.property.title}" has been approved!`
      : status === 'rejected'
        ? `Your visit request for "${booking.property.title}" was rejected.`
        : `Your booking status has been updated to ${status}.`;

    await User.findByIdAndUpdate(booking.customer._id || booking.customer, {
      $push: {
        notifications: {
          message: notifMsg,
          type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info'
        }
      }
    });

    res.json({ success: true, message: `Booking ${status}!`, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('property', 'title city thumbnail price')
      .populate('customer', 'firstName lastName email avatar')
      .populate('agent', 'firstName lastName email')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, total, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking (customer)
// @route   PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled.', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getAgentRequests, updateBookingStatus, getAllBookings, cancelBooking };
