import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Swords,
  Trophy,
  MapPin,
  Shield,
  Star,
  Flame,
  X,
  Activity,
} from 'lucide-react';
import { PlayerProfile } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { CreateMatchModal } from '../components/CreateMatchModal.tsx';

export const PlayersPage: React.FC = () => {
  const { user } = useAuth();

  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('ALL');
  const [selectedStyle, setSelectedStyle] = useState('ALL');

  // Modals
  const [selectedPlayerForChallenge, setSelectedPlayerForChallenge] = useState<PlayerProfile | null>(null);
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<any | null>(null);

  const fetchPlayers = () => {
    setLoading(true);
    api.players
      .list({
        search: search || undefined,
        skillLevel: selectedSkill !== 'ALL' ? selectedSkill : undefined,
        playingStyle: selectedStyle !== 'ALL' ? selectedStyle : undefined,
      })
      .then((data) => setPlayers(data))
      .catch((err) => console.error('Failed to load players:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlayers();
  }, [selectedSkill, selectedStyle]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlayers();
  };

  const handleViewProfile = async (id: string) => {
    try {
      const detailed = await api.players.getById(id);
      setViewingProfile(detailed);
    } catch (err) {
      console.error('Failed to view profile:', err);
    }
  };

  const allSkills = ['ALL', 'Beginner', 'Intermediate', 'Advanced', 'Professional'];
  const allStyles = [
    'ALL',
    'Aggressive Attacker',
    'Tactical Deceiver',
    'Defensive Counter-Puncher',
    'All-Rounder',
    'Fast-Paced Net Dominator',
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Player Matchmaking & Network</span>
          <span>·</span>
          <span>Verified Roster</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Discover Badminton Players
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Connect with club players, sparring partners, and tournament contenders filtered by skill tier and tactical playing style.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players by name, location, or bio..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          {/* Skill Filter */}
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              {allSkills.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Skill Tiers' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Playing Style */}
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              {allStyles.map((st) => (
                <option key={st} value={st}>
                  {st === 'ALL' ? 'All Tactical Styles' : st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Players Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading players roster...</div>
      ) : players.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
          No players found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {players.map((p) => {
            const isMe = p.userId === user?.id;

            return (
              <div
                key={p.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-center gap-3.5">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/40 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white truncate">{p.name}</h3>
                        {isMe && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-400 block">
                        {p.skillLevel} · {p.preferredPosition}
                      </span>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{p.location}</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {p.bio}
                  </p>

                  <div className="p-1 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 text-center font-medium">
                    Style: <span className="text-emerald-400">{p.playingStyle}</span>
                  </div>

                  {/* Quick Stat Pillows */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Win Rate</span>
                      <span className="font-extrabold text-emerald-400 font-mono">{p.winPercentage}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Matches</span>
                      <span className="font-extrabold text-white font-mono">{p.matchesPlayed}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Score</span>
                      <span className="font-extrabold text-teal-400 font-mono">{p.performanceScore}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => handleViewProfile(p.id)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    View Profile
                  </button>

                  {!isMe && (
                    <button
                      onClick={() => {
                        setSelectedPlayerForChallenge(p);
                        setChallengeModalOpen(true);
                      }}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Challenge</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Public Profile View Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setViewingProfile(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={viewingProfile.avatar}
                alt={viewingProfile.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/50"
              />
              <div>
                <h3 className="text-xl font-bold text-white">{viewingProfile.name}</h3>
                <p className="text-xs text-emerald-400 font-semibold">
                  {viewingProfile.skillLevel} · {viewingProfile.playingStyle}
                </p>
                <p className="text-xs text-slate-400">{viewingProfile.location} · Age {viewingProfile.age}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              "{viewingProfile.bio}"
            </p>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Matches</span>
                <span className="font-bold text-white font-mono">{viewingProfile.matchesPlayed}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Won</span>
                <span className="font-bold text-emerald-400 font-mono">{viewingProfile.matchesWon}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Win Rate</span>
                <span className="font-bold text-emerald-400 font-mono">{viewingProfile.winPercentage}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Score</span>
                <span className="font-bold text-teal-400 font-mono">{viewingProfile.performanceScore}</span>
              </div>
            </div>

            {viewingProfile.achievements && viewingProfile.achievements.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Trophies & Badges
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingProfile.achievements.map((a: any) => (
                    <span
                      key={a.id}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    >
                      🏆 {a.achievement?.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  const p = viewingProfile;
                  setViewingProfile(null);
                  setSelectedPlayerForChallenge(p);
                  setChallengeModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-md"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Challenge to Match</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Match Modal */}
      {challengeModalOpen && (
        <CreateMatchModal
          isOpen={challengeModalOpen}
          onClose={() => {
            setChallengeModalOpen(false);
            setSelectedPlayerForChallenge(null);
          }}
          preselectedPlayer={selectedPlayerForChallenge}
          onMatchCreated={() => {
            // match created
          }}
        />
      )}
    </div>
  );
};
