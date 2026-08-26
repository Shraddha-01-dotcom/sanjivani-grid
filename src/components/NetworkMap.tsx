import { useMemo } from 'react';
import type { GraphState, GraphNode } from '../types';

interface NetworkMapProps {
  graph: GraphState;
  activeRoute: string[] | null;
  selectedRequestVillage?: string;
}

export function NetworkMap({ graph, activeRoute }: NetworkMapProps) {
  const nodes = useMemo(() => Array.from(graph.nodes.values()), [graph]);
  const villages = nodes.filter(n => n.type === 'village');
  const facilities = nodes.filter(n => n.type === 'facility');
  const ambulances = nodes.filter(n => n.type === 'ambulance');

  // Build path segments for active route
  const routeSegments = useMemo(() => {
    if (!activeRoute || activeRoute.length < 2) return [];
    const segs: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < activeRoute.length - 1; i++) {
      const a = graph.nodes.get(activeRoute[i]);
      const b = graph.nodes.get(activeRoute[i + 1]);
      if (a && b) segs.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
    return segs;
  }, [activeRoute, graph]);

  // Draw roads (only open/slow for visual clarity)
  const roadLines = useMemo(() => {
    return graph.roads
      .filter(r => r.status !== 'blocked')
      .map(r => {
        const a = graph.nodes.get(r.from);
        const b = graph.nodes.get(r.to);
        if (!a || !b) return null;
        return {
          key: `${r.from}-${r.to}`,
          x1: a.x, y1: a.y, x2: b.x, y2: b.y,
          slow: r.status === 'slow',
        };
      })
      .filter(Boolean) as { key: string; x1: number; y1: number; x2: number; y2: number; slow: boolean }[];
  }, [graph]);

  return (
    <div className="card relative overflow-hidden h-full min-h-[420px]">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-navy-900 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-teal-500/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Live Network</div>
            <div className="text-[10px] text-slate-500 font-mono">
              {nodes.length} nodes · {graph.roads.length} edges · capacity-aware A*
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Village
          </span>
          <span className="flex items-center gap-1.5 text-teal-400">
            <span className="w-2 h-2 rounded-full bg-teal-400" /> Facility
          </span>
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400" /> Ambulance
          </span>
        </div>
      </div>

      {/* SVG Map */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ background: 'radial-gradient(ellipse at center, #0f172a 0%, #0a0f1a 100%)' }}
      >
        {/* Grid */}
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#1e293b" strokeWidth="0.15" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Roads */}
        {roadLines.map(r => (
          <line
            key={r.key}
            x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
            stroke={r.slow ? '#64748b' : '#334155'}
            strokeWidth={r.slow ? 0.35 : 0.25}
            strokeDasharray={r.slow ? '1 0.8' : undefined}
            opacity={0.7}
          />
        ))}

        {/* Active route highlight */}
        {routeSegments.map((s, i) => (
          <line
            key={`route-${i}`}
            x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke="#2dd4bf"
            strokeWidth="0.7"
            strokeDasharray="1.5 1"
            className="animate-route-dash"
            filter="url(#glow)"
          />
        ))}

        {/* Villages */}
        {villages.map(v => (
          <g key={v.id}>
            <circle cx={v.x} cy={v.y} r="1.8" fill="#f59e0b" opacity="0.9" />
            <circle cx={v.x} cy={v.y} r="2.8" fill="none" stroke="#f59e0b" strokeWidth="0.3" opacity="0.4" />
            <text x={v.x} y={v.y + 4.2} textAnchor="middle" fill="#94a3b8" fontSize="2.2" fontFamily="DM Mono">
              {v.name}
            </text>
          </g>
        ))}

        {/* Facilities */}
        {facilities.map(f => (
          <g key={f.id}>
            <rect
              x={f.x - 2} y={f.y - 2}
              width="4" height="4"
              rx="0.6"
              fill={f.bedsAvailable === 0 ? '#475569' : '#14b8a6'}
              opacity="0.95"
            />
            <text x={f.x} y={f.y + 5.5} textAnchor="middle" fill="#64748b" fontSize="1.8" fontFamily="DM Mono">
              {f.name.split(' ')[0]}
            </text>
          </g>
        ))}

        {/* Ambulances */}
        {ambulances.map(a => (
          <g key={a.id}>
            <circle
              cx={a.x} cy={a.y} r="1.6"
              fill={a.status === 'Available' ? '#38bdf8' : a.status === 'En route' ? '#f97316' : '#64748b'}
            />
            <text x={a.x} y={a.y - 2.8} textAnchor="middle" fill="#94a3b8" fontSize="1.6" fontFamily="DM Mono">
              {a.callSign}
            </text>
          </g>
        ))}
      </svg>

      {/* Active route badge */}
      {activeRoute && activeRoute.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-xs card p-3 border-teal-500/30 bg-navy-900/95">
          <div className="text-[10px] uppercase tracking-wider text-teal-400 font-semibold mb-1">Active Route</div>
          <div className="text-xs text-slate-300 font-mono truncate">
            {activeRoute.map(id => graph.nodes.get(id)?.name || id).join(' → ')}
          </div>
        </div>
      )}
    </div>
  );
}
