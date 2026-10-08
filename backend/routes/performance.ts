import { Router, Response } from 'express';
import { db } from '../database.ts';
import { analyzePlayerPerformanceWithGemini } from '../services/gemini.ts';

const router = Router();

// GET /api/performance/:playerId
router.get('/:playerId', async (req, res: Response) => {
  const { playerId } = req.params;

  let profile = db.getPlayerProfileById(playerId);
  if (!profile) {
    profile = db.getPlayerProfileByUserId(playerId);
  }

  if (!profile) {
    return res.status(404).json({ error: 'Player profile not found.' });
  }

  const userMatches = db
    .getMatchesForUser(profile.userId)
    .filter((m) => m.status === 'COMPLETED');

  // Breakdown by format
  const singles = userMatches.filter((m) => m.format === 'SINGLES');
  const doubles = userMatches.filter((m) => m.format === 'DOUBLES');

  let singlesWins = 0;
  for (const m of singles) {
    const isTeam1 = m.team1PlayerIds.includes(profile.userId);
    if ((isTeam1 && m.winnerTeam === 1) || (!isTeam1 && m.winnerTeam === 2)) {
      singlesWins++;
    }
  }

  let doublesWins = 0;
  for (const m of doubles) {
    const isTeam1 = m.team1PlayerIds.includes(profile.userId);
    if ((isTeam1 && m.winnerTeam === 1) || (!isTeam1 && m.winnerTeam === 2)) {
      doublesWins++;
    }
  }

  // Set 1, 2, 3 conversion rates
  let set1Wins = 0;
  let set1Count = 0;
  let set2Wins = 0;
  let set2Count = 0;
  let set3Wins = 0;
  let set3Count = 0;

  for (const m of userMatches) {
    const isTeam1 = m.team1PlayerIds.includes(profile.userId);
    if (m.scores.length >= 1) {
      set1Count++;
      const s = m.scores[0];
      if ((isTeam1 && s.team1Score > s.team2Score) || (!isTeam1 && s.team2Score > s.team1Score)) {
        set1Wins++;
      }
    }
    if (m.scores.length >= 2) {
      set2Count++;
      const s = m.scores[1];
      if ((isTeam1 && s.team1Score > s.team2Score) || (!isTeam1 && s.team2Score > s.team1Score)) {
        set2Wins++;
      }
    }
    if (m.scores.length >= 3) {
      set3Count++;
      const s = m.scores[2];
      if ((isTeam1 && s.team1Score > s.team2Score) || (!isTeam1 && s.team2Score > s.team1Score)) {
        set3Wins++;
      }
    }
  }

  // Recent 10 matches trend
  const recentTrend = userMatches.slice(0, 10).map((m) => {
    const isTeam1 = m.team1PlayerIds.includes(profile!.userId);
    const won = (isTeam1 && m.winnerTeam === 1) || (!isTeam1 && m.winnerTeam === 2);
    return {
      id: m.id,
      date: m.date,
      title: m.title,
      format: m.format,
      result: won ? 'WON' : 'LOST',
      scoreSummary: m.scores.map((s) => `${s.team1Score}-${s.team2Score}`).join(', '),
    };
  });

  const achievements = db.getPlayerAchievements(profile.id);

  // Performance formula weights documentation
  const calculationFormula = {
    formula: 'Performance Score = (Win Rate × 0.40) + (Recent Form Factor × 0.25) + (Match Consistency × 0.20) + (Game Margin × 0.15)',
    components: [
      { name: 'Win Rate Component', weight: '40%', value: Number((profile.winPercentage * 0.4).toFixed(1)) },
      { name: 'Recent Form Factor', weight: '25%', description: 'Win percentage in last 5 matches' },
      { name: 'Match Consistency', weight: '20%', description: 'Match volume stability and rally continuity' },
      { name: 'Game Point Margin', weight: '15%', description: 'Ratio of sets won vs sets lost' },
    ],
  };

  return res.json({
    profile,
    score: profile.performanceScore,
    calculationFormula,
    stats: {
      matchesPlayed: profile.matchesPlayed,
      matchesWon: profile.matchesWon,
      matchesLost: profile.matchesLost,
      winPercentage: profile.winPercentage,
      gamesWon: profile.gamesWon,
      gamesLost: profile.gamesLost,
      currentStreak: profile.currentStreak,
      bestStreak: profile.bestStreak,
    },
    formatBreakdown: {
      singles: {
        played: singles.length,
        won: singlesWins,
        lost: singles.length - singlesWins,
        winRate: singles.length > 0 ? Number(((singlesWins / singles.length) * 100).toFixed(1)) : 0,
      },
      doubles: {
        played: doubles.length,
        won: doublesWins,
        lost: doubles.length - doublesWins,
        winRate: doubles.length > 0 ? Number(((doublesWins / doubles.length) * 100).toFixed(1)) : 0,
      },
    },
    setPerformance: {
      set1: { total: set1Count, won: set1Wins, rate: set1Count > 0 ? Math.round((set1Wins / set1Count) * 100) : 0 },
      set2: { total: set2Count, won: set2Wins, rate: set2Count > 0 ? Math.round((set2Wins / set2Count) * 100) : 0 },
      set3: { total: set3Count, won: set3Wins, rate: set3Count > 0 ? Math.round((set3Wins / set3Count) * 100) : 0 },
    },
    recentTrend,
    achievements,
  });
});

// GET /api/performance/:playerId/coach (RallySphere AI Coach)
router.get('/:playerId/coach', async (req, res: Response) => {
  const { playerId } = req.params;

  let profile = db.getPlayerProfileById(playerId);
  if (!profile) {
    profile = db.getPlayerProfileByUserId(playerId);
  }

  if (!profile) {
    return res.status(404).json({ error: 'Player profile not found.' });
  }

  const userMatches = db
    .getMatchesForUser(profile.userId)
    .filter((m) => m.status === 'COMPLETED');

  try {
    const feedback = await analyzePlayerPerformanceWithGemini(profile, userMatches);
    return res.json(feedback);
  } catch (error) {
    console.error('Error generating AI coach feedback:', error);
    return res.status(500).json({ error: 'Failed to analyze player performance.' });
  }
});

export default router;
