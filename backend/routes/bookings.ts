import { Router, Response } from 'express';
import { db } from '../database.ts';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';
import { Booking } from '../types.ts';

const router = Router();

// GET /api/bookings
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === 'ADMIN';
  const { status, all } = req.query;

  let bookings: Booking[];

  // If admin requests all bookings
  if (isAdmin && all === 'true') {
    bookings = db.getAllBookings();
  } else {
    bookings = db.getBookingsByUserId(userId);
  }

  if (status && typeof status === 'string') {
    bookings = bookings.filter((b) => b.status.toLowerCase() === status.toLowerCase());
  }

  // Populate facility and court details
  const enriched = bookings.map((b) => {
    const facility = db.getFacilityById(b.facilityId);
    const court = db.getCourtById(b.courtId);
    return {
      ...b,
      facilityName: facility?.name || 'Badminton Facility',
      facilityCity: facility?.city || 'Downtown',
      courtName: court?.courtNumber || 'Court',
      surface: court?.surface || 'Synthetic',
    };
  });

  return res.json(enriched);
});

// GET /api/bookings/:id
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const booking = db.getBookingById(id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  // Check authorization
  if (booking.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized to view this booking.' });
  }

  const facility = db.getFacilityById(booking.facilityId);
  const court = db.getCourtById(booking.courtId);

  return res.json({
    ...booking,
    facility,
    court,
  });
});

// POST /api/bookings
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { facilityId, courtId, date, startTime, durationHours = 1, paymentMethod = 'Credit Card (Mock)' } = req.body;

  if (!facilityId || !courtId || !date || !startTime) {
    return res.status(400).json({ error: 'Facility, court, date, and start time are required.' });
  }

  const court = db.getCourtById(courtId);
  if (!court || !court.isActive) {
    return res.status(404).json({ error: 'Court not found or currently inactive.' });
  }

  const facility = db.getFacilityById(facilityId);
  if (!facility) {
    return res.status(404).json({ error: 'Facility not found.' });
  }

  // Validation: Check double booking
  const isAvailable = db.isCourtSlotAvailable(courtId, date, startTime);
  if (!isAvailable) {
    return res.status(409).json({
      error: 'This time slot is no longer available. Please select another slot.',
    });
  }

  // Calculate end time
  const startHour = parseInt(startTime.split(':')[0], 10);
  const endHour = startHour + Number(durationHours);
  const endTime = `${endHour.toString().padStart(2, '0')}:00`;

  const totalAmount = court.pricePerHour * Number(durationHours);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingNumber = `RSB-2026-${randomSuffix}`;
  const transactionId = `TXN-MOCK-${Date.now().toString().slice(-6)}`;

  const newBooking: Booking = {
    id: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    bookingNumber,
    userId,
    facilityId,
    courtId,
    date,
    startTime,
    endTime,
    durationHours: Number(durationHours),
    totalAmount,
    status: 'Confirmed',
    paymentStatus: 'PAID',
    paymentMethod,
    transactionId,
    createdAt: new Date().toISOString(),
  };

  const created = db.createBooking(newBooking);

  // Send Notification
  db.createNotification({
    id: `notif_${Date.now()}`,
    userId,
    title: 'Court Booking Confirmed! 🎟️',
    message: `Your booking #${bookingNumber} at ${facility.name} (${court.courtNumber}) on ${date} at ${startTime} has been secured.`,
    type: 'BOOKING',
    read: false,
    link: '/bookings',
    createdAt: new Date().toISOString(),
  });

  // Evaluate Prime Booker achievement if user has >= 3 bookings
  const userBookings = db.getBookingsByUserId(userId).filter((b) => b.status !== 'Cancelled');
  if (userBookings.length >= 3) {
    const profile = db.getPlayerProfileByUserId(userId);
    if (profile) {
      const allAch = db.getAllAchievements();
      const ach = allAch.find((a) => a.code === 'PRIME_BOOKER');
      const existing = db.getPlayerAchievements(profile.id);
      if (ach && !existing.some((pa) => pa.achievement.code === 'PRIME_BOOKER')) {
        db.evaluateAchievementsForPlayer(profile.id, {
          totalMatches: profile.matchesPlayed,
          currentStreak: profile.currentStreak,
          performanceScore: profile.performanceScore,
        });
      }
    }
  }

  return res.status(201).json({
    ...created,
    facilityName: facility.name,
    courtName: court.courtNumber,
  });
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const booking = db.getBookingById(id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  if (booking.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized to cancel this booking.' });
  }

  if (booking.status === 'Cancelled') {
    return res.status(400).json({ error: 'This booking has already been cancelled.' });
  }

  const updated = db.updateBooking(id, {
    status: 'Cancelled',
    paymentStatus: 'REFUNDED',
  });

  const facility = db.getFacilityById(booking.facilityId);

  // Send cancellation notification
  db.createNotification({
    id: `notif_${Date.now()}`,
    userId: booking.userId,
    title: 'Booking Cancelled',
    message: `Your booking #${booking.bookingNumber} at ${facility?.name || 'Facility'} for ${booking.date} has been cancelled and refunded.`,
    type: 'BOOKING',
    read: false,
    link: '/bookings',
    createdAt: new Date().toISOString(),
  });

  return res.json(updated);
});

// PUT /api/bookings/:id/status (Admin only)
router.put('/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid booking status.' });
  }

  const updated = db.updateBooking(id, { status });
  if (!updated) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  return res.json(updated);
});

export default router;
