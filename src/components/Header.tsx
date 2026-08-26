import { Activity, RefreshCw, Plus, Pause, Play } from 'lucide-react';

interface HeaderProps {
  lastSync: Date;
  isRunning: boolean;
  onToggle: () => void;
  onNewEmergency: () => void;
  onRefresh: () => void;
}

export function Header({ lastSync, isRunning, onToggle, onNewEmergency, onRefresh }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-navy-700/60 bg-navy-900/40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
            <Activity className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">
              District · Madhya Zone
            </div>
            <h1 className="text-xl font-display font-semibold text-white leading-tight">
              Sanjivani Grid
            </h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">Network Operational</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Last Sync</div>
          <div className="text-sm font-mono text-slate-300">
            {lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        <button
          onClick={onToggle}
          className="p-2 rounded-lg border border-navy-700 hover:border-teal-500/40 hover:bg-navy-800 transition-colors"
          title={isRunning ? 'Pause simulation' : 'Resume simulation'}
        >
          {isRunning ? <Pause className="w-4 h-4 text-slate-400" /> : <Play className="w-4 h-4 text-teal-400" />}
        </button>

        <button
          onClick={onRefresh}
          className="p-2 rounded-lg border border-navy-700 hover:border-teal-500/40 hover:bg-navy-800 transition-colors"
          title="Force process next request"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={onNewEmergency}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-500/20"
        >
          <Plus className="w-4 h-4" />
          New Emergency
        </button>
      </div>
    </header>
  );
}
