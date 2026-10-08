import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Zap,
  Calendar,
  Users,
  Flame,
  ShieldCheck,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Achievement, PlayerAchievement } from '../types.ts';

export const AchievementsPage: React.FC = () => {
  const { profile } = useAuth();

  const [unlocked, setUnlocked] = useState<PlayerAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Master list of achievements
  const allAchievements: Achievement[] = [
    {
      id: 'ach_first_smash',
      code: 'FIRST_SMASH',
      title: 'First Smash',
      description: 'Played and recorded your first competitive badminton match on RallySphere.',
      icon: 'Zap',
      category: 'MATCHES',
    },
    {
      id: 'ach_century_rally',
      code: 'CENTURY_RALLY',
      title: 'Century Rally',
      description: 'Participated in 10 or more competitive badminton fixtures.',
      icon: 'Trophy',
      category: 'MATCHES',
    },
    {
      id: 'ach_unstoppable',
      code: 'UNSTOPPABLE',
      title: 'Unstoppable Momentum',
      description: 'Maintained an active 3+ match win streak in singles or doubles.',
      icon: 'Flame',
      category: 'STREAKS',
    },
    {
      id: 'ach_prime_booker',
      code: 'PRIME_BOOKER',
      title: 'Prime Booker',
      description: 'Reserved 3 or more badminton court sessions at partner arena facilities.',
      icon: 'Calendar',
      category: 'BOOKINGS',
    },
    {
      id: 'ach_doubles_maestro',
      code: 'DOUBLES_MAESTRO',
      title: 'Doubles Maestro',
      description: 'Won 3 competitive doubles matches partnering with club players.',
      icon: 'Users',
      category: 'MATCHES',
    },
    {
      id: 'ach_elite_rating',
      code: 'ELITE_RATING',
      title: 'Master Tactician',
      description: 'Achieved an algorithmic RallySphere Performance Score above 80.0.',
      icon: 'ShieldCheck',
      category: 'PERFORMANCE',
    },
  ];

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    api.players
      .getById(profile.id)
      .then((data) => {
        setUnlocked(data.achievements || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [profile]);

  const unlockedCodes = new Set(unlocked.map((u) => u.achievement.code));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
          <Trophy className="w-4 h-4" />
          <span>Trophy Cabinet & Milestones</span>
          <span>·</span>
          <span>Badminton Gamification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
          Player Achievements
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Unlock milestone badges through match volume, court reservations, winning streaks, and peak performance ratings.
        </p>
      </div>

      {/* Progress Counter Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-amber-950/30 border border-amber-500/30 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Trophies Unlocked</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-extrabold text-white font-mono">{unlockedCodes.size}</span>
            <span className="text-sm font-semibold text-slate-400">/ {allAchievements.length} Badges</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Keep rallying and recording matches to expand your competitive trophy showcase.
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-3xl shadow-inner">
          🏆
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allAchievements.map((ach) => {
          const isUnlocked = unlockedCodes.has(ach.code);
          const unlockedRecord = unlocked.find((u) => u.achievement.code === ach.code);

          return (
            <div
              key={ach.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isUnlocked
                  ? 'bg-slate-900 border-amber-500/40 shadow-md shadow-amber-500/5'
                  : 'bg-slate-950/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                      isUnlocked
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? '🏆' : <Lock className="w-5 h-5" />}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isUnlocked
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{ach.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">{ach.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Category: {ach.category}</span>
                {isUnlocked && unlockedRecord && (
                  <span className="text-amber-400/90 font-mono">
                    Unlocked {new Date(unlockedRecord.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
