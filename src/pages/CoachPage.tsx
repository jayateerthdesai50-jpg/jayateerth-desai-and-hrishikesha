import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Target,
  Dumbbell,
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  Star,
  Award,
  Plus,
  Zap,
  Flame,
  AlertCircle,
  Loader2,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { OnlineCoach, CoachBooking, AITrainingPlan } from '../types.ts';

const PRESET_WEAKPOINTS = [
  'Deep rear-court backhand clear depth & height',
  'Fatigue & unforced errors in 3rd set rubber games (18-18 pressure)',
  'Slow split-step reaction to fast flat drives',
  'Vulnerable to tight deceptive tumbling net spin shots',
  'Flick serve anticipation & defensive lift depth',
  'Overhead jump smash angle & steepness',
  'Cross-court slice drop shot netting errors',
  'Forecourt recovery footwork after hitting a net kill',
];

export const CoachPage: React.FC = () => {
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'AI_TRAIN' | 'ONLINE_COACHES' | 'MY_SESSIONS'>('AI_TRAIN');

  // AI Training Generator State
  const [selectedWeakpoints, setSelectedWeakpoints] = useState<string[]>([
    'Deep rear-court backhand clear depth & height',
    'Fatigue & unforced errors in 3rd set rubber games (18-18 pressure)',
  ]);
  const [customWeakpoint, setCustomWeakpoint] = useState('');
  const [targetFocus, setTargetFocus] = useState('Rear-Court Power & Stamina Pacing');
  const [weeklyDays, setWeeklyDays] = useState(3);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [trainingPlans, setTrainingPlans] = useState<AITrainingPlan[]>([]);

  // Online Coaches State
  const [coaches, setCoaches] = useState<OnlineCoach[]>([]);
  const [myCoachBookings, setMyCoachBookings] = useState<CoachBooking[]>([]);
  const [selectedCoachForBooking, setSelectedCoachForBooking] = useState<OnlineCoach | null>(null);
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('07:00 AM - 08:00 AM');
  const [sessionType, setSessionType] = useState<any>('1-on-1 Online Video Analysis');
  const [focusNotes, setFocusNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<CoachBooking | null>(null);

  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.coaching.listCoaches(),
      api.coaching.getMyPlans(),
      api.coaching.getMyBookings(),
    ])
      .then(([cList, pList, bList]) => {
        setCoaches(cList);
        setTrainingPlans(pList);
        setMyCoachBookings(bList);
      })
      .catch((err) => console.error('Failed to load coaching data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const toggleWeakpoint = (item: string) => {
    if (selectedWeakpoints.includes(item)) {
      setSelectedWeakpoints(selectedWeakpoints.filter((w) => w !== item));
    } else {
      setSelectedWeakpoints([...selectedWeakpoints, item]);
    }
  };

  const handleAddCustomWeakpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWeakpoint.trim()) return;
    if (!selectedWeakpoints.includes(customWeakpoint.trim())) {
      setSelectedWeakpoints([...selectedWeakpoints, customWeakpoint.trim()]);
    }
    setCustomWeakpoint('');
  };

  const handleGenerateTraining = async () => {
    if (selectedWeakpoints.length === 0) {
      alert('Please select or add at least one weakpoint.');
      return;
    }

    setGeneratingPlan(true);
    try {
      const plan = await api.coaching.aiTrain({
        weakpoints: selectedWeakpoints,
        targetArea: targetFocus,
        weeklyDays,
      });

      setTrainingPlans([plan, ...trainingPlans]);

      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      alert(err.message || 'Failed to generate training plan.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleToggleDrill = async (planId: string, idx: number) => {
    try {
      await api.coaching.toggleDrill(planId, idx);
      setTrainingPlans((prev) =>
        prev.map((p) => {
          if (p.id === planId) {
            const newDrills = [...p.drills];
            newDrills[idx] = { ...newDrills[idx], completed: !newDrills[idx].completed };
            return { ...p, drills: newDrills };
          }
          return p;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoachForBooking) return;

    setBookingSubmitting(true);
    try {
      const res = await api.coaching.bookCoach({
        coachId: selectedCoachForBooking.id,
        date: bookingDate,
        timeSlot: bookingTime,
        sessionType,
        focusWeakpoints: focusNotes || selectedWeakpoints.join(', '),
      });

      setBookingSuccess(res);
      setMyCoachBookings([res, ...myCoachBookings]);

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.5 },
        });
      } catch {}
    } catch (err: any) {
      alert(err.message || 'Failed to book coach.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header with creative badminton stickers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <span>🏸 High-Performance Coaching Center</span>
            <span>·</span>
            <span>AI Drills & BWF Gurus 🇮🇳</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3">
            <span>RallySphere Coach & Academy</span>
            <span className="text-2xl">🔥</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed mt-1">
            Input your specific badminton weakpoints to generate personalized AI drill regimens, or book 1-on-1 virtual stroke correction with India's top certified BWF coaches.
          </p>
        </div>

        {/* Sticker badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
            <span>⚡ Split-Step Fast</span>
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
            <span>🎯 Weakpoint Killer</span>
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center gap-1.5 shadow-sm">
            <span>🇮🇳 Certified Mentors</span>
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('AI_TRAIN')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'AI_TRAIN'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Weakpoints Training Regimen</span>
          <span className="text-xs">🤖</span>
        </button>

        <button
          onClick={() => setActiveTab('ONLINE_COACHES')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ONLINE_COACHES'
              ? 'bg-slate-800 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>BWF Certified Online Coaches (₹ INR)</span>
          <span className="text-xs">🇮🇳</span>
        </button>

        <button
          onClick={() => setActiveTab('MY_SESSIONS')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'MY_SESSIONS'
              ? 'bg-slate-800 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>My Coaching Sessions</span>
          {myCoachBookings.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
              {myCoachBookings.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: AI Weakpoints Trainer */}
      {activeTab === 'AI_TRAIN' && (
        <div className="space-y-8">
          {/* Weakpoints Input Card */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Step 1: Select Your Current Technical Weaknesses</span>
                  <span className="text-lg">🎯</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select common badminton struggle points or type your exact difficulty below.
                </p>
              </div>

              <div className="text-xs text-emerald-400 font-mono font-bold">
                {selectedWeakpoints.length} weakpoints targeted
              </div>
            </div>

            {/* Common Weakpoint Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_WEAKPOINTS.map((wp) => {
                const isSelected = selectedWeakpoints.includes(wp);
                return (
                  <button
                    key={wp}
                    type="button"
                    onClick={() => toggleWeakpoint(wp)}
                    className={`p-3 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-white ring-1 ring-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{wp}</span>
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ml-2 ${
                        isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isSelected ? '✓' : '+'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Weakpoint Input */}
            <form onSubmit={handleAddCustomWeakpoint} className="flex gap-2 pt-2">
              <input
                type="text"
                value={customWeakpoint}
                onChange={(e) => setCustomWeakpoint(e.target.value)}
                placeholder="Type your own custom weakpoint (e.g. poor jump smash landing balance)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Custom</span>
              </button>
            </form>

            {/* Target Area & Weekly Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Priority Target Category</label>
                <select
                  value={targetFocus}
                  onChange={(e) => setTargetFocus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="Rear-Court Power & Stamina Pacing">Rear-Court Power & Stamina Pacing</option>
                  <option value="Front-Court Deception & Net Kills">Front-Court Deception & Net Kills</option>
                  <option value="Explosive 6-Corner Footwork & Agility">Explosive 6-Corner Footwork & Agility</option>
                  <option value="Doubles Rotations & Serve-Return Defense">Doubles Rotations & Serve-Return Defense</option>
                  <option value="Third-Set Tiebreak Mental Toughness">Third-Set Tiebreak Mental Toughness</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Weekly Practice Commitment</label>
                <select
                  value={weeklyDays}
                  onChange={(e) => setWeeklyDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value={2}>2 Days / Week (Moderate)</option>
                  <option value={3}>3 Days / Week (Recommended)</option>
                  <option value={4}>4 Days / Week (Tournament Prep)</option>
                  <option value={5}>5 Days / Week (Intensive Elite)</option>
                </select>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={generatingPlan || selectedWeakpoints.length === 0}
                onClick={handleGenerateTraining}
                className="px-6 py-3 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/25"
              >
                {generatingPlan ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>
                  {generatingPlan ? 'Synthesizing Drill Regimen with Gemini AI...' : 'Generate AI Training Drills & Program 🚀'}
                </span>
              </button>
            </div>
          </div>

          {/* Active Training Plans Showcase */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Your Custom Training Regimens</span>
              <span className="text-lg">📋</span>
            </h3>

            {trainingPlans.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 rounded-3xl border border-dashed border-slate-800 text-slate-400 text-xs space-y-2">
                <Dumbbell className="w-10 h-10 text-slate-600 mx-auto" />
                <p>No training plans generated yet. Pick your weakpoints above to generate your customized training regimen!</p>
              </div>
            ) : (
              trainingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {plan.targetArea}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{plan.weeklySchedule}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mt-1">{plan.planTitle}</h4>
                    </div>

                    <span className="text-xs text-slate-400">
                      Created: {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Targeted Weakpoints pills */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Targeted Weakpoints
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.weakpoints.map((w, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1"
                        >
                          <span>⚠️</span> {w}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Coach Advice */}
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed">
                    <strong className="text-white block mb-1">📢 Coach Biomechanical Cue:</strong>
                    "{plan.coachAdvice}"
                  </div>

                  {/* Interactive Drills Checklist */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span>Prescribed Training Drills (Click to Mark Completed)</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {plan.drills.map((drill, dIdx) => (
                        <div
                          key={dIdx}
                          onClick={() => handleToggleDrill(plan.id, dIdx)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                            drill.completed
                              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-sm'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400">Drill #{dIdx + 1}</span>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                  drill.completed ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'
                                }`}
                              >
                                {drill.completed && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </div>

                            <h6 className="text-xs font-bold text-white leading-tight">{drill.title}</h6>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{drill.description}</p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 text-[10px] space-y-1">
                            <p className="text-emerald-400 font-mono font-semibold">⚡ {drill.setsAndReps}</p>
                            <p className="text-amber-400 italic">Cue: {drill.focusCue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recovery */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-teal-400">🧘 Recovery & Post-Practice Protocol:</strong> {plan.recoveryAdvice}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Online BWF Coaches */}
      {activeTab === 'ONLINE_COACHES' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <img
                        src={coach.avatar}
                        alt={coach.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40"
                      />
                      <span className="absolute -bottom-2 -right-1 text-sm">🇮🇳</span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{coach.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{coach.sessionsCompleted}+ sessions</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{coach.name}</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{coach.title}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{coach.location}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {coach.bio}
                  </p>

                  {/* Specializations */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Specializations
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {coach.specializations.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">1-on-1 Fee:</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      ₹{coach.hourlyRateINR}/session
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCoachForBooking(coach);
                      setBookingSuccess(null);
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Book 1-on-1 Video Session</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: My Sessions */}
      {activeTab === 'MY_SESSIONS' && (
        <div className="space-y-4">
          {myCoachBookings.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 rounded-3xl border border-dashed border-slate-800 text-slate-400 text-xs">
              No coaching sessions booked yet. Explore India's certified coaches above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCoachBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">{b.bookingRef}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{b.coach?.name || 'BWF Master Coach'}</h4>
                      <p className="text-xs text-slate-400">{b.sessionType}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {b.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <p className="text-slate-300">
                      <strong>Scheduled:</strong> {b.date} · {b.timeSlot}
                    </p>
                    <p className="text-slate-300">
                      <strong>Focus:</strong> {b.focusWeakpoints}
                    </p>
                    <p className="text-emerald-400 font-mono">
                      <strong>Fee Paid:</strong> ₹{b.priceINR} (UPI Confirmed)
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Google Meet Classroom</span>
                    <a
                      href={b.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Live Session</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Book Coach Modal */}
      {selectedCoachForBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            {bookingSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-white">Coaching Session Reserved! 🏸</h3>
                <p className="text-xs text-slate-300">
                  Your session with {selectedCoachForBooking.name} is scheduled. Reference: <strong className="text-emerald-400">{bookingSuccess.bookingRef}</strong>
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-left space-y-1">
                  <p><strong>Date & Slot:</strong> {bookingSuccess.date} · {bookingSuccess.timeSlot}</p>
                  <p><strong>Amount Paid:</strong> ₹{bookingSuccess.priceINR} via UPI Mock</p>
                  <p className="text-emerald-400 font-mono text-[11px] truncate">Link: {bookingSuccess.meetingLink}</p>
                </div>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => {
                      setSelectedCoachForBooking(null);
                      setBookingSuccess(null);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950"
                  >
                    View in My Sessions
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookCoach} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">Book Online Coaching</h3>
                    <p className="text-xs text-emerald-400">{selectedCoachForBooking.name} (₹{selectedCoachForBooking.hourlyRateINR}/hr)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCoachForBooking(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Session Type</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="1-on-1 Online Video Analysis">1-on-1 Online Video Match Analysis</option>
                    <option value="Live Stroke Drill Correction">Live Stroke Biomechanics & Drill Correction</option>
                    <option value="Tactical Strategy Session">Tactical Gameplan & Tournament Strategy</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Time Slot</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    >
                      <option value="06:30 AM - 07:30 AM">06:30 AM - 07:30 AM</option>
                      <option value="07:30 AM - 08:30 AM">07:30 AM - 08:30 AM</option>
                      <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                      <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weakpoints to Target in this Session</label>
                  <input
                    type="text"
                    value={focusNotes}
                    onChange={(e) => setFocusNotes(e.target.value)}
                    placeholder="e.g. Backhand overhead clear and high jump smash recovery"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Payment:</span>
                  <span className="font-bold text-emerald-400 font-mono">₹{selectedCoachForBooking.hourlyRateINR} (UPI Mock)</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCoachForBooking(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="px-5 py-2.5 rounded-xl font-bold bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    {bookingSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{bookingSubmitting ? 'Confirming...' : `Confirm & Pay ₹${selectedCoachForBooking.hourlyRateINR}`}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
