const {
  createBooking,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} = require('./booking.service');
const { validateCreate, validateReject } = require('./booking.validation');

async function create(req, res, next) {
  try {
    const errors = validateCreate(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }

    const booking = await createBooking(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Booking request created',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const bookings = await getMyBookings(req.user.id, req.user.role);
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const booking = await getBookingById(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

async function accept(req, res, next) {
  try {
    const booking = await acceptBooking(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Booking accepted',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

async function reject(req, res, next) {
  try {
    const errors = validateReject(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }

    const booking = await rejectBooking(req.params.id, req.user.id, req.body.reason);
    res.json({
      success: true,
      message: 'Booking rejected',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const booking = await cancelBooking(req.params.id, req.user.id, req.user.role);
    res.json({
      success: true,
      message: 'Booking cancelled',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

async function complete(req, res, next) {
  try {
    const booking = await completeBooking(req.params.id, req.user.id);
    res.json({
      success: true,
      message: 'Booking completed',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listMine, getOne, accept, reject, cancel, complete };