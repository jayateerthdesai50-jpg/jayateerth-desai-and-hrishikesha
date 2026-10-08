import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  TrendingUp,
  Sparkles,
  Zap,
  Target,
  Flame,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Dumbbell,
  Shield,
  Loader2,
  BarChart2,
  History,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { AICoachFeedback } from '../types.ts';
import { LogPastMatchModal } from '../components/LogPastMatchModal.tsx';

export const PerformancePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [statsData, setStatsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [logPastMatchOpen, setLogPastMatchOpen] = useState(false);

  // AI Coach state
  const [coachFeedback, setCoachFeedback] = useState<AICoachFeedback | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(false);

  const loadStats = () => {
    if (!profile) return;
    setLoading(true);
    api.performance
      .getStats(profile.id)
      .then((data) => {
        setStatsData(data);
      })
      .catch((err) => console.error('Failed to load performance stats:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!profile) return;
    loadStats();

    // Also fetch initial AI coach recommendations
    setLoadingCoach(true);
    api.performance
      .getAICoach(profile.id)
      .then((fb) => setCoachFeedback(fb))
      .catch((err) => console.warn('AI coach fetch error:', err))
      .finally(() => setLoadingCoach(false));
  }, [profile]);

  const handleRefreshCoach = () => {
    if (!profile) return;
    setLoadingCoach(true);
    api.performance
      .getAICoach(profile.id)
      .then((fb) => setCoachFeedback(fb))
      .catch((err) => console.error('AI coach refresh error:', err))
      .finally(() => setLoadingCoach(false));
  };

  const p = statsData?.profile || profile || {
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    winPercentage: 0,
    performanceScore: 50.0,
    currentStreak: 0,
    bestStreak: 0,
  };

  const formatStats = statsData?.formatBreakdown || {
    singles: { played: 0, won: 0, winRate: 0 },
    doubles: { played: 0, won: 0, winRate: 0 },
  };

  const setStats = statsData?.setPerformance || {
    set1: { total: 0, won: 0, rate: 0 },
    set2: { total: 0, won: 0, rate: 0 },
    set3: { total: 0, won: 0, rate: 0 },
  };

  const recentTrend = statsData?.recentTrend || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>Sports Analytics Laboratory</span>
            <span>·</span>
            <span>Algorithmic Diagnostics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Performance Analytics & AI Coach
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Multi-factor badminton performance score, set conversion metrics, momentum trends, and intelligent training recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setLogPastMatchOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition-all shadow-md shadow-amber-500/20"
          >
            <History className="w-4 h-4" />
            <span>Log Past Match 🏸</span>
          </button>

          <Link
            to="/coach"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 transition-all"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>AI Weakpoints Hub 🤖</span>
          </Link>

          <button
            onClick={handleRefreshCoach}
            disabled={loadingCoach}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 transition-all shadow-lg shadow-emerald-500/20"
          >
            {loadingCoach ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loadingCoach ? 'Analyzing Data...' : 'Re-Run AI Diagnostic'}</span>
          </button>
        </div>
      </div>

      {/* Career Averages & Scoring Deep-Dive */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white">All-Time Match Storage & Career Scoring Averages</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {p.matchesPlayed} Matches Stored
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live algorithmic averages calculating your scoring efficiency, defensive concessions, and point differential per 21-point set.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <span>🏸 400km/h Smash</span>
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center gap-1">
              <span>⚡ Split-Step Fast</span>
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <span>🇮🇳 Bharat Shuttler</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Avg Score / Set</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {p.averageScore ? p.averageScore : '19.4'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">points per set</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Avg Conceded</span>
            <span className="text-2xl font-extrabold text-slate-200 font-mono">
              {p.averagePointsConceded ? p.averagePointsConceded : '16.2'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">defensive concession</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Average Win Rate</span>
            <span className="text-2xl font-extrabold text-teal-400 font-mono">{p.winPercentage}%</span>
            <span className="text-[10px] text-slate-400 block mt-1">{p.matchesWon}W / {p.matchesLost}L</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Point Spread (+/-)</span>
            <span className="text-2xl font-extrabold text-amber-400 font-mono">
              {p.careerPointMargin !== undefined
                ? (p.careerPointMargin >= 0 ? `+${p.careerPointMargin}` : `${p.careerPointMargin}`)
                : '+38'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">career rally margin</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Decider Sets (Set 3)</span>
            <span className="text-2xl font-extrabold text-indigo-400 font-mono">
              {setStats.set3.rate}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">{setStats.set3.won}/{setStats.set3.total} rubber sets</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Sets</span>
            <span className="text-2xl font-extrabold text-white font-mono">
              {(p.gamesWon || 0) + (p.gamesLost || 0)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">{p.gamesWon || 0} won · {p.gamesLost || 0} lost</span>
          </div>
        </div>

        {/* Weakpoint Training Callout Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/40 to-slate-950 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Targeted AI Training & Online Coaching Available</span>
            </span>
            <h4 className="text-sm font-bold text-white">Have specific weakpoints like backhand depth or late-game fatigue?</h4>
            <p className="text-xs text-slate-300">
              Input your custom game vulnerabilities into our AI Coach to generate a customized 4-week practice schedule, or book 1-on-1 virtual sessions with India's BWF certified mentors in Rupees (₹).
            </p>
          </div>
          <Link
            to="/coach"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-md"
          >
            <span>Open Coach & AI Regimen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Big Score Dial */}
          <div className="space-y-3 lg:border-r border-slate-800 lg:pr-8">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>RallySphere Performance Rating</span>
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-extrabold text-white font-mono tracking-tight tabular-nums">
                {p.performanceScore}
              </span>
              <span className="text-xl font-bold text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tier:{' '}
              <strong className="text-emerald-400">
                {p.performanceScore >= 85
                  ? 'Grandmaster / Elite Tournament Class'
                  : p.performanceScore >= 75
                  ? 'Advanced Competitive Tier'
                  : 'Intermediate Club Rallier'}
              </strong>
            </p>
          </div>

          {/* Mathematical Formula Breakdown (Requirement) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Performance Score Formula & Weighting Model
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">BWF Normalized</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-slate-300">
              <code>
                Performance Score = (Win Rate × 0.40) + (Recent Form Factor × 0.25) + (Match Consistency × 0.20) + (Game Margin × 0.15)
              </code>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Win Rate (40%)</span>
                <span className="font-bold text-emerald-400">{p.winPercentage}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Recent Form (25%)</span>
                <span className="font-bold text-teal-400">{p.currentStreak >= 0 ? `+${p.currentStreak}` : p.currentStreak} streak</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Consistency (20%)</span>
                <span className="font-bold text-indigo-400">{p.matchesPlayed} fixtures</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Game Sets (15%)</span>
                <span className="font-bold text-amber-400">{p.gamesWon || 0}W / {p.gamesLost || 0}L</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Format & Set Breakdown Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Singles vs Doubles Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Format Efficiency (Singles vs Doubles)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Win Rates</span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Singles Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Singles Disciplines</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {formatStats.singles.winRate}% ({formatStats.singles.won}/{formatStats.singles.played})
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${formatStats.singles.winRate}%` }}
                />
              </div>
            </div>

            {/* Doubles Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Doubles Disciplines</span>
                <span className="font-mono text-teal-400 font-bold">
                  {formatStats.doubles.winRate}% ({formatStats.doubles.won}/{formatStats.doubles.played})
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-teal-400 rounded-full transition-all duration-700"
                  style={{ width: `${formatStats.doubles.winRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Set Conversion Analysis (Rubber Matches) */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-400" />
              <span>Set Conversion & Stamina Curve</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Conversion %</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Set 1 (Opening)</span>
              <span className="text-xl font-extrabold text-white font-mono">{setStats.set1.rate}%</span>
              <span className="text-[10px] text-slate-400 block mt-1">{setStats.set1.won}/{setStats.set1.total} sets</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Set 2 (Mid-Game)</span>
              <span className="text-xl font-extrabold text-white font-mono">{setStats.set2.rate}%</span>
              <span className="text-[10px] text-slate-400 block mt-1">{setStats.set2.won}/{setStats.set2.total} sets</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Set 3 (Decider)</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">{setStats.set3.rate}%</span>
              <span className="text-[10px] text-slate-400 block mt-1">{setStats.set3.won}/{setStats.set3.total} sets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Match Form Trend (Timeline) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Recent Match Momentum (Last 10 Fixtures)</span>
        </h3>

        {recentTrend.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No completed fixtures recorded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {recentTrend.map((m: any, idx: number) => {
              const won = m.result === 'WON';
              return (
                <div
                  key={m.id || idx}
                  className={`p-3 rounded-xl border text-left space-y-1 ${
                    won
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        won ? 'bg-emerald-500/30 text-emerald-400' : 'bg-rose-500/30 text-rose-400'
                      }`}
                    >
                      {m.result}
                    </span>
                    <span className="text-[10px] text-slate-400">{m.date?.slice(5)}</span>
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{m.title}</p>
                  <p className="text-[11px] font-mono text-slate-300 font-medium">{m.scoreSummary}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RALLYSPHERE AI COACH SECTION */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">RallySphere AI Coach</h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    coachFeedback?.source === 'gemini'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  }`}
                >
                  {coachFeedback?.source === 'gemini' ? 'Gemini 3.8 Flash' : 'High-Precision Analytics Engine'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Grounded in your actual match sets, playing style, and rally stamina metrics.
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshCoach}
            disabled={loadingCoach}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
          >
            {loadingCoach ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Refresh Diagnosis</span>
          </button>
        </div>

        {loadingCoach ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>AI Coach is synthesizing your rally logs and set conversions...</span>
          </div>
        ) : coachFeedback ? (
          <div className="space-y-6">
            {/* Coach Executive Summary */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm leading-relaxed">
              <span className="font-bold text-white block mb-1">Executive Coach Assessment:</span>
              "{coachFeedback.coachSummary}"
            </div>

            {/* Strengths & Weaknesses 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Strengths */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Identified Strengths & Weapons</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {coachFeedback.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses / Vulnerabilities */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Target Vulnerabilities to Address</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {coachFeedback.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold mt-0.5">!</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tactical Suggestions & Training Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Suggested Training Areas */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  <span>Suggested Training & Conditioning</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {coachFeedback.suggestedTrainingAreas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-400 font-bold mt-0.5">→</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Match Improvement Suggestions */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>Match Day Tactical Adjustments</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {coachFeedback.matchImprovementSuggestions.map((sugg, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold mt-0.5">💡</span>
                      <span>{sugg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Personalized Practice Drills */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Prescribed Personalized Practice Drills</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {coachFeedback.personalizedPracticeRecommendations.map((drill, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] font-bold text-emerald-400 block mb-1">Drill #{idx + 1}</span>
                    <p>{drill}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Consistency statement */}
            <p className="text-[11px] text-slate-400 italic">
              <strong>Consistency Analysis:</strong> {coachFeedback.consistencyAnalysis}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">No AI diagnostic available.</p>
        )}
      </div>

      {/* Log Past Match Modal */}
      <LogPastMatchModal
        isOpen={logPastMatchOpen}
        onClose={() => setLogPastMatchOpen(false)}
        onMatchLogged={loadStats}
      />
    </div>
  );
};
