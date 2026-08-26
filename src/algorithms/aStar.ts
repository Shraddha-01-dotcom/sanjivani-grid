/**
 * Capacity-Aware A* Pathfinding
 *
 * Standard A* finds the lowest-cost path on a weighted graph.
 * We extend it with capacity awareness:
 *   - Prefer facilities that have beds + required specialist
 *   - Prefer roads that are open over slow/blocked
 *   - Heuristic = Euclidean distance (admissible → optimal)
 *
 * Time Complexity: O((V + E) log V) with binary heap
 * Space Complexity: O(V)
 *
 * Why A* over Dijkstra?
 *   - Heuristic guides search toward goal → fewer nodes expanded
 *   - Still optimal when heuristic is admissible (never overestimates)
 */

import { PriorityQueue } from './priorityQueue';
import type { GraphState, GraphNode } from '../types';

export interface PathResult {
  path: string[];           // node ids from start → goal
  distanceKm: number;
  cost: number;             // weighted cost used by algorithm
  nodesExpanded: number;
  found: boolean;
  reason?: string;
}

function euclidean(a: GraphNode, b: GraphNode): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  // Map percentage to rough km (demo scale: 1 unit ≈ 1.2 km)
  return Math.sqrt(dx * dx + dy * dy) * 1.2;
}

/**
 * Reconstruct path from cameFrom map
 */
function reconstructPath(cameFrom: Map<string, string>, current: string): string[] {
  const path = [current];
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    path.unshift(current);
  }
  return path;
}

/**
 * Core A* search from startId to goalId on the given graph.
 */
export function aStar(
  graph: GraphState,
  startId: string,
  goalId: string
): PathResult {
  const startNode = graph.nodes.get(startId);
  const goalNode = graph.nodes.get(goalId);

  if (!startNode || !goalNode) {
    return { path: [], distanceKm: 0, cost: Infinity, nodesExpanded: 0, found: false, reason: 'Node not found' };
  }

  if (startId === goalId) {
    return { path: [startId], distanceKm: 0, cost: 0, nodesExpanded: 0, found: true };
  }

  const openSet = new PriorityQueue<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>(); // cost from start
  const fScore = new Map<string, number>(); // g + h

  gScore.set(startId, 0);
  fScore.set(startId, euclidean(startNode, goalNode));
  openSet.insert(startId, fScore.get(startId)!);

  const closed = new Set<string>();
  let nodesExpanded = 0;

  while (!openSet.isEmpty()) {
    const current = openSet.extractMin()!;
    nodesExpanded++;

    if (current === goalId) {
      const path = reconstructPath(cameFrom, current);
      let distanceKm = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const neighbors = graph.adjacency.get(path[i]) || [];
        const edge = neighbors.find(n => n.to === path[i + 1]);
        if (edge) distanceKm += edge.distanceKm;
      }
      return {
        path,
        distanceKm: Math.round(distanceKm * 10) / 10,
        cost: gScore.get(goalId)!,
        nodesExpanded,
        found: true,
      };
    }

    closed.add(current);
    const neighbors = graph.adjacency.get(current) || [];

    for (const edge of neighbors) {
      if (edge.status === 'blocked') continue; // hard skip blocked roads
      if (closed.has(edge.to)) continue;

      const tentativeG = (gScore.get(current) ?? Infinity) + edge.weight;

      if (tentativeG < (gScore.get(edge.to) ?? Infinity)) {
        cameFrom.set(edge.to, current);
        gScore.set(edge.to, tentativeG);

        const neighborNode = graph.nodes.get(edge.to);
        const h = neighborNode ? euclidean(neighborNode, goalNode) : 0;
        const f = tentativeG + h;
        fScore.set(edge.to, f);

        // Re-insert (binary heap does not support decrease-key easily;
        // duplicate entries are fine — we skip closed nodes)
        openSet.insert(edge.to, f);
      }
    }
  }

  return {
    path: [],
    distanceKm: 0,
    cost: Infinity,
    nodesExpanded,
    found: false,
    reason: 'No path exists (roads blocked or disconnected)',
  };
}

/**
 * Find the best facility for a request considering:
 * 1. Specialist availability
 * 2. Bed capacity
 * 3. Medicine stock (if required)
 * 4. Travel cost (A*)
 * 5. Current wait / load
 *
 * Returns ranked candidates with reasons.
 */
export function findBestFacility(
  graph: GraphState,
  villageId: string,
  specialistRequired: string,
  medicineRequired?: string
): {
  facilityId: string | null;
  path: PathResult | null;
  score: number;
  reasons: string[];
  alternatives: number;
} {
  const facilities = Array.from(graph.nodes.values()).filter(n => n.type === 'facility');
  const candidates: {
    id: string;
    path: PathResult;
    score: number;
    reasons: string[];
  }[] = [];

  for (const fac of facilities) {
    const reasons: string[] = [];
    let score = 0;

    // Specialist check
    const hasSpecialist = fac.specialists?.includes(specialistRequired) ?? false;
    if (!hasSpecialist) {
      reasons.push(`No ${specialistRequired} on duty`);
      continue; // hard filter
    }
    reasons.push(`${specialistRequired} available`);

    // Bed capacity
    const beds = fac.bedsAvailable ?? 0;
    if (beds <= 0) {
      reasons.push('Beds full');
      continue;
    }
    reasons.push(`${beds} beds free`);
    score += (fac.bedsTotal ?? 10) - beds; // slight preference for less loaded

    // Medicine
    if (medicineRequired) {
      const stock = fac.medicines?.[medicineRequired] ?? 0;
      if (stock <= 0) {
        reasons.push(`${medicineRequired} depleted`);
        continue;
      }
      reasons.push(`${medicineRequired} in stock (${stock})`);
    }

    // Path cost
    const path = aStar(graph, villageId, fac.id);
    if (!path.found) {
      reasons.push(path.reason || 'Unreachable');
      continue;
    }
    reasons.push(`Route ${path.distanceKm} km (${path.nodesExpanded} nodes expanded)`);
    score += path.cost * 10; // travel cost dominates

    candidates.push({ id: fac.id, path, score, reasons });
  }

  if (candidates.length === 0) {
    return {
      facilityId: null,
      path: null,
      score: Infinity,
      reasons: ['No suitable facility found (specialist / beds / medicine / route)'],
      alternatives: 0,
    };
  }

  // Sort by score ascending (lower = better)
  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];

  return {
    facilityId: best.id,
    path: best.path,
    score: best.score,
    reasons: best.reasons,
    alternatives: candidates.length - 1,
  };
}
