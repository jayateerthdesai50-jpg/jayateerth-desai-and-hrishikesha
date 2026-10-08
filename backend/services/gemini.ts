import { GoogleGenAI } from '@google/genai';
import { PlayerProfile, Match, AITrainingPlan } from '../types.ts';

export interface AICoachFeedback {
  coachSummary: string;
  strengths: string[];
  weaknesses: string[];
  suggestedTrainingAreas: string[];
  matchImprovementSuggestions: string[];
  consistencyAnalysis: string;
  personalizedPracticeRecommendations: string[];
  source: 'gemini' | 'rule-based';
}

export function generateRuleBasedAnalysis(profile: PlayerProfile, matches: Match[]): AICoachFeedback {
  const winRate = profile.winPercentage;
  const streak = profile.currentStreak;

  let set1Wins = 0;
  let set1Total = 0;
  let set3Wins = 0;
  let set3Total = 0;

  for (const m of matches) {
    const isTeam1 = m.team1PlayerIds.includes(profile.userId);
    if (m.scores.length >= 1) {
      set1Total++;
      const s1 = m.scores[0];
      if ((isTeam1 && s1.team1Score > s1.team2Score) || (!isTeam1 && s1.team2Score > s1.team1Score)) {
        set1Wins++;
      }
    }
    if (m.scores.length === 3) {
      set3Total++;
      const s3 = m.scores[2];
      if ((isTeam1 && s3.team1Score > s3.team2Score) || (!isTeam1 && s3.team2Score > s3.team1Score)) {
        set3Wins++;
      }
    }
  }

  const set1WinPct = set1Total > 0 ? (set1Wins / set1Total) * 100 : winRate;
  const set3WinPct = set3Total > 0 ? (set3Wins / set3Total) * 100 : winRate;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const trainingAreas: string[] = [];
  const matchSuggestions: string[] = [];
  const practiceRecommendations: string[] = [];

  if (profile.playingStyle === 'Aggressive Attacker') {
    strengths.push('High-pressure attacking profile with steep angle jump smashes.');
    strengths.push('Dictates rally tempo early in opening service exchanges.');
  } else if (profile.playingStyle === 'Fast-Paced Net Dominator') {
    strengths.push('Exceptional front-court reaction times and rapid brush kills.');
    strengths.push('High interception rate when opponents hit flat drives.');
  } else if (profile.playingStyle === 'Tactical Deceiver') {
    strengths.push('Superior deception at the net and disguised reverse-slice drops.');
    strengths.push('Calculated court geometry targeting deep corners effectively.');
  } else {
    strengths.push('Steady baseline retrieval with disciplined court coverage.');
    strengths.push('Low unforced error margin during prolonged 20+ shot rallies.');
  }

  if (winRate >= 70) {
    strengths.push(`Dominant overall winning rate (${winRate}%) showing command across tournament sets.`);
  }

  if (set3Total > 0 && set3WinPct < set1WinPct - 15) {
    weaknesses.push('Performance drop-off in deciding 3rd sets due to aerobic fatigue or pacing.');
    trainingAreas.push('High-intensity interval training (HIIT) with 30s shuttle sprints and 15s recovery.');
    practiceRecommendations.push('Simulate match pressure drills with 18-18 scoreboard handicap starts.');
  } else {
    weaknesses.push('Susceptibility to unexpected deception when pressed into backhand rear-court.');
    trainingAreas.push('Rear-court scissor-kick footwork and round-the-head overhead placement.');
  }

  if (profile.gamesLost > profile.gamesWon * 0.6) {
    weaknesses.push('High game volatility during service return phase.');
    matchSuggestions.push('Vary return-of-serve trajectories: alternate between tight tumbling spin nets and punch clears.');
  } else {
    matchSuggestions.push('Maintain aggressive court positioning 1 meter closer to T-line during doubles serve reception.');
  }

  trainingAreas.push('Footwork recovery drills: 6-corner multi-shuttle speed endurance.');
  practiceRecommendations.push('20-minute daily shadow badminton focusing on explosive split-step timing.');
  practiceRecommendations.push('Wall rally practice with heavy racket for forefinger and wrist dexterity.');

  const consistencyAnalysis = `Player holds a ${winRate}% win rate across ${profile.matchesPlayed} matches with an average set score of ${profile.averageScore || 19.5} points. Active streak is ${streak >= 0 ? `+${streak} wins` : `${Math.abs(streak)} losses`}. Deciding set conversion sits at ${set3Total > 0 ? Math.round(set3WinPct) : Math.round(winRate)}%. Consistency index is rated at ${profile.performanceScore}/100.`;

  const coachSummary = `Based on your recent match history as an ${profile.playingStyle} (${profile.skillLevel}), you demonstrate outstanding court presence and offensive initiative. ${
    set3Total > 0 && set3WinPct < set1WinPct
      ? 'Your data indicates strong opening set authority, but endurance dips in lengthy rubber matches. Prioritize aerobic recovery and late-game patience.'
      : 'Your rally conversion is steady. Focusing on front-court deception and defensive lifts will elevate your game to the next tier.'
  }`;

  return {
    coachSummary,
    strengths,
    weaknesses,
    suggestedTrainingAreas: trainingAreas,
    matchImprovementSuggestions: matchSuggestions,
    consistencyAnalysis,
    personalizedPracticeRecommendations: practiceRecommendations,
    source: 'rule-based',
  };
}

