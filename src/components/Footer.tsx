import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Calendar, Trophy, Swords, BookOpen, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏸</span>
              <span className="text-lg font-bold text-white tracking-tight">RallySphere</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integrated badminton court booking, player matchmaking, real-time match scoring, and performance analytics platform.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Full-Stack REST Architecture Active</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Player Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/courts" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-500" />
                  <span>Court Discovery & Booking</span>
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reservation Management</span>
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-slate-500" />
                  <span>Match Scheduling & Scores</span>
                </Link>
              </li>
              <li>
                <Link to="/performance" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Performance & AI Coach</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Facility & Research */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Facility & Science
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/admin" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Facility Management Portal</span>
                </Link>
              </li>
              <li>
                <Link to="/research" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Research Motivation & Limits</span>
                </Link>
              </li>
              <li>
                <span className="text-slate-400">BWF Synthetic Mat Standards</span>
              </li>
              <li>
                <span className="text-slate-400">Anti-Double Booking Guard</span>
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Platform Architecture
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p>• Node.js & Express.js REST Engine</p>
              <p>• Persistent Normalized JSON Database</p>
              <p>• JWT Authentication & Role Guards</p>
              <p>• Google Gemini API Integration Layer</p>
              <p>• BWF Regulation Badminton Scoring</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 RallySphere Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Play. Rally. Improve.</span>
            <span>·</span>
            <span>Zero-pill Athletic SaaS Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
