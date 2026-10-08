import React, { useState } from 'react';
import { X, History, Trophy, Calendar, MapPin, Check, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface LogPastMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchLogged: () => void;
}

export const LogPastMatchModal: React.FC<LogPastMatchModalProps> = ({
  isOpen,
  onClose,
  onMatchLogged,
}) => {
  const { refreshProfile } = useAuth();

  const [title, setTitle] = useState('Club Ladder Sparring Match');
  const [format, setFormat] = useState<'SINGLES' | 'DOUBLES'>('SINGLES');
  const [venueName, setVenueName] = useState('Apex Badminton Arena, Bengaluru');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return d.toISOString().split('T')[0];
  });
  const [opponentName, setOpponentName] = useState('Vikram S.');
  const [winnerTeam, setWinnerTeam] = useState<number>(1); // 1 = user won, 2 = opponent won

  // Sets
  const [set1My, setSet1My] = useState(21);
  const [set1Opp, setSet1Opp] = useState(17);

  const [set2My, setSet2My] = useState(19);
  const [set2Opp, setSet2Opp] = useState(21);

  const [hasSet3, setHasSet3] = useState(true);
  const [set3My, setSet3My] = useState(21);
  const [set3Opp, setSet3Opp] = useState(15);

  const [notes, setNotes] = useState('Solid smashes and good recovery in deciding rubber set.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !opponentName) {
      setError('Please provide match title, date, and opponent name.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const scores = [
      { team1Score: Number(set1My), team2Score: Number(set1Opp) },
      { team1Score: Number(set2My), team2Score: Number(set2Opp) },
    ];

    if (hasSet3) {
      scores.push({ team1Score: Number(set3My), team2Score: Number(set3Opp) });
    }

    // Auto calculate winner if not manually matched
    let myWins = 0;
    let oppWins = 0;
    scores.forEach((s) => {
      if (s.team1Score > s.team2Score) myWins++;
      else if (s.team2Score > s.team1Score) oppWins++;
    });
    const finalWinner = myWins >= oppWins ? 1 : 2;

    try {
      await api.matches.logPast({
        title,
        format,
        venueName,
        date,
        opponentNames: [opponentName],
        scores,
        winnerTeam: finalWinner,
        notes,
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      await refreshProfile();
      onMatchLogged();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to archive past match.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8 text-slate-100">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Archive Historical Match</span>
                <span className="text-base">📊</span>
              </h3>
              <p className="text-xs text-slate-400">Log past results to calculate your career average score & win rate</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Match Title / Tournament</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Match Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="SINGLES">Singles (1v1)</option>
                <option value="DOUBLES">Doubles (2v2)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Opponent Name</label>
              <input
                type="text"
                required
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                placeholder="e.g. Rahul K."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Venue / Club Arena</label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Set Scores */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-white block">Badminton Set Scores (Points)</span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Set 1</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={set1My}
                    onChange={(e) => setSet1My(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center font-bold text-emerald-400"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={set1Opp}
                    onChange={(e) => setSet1Opp(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center font-bold text-slate-300"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Set 2</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={set2My}
                    onChange={(e) => setSet2My(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center font-bold text-emerald-400"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={set2Opp}
                    onChange={(e) => setSet2Opp(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center font-bold text-slate-300"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">
                  <label className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSet3}
                      onChange={(e) => setHasSet3(e.target.checked)}
                      className="mr-1"
                    />
                    Set 3 (Decider)
                  </label>
                </span>
                {hasSet3 ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={set3My}
                      onChange={(e) => setSet3My(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center font-bold text-emerald-400"
                    />
                    <span>:</span>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={set3Opp}
                      onChange={(e) => setSet3Opp(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center font-bold text-slate-300"
                    />
                  </div>
                ) : (
                  <div className="p-1.5 text-[10px] text-slate-400 italic">2 sets only</div>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 text-center">Format: (Your Points) : (Opponent Points)</p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Key Takeaway / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitting ? 'Saving...' : 'Archive & Update Career Averages'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
