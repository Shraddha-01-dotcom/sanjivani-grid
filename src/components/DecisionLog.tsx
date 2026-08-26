import { ListChecks, Route } from 'lucide-react';
import type { DispatchDecision } from '../types';

interface DecisionLogProps {
  decisions: DispatchDecision[];
}

export function DecisionLog({ decisions }: DecisionLogProps) {
  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-navy-700/60">
        <ListChecks className="w-4 h-4 text-teal-400" />
        <span className="text-sm font-semibold text-white">Decision Log</span>
        <span className="text-[10px] text-slate-500 font-mono ml-auto">{decisions.length} recorded</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {decisions.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-8">
            No dispatches yet. Simulation will generate decisions automatically.
          </div>
        )}
        {decisions.slice(0, 12).map(d => (
          <div key={`${d.requestId}-${d.timestamp}`} className="rounded-lg border border-navy-700/60 bg-navy-950/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-teal-400">{d.requestId}</span>
              <span className="text-[10px] text-slate-500">
                {new Date(d.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white mb-1.5">
              <Route className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{d.chosenFacility}</span>
              <span className="text-slate-500">·</span>
              <span className="text-sky-400 font-mono text-xs">{d.chosenAmbulance}</span>
            </div>
            <div className="text-[11px] text-slate-400 mb-2">
              {d.routeDistanceKm} km · score {d.totalCost.toFixed(0)} · {d.alternativesConsidered} alternatives
            </div>
            <ul className="space-y-0.5">
              {d.reasons.slice(0, 4).map((r, i) => (
                <li key={i} className="text-[10px] text-slate-500 flex gap-1.5">
                  <span className="text-teal-600">→</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 text-[9px] uppercase tracking-wider text-slate-600 font-mono">
              {d.algorithm}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
