import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface RiskReasonsProps {
  reasons: string[] | undefined;
  riskLevel: string;
}

export default function RiskReasons({ reasons, riskLevel }: RiskReasonsProps) {
  const [expanded, setExpanded] = useState(true);

  if (!reasons || reasons.length === 0) return null;

  const isHighOrExtreme = riskLevel === 'HIGH' || riskLevel === 'EXTREME';
  const isModerate = riskLevel === 'MODERATE';

  const badgeBg = isHighOrExtreme
    ? 'bg-red-50 text-red-700 border-red-200'
    : isModerate
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const iconColor = isHighOrExtreme ? 'text-red-500' : isModerate ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="mt-4 pt-4 border-t border-slate-200/80">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${iconColor}`} />
          <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-950 transition-colors">
            Risk Assessment Breakdown & Contributing Factors ({reasons.length})
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-slate-700 font-medium">
          <span>{expanded ? 'Hide Details' : 'Show Details'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {reasons.map((reason, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-start gap-2.5 transition-all ${badgeBg}`}
            >
              {isHighOrExtreme || isModerate ? (
                <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
              ) : (
                <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
              )}
              <span className="leading-relaxed">{reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
