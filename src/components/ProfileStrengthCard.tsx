import React from 'react';
import { ProfileStrengthResult } from '../types';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileStrengthCardProps {
  strength: ProfileStrengthResult | null;
  onSelectSection?: (actionKey: string) => void;
  compact?: boolean;
}

export const ProfileStrengthCard: React.FC<ProfileStrengthCardProps> = ({
  strength,
  onSelectSection,
  compact = false,
}) => {
  if (!strength) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-2 bg-slate-100 rounded mb-2"></div>
      </div>
    );
  }

  const { score, levelLabel, completedCount, totalCount, recommendations } = strength;

  // Level Badge Colors
  const getBadgeStyle = () => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (score >= 40) return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const getProgressColor = () => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-teal-500';
    if (score >= 40) return 'bg-sky-500';
    return 'bg-amber-500';
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Profile Strength
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{score}%</h3>
            <span className="text-xs font-medium text-slate-500">
              ({completedCount} of {totalCount} completed)
            </span>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeStyle()}`}
        >
          {levelLabel}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {score === 100 ? (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-100 text-xs text-emerald-800 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Awesome! Your profile is 100% complete and fully optimized for customer trust.</span>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-2 mt-4">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <span>Improve your profile</span>
            <span className="text-slate-400 font-normal">({recommendations.length} suggestions)</span>
          </div>

          <div className={`space-y-2 ${compact ? 'max-h-48 overflow-y-auto pr-1' : ''}`}>
            {recommendations.slice(0, compact ? 3 : 5).map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/60 transition group text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-black text-[10px] flex items-center justify-center shrink-0">
                    +{rec.points}
                  </span>
                  <span className="text-xs text-slate-700 font-medium truncate">{rec.label}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectSection && onSelectSection(rec.actionKey)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 shrink-0 px-2.5 py-1 rounded-xl bg-white border border-slate-200/60 hover:border-emerald-300 shadow-2xs transition cursor-pointer"
                >
                  <span>Complete Now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
