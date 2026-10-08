import React, { useState } from 'react';
import { X, Trophy, Check, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Match } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface RecordScoreModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  onScoreRecorded: () => void;
}

export const RecordScoreModal: React.FC<RecordScoreModalProps> = ({
  match,
  isOpen,
  onClose,
  onScoreRecorded,
}) => {
  const { refreshProfile } = useAuth();

  const [set1T1, setSet1T1] = useState(21);
  const [set1T2, setSet1T2] = useState(18);

  const [set2T1, setSet2T1] = useState(19);
  const [set2T2, setSet2T2] = useState(21);

  const [hasSet3, setHasSet3] = useState(true);
  const [set3T1, setSet3T1] = useState(21);
  const [set3T2, setSet3T2] = useState(16);

  const [durationMinutes, setDurationMinutes] = useState(48);
  const [notes, setNotes] = useState('High energy competitive match with fast net play and cross-court winners.');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const team1Label =
    match.team1Players && match.team1Players.length > 0
      ? match.team1Players.map((p) => p.name).join(' & ')
      : 'Team 1';

  const team2Label =
    match.team2Players && match.team2Players.length > 0
      ? match.team2Players.map((p) => p.name).join(' & ')
      : 'Team 2';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const scores = [
      { team1Score: Number(set1T1), team2Score: Number(set1T2) },
      { team1Score: Number(set2T1), team2Score: Number(set2T2) },
    ];

    if (hasSet3) {
      scores.push({ team1Score: Number(set3T1), team2Score: Number(set3T2) });
    }

    try {
      await api.matches.submitResult(match.id, {
        scores,
        durationMinutes: Number(durationMinutes),
        notes,
      });

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.5 },
        });
      } catch {}

      await refreshProfile();
      onScoreRecorded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit match score.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 text-slate-100">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Record Match Score</h3>
              <p className="text-xs text-slate-400">{match.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Teams Header */}
          <div className="grid grid-cols-2 gap-4 text-center py-2 px-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Team 1</span>
              <p className="text-xs font-semibold text-white truncate">{team1Label}</p>
            </div>
            <div>
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Team 2</span>
              <p className="text-xs font-semibold text-white truncate">{team2Label}</p>
            </div>
          </div>

          {/* Set 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300">Set 1 Points</span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Team 1</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={set1T1}
                  onChange={(e) => setSet1T1(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Team 2</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={set1T2}
                  onChange={(e) => setSet1T2(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Set 2 */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300">Set 2 Points</span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Team 1</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={set2T1}
                  onChange={(e) => setSet2T1(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Team 2</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={set2T2}
                  onChange={(e) => setSet2T2(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Set 3 Toggle */}
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300 cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasSet3}
                onChange={(e) => setHasSet3(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
              />
              <span>Deciding Set 3 Played (Rubber Match)</span>
            </label>
          </div>

          {/* Set 3 */}
          {hasSet3 && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400">Set 3 Points (Decider)</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Team 1</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={set3T1}
                    onChange={(e) => setSet3T1(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Team 2</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={set3T2}
                    onChange={(e) => setSet3T2(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-center text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Duration & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Duration (min)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Match Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tactics, shuttle conditions, highlight rallies"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitting ? 'Updating Database...' : 'Finalize & Update Stats'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
