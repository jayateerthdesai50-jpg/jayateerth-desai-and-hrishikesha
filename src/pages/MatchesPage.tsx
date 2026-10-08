import React, { useState, useEffect } from 'react';
import {
  Swords,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Plus,
  Users,
  Check,
  X,
  Mail,
  Loader2,
  AlertCircle,
  History,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Match, MatchInvitation } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { CreateMatchModal } from '../components/CreateMatchModal.tsx';
import { RecordScoreModal } from '../components/RecordScoreModal.tsx';
import { LogPastMatchModal } from '../components/LogPastMatchModal.tsx';

export const MatchesPage: React.FC = () => {
  const { user } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [invitations, setInvitations] = useState<MatchInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'INVITATIONS'>('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [logPastModalOpen, setLogPastModalOpen] = useState(false);
  const [scoreModalMatch, setScoreModalMatch] = useState<Match | null>(null);

  const fetchMatchesAndInvites = () => {
    setLoading(true);
    Promise.all([api.matches.list(), api.matches.getInvitations()])
      .then(([mList, invList]) => {
        setMatches(mList);
        setInvitations(invList);
      })
      .catch((err) => console.error('Failed to load matches:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMatchesAndInvites();
  }, []);

  const handleRespondInvitation = async (invId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      await api.matches.respondToInvitation(invId, status);
      fetchMatchesAndInvites();
    } catch (err: any) {
      alert(err.message || 'Failed to update invitation.');
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (activeTab === 'SCHEDULED') return m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS';
    if (activeTab === 'COMPLETED') return m.status === 'COMPLETED';
    return true;
  });

  const pendingInvitations = invitations.filter((i) => i.status === 'PENDING');

  // Compute live averages across all stored previous matches
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED');
  let myWins = 0;
  let totalSets = 0;
  let myPoints = 0;
  let oppPoints = 0;

  completedMatches.forEach((m) => {
    const isTeam1 = m.team1PlayerIds.includes(user?.id || '');
    if ((isTeam1 && m.winnerTeam === 1) || (!isTeam1 && m.winnerTeam === 2)) {
      myWins++;
    }
    m.scores.forEach((s) => {
      totalSets++;
      const pScored = isTeam1 ? s.team1Score : s.team2Score;
      const pConceded = isTeam1 ? s.team2Score : s.team1Score;
      myPoints += pScored;
      oppPoints += pConceded;
    });
  });

  const avgScorePerSet = totalSets > 0 ? (myPoints / totalSets).toFixed(1) : '19.5';
  const avgPointsConceded = totalSets > 0 ? (oppPoints / totalSets).toFixed(1) : '16.2';
  const careerWinRate = completedMatches.length > 0 ? Math.round((myWins / completedMatches.length) * 100) : 67;
  const netPointDiff = myPoints - oppPoints;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Swords className="w-4 h-4" />
            <span>Badminton Match Engine</span>
            <span>·</span>
            <span>BWF Regulation Sets & Career Archives</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Matches & Challenges
          </h1>
          <p className="text-sm text-slate-400">
            Create live court challenges, log previous match history, and analyze your average score and win rate.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setLogPastModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition-all shadow-md shadow-amber-500/20"
          >
            <History className="w-4 h-4" />
            <span>Log Past / Previous Match 🏸</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Challenge</span>
          </button>
        </div>
      </div>

      {/* Match History Storage & Average Stats Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">All Previous Matches & Career Averages</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Aggregation
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              🏸 Smash King
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
              ⚡ Rubber Set Ace
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300">
              🇮🇳 Desi Shuttler
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Matches Stored</span>
            <span className="text-2xl font-extrabold text-white font-mono">{completedMatches.length}</span>
            <span className="text-[10px] text-slate-400 block mt-1">{myWins} won · {completedMatches.length - myWins} lost</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Average Win Rate</span>
            <span className="text-2xl font-extrabold text-teal-400 font-mono">{careerWinRate}%</span>
            <span className="text-[10px] text-slate-400 block mt-1">across all disciplines</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Avg Score / Set</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{avgScorePerSet}</span>
            <span className="text-[10px] text-slate-400 block mt-1">vs {avgPointsConceded} conceded</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Point Spread (+/-)</span>
            <span className="text-2xl font-extrabold text-amber-400 font-mono">
              {netPointDiff >= 0 ? `+${netPointDiff}` : `${netPointDiff}`}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">{totalSets} sets calculated</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 w-fit">
        {(['ALL', 'SCHEDULED', 'COMPLETED', 'INVITATIONS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors relative ${
              activeTab === tab
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
            {tab === 'INVITATIONS' && pendingInvitations.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px]">
                {pendingInvitations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading matches and rosters...</div>
      ) : activeTab === 'INVITATIONS' ? (
        /* Invitations Tab */
        <div className="space-y-4">
          {invitations.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 rounded-3xl border border-dashed border-slate-800 text-slate-400 text-xs">
              No match invitations at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={inv.sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt="Sender"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{inv.sender?.name || 'Badminton Player'}</h4>
                        <p className="text-[11px] text-slate-400">challenged you to a match</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'ACCEPTED'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : inv.status === 'DECLINED'
                          ? 'bg-rose-500/15 text-rose-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  {inv.match && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                      <p className="font-semibold text-white">{inv.match.title}</p>
                      <p className="text-slate-400 text-[11px]">{inv.match.venueName}</p>
                      <p className="text-emerald-400 text-[11px]">{inv.match.date} · {inv.match.time}</p>
                    </div>
                  )}

                  {inv.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleRespondInvitation(inv.id, 'DECLINED')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white border border-slate-800"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRespondInvitation(inv.id, 'ACCEPTED')}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Challenge</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Matches Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMatches.length === 0 ? (
            <div className="col-span-2 p-12 text-center bg-slate-900 rounded-3xl border border-dashed border-slate-800 space-y-3">
              <Swords className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Matches Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No fixtures under {activeTab.toLowerCase()}. Challenge club players or create a ladder session.
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950"
              >
                Create Challenge
              </button>
            </div>
          ) : (
            filteredMatches.map((m) => {
              const isCompleted = m.status === 'COMPLETED';
              const team1Label = m.team1Players?.map((p) => p.name).join(' & ') || 'Team 1';
              const team2Label = m.team2Players?.map((p) => p.name).join(' & ') || 'Team 2';

              return (
                <div
                  key={m.id}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {m.format}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{m.date}</span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-2">{m.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{m.venueName} · {m.time}</span>
                    </p>

                    {/* Teams / Score Board */}
                    <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCompleted && m.winnerTeam === 1 ? 'bg-emerald-400' : 'bg-slate-600'
                            }`}
                          />
                          <span className="font-semibold text-white truncate">{team1Label}</span>
                        </div>
                        {isCompleted && (
                          <div className="flex items-center gap-2 font-mono font-bold text-white">
                            {m.scores.map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                                {s.team1Score}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCompleted && m.winnerTeam === 2 ? 'bg-emerald-400' : 'bg-slate-600'
                            }`}
                          />
                          <span className="font-semibold text-white truncate">{team2Label}</span>
                        </div>
                        {isCompleted && (
                          <div className="flex items-center gap-2 font-mono font-bold text-white">
                            {m.scores.map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                                {s.team2Score}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {m.notes && (
                      <p className="text-[11px] text-slate-400 mt-2 italic line-clamp-1">
                        "{m.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    {isCompleted ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Winner: {m.winnerTeam === 1 ? team1Label : team2Label}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Match in scheduling queue</span>
                    )}

                    {!isCompleted && (
                      <button
                        onClick={() => setScoreModalMatch(m)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/40 transition-all flex items-center gap-1.5"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Record Scores</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create Match Modal */}
      <CreateMatchModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onMatchCreated={fetchMatchesAndInvites}
      />

      {/* Log Past Match Modal */}
      <LogPastMatchModal
        isOpen={logPastModalOpen}
        onClose={() => setLogPastModalOpen(false)}
        onMatchLogged={fetchMatchesAndInvites}
      />

      {/* Record Score Modal */}
      {scoreModalMatch && (
        <RecordScoreModal
          match={scoreModalMatch}
          isOpen={!!scoreModalMatch}
          onClose={() => setScoreModalMatch(null)}
          onScoreRecorded={fetchMatchesAndInvites}
        />
      )}
    </div>
  );
};
