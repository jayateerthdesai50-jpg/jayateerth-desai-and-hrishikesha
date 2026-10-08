import React from 'react';
import { BookOpen, CheckCircle2, Shield, Activity, Database, Cpu, Layers } from 'lucide-react';

export const ResearchPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16 text-slate-200">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Academic & Sports Engineering Context</span>
          <span>·</span>
          <span>Applied Systems Design</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Research Motivation & System Architecture
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
          An engineering analysis of traditional badminton facility bottlenecks, manual coordination friction, and how RallySphere provides a cohesive digital architecture for court reservations, matchmaking, and data-driven performance analytics.
        </p>
      </div>

      {/* Section 1: Research Motivation and Existing System Limitations */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <span className="text-emerald-400">01.</span>
          <span>Research Motivation and Existing System Limitations</span>
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Badminton is one of the fastest-growing and highest-velocity racket sports globally, yet recreational and club infrastructure suffers from severe operational fragmentation. In existing real-world club workflows, court reservations are predominantly conducted via phone calls, localized WhatsApp/chat groups, or siloed venue-specific forms.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Existing System Limitations
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Double Booking Vulnerabilities:</strong> Concurrency race conditions when venues update availability manually across different phone and web channels.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Siloed Player Coordination:</strong> Players lack transparent rosters, skill tier calibrations, or unified invitation channels.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Loss of Historical Match Data:</strong> Scores are recorded on physical paper or forgotten immediately after games, preventing longitudinal progress tracking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Absence of Accessible Sports Analytics:</strong> Video analysis tools and kinematic sensors remain restricted to national elite teams.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                The RallySphere Technological Paradigm
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Deterministic Anti-Double Booking Guard:</strong> Database-level slot validation rejecting concurrent collision requests.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Unified Player Roster & Skill Tiers:</strong> Standardized BWF classification (Beginner to Professional) with verified playing styles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Algorithmic Performance Index:</strong> Multi-factor mathematical scoring grounded in real match sets, recent form, and streak stability.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>AI Coach Diagnostic Engine:</strong> Server-side synthesis translating raw match data into actionable practice prescriptions.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Mathematical Scoring Methodology */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <span className="text-emerald-400">02.</span>
          <span>Algorithmic Performance Score Formulation</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Traditional sports apps often rely on simple binary win/loss tallies. RallySphere establishes a continuous, normalized performance metric calculated across four weighted vectors:
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300">
          Performance Score = (Win Rate × 0.40) + (Recent Form Factor × 0.25) + (Match Consistency × 0.20) + (Game Margin × 0.15)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white">1. Win Rate Weight (40%)</span>
            <p className="text-slate-400">
              Evaluates overall historical competitive win percentage across all sanctioned singles and doubles fixtures.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white">2. Recent Form Factor (25%)</span>
            <p className="text-slate-400">
              Captures momentum by weighting the outcome of the player's last 5 fixtures to reflect current physical conditioning.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white">3. Match Consistency (20%)</span>
            <p className="text-slate-400">
              Awards volume stability and regular participation, preventing sample-size distortions from 1-match records.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-white">4. Game Set Margin (15%)</span>
            <p className="text-slate-400">
              Assesses resilience in deciding sets by calculating total games won versus conceded across multi-set rubbers.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: AI Integration & Fallback Guarantees */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <span className="text-emerald-400">03.</span>
          <span>RallySphere AI Coach: Hybrid LLM & Rule-Based Fallback</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The RallySphere AI Coach utilizes the latest `@google/genai` TypeScript SDK on the server-side to ground analysis strictly in the player's actual recorded sets, tactical playing style, and conversion rates. When external AI APIs are unconfigured or unavailable, an internal sports science rule-based engine immediately provides deterministic tactical recommendations without breaking user experience.
        </p>
      </div>
    </div>
  );
};
