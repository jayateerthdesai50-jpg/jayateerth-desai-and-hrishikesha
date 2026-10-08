import { Router, Response } from 'express';
import { db } from '../database.ts';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const notifications = db.getNotificationsByUserId(userId);
  return res.json(notifications);
});

// PUT /api/notifications/:id/read
router.put('/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.markNotificationRead(id);
  if (!success) {
    return res.status(404).json({ error: 'Notification not found.' });
  }
  return res.json({ message: 'Marked as read.' });
});

// PUT /api/notifications/read-all
router.put('/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  db.markAllNotificationsRead(userId);
  return res.json({ message: 'All notifications marked as read.' });
});

export default router;