export async function analyzePlayerPerformanceWithGemini(
  profile: PlayerProfile,
  matches: Match[]
): Promise<AICoachFeedback> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return generateRuleBasedAnalysis(profile, matches);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const recentMatchesSummary = matches.slice(0, 10).map((m) => {
      const isTeam1 = m.team1PlayerIds.includes(profile.userId);
      const won = (isTeam1 && m.winnerTeam === 1) || (!isTeam1 && m.winnerTeam === 2);
      return {
        date: m.date,
        format: m.format,
        venue: m.venueName,
        result: won ? 'WON' : 'LOST',
        sets: m.scores.map((s) => `${s.team1Score}-${s.team2Score}`).join(', '),
      };
    });

    const prompt = `You are the RallySphere AI Coach, an elite BWF-certified high-performance badminton coach and performance sports scientist.
Analyze the following player's actual data from our system:

Player Profile:
- Name: ${profile.name}
- Skill Level: ${profile.skillLevel}
- Playing Style: ${profile.playingStyle}
- Preferred Position: ${profile.preferredPosition}
- Matches Played: ${profile.matchesPlayed}
- Matches Won: ${profile.matchesWon}
- Matches Lost: ${profile.matchesLost}
- Win Percentage: ${profile.winPercentage}%
- Games Won: ${profile.gamesWon}
- Games Lost: ${profile.gamesLost}
- Average Score: ${profile.averageScore || 19.5} / 21
- Current Streak: ${profile.currentStreak}
- Performance Score: ${profile.performanceScore} / 100

Recent Match Results (up to 10):
${JSON.stringify(recentMatchesSummary, null, 2)}

Provide a structured, data-grounded performance diagnosis in valid JSON format matching this exact schema:
{
  "coachSummary": "2-3 sentences summarizing current trajectory, form and priority focus",
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "weaknesses": ["specific weakness 1", "specific weakness 2"],
  "suggestedTrainingAreas": ["training area 1", "training area 2", "training area 3"],
  "matchImprovementSuggestions": ["tactical suggestion 1", "tactical suggestion 2"],
  "consistencyAnalysis": "1-2 sentences analyzing their form consistency, set conversions, and endurance trend",
  "personalizedPracticeRecommendations": ["drill recommendation 1", "drill recommendation 2", "drill recommendation 3"]
}

Return strictly parseable JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const parsed = JSON.parse(text);

    return {
      coachSummary: parsed.coachSummary || 'Consistent baseline game with opportunities for higher net conversion.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Aggressive smashes', 'Quick court transition'],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : ['Backhand clear depth', 'Deciding set stamina'],
      suggestedTrainingAreas: Array.isArray(parsed.suggestedTrainingAreas)
        ? parsed.suggestedTrainingAreas
        : ['Footwork agility', 'Multi-shuttle drills'],
      matchImprovementSuggestions: Array.isArray(parsed.matchImprovementSuggestions)
        ? parsed.matchImprovementSuggestions
        : ['Vary serve direction', 'Attack weak returns'],
      consistencyAnalysis: parsed.consistencyAnalysis || 'Stable performance across multi-set tournament matches.',
      personalizedPracticeRecommendations: Array.isArray(parsed.personalizedPracticeRecommendations)
        ? parsed.personalizedPracticeRecommendations
        : ['Daily shadow drills', 'Core endurance circuit'],
      source: 'gemini',
    };
  } catch (error) {
    console.warn('Gemini API call failed, using rule-based coach fallback:', error);
    return generateRuleBasedAnalysis(profile, matches);
  }
}

/**
 * Generate a personalized weak-points training plan requested by the user.
 */
export async function generateWeakpointsTrainingPlan(
  userWeakpoints: string[],
  targetFocus: string,
  weeklyDays: number,
  profile: PlayerProfile
): Promise<Omit<AITrainingPlan, 'id' | 'userId' | 'createdAt'>> {
  const apiKey = process.env.GEMINI_API_KEY;

  const fallbackPlan = {
    planTitle: `${targetFocus || 'Badminton Technique & Power'} Master Routine 🏸`,
    targetArea: targetFocus || 'Custom Weakpoint Correction',
    weakpoints: userWeakpoints,
    weeklySchedule: `${weeklyDays || 3} Sessions / Week (45 mins)`,
    coachAdvice: `Addressing your key concerns (${userWeakpoints.join(', ')}). The primary biomechanical adjustment is early preparation, continuous split-step timing, and relaxation of the grip prior to point of impact.`,
    drills: [
      {
        title: 'Precision Shadow Movement Drill',
        description: 'Practice explosive movements focusing specifically on early racket recovery and high elbow position.',
        setsAndReps: '4 sets × 10 reps',
        focusCue: 'Land on the ball of the foot with non-racket arm stabilizing balance',
        completed: false,
      },
      {
        title: 'Target Feeding & Placement Control',
        description: `Feeder plays repetitive shuttles targeting your identified weakness (${userWeakpoints[0] || 'clear'}). Execute controlled returns.`,
        setsAndReps: '5 sets × 12 shuttles',
        focusCue: 'Maintain high impact point without dropping elbow',
        completed: false,
      },
      {
        title: 'High-Fatigue Tiebreak Simulation',
        description: 'Simulate high pressure endgame rallies (score 18-18) while executing under tired legs.',
        setsAndReps: '3 tiebreaker games',
        focusCue: 'Focus on breathing rhythm and deliberate shot selection',
        completed: false,
      },
    ],
    recoveryAdvice: '10 minutes of active quad and shoulder stretches, followed by electrolyte hydration.',
  };

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return fallbackPlan;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are the chief training director at an elite BWF international badminton academy.
A player has provided their specific weakpoints in their game:
Weakpoints: ${JSON.stringify(userWeakpoints)}
Target Focus: ${targetFocus}
Target Weekly Sessions: ${weeklyDays} days/week
Player Profile:
- Name: ${profile.name}
- Skill Tier: ${profile.skillLevel}
- Playing Style: ${profile.playingStyle}

Generate a comprehensive, actionable, structured practice regimen specifically tailored to systematically eliminate these weak points.
Return valid JSON matching this schema:
{
  "planTitle": "Catchy title for the custom training plan",
  "targetArea": "Core area targeted",
  "weeklySchedule": "e.g. 3 Sessions/Week (45 mins)",
  "coachAdvice": "Direct advice explaining why they struggle with these weakpoints and how this plan cures it (3-4 sentences)",
  "drills": [
    {
      "title": "Drill Name",
      "description": "Specific execution instructions for player and feeder/sparring partner",
      "setsAndReps": "e.g. 4 sets × 15 shuttles",
      "focusCue": "Specific technical/biomechanical cue to remember while striking",
      "completed": false
    },
    {
      "title": "Drill Name 2",
      "description": "Drill description",
      "setsAndReps": "e.g. 5 sets × 10 reps",
      "focusCue": "Cue",
      "completed": false
    },
    {
      "title": "Drill Name 3",
      "description": "Match scenario drill",
      "setsAndReps": "e.g. 3 sets × 8 rallies",
      "focusCue": "Cue",
      "completed": false
    }
  ],
  "recoveryAdvice": "Post-session recovery and conditioning advice"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    const parsed = JSON.parse(text);

    return {
      planTitle: parsed.planTitle || fallbackPlan.planTitle,
      targetArea: parsed.targetArea || fallbackPlan.targetArea,
      weakpoints: userWeakpoints,
      weeklySchedule: parsed.weeklySchedule || fallbackPlan.weeklySchedule,
      coachAdvice: parsed.coachAdvice || fallbackPlan.coachAdvice,
      drills: Array.isArray(parsed.drills) && parsed.drills.length > 0 ? parsed.drills : fallbackPlan.drills,
      recoveryAdvice: parsed.recoveryAdvice || fallbackPlan.recoveryAdvice,
    };
  } catch (err) {
    console.warn('Gemini weakpoints training generator error, falling back:', err);
    return fallbackPlan;
  }
}
