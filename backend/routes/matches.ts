import { Router, Response } from 'express';
import { db } from '../database.ts';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.ts';
import { Match, MatchSet, MatchInvitation } from '../types.ts';

const router = Router();

// GET /api/matches
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { all, status } = req.query;

  let matches: Match[];

  if (all === 'true') {
    matches = db.getAllMatches();
  } else {
    matches = db.getMatchesForUser(userId);
  }

  if (status && typeof status === 'string') {
    matches = matches.filter((m) => m.status.toLowerCase() === status.toLowerCase());
  }

  const enriched = matches.map((m) => {
    const team1Profiles = m.team1PlayerIds.map((id) => db.getPlayerProfileByUserId(id)).filter(Boolean);
    const team2Profiles = m.team2PlayerIds.map((id) => db.getPlayerProfileByUserId(id)).filter(Boolean);
    return {
      ...m,
      team1Players: team1Profiles,
      team2Players: team2Profiles,
    };
  });

  return res.json(enriched);
});

// GET /api/matches/:id
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const match = db.getMatchById(id);

  if (!match) {
    return res.status(404).json({ error: 'Match not found.' });
  }

  const team1Profiles = match.team1PlayerIds.map((pid) => db.getPlayerProfileByUserId(pid)).filter(Boolean);
  const team2Profiles = match.team2PlayerIds.map((pid) => db.getPlayerProfileByUserId(pid)).filter(Boolean);

  return res.json({
    ...match,
    team1Players: team1Profiles,
    team2Players: team2Profiles,
  });
});

// POST /api/matches (Schedule future challenge)
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const creatorId = req.user!.userId;
  const {
    title,
    format = 'SINGLES',
    venueName,
    facilityId,
    courtId,
    date,
    time,
    team1PlayerIds = [],
    team2PlayerIds = [],
    notes,
  } = req.body;

  if (!title || !venueName || !date || !time) {
    return res.status(400).json({ error: 'Title, venue, date, and time are required.' });
  }

  const finalTeam1 = team1PlayerIds.length > 0 ? team1PlayerIds : [creatorId];
  const finalTeam2 = team2PlayerIds;

  const newMatch: Match = {
    id: `mtch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    format: format === 'DOUBLES' ? 'DOUBLES' : 'SINGLES',
    venueName: venueName.trim(),
    facilityId,
    courtId,
    date,
    time,
    creatorId,
    status: 'SCHEDULED',
    team1PlayerIds: finalTeam1,
    team2PlayerIds: finalTeam2,
    scores: [],
    winnerTeam: null,
    durationMinutes: 60,
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  const created = db.createMatch(newMatch);

  const invitedPlayerIds = [...finalTeam1.filter((id: string) => id !== creatorId), ...finalTeam2];

  for (const receiverId of invitedPlayerIds) {
    const inv: MatchInvitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      matchId: created.id,
      senderId: creatorId,
      receiverId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    db.createInvitation(inv);

    const creatorProfile = db.getPlayerProfileByUserId(creatorId);
    db.createNotification({
      id: `notif_${Date.now()}`,
      userId: receiverId,
      title: 'New Match Challenge! 🏸',
      message: `${creatorProfile?.name || 'A player'} invited you to a ${format.toLowerCase()} match on ${date} at ${time}.`,
      type: 'MATCH',
      read: false,
      link: '/matches',
      createdAt: new Date().toISOString(),
    });
  }

  return res.status(201).json(created);
});

// POST /api/matches/log-past (User can store historical past matches!)
router.post('/log-past', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user!.userId;
  const {
    title,
    format = 'SINGLES',
    venueName,
    date,
    opponentNames = ['Club Opponent'],
    scores = [],
    winnerTeam = 1,
    durationMinutes = 45,
    notes,
  } = req.body;

  if (!title || !date || !Array.isArray(scores) || scores.length === 0) {
    return res.status(400).json({ error: 'Title, date, and set scores are required.' });
  }

  const formattedScores: MatchSet[] = scores.map((s: any, idx: number) => ({
    setNumber: idx + 1,
    team1Score: Number(s.team1Score) || 0,
    team2Score: Number(s.team2Score) || 0,
  }));

  const newMatch: Match = {
    id: `mtch_hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    format: format === 'DOUBLES' ? 'DOUBLES' : 'SINGLES',
    venueName: (venueName || 'Badminton Club Arena').trim(),
    date,
    time: '18:00',
    creatorId: currentUserId,
    status: 'COMPLETED',
    team1PlayerIds: [currentUserId],
    team2PlayerIds: [],
    opponentNames: Array.isArray(opponentNames) ? opponentNames : [opponentNames],
    scores: formattedScores,
    winnerTeam: Number(winnerTeam) === 2 ? 2 : 1,
    durationMinutes: Number(durationMinutes) || 45,
    notes: notes || 'Historical match logged into career archives.',
    isPastRecord: true,
    createdAt: new Date().toISOString(),
  };

  const created = db.createMatch(newMatch);

  // Recalculate player career averages & performance score
  db.updatePlayerStatsAfterMatch(created);

  const updatedProfile = db.getPlayerProfileByUserId(currentUserId);

  return res.status(201).json({
    match: created,
    careerProfile: updatedProfile,
  });
});

