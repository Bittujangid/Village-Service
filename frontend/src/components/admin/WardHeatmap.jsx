import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Flame, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert,
  Building,
  Activity
} from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

const getCategoryEmoji = (category) => {
  if (!category || category === 'कोई नहीं') return '📋';
  if (category.includes('पानी')) return '💧';
  if (category.includes('बिजली')) return '⚡';
  if (category.includes('सड़क')) return '🛣️';
  if (category.includes('सफाई')) return '🧹';
  return '📋';
};

const WardHeatmap = ({ 
  wardBreakdown = [], 
  criticalWard = 1, 
  selectedWard = null, 
  onSelectWard = () => {} 
}) => {
  const { lang, t } = useLang();

  // Helper to determine ward severity tier
  const getSeverityTier = (ward) => {
    const { totalComplaints, openCount, resolutionRate, wardNumber } = ward;
    
    // If 0 total complaints or 0 open complaints, optimal
    if (totalComplaints === 0 || openCount === 0) {
      return {
        tier: 'optimal',
        bgClass: 'bg-emerald-50/80 hover:bg-emerald-50',
        borderClass: 'border-emerald-300/80 hover:border-emerald-400',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        badgeText: lang === 'hi' ? 'संतोषजनक' : 'Optimal',
        icon: CheckCircle2,
        iconColor: 'text-emerald-600',
      };
    }

    // High urgency: resolutionRate < 50% or severityScore >= 1.2 or isCriticalWard with open backlog
    if (resolutionRate < 50 || ward.severityScore >= 1.2 || (wardNumber === criticalWard && openCount >= 2)) {
      return {
        tier: 'critical',
        bgClass: 'bg-rose-50/90 hover:bg-rose-50',
        borderClass: 'border-rose-300/90 hover:border-rose-400',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
        badgeText: lang === 'hi' ? 'अति संवेदनशील' : 'High Urgency',
        icon: Flame,
        iconColor: 'text-rose-600',
      };
    }

    // Moderate tier (default when there are open complaints with 50-79% resolution)
    return {
      tier: 'moderate',
      bgClass: 'bg-amber-50/80 hover:bg-amber-50',
      borderClass: 'border-amber-300/80 hover:border-amber-400',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      badgeText: lang === 'hi' ? 'मध्यम लोड' : 'Moderate',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    };
  };

  return (
    <div className="space-y-4">
      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" />
              <span>{t.wardHeatmapTitle} (Wards 1–7)</span>
            </h3>
            {criticalWard && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>{lang === 'hi' ? `वार्ड ${criticalWard} सर्वाधिक संवेदनशील` : `Ward ${criticalWard} Highest Priority`}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.wardHeatmapDesc}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100/80 border border-emerald-300 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            {t.normalStatus}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            {t.moderateStatus}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100/80 border border-rose-300 text-rose-800">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            {t.criticalStatus}
          </span>
        </div>
      </div>

      {/* Grid of 7 Wards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wardBreakdown.map((ward) => {
          const config = getSeverityTier(ward);
          const TierIcon = config.icon;
          const isSelected = Number(selectedWard) === Number(ward.wardNumber);

          return (
            <div
              key={ward.wardNumber}
              onClick={() => onSelectWard(ward.wardNumber)}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 shadow-xs hover:shadow-md ${config.bgClass} ${config.borderClass} ${
                isSelected ? 'ring-3 ring-emerald-500 ring-offset-2 scale-[1.02]' : ''
              }`}
            >
              {/* Card Header: Ward Number + Status Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center font-black text-slate-800 text-sm">
                    W{ward.wardNumber}
                  </div>
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {lang === 'hi' ? `वार्ड ${ward.wardNumber}` : `Ward ${ward.wardNumber}`}
                  </span>
                </div>

                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeBg}`}>
                  <TierIcon className="w-3 h-3" />
                  <span>{config.badgeText}</span>
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-white/80 rounded-xl border border-slate-200/60 text-center mb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {lang === 'hi' ? 'कुल' : 'Total'}
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {ward.totalComplaints}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">
                    {lang === 'hi' ? 'लंबित' : 'Pending'}
                  </span>
                  <span className="text-base font-black text-amber-700">
                    {ward.pending}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                    {lang === 'hi' ? 'निस्तारित' : 'Solved'}
                  </span>
                  <span className="text-base font-black text-emerald-700">
                    {ward.resolved}
                  </span>
                </div>
              </div>

              {/* Top Issue Category */}
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span className="text-slate-500 text-[11px] font-medium">
                  {t.topProblemCategory}:
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1 truncate max-w-[140px]">
                  <span>{getCategoryEmoji(ward.topCategory)}</span>
                  <span className="truncate">{ward.topCategory}</span>
                </span>
              </div>

              {/* Progress Bar (Resolution %) */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                  <span>{t.resolutionRate}</span>
                  <span className="font-bold text-slate-800">{ward.resolutionRate}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ward.resolutionRate >= 80
                        ? 'bg-emerald-600'
                        : ward.resolutionRate >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${ward.resolutionRate}%` }}
                  />
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-emerald-800 hover:text-emerald-950">
                <span>{t.filterByWard}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WardHeatmap;
