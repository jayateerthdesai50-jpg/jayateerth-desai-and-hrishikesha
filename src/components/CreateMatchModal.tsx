import React, { useState, useEffect } from 'react';
import { X, Swords, Calendar, Clock, MapPin, Users, Check, AlertCircle, Loader2 } from 'lucide-react';
import { PlayerProfile, Facility, MatchFormat } from '../types.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchCreated: () => void;
  preselectedPlayer?: PlayerProfile | null;
}

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({
  isOpen,
  onClose,
  onMatchCreated,
  preselectedPlayer,
}) => {
  const { user, profile } = useAuth();

  const [title, setTitle] = useState('Competitive Badminton Clash');
  const [format, setFormat] = useState<MatchFormat>('SINGLES');
  const [venueName, setVenueName] = useState('Apex Badminton Arena - Court 1');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('18:00');
  const [notes, setNotes] = useState('Best of 3 sets to 21 points. BWF regulation scoring.');

  // Opponent player selection
  const [availablePlayers, setAvailablePlayers] = useState<PlayerProfile[]>([]);
  const [selectedOpponents, setSelectedOpponents] = useState<string[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Load registered players and facilities
    api.players.list().then((list) => {
      const others = list.filter((p) => p.userId !== user?.id);
      setAvailablePlayers(others);

      if (preselectedPlayer) {
        setSelectedOpponents([preselectedPlayer.userId]);
      }
    });

    api.facilities.list().then((facs) => {
      setFacilities(facs);
      if (facs.length > 0) {
        setVenueName(`${facs[0].name} - Court 1`);
      }
    });
  }, [isOpen, user, preselectedPlayer]);

  if (!isOpen) return null;

  const toggleOpponent = (userId: string) => {
    if (format === 'SINGLES') {
      setSelectedOpponents([userId]);
    } else {
      if (selectedOpponents.includes(userId)) {
        setSelectedOpponents(selectedOpponents.filter((id) => id !== userId));
      } else if (selectedOpponents.length < 2) {
        setSelectedOpponents([...selectedOpponents, userId]);
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !venueName || !date || !time) {
      setError('Please fill out all required match details.');
      return;
    }

    if (selectedOpponents.length === 0) {
      setError('Please select at least one opponent to challenge.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const team1 = [user!.id];
      if (format === 'DOUBLES' && selectedPartner) {
        team1.push(selectedPartner);
      }

      await api.matches.create({
        title,
        format,
        venueName,
        date,
        time,
        team1PlayerIds: team1,
        team2PlayerIds: selectedOpponents,
        notes,
      });

      onMatchCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create and schedule match.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8 text-slate-100">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Match Challenge</h3>
              <p className="text-xs text-slate-400">Schedule a competitive or friendly badminton fixture</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Match Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Saturday Ladder Qualifier"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          {/* Format Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Match Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormat('SINGLES');
                  if (selectedOpponents.length > 1) setSelectedOpponents([selectedOpponents[0]]);
                }}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  format === 'SINGLES'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Singles (1 vs 1)
              </button>
              <button
                type="button"
                onClick={() => setFormat('DOUBLES')}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  format === 'DOUBLES'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Doubles (2 vs 2)
              </button>
            </div>
          </div>

          {/* Venue & Date/Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Venue</span>
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Facility or court name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Time</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>
          </div>

          {/* Select Opponent */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Invite Opponent ({format === 'SINGLES' ? '1 Player' : 'Up to 2 Players'})</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-normal">
                {selectedOpponents.length} selected
              </span>
            </label>

            <div className="max-h-40 overflow-y-auto space-y-1.5 p-1">
              {availablePlayers.map((p) => {
                const isSelected = selectedOpponents.includes(p.userId);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleOpponent(p.userId)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-semibold text-white leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {p.skillLevel} · {p.playingStyle} · {p.winPercentage}% Win
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Match Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Match Rules & Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60"
            />
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
              <span>{submitting ? 'Creating Match...' : 'Send Challenge & Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
