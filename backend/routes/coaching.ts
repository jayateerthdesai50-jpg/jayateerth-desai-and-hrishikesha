import { Router, Response } from 'express';
import { db } from '../database.ts';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.ts';
import { generateWeakpointsTrainingPlan } from '../services/gemini.ts';
import { CoachBooking, AITrainingPlan } from '../types.ts';

const router = Router();

// GET /api/coaching/coaches
router.get('/coaches', (req, res: Response) => {
  const coaches = db.getAllCoaches();
  return res.json(coaches);
});

// GET /api/coaching/coaches/:id
router.get('/coaches/:id', (req, res: Response) => {
  const { id } = req.params;
  const coach = db.getCoachById(id);
  if (!coach) {
    return res.status(404).json({ error: 'Coach not found.' });
  }
  return res.json(coach);
});

// POST /api/coaching/book
router.post('/book', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { coachId, date, timeSlot, sessionType, focusWeakpoints } = req.body;

  if (!coachId || !date || !timeSlot) {
    return res.status(400).json({ error: 'Coach, date, and time slot are required.' });
  }

  const coach = db.getCoachById(coachId);
  if (!coach) {
    return res.status(404).json({ error: 'Selected coach not found.' });
  }

  const bookingRef = `COACH-IN-${Math.floor(1000 + Math.random() * 9000)}`;
  const meetingCode = `meet.google.com/rs-badminton-${Math.random().toString(36).substring(2, 6)}`;

  const booking: CoachBooking = {
    id: `cbk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    bookingRef,
    userId,
    coachId,
    date,
    timeSlot,
    sessionType: sessionType || '1-on-1 Online Video Analysis',
    focusWeakpoints: focusWeakpoints || 'General stroke biomechanics and tactical positioning',
    priceINR: coach.hourlyRateINR,
    status: 'Confirmed',
    paymentStatus: 'PAID',
    meetingLink: `https://${meetingCode}`,
    createdAt: new Date().toISOString(),
  };

  const created = db.createCoachBooking(booking);

  // Send notification
  db.createNotification({
    id: `notif_${Date.now()}`,
    userId,
    title: `Coaching Session Confirmed! 📢`,
    message: `Your session with ${coach.name} is confirmed for ${date} at ${timeSlot}. ₹${coach.hourlyRateINR} paid via UPI.`,
    type: 'COACHING',
    read: false,
    link: '/coach',
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({
    ...created,
    coach,
  });
});

// GET /api/coaching/my-bookings
router.get('/my-bookings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const bookings = db.getCoachBookings(userId);

  const enriched = bookings.map((b) => ({
    ...b,
    coach: db.getCoachById(b.coachId),
  }));

  return res.json(enriched);
});

// POST /api/coaching/ai-train (Generate Weakpoints Regimen with AI)
router.post('/ai-train', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { weakpoints, targetArea, weeklyDays = 3 } = req.body;

  if (!Array.isArray(weakpoints) || weakpoints.length === 0) {
    return res.status(400).json({ error: 'Please specify at least one weakpoint to target.' });
  }

  const profile = db.getPlayerProfileByUserId(userId);
  if (!profile) {
    return res.status(404).json({ error: 'Player profile not found.' });
  }

  try {
    const generated = await generateWeakpointsTrainingPlan(
      weakpoints,
      targetArea || 'Technique Correction',
      Number(weeklyDays),
      profile
    );

    const newPlan: AITrainingPlan = {
      id: `tp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      weakpoints,
      targetArea: generated.targetArea,
      weeklySchedule: generated.weeklySchedule,
      planTitle: generated.planTitle,
      coachAdvice: generated.coachAdvice,
      drills: generated.drills,
      recoveryAdvice: generated.recoveryAdvice,
      createdAt: new Date().toISOString(),
    };

    const saved = db.saveTrainingPlan(newPlan);

    // Send Notification
    db.createNotification({
      id: `notif_${Date.now()}`,
      userId,
      title: 'Personalized AI Training Regimen Ready! 🎯',
      message: `Your custom training plan "${saved.planTitle}" addressing your weakpoints has been synthesized.`,
      type: 'COACHING',
      read: false,
      link: '/coach',
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json(saved);
  } catch (err: any) {
    console.error('Error generating AI training plan:', err);
    return res.status(500).json({ error: 'Failed to generate training plan.' });
  }
});

// GET /api/coaching/my-plans
router.get('/my-plans', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const plans = db.getTrainingPlansForUser(userId);
  return res.json(plans);
});

// PUT /api/coaching/plans/:planId/drill/:drillIndex
router.put('/plans/:planId/drill/:drillIndex', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { planId, drillIndex } = req.params;
  const updated = db.toggleDrillCompleted(planId, Number(drillIndex));
  if (!updated) {
    return res.status(404).json({ error: 'Training drill not found.' });
  }
  return res.json({ message: 'Drill status toggled.' });
});

export default router;
