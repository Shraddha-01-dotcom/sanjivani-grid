import { AlertTriangle, Clock, Ambulance, Timer, TrendingDown, ShieldAlert } from 'lucide-react';
import type { SimulationMetrics } from '../types';

interface MetricsBarProps {
  metrics: SimulationMetrics;
}

const items = [
  { key: 'activeIncidents', label: 'Active Incidents', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  { key: 'queuedRequests', label: 'Queued Requests', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { key: 'availableAmbulances', label: 'Ambulances Ready', icon: Ambulance, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { key: 'avgWaitMinutes', label: 'Average Wait', icon: Timer, color: 'text-sky-400', bg: 'bg-sky-500/10', suffix: 'm' },
  { key: 'costSavedPercent', label: 'Cost Avoided', icon: TrendingDown, color: 'text-emerald-400', bg: 'bg-emerald-500/10', suffix: '%' },
  { key: 'slaAtRisk', label: 'SLA at Risk', icon: ShieldAlert, color: 'text-orange-400', bg: 'bg-orange-500/10' },
] as const;

export function MetricsBar({ metrics }: MetricsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 px-6 py-4">
      {items.map(({ key, label, icon: Icon, color, bg, suffix }) => (
        <div key={key} className="metric-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{label}</span>
            <div className={`w-7 h-7 rounded-md ${bg} flex items-center justify-center`}>
              <Icon className={`w-3.5 h-3.5 ${color}`} />
            </div>
          </div>
          <div className="text-2xl font-display font-bold text-white tabular-nums">
            {typeof metrics[key] === 'number'
              ? Number.isInteger(metrics[key])
                ? metrics[key]
                : (metrics[key] as number).toFixed(1)
              : metrics[key]}
            {suffix && <span className="text-base font-medium text-slate-400 ml-0.5">{suffix}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
