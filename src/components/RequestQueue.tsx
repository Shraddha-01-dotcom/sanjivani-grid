import { AlertCircle, Clock } from 'lucide-react';
import type { PatientRequest } from '../types';

interface RequestQueueProps {
  requests: PatientRequest[];
  onSelect?: (req: PatientRequest) => void;
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  if (urgency === 'critical') return <span className="badge-critical">Critical</span>;
  if (urgency === 'urgent') return <span className="badge-urgent">Urgent</span>;
  return <span className="badge-routine">Routine</span>;
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'assigned' || status === 'en-route' ? 'bg-teal-400' :
    status === 'at-risk' ? 'bg-red-400 animate-pulse' :
    status === 'routing' ? 'bg-amber-400' : 'bg-slate-500';
  return <span className={`w-1.5 h-1.5 rounded-full ${color}`} />;
}

export function RequestQueue({ requests }: RequestQueueProps) {
  const sorted = [...requests]
    .filter(r => r.status !== 'completed')
    .sort((a, b) => {
      const order = { critical: 0, urgent: 1, routine: 2 };
      return (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3) || b.waitMinutes - a.waitMinutes;
    })
    .slice(0, 14);

  const needsDecision = sorted.filter(r => r.status === 'queued' || r.status === 'at-risk').length;

  return (
    <div className="card flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-700/60">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">Request Queue</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Needs a decision · <span className="text-amber-400 font-mono">{needsDecision}</span> / {sorted.length}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 && (
          <div className="p-6 text-center text-slate-500 text-sm">Queue clear</div>
        )}
        {sorted.map(req => (
          <div
            key={req.id}
            className={`px-4 py-3 border-b border-navy-800/80 hover:bg-navy-800/40 transition-colors cursor-default ${
              req.status === 'at-risk' ? 'bg-red-500/5' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-mono text-slate-500">{req.id}</span>
                  <UrgencyBadge urgency={req.urgency} />
                </div>
                <div className="text-sm font-medium text-white truncate">{req.condition}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {req.villageName} · {req.specialistRequired}
                </div>
                {req.decisionReason && (
                  <div className="text-[10px] text-teal-500/80 mt-1 truncate">{req.decisionReason}</div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3" />
                  {Math.round(req.waitMinutes)}m
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusDot status={req.status} />
                  <span className="text-[10px] uppercase text-slate-500">{req.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
