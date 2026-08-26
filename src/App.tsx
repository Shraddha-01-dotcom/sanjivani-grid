import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { NetworkMap } from './components/NetworkMap';
import { RequestQueue } from './components/RequestQueue';
import { DecisionLog } from './components/DecisionLog';
import { FleetPanel } from './components/FleetPanel';
import { useSimulation } from './hooks/useSimulation';

export default function App() {
  const {
    graph,
    requests,
    decisions,
    metrics,
    isRunning,
    lastSync,
    activeRoute,
    addEmergency,
    processManually,
    toggleRunning,
  } = useSimulation();

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Header
        lastSync={lastSync}
        isRunning={isRunning}
        onToggle={toggleRunning}
        onNewEmergency={() => addEmergency({ urgency: 'critical' })}
        onRefresh={processManually}
      />

      <MetricsBar metrics={metrics} />

      <main className="flex-1 px-6 pb-6 grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: Map */}
        <div className="xl:col-span-7 min-h-[480px]">
          <NetworkMap graph={graph} activeRoute={activeRoute} />
        </div>

        {/* Right column */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <div className="h-[320px] min-h-[280px]">
            <RequestQueue requests={requests} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="min-h-[260px]">
              <DecisionLog decisions={decisions} />
            </div>
            <div className="min-h-[260px]">
              <FleetPanel graph={graph} />
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-3 border-t border-navy-800 text-[11px] text-slate-600 flex items-center justify-between">
        <span>
          Sanjivani Grid · Capacity-Aware A* · Binary Heap Priority Queue · Demo scale, production algorithms
        </span>
        <span className="font-mono">
          Model: A* · capacity-aware · Auto-refresh {isRunning ? 'ON' : 'PAUSED'}
        </span>
      </footer>
    </div>
  );
}
