import { Router, Response } from 'express';
import { db } from '../database.ts';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/players
router.get('/', (req, res: Response) => {
  const { search, skillLevel, playingStyle, location } = req.query;

  let profiles = db.getAllPlayerProfiles();

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    profiles = profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }

  if (skillLevel && typeof skillLevel === 'string') {
    profiles = profiles.filter((p) => p.skillLevel.toLowerCase() === skillLevel.toLowerCase());
  }

  if (playingStyle && typeof playingStyle === 'string') {
    profiles = profiles.filter((p) => p.playingStyle.toLowerCase() === playingStyle.toLowerCase());
  }

  if (location && typeof location === 'string') {
    profiles = profiles.filter((p) => p.location.toLowerCase().includes(location.toLowerCase()));
  }

  return res.json(profiles);
});

// GET /api/players/:id
router.get('/:id', (req, res: Response) => {
  const { id } = req.params;

  // Try finding by profile id or user id
  let profile = db.getPlayerProfileById(id);
  if (!profile) {
    profile = db.getPlayerProfileByUserId(id);
  }

  if (!profile) {
    return res.status(404).json({ error: 'Player profile not found.' });
  }

  const achievements = db.getPlayerAchievements(profile.id);
  const recentMatches = db
    .getMatchesForUser(profile.userId)
    .filter((m) => m.status === 'COMPLETED')
    .slice(0, 5);

  return res.json({
    ...profile,
    achievements,
    recentMatches,
  });
});

// PUT /api/players/:id
router.put('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.user?.userId;
  const isAdmin = req.user?.role === 'ADMIN';

  let profile = db.getPlayerProfileById(id);
  if (!profile) {
    profile = db.getPlayerProfileByUserId(id);
  }

  if (!profile) {
    return res.status(404).json({ error: 'Player profile not found.' });
  }

  // Authorization check: only own profile or admin can update
  if (profile.userId !== currentUserId && !isAdmin) {
    return res.status(403).json({ error: 'Unauthorized to update this profile.' });
  }

  const allowedUpdates = [
    'name',
    'avatar',
    'bio',
    'age',
    'location',
    'skillLevel',
    'playingStyle',
    'preferredPosition',
  ];

  const updates: Record<string, any> = {};
  for (const key of allowedUpdates) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const updated = db.updatePlayerProfile(profile.id, updates);
  return res.json(updated);
});

export default router;
