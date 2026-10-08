import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  MapPin,
  Shield,
  Activity,
  Trophy,
  Edit3,
  Check,
  Calendar,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { SkillLevel, PlayingStyle, PreferredPosition, PlayerProfile } from '../types.ts';

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile, updateLocalProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [age, setAge] = useState(profile?.age || 25);
  const [location, setLocation] = useState(profile?.location || '');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(profile?.skillLevel || 'Intermediate');
  const [playingStyle, setPlayingStyle] = useState<PlayingStyle>(profile?.playingStyle || 'All-Rounder');
  const [preferredPosition, setPreferredPosition] = useState<PreferredPosition>(
    profile?.preferredPosition || 'Singles'
  );

  const [achievements, setAchievements] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAvatar(profile.avatar);
      setBio(profile.bio);
      setAge(profile.age);
      setLocation(profile.location);
      setSkillLevel(profile.skillLevel);
      setPlayingStyle(profile.playingStyle);
      setPreferredPosition(profile.preferredPosition);

      api.players.getById(profile.id).then((d) => {
        setAchievements(d.achievements || []);
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const updated = await api.players.update(profile.id, {
        name,
        avatar,
        bio,
        age: Number(age),
        location,
        skillLevel,
        playingStyle,
        preferredPosition,
      });

      updateLocalProfile(updated);
      await refreshProfile();
      setSuccessMsg('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

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
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <UserIcon className="w-4 h-4" />
            <span>Player Registry</span>
            <span>·</span>
            <span>Verified Credentials</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">Player Profile</h1>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{editing ? 'Cancel Editing' : 'Edit Profile'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Info Card */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={p.avatar}
            alt={p.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500/40 shadow-lg"
          />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-white">{p.name}</h2>
                <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-fit mx-auto sm:mx-0">
                {p.skillLevel} Division
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              "{p.bio}"
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{p.location || 'Not specified'}</span>
              </span>
              <span>·</span>
              <span>Age {p.age || 25}</span>
              <span>·</span>
              <span className="text-teal-400 font-semibold">{p.playingStyle}</span>
              <span>·</span>
              <span>Preferred: {p.preferredPosition}</span>
            </div>
          </div>
        </div>

        {/* Stats Strip with Average Score & Win Rate */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-800 text-center">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Total Matches</span>
            <span className="text-xl font-bold text-white font-mono">{p.matchesPlayed}</span>
            <span className="text-[10px] text-slate-400 block">{p.matchesWon}W · {p.matchesLost}L</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Career Win Rate</span>
            <span className="text-xl font-bold text-teal-400 font-mono">{p.winPercentage}%</span>
            <span className="text-[10px] text-slate-400 block">{p.gamesWon || 0} sets won</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Avg Score / Set</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {p.averageScore ? p.averageScore : '19.4'}
            </span>
            <span className="text-[10px] text-slate-400 block">points scored</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Avg Conceded</span>
            <span className="text-xl font-bold text-slate-200 font-mono">
              {p.averagePointsConceded ? p.averagePointsConceded : '16.2'}
            </span>
            <span className="text-[10px] text-slate-400 block">defensive rate</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Point Spread</span>
            <span className="text-xl font-bold text-amber-400 font-mono">
              {p.careerPointMargin !== undefined
                ? (p.careerPointMargin >= 0 ? `+${p.careerPointMargin}` : `${p.careerPointMargin}`)
                : '+38'}
            </span>
            <span className="text-[10px] text-slate-400 block">career spread</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Rally Score</span>
            <span className="text-xl font-bold text-indigo-400 font-mono">{p.performanceScore}</span>
            <span className="text-[10px] text-slate-400 block">/ 100 Index</span>
          </div>
        </div>
      </div>

      {/* Creative Badminton Stickers & Flair Locker */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏸</span>
            <h3 className="text-base font-bold text-white">Desi Shuttler Stickers & Flair Locker</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Interactive Flair
            </span>
          </div>
          <span className="text-xs text-slate-400">Equip badges to feature on your public profile</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-500/30 hover:border-rose-500 transition-all flex items-center gap-3 cursor-default shadow-sm group">
            <span className="text-2xl group-hover:scale-125 transition-transform">💥</span>
            <div>
              <span className="text-xs font-bold text-white block">Thunder Smash</span>
              <span className="text-[10px] text-rose-400">400+ km/h Power</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-500 transition-all flex items-center gap-3 cursor-default shadow-sm group">
            <span className="text-2xl group-hover:scale-125 transition-transform">⚡</span>
            <div>
              <span className="text-xs font-bold text-white block">Split-Step Ninja</span>
              <span className="text-[10px] text-amber-400">0.18s Reaction</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 hover:border-emerald-500 transition-all flex items-center gap-3 cursor-default shadow-sm group">
            <span className="text-2xl group-hover:scale-125 transition-transform">🇮🇳</span>
            <div>
              <span className="text-xs font-bold text-white block">Desi Shuttler Pro</span>
              <span className="text-[10px] text-emerald-400">National Circuit</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500/30 hover:border-teal-500 transition-all flex items-center gap-3 cursor-default shadow-sm group">
            <span className="text-2xl group-hover:scale-125 transition-transform">🎯</span>
            <div>
              <span className="text-xs font-bold text-white block">Deceptive Tumbler</span>
              <span className="text-[10px] text-teal-400">Net Tape Drops</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-indigo-500/30 hover:border-indigo-500 transition-all flex items-center gap-3 cursor-default shadow-sm group">
            <span className="text-2xl group-hover:scale-125 transition-transform">🧘</span>
            <div>
              <span className="text-xs font-bold text-white block">Rubber Set Ace</span>
              <span className="text-[10px] text-indigo-400">18-18 Decider Clutch</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/30 hover:border-cyan-500 transition-all flex items-center gap-3 cursor-default shadow-sm group">
            <span className="text-2xl group-hover:scale-125 transition-transform">🛡️</span>
            <div>
              <span className="text-xs font-bold text-white block">Iron Wall Defense</span>
              <span className="text-[10px] text-cyan-400">Dive & Clear</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-yellow-500/30 hover:border-yellow-500 transition-all flex items-center gap-3 cursor-default shadow-sm group">
            <span className="text-2xl group-hover:scale-125 transition-transform">🥇</span>
            <div>
              <span className="text-xs font-bold text-white block">Gold Medal Drive</span>
              <span className="text-[10px] text-yellow-400">Ladder Tier #1</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-500/30 hover:border-purple-500 transition-all flex items-center gap-3 cursor-default shadow-sm group">
            <span className="text-2xl group-hover:scale-125 transition-transform">🏸</span>
            <div>
              <span className="text-xs font-bold text-white block">Shuttle Craftsman</span>
              <span className="text-[10px] text-purple-400">Yonex Feather Specialist</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {editing && (
        <form onSubmit={handleSave} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white">Edit Profile Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Avatar Image URL
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Player Biography
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="10"
                max="90"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Home District / Club
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Preferred Format
              </label>
              <select
                value={preferredPosition}
                onChange={(e) => setPreferredPosition(e.target.value as PreferredPosition)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Singles">Singles</option>
                <option value="Doubles Front">Doubles Front (Net Interceptor)</option>
                <option value="Doubles Back">Doubles Back (Heavy Smasher)</option>
                <option value="Doubles Universal">Doubles Universal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Professional">Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tactical Playing Style
              </label>
              <select
                value={playingStyle}
                onChange={(e) => setPlayingStyle(e.target.value as PlayingStyle)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Aggressive Attacker">Aggressive Attacker (Steep smasher)</option>
                <option value="Tactical Deceiver">Tactical Deceiver (Deceptive slices & net)</option>
                <option value="Defensive Counter-Puncher">Defensive Counter-Puncher (High stamina retriever)</option>
                <option value="All-Rounder">All-Rounder (Balanced court geometry)</option>
                <option value="Fast-Paced Net Dominator">Fast-Paced Net Dominator (Brush kills)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Unlocked Achievements list */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Earned Trophy Milestones</span>
        </h3>

        {achievements.length === 0 ? (
          <p className="text-xs text-slate-400">No achievements recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3"
              >
                <span className="text-2xl">🏆</span>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.achievement?.title}</h4>
                  <p className="text-[11px] text-slate-400">{item.achievement?.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
