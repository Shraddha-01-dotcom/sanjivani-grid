import { Ambulance, Building2 } from 'lucide-react';
import type { GraphState } from '../types';

interface FleetPanelProps {
  graph: GraphState;
}

export function FleetPanel({ graph }: FleetPanelProps) {
  const ambulances = Array.from(graph.nodes.values()).filter(n => n.type === 'ambulance');
  const facilities = Array.from(graph.nodes.values()).filter(n => n.type === 'facility');

  return (
    <div className="card p-4 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Ambulance className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-semibold text-white">Fleet Status</span>
        </div>
        <div className="space-y-2">
          {ambulances.map(a => (
            <div key={a.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  a.status === 'Available' ? 'bg-emerald-400' :
                  a.status === 'En route' ? 'bg-orange-400' : 'bg-slate-500'
                }`} />
                <span className="font-mono text-slate-300">{a.callSign}</span>
              </div>
              <span className={`text-xs ${
                a.status === 'Available' ? 'text-emerald-400' :
                a.status === 'En route' ? 'text-orange-400' : 'text-slate-500'
              }`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-navy-700/60 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-semibold text-white">Facility Capacity</span>
        </div>
        <div className="space-y-2.5">
          {facilities.map(f => {
            const pct = f.bedsTotal ? Math.round(((f.bedsAvailable ?? 0) / f.bedsTotal) * 100) : 0;
            return (
              <div key={f.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 truncate max-w-[140px]">{f.name}</span>
                  <span className="font-mono text-slate-400">
                    {f.bedsAvailable}/{f.bedsTotal}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-navy-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct === 0 ? 'bg-red-500' : pct < 30 ? 'bg-orange-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
