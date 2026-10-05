import React, { useState } from 'react';
import { TrustScoreResult } from '../types';
import { ShieldCheck, Info, ChevronDown, ChevronUp, Check, Star, Briefcase, Award } from 'lucide-react';

interface TrustScoreCardProps {
  trust: TrustScoreResult | null;
  compact?: boolean;
}

export const TrustScoreCard: React.FC<TrustScoreCardProps> = ({ trust, compact = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  if (!trust) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-100 rounded mb-2"></div>
      </div>
    );
  }

  const { score, trustBadgeText, trustDescription, isNewProfessional, tooltipText, signals, publicSummary } = trust;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Trust Score</span>
            <div className="relative inline-block">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-500 hover:text-slate-800 transition p-0.5"
                aria-label="Trust Score information"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2.5 bg-slate-900 text-white text-[11px] font-normal leading-relaxed rounded-xl shadow-xl z-30">
                  {tooltipText}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-2.5 mt-1.5">
            {isNewProfessional ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">New Professional</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Identity Verified
                </span>
              </div>
            ) : (
              <>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {score}
                  <span className="text-base text-slate-500 font-semibold">/100</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {trustBadgeText}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>
      </div>

      <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">{trustDescription}</p>

      {/* Verified Badges Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {publicSummary.digilockerVerified ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/80">
            <Check className="w-3 h-3 text-emerald-600" />
            DigiLocker Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 text-slate-500 text-[11px] font-medium border border-slate-200/80">
            DigiLocker Unverified
          </span>
        )}

        {publicSummary.mobileVerified && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 text-[11px] font-bold border border-sky-200/80">
            <Check className="w-3 h-3 text-sky-600" />
            Mobile Verified
          </span>
        )}

        {publicSummary.emailVerified && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-800 text-[11px] font-bold border border-indigo-200/80">
            <Check className="w-3 h-3 text-indigo-600" />
            Email Verified
          </span>
        )}
      </div>

      {/* Supporting Signals Snapshot */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center mb-4">
        <div>
          <div className="text-[11px] text-slate-500 font-medium">Rating</div>
          <div className="text-xs font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {publicSummary.rating > 0 ? publicSummary.rating.toFixed(1) : 'New'}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 font-medium">Jobs</div>
          <div className="text-xs font-black text-slate-900 flex items-center justify-center gap-1 mt-0.5">
            <Briefcase className="w-3 h-3 text-slate-500" />
            {publicSummary.completedJobsCount}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 font-medium">Experience</div>
          <div className="text-xs font-black text-slate-900 mt-0.5">
            {publicSummary.yearsOfExperience} yrs
          </div>
        </div>
      </div>

      {/* Expand Details Toggle */}
      {!compact && (
        <>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 pt-2 border-t border-slate-100 cursor-pointer"
          >
            <span>Trust Signals Breakdown ({signals.length})</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2 pt-2 animate-in fade-in duration-200">
              {signals.map((sig) => (
                <div
                  key={sig.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100/80 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-800 truncate">{sig.name}</div>
                    <div className="text-[11px] text-slate-500">{sig.description}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-black ${sig.isVerified ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {sig.points}/{sig.maxPoints} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
