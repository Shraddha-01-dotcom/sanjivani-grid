import { useState, useEffect, useCallback, useRef } from 'react';
import { DispatchEngine } from '../algorithms/dispatcher';
import { buildGraphState, INITIAL_REQUESTS, createRandomRequest, AMBULANCES } from '../data/mockGraph';
import type { GraphState, PatientRequest, DispatchDecision, SimulationMetrics, GraphNode } from '../types';

export function useSimulation() {
  const engineRef = useRef(new DispatchEngine());
  const [graph, setGraph] = useState<GraphState>(() => buildGraphState());
  const [requests, setRequests] = useState<PatientRequest[]>([...INITIAL_REQUESTS]);
  const [decisions, setDecisions] = useState<DispatchDecision[]>([]);
  const [metrics, setMetrics] = useState<SimulationMetrics>(engineRef.current.getMetrics());
  const [isRunning, setIsRunning] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [activeRoute, setActiveRoute] = useState<string[] | null>(null);
  const requestCounter = useRef(0);

  // Bootstrap queue
  useEffect(() => {
    engineRef.current.rebuildQueue(INITIAL_REQUESTS);
    setMetrics(engineRef.current.getMetrics());
  }, []);

  // Live simulation tick
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Age existing queued requests
      setRequests(prev =>
        prev.map(r =>
          r.status === 'queued' || r.status === 'at-risk'
            ? { ...r, waitMinutes: r.waitMinutes + 0.5 }
            : r
        )
      );

      // Occasionally process next request
      if (Math.random() > 0.55) {
        const result = engineRef.current.processNext(graph);
        if (result.updatedRequest) {
          setRequests(prev => {
            const without = prev.filter(r => r.id !== result.updatedRequest!.id);
            return [result.updatedRequest!, ...without];
          });
          if (result.decision) {
            setDecisions(engineRef.current.getDecisions());
            setActiveRoute(result.updatedRequest.route || null);
            // Briefly mark ambulance as busy
            setGraph(g => {
              const nodes = new Map(g.nodes);
              if (result.updatedRequest?.assignedAmbulanceId) {
                const amb = nodes.get(result.updatedRequest.assignedAmbulanceId);
                if (amb) {
                  nodes.set(amb.id, { ...amb, status: 'En route' });
                }
              }
              // Decrement bed if facility assigned
              if (result.updatedRequest?.assignedFacilityId) {
                const fac = nodes.get(result.updatedRequest.assignedFacilityId);
                if (fac && fac.bedsAvailable !== undefined && fac.bedsAvailable > 0) {
                  nodes.set(fac.id, { ...fac, bedsAvailable: fac.bedsAvailable - 1 });
                }
              }
              return { ...g, nodes };
            });
          }
        }
      }

      // Random new request
      if (Math.random() > 0.78) {
        requestCounter.current += 1;
        const newReq = createRandomRequest(requestCounter.current);
        engineRef.current.enqueue(newReq);
        setRequests(prev => [newReq, ...prev].slice(0, 40));
      }

      // Occasionally free an ambulance
      if (Math.random() > 0.85) {
        setGraph(g => {
          const nodes = new Map(g.nodes);
          const busy = Array.from(nodes.values()).filter(n => n.type === 'ambulance' && n.status === 'En route');
          if (busy.length > 0) {
            const pick = busy[Math.floor(Math.random() * busy.length)];
            nodes.set(pick.id, { ...pick, status: 'Available' });
          }
          return { ...g, nodes };
        });
      }

      // Update metrics
      const m = engineRef.current.getMetrics();
      const available = Array.from(graph.nodes.values()).filter(
        n => n.type === 'ambulance' && n.status === 'Available'
      ).length;
      const queued = requests.filter(r => r.status === 'queued' || r.status === 'at-risk').length;
      const atRisk = requests.filter(r => r.status === 'at-risk' || (r.urgency === 'critical' && r.waitMinutes > 15)).length;
      const avgWait =
        requests.length > 0
          ? requests.reduce((s, r) => s + r.waitMinutes, 0) / requests.length
          : 0;

      setMetrics({
        ...m,
        availableAmbulances: available,
        queuedRequests: queued,
        activeIncidents: requests.filter(r => r.status !== 'completed').length,
        avgWaitMinutes: Math.round(avgWait * 10) / 10,
        slaAtRisk: atRisk,
      });

      setLastSync(new Date());
    }, 2200);

    return () => clearInterval(interval);
  }, [isRunning, graph, requests]);

  const addEmergency = useCallback((partial?: Partial<PatientRequest>) => {
    requestCounter.current += 1;
    const base = createRandomRequest(requestCounter.current);
    const req: PatientRequest = {
      ...base,
      ...partial,
      id: `REQ-${3000 + requestCounter.current}`,
      urgency: partial?.urgency || 'critical',
      waitMinutes: 0,
      status: 'queued',
      createdAt: Date.now(),
    };
    engineRef.current.enqueue(req);
    setRequests(prev => [req, ...prev]);
  }, []);

  const processManually = useCallback(() => {
    const result = engineRef.current.processNext(graph);
    if (result.updatedRequest) {
      setRequests(prev => {
        const without = prev.filter(r => r.id !== result.updatedRequest!.id);
        return [result.updatedRequest!, ...without];
      });
      if (result.decision) {
        setDecisions(engineRef.current.getDecisions());
        setActiveRoute(result.updatedRequest.route || null);
      }
      setMetrics(engineRef.current.getMetrics());
    }
  }, [graph]);

  const toggleRunning = () => setIsRunning(r => !r);

  const getNode = (id: string): GraphNode | undefined => graph.nodes.get(id);

  return {
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
    getNode,
  };
}
