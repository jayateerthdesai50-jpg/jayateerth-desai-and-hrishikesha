import { Router, Response } from 'express';
import { db } from '../database.ts';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth.ts';
import { Court } from '../types.ts';

const router = Router();

// Standard available hourly slots from 06:00 to 22:00
const STANDARD_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

// GET /api/courts
router.get('/', (req, res: Response) => {
  const { facilityId } = req.query;

  if (facilityId && typeof facilityId === 'string') {
    const courts = db.getCourtsByFacilityId(facilityId);
    return res.json(courts);
  }

  return res.json(db.getAllCourts());
});

// GET /api/courts/:id
router.get('/:id', (req, res: Response) => {
  const { id } = req.params;
  const court = db.getCourtById(id);

  if (!court) {
    return res.status(404).json({ error: 'Court not found.' });
  }

  const facility = db.getFacilityById(court.facilityId);

  return res.json({
    ...court,
    facility,
  });
});

// GET /api/courts/:id/availability?date=YYYY-MM-DD
router.get('/:id/availability', (req, res: Response) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Date query parameter is required (YYYY-MM-DD).' });
  }

  const court = db.getCourtById(id);
  if (!court) {
    return res.status(404).json({ error: 'Court not found.' });
  }

  const allBookings = db.getAllBookings();
  const dayBookings = allBookings.filter(
    (b) => b.courtId === id && b.date === date && b.status !== 'Cancelled'
  );

  const blockedSlots = court.blockedSlots?.filter((b) => b.date === date) || [];

  const slots = STANDARD_SLOTS.map((time) => {
    // Check if slot is blocked by admin
    const blocked = blockedSlots.find((b) => b.time === time);
    if (blocked) {
      return {
        time,
        status: 'BLOCKED',
        reason: blocked.reason || 'Maintenance / Coaching session',
      };
    }

    // Check if slot is booked
    const booking = dayBookings.find((b) => b.startTime === time);
    if (booking) {
      return {
        time,
        status: 'BOOKED',
        bookingId: booking.id,
      };
    }

    return {
      time,
      status: 'AVAILABLE',
      price: court.pricePerHour,
    };
  });

  return res.json({
    courtId: id,
    courtName: court.courtNumber,
    date,
    pricePerHour: court.pricePerHour,
    slots,
  });
});

// POST /api/courts (Admin only)
router.post('/', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { facilityId, courtNumber, type = 'Indoor', surface = 'BWF Synthetic Mat', pricePerHour } = req.body;

  if (!facilityId || !courtNumber || !pricePerHour) {
    return res.status(400).json({ error: 'Facility ID, court number/name, and price per hour are required.' });
  }

  const facility = db.getFacilityById(facilityId);
  if (!facility) {
    return res.status(404).json({ error: 'Target facility does not exist.' });
  }

  const newCourt: Court = {
    id: `crt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    facilityId,
    courtNumber: courtNumber.trim(),
    type: type === 'Outdoor' ? 'Outdoor' : 'Indoor',
    surface: surface,
    pricePerHour: Number(pricePerHour),
    isActive: true,
  };

  db.createCourt(newCourt);
  return res.status(201).json(newCourt);
});

// PUT /api/courts/:id (Admin only)
router.put('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updated = db.updateCourt(id, req.body);

  if (!updated) {
    return res.status(404).json({ error: 'Court not found.' });
  }

  return res.json(updated);
});

// DELETE /api/courts/:id (Admin only)
router.delete('/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteCourt(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Court not found.' });
  }

  return res.json({ message: 'Court deleted successfully.' });
});

// POST /api/courts/:id/block-slot (Admin only)
router.post('/:id/block-slot', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { date, time, reason } = req.body;

  if (!date || !time) {
    return res.status(400).json({ error: 'Date and time are required to block slot.' });
  }

  const court = db.getCourtById(id);
  if (!court) {
    return res.status(404).json({ error: 'Court not found.' });
  }

  const blockedSlots = court.blockedSlots || [];
  blockedSlots.push({
    date,
    time,
    reason: reason || 'Facility Maintenance',
  });

  const updated = db.updateCourt(id, { blockedSlots });
  return res.json(updated);
});

export default router;
