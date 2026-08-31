import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, RefreshCw } from 'lucide-react';

interface RiskReasonsProps {
  reasons: string[] | undefined;
  riskLevel: string;
}

export default function RiskReasons({ reasons, riskLevel }: RiskReasonsProps) {
  const [expanded, setExpanded] = useState(true);

  if (!reasons || reasons.length === 0) return null;

  const isPending = riskLevel === 'PENDING' || riskLevel === 'CALCULATING';
  const isHighOrExtreme = riskLevel === 'HIGH' || riskLevel === 'EXTREME';
  const isModerate = riskLevel === 'MODERATE';

  const getReasonStyle = (reason: string) => {
    if (isPending) {
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200/80 animate-pulse',
        Icon: RefreshCw,
        iconColor: 'text-blue-500 animate-spin',
      };
    }
    const lower = reason.toLowerCase();
    if (lower.includes('extreme') || lower.includes('critical') || lower.includes('high') || isHighOrExtreme) {
      return {
        bg: 'bg-red-50 text-red-800 border-red-200',
        Icon: AlertTriangle,
        iconColor: 'text-red-500',
      };
    }
    if (lower.includes('moderate') || lower.includes('elevated') || lower.includes('overlap') || isModerate) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        Icon: AlertTriangle,
        iconColor: 'text-amber-500',
      };
    }
    return {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      Icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    };
  };

  const headerIconColor = isPending
    ? 'text-blue-500 animate-spin'
    : isHighOrExtreme
    ? 'text-red-500'
    : isModerate
    ? 'text-amber-500'
    : 'text-emerald-500';

  const HeaderIcon = isPending ? RefreshCw : AlertTriangle;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-2">
          <HeaderIcon className={`w-4 h-4 ${headerIconColor}`} />
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
          {reasons.map((reason, idx) => {
            const style = getReasonStyle(reason);
            const ItemIcon = style.Icon;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-start gap-2.5 transition-all ${style.bg}`}
              >
                <ItemIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
                <span className="leading-relaxed">{reason}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
