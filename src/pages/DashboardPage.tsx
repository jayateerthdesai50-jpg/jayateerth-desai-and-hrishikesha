import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Calendar,
  Swords,
  Trophy,
  Users,
  Flame,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Shield,
  Zap,
  History,
  Plus,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Booking, Match, PlayerAchievement, PlayerProfile } from '../types.ts';
import { LogPastMatchModal } from '../components/LogPastMatchModal.tsx';

export const DashboardPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [achievements, setAchievements] = useState<PlayerAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [logPastMatchOpen, setLogPastMatchOpen] = useState(false);

  const loadDashboardData = () => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      api.bookings.list(),
      api.matches.list(),
      profile ? api.players.getById(profile.id) : Promise.resolve(null),
    ])
      .then(([bookings, matches, profileDetails]) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const upcomingB = bookings
          .filter((b) => b.status === 'Confirmed' && b.date >= todayStr)
          .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())[0];
        setUpcomingBooking(upcomingB || null);

        const upcomingM = matches
          .filter((m) => m.status === 'SCHEDULED' && m.date >= todayStr)
          .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0];
        setUpcomingMatch(upcomingM || null);

        const pastM = matches.filter((m) => m.status === 'COMPLETED').slice(0, 5);
        setRecentMatches(pastM);

        if (profileDetails?.achievements) {
          setAchievements(profileDetails.achievements);
        }
      })
      .catch((err) => {
        console.warn('Dashboard loading error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboardData();
  }, [user, profile]);

  const p: PlayerProfile = profile || {
    id: 'temp',
    userId: user?.id || 'temp',
    name: 'Player',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: '',
    age: 25,
    location: '',
    skillLevel: 'Intermediate',
    playingStyle: 'All-Rounder',
    preferredPosition: 'Singles',
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    winPercentage: 0,
    gamesWon: 0,
    gamesLost: 0,
    performanceScore: 50.0,
    currentStreak: 0,
    bestStreak: 0,
    createdAt: '',
    updatedAt: '',
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>BADMINTON HUB · ACTIVE TOURNAMENT CYCLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {p.name} 🏸
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Your court bookings, ladder matchmaking, and AI-powered performance diagnostics are synchronized.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                {p.skillLevel} Division
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                {p.playingStyle}
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Shield className="w-3.5 h-3.5" /> Rating Verified
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 min-w-[320px]">
            <Link
              to="/courts"
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Compass className="w-4 h-4" />
              <span>Book Court (₹)</span>
            </Link>
            <Link
              to="/matches"
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
            >
              <Swords className="w-4 h-4 text-emerald-400" />
              <span>Create Match</span>
            </Link>
            <button
              onClick={() => setLogPastMatchOpen(true)}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition-all shadow-md shadow-amber-500/20"
            >
              <History className="w-4 h-4" />
              <span>Log Past Match 🏸</span>
            </button>
            <Link
              to="/coach"
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 transition-all"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Online Coach & AI 🤖</span>
            </Link>
            <Link
              to="/players"
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
            >
              <Users className="w-4 h-4 text-slate-300" />
              <span>Find Players</span>
            </Link>
            <Link
              to="/performance"
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Badminton Stickers & Shuttler Flair Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <span className="text-base">🏸</span>
          <span>Desi Shuttler Flair & Stickers:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1 shadow-sm hover:scale-105 transition-transform cursor-default">
            <span>💥 Thunder Smash 400km/h</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm hover:scale-105 transition-transform cursor-default">
            <span>⚡ Lightning Split-Step</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm hover:scale-105 transition-transform cursor-default">
            <span>🇮🇳 Desi Shuttler Pro</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center gap-1 shadow-sm hover:scale-105 transition-transform cursor-default">
            <span>🎯 Deceptive Tumbler</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shadow-sm hover:scale-105 transition-transform cursor-default">
            <span>🧘 Rubber Set Clutch Ace</span>
          </span>
        </div>
      </div>

      {/* Career Scoring & Win Averages Live Bar (New Indian Form Options) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Career Scoring Engine & Win Rate Averages</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                All Matches Stored
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Derived automatically across all {p.matchesPlayed} competitive, club, and historical logged matches.
            </p>
          </div>
          <button
            onClick={() => setLogPastMatchOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Add Previous Match Record</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Average Score / Set
            </span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {p.averageScore ? p.averageScore : '19.4'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">points per 21-pt set</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Avg Points Conceded
            </span>
            <span className="text-2xl font-extrabold text-slate-200 font-mono">
              {p.averagePointsConceded ? p.averagePointsConceded : '16.2'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">defensive concession</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Average Win Rate
            </span>
            <span className="text-2xl font-extrabold text-teal-400 font-mono">
              {p.winPercentage}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">{p.matchesWon} won / {p.matchesPlayed} total</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Net Point Differential
            </span>
            <span className="text-2xl font-extrabold text-amber-400 font-mono">
              {p.careerPointMargin !== undefined
                ? (p.careerPointMargin >= 0 ? `+${p.careerPointMargin}` : `${p.careerPointMargin}`)
                : '+38'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">career rally spread</span>
          </div>
        </div>
      </div>

      {/* Top Key Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Matches Played */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Matches Recorded</span>
            <Swords className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {p.matchesPlayed}
            </span>
            <span className="text-xs text-slate-400">fixtures</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {p.gamesWon || 0} sets won · {p.gamesLost || 0} sets lost
          </p>
        </div>

        {/* Win Percentage */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Win Ratio</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
              {p.winPercentage}%
            </span>
            <span className="text-xs text-slate-400">efficiency</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {p.matchesWon || 0} won · {p.matchesLost || 0} lost
          </p>
        </div>

        {/* Current Streak */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Current Form Streak</span>
            <Flame className={`w-4 h-4 ${p.currentStreak > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {p.currentStreak >= 0 ? `+${p.currentStreak}` : `${p.currentStreak}`}
            </span>
            <span className="text-xs text-slate-400">streak</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Personal best streak: {p.bestStreak || 0} matches
          </p>
        </div>

        {/* Performance Score */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-500/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-medium">
            <span>RallySphere Score</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {p.performanceScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Multi-factor weighted index</span>
          </p>
        </div>
      </div>

      {/* Upcoming Scheduled Fixtures & Reservations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Court Booking */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Upcoming Court Reservation</span>
            </h3>
            <Link to="/bookings" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium">
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingBooking ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400">
                    {upcomingBooking.bookingNumber}
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">{upcomingBooking.facilityName}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{upcomingBooking.courtName} · {upcomingBooking.surface}</span>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Confirmed
                </span>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{upcomingBooking.date} · {upcomingBooking.startTime} - {upcomingBooking.endTime}</span>
                </span>
                <span className="font-bold text-white">₹{upcomingBooking.totalAmount} (PAID)</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 space-y-2">
              <p className="text-xs text-slate-400">No active upcoming court reservations scheduled.</p>
              <Link
                to="/courts"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950"
              >
                Find & Book a Court
              </Link>
            </div>
          )}
        </div>

        {/* Next Scheduled Match */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-emerald-400" />
              <span>Next Scheduled Match</span>
            </h3>
            <Link to="/matches" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium">
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingMatch ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400">
                    {upcomingMatch.format} Match
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">{upcomingMatch.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{upcomingMatch.venueName}</span>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30">
                  Ready
                </span>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{upcomingMatch.date} · {upcomingMatch.time}</span>
                </span>
                <Link
                  to="/matches"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Enter Scores →
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 space-y-2">
              <p className="text-xs text-slate-400">No scheduled match challenges pending.</p>
              <Link
                to="/matches"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Schedule a Match
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity & Achievements Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Match Results Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>Recent Match Outcomes</span>
            </h3>
            <Link to="/performance" className="text-xs text-slate-400 hover:text-white">
              Full Analytics History →
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentMatches.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">No completed matches recorded yet.</p>
            ) : (
              recentMatches.map((m) => {
                const isTeam1 = m.team1PlayerIds.includes(user?.id || '');
                const won = (isTeam1 && m.winnerTeam === 1) || (!isTeam1 && m.winnerTeam === 2);
                const scoreSummary = m.scores.map((s) => `${s.team1Score}-${s.team2Score}`).join(', ');

                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            won
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {won ? 'VICTORY' : 'DEFEAT'}
                        </span>
                        <h4 className="text-xs font-semibold text-white">{m.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {m.venueName} · {m.date}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-white tracking-wide">
                        {scoreSummary || 'In Progress'}
                      </span>
                      <p className="text-[10px] text-slate-400">{m.format}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Unlocked Achievements Trophy Showcase */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Trophy Showcase</span>
            </h3>
            <Link to="/achievements" className="text-xs text-slate-400 hover:text-white">
              View All ({achievements.length})
            </Link>
          </div>

          <div className="space-y-3">
            {achievements.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{item.achievement.title}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-1 leading-tight">
                    {item.achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/achievements"
            className="w-full py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Explore Milestone Badges</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Log Past Match Modal */}
      <LogPastMatchModal
        isOpen={logPastMatchOpen}
        onClose={() => setLogPastMatchOpen(false)}
        onMatchLogged={loadDashboardData}
      />
    </div>
  );
};