// POST /api/matches/:id/result (Record result for scheduled match)
router.post('/:id/result', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.user!.userId;
  const { scores, durationMinutes, notes } = req.body;

  const match = db.getMatchById(id);
  if (!match) {
    return res.status(404).json({ error: 'Match not found.' });
  }

  const isParticipant =
    match.team1PlayerIds.includes(currentUserId) ||
    match.team2PlayerIds.includes(currentUserId) ||
    req.user!.role === 'ADMIN';

  if (!isParticipant) {
    return res.status(403).json({ error: 'Only match participants can record scores.' });
  }

  if (!Array.isArray(scores) || scores.length === 0) {
    return res.status(400).json({ error: 'Scores array with at least one set is required.' });
  }

  let team1SetWins = 0;
  let team2SetWins = 0;

  const formattedScores: MatchSet[] = scores.map((s: any, idx: number) => {
    const t1 = Number(s.team1Score) || 0;
    const t2 = Number(s.team2Score) || 0;
    if (t1 > t2) team1SetWins++;
    else if (t2 > t1) team2SetWins++;
    return {
      setNumber: idx + 1,
      team1Score: t1,
      team2Score: t2,
    };
  });

  const winnerTeam = team1SetWins > team2SetWins ? 1 : team2SetWins > team1SetWins ? 2 : null;

  const updated = db.updateMatch(id, {
    status: 'COMPLETED',
    scores: formattedScores,
    winnerTeam,
    durationMinutes: Number(durationMinutes) || match.durationMinutes || 45,
    notes: notes !== undefined ? notes : match.notes,
  });

  if (updated) {
    db.updatePlayerStatsAfterMatch(updated);

    const allParticipants = [...updated.team1PlayerIds, ...updated.team2PlayerIds];
    for (const participantId of allParticipants) {
      db.createNotification({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        userId: participantId,
        title: 'Match Result Recorded! 🏆',
        message: `Final result for "${updated.title}" has been saved. Your average score and career win rate have been updated.`,
        type: 'MATCH',
        read: false,
        link: '/performance',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return res.json(updated);
});

// GET /api/matches/invitations/me
router.get('/invitations/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const invitations = db.getInvitationsForUser(userId);

  const enriched = invitations.map((inv) => {
    const match = db.getMatchById(inv.matchId);
    const senderProfile = db.getPlayerProfileByUserId(inv.senderId);
    return {
      ...inv,
      match,
      sender: senderProfile,
    };
  });

  return res.json(enriched);
});

// PUT /api/matches/invitations/:invitationId
router.put('/invitations/:invitationId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { invitationId } = req.params;
  const { status } = req.body;

  if (status !== 'ACCEPTED' && status !== 'DECLINED') {
    return res.status(400).json({ error: 'Status must be ACCEPTED or DECLINED.' });
  }

  const updated = db.updateInvitation(invitationId, status);
  if (!updated) {
    return res.status(404).json({ error: 'Invitation not found.' });
  }

  const receiverProfile = db.getPlayerProfileByUserId(updated.receiverId);
  db.createNotification({
    id: `notif_${Date.now()}`,
    userId: updated.senderId,
    title: `Match Invitation ${status === 'ACCEPTED' ? 'Accepted! 🎉' : 'Declined'}`,
    message: `${receiverProfile?.name || 'Player'} has ${status.toLowerCase()} your match invitation.`,
    type: 'MATCH',
    read: false,
    link: '/matches',
    createdAt: new Date().toISOString(),
  });

  return res.json(updated);
});

export default router;
