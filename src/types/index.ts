export type Urgency = 'critical' | 'urgent' | 'routine';

export type NodeType = 'village' | 'facility' | 'ambulance';

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  x: number; // 0-100 percentage for map
  y: number;
  // Facility specific
  bedsAvailable?: number;
  bedsTotal?: number;
  specialists?: string[];
  medicines?: Record<string, number>; // medicine name -> stock
  status?: string;
  // Ambulance specific
  callSign?: string;
  capacity?: number;
  etaMinutes?: number;
  // Village specific
  pendingRequests?: number;
}

export interface Road {
  from: string;
  to: string;
  distanceKm: number;
  status: 'open' | 'slow' | 'blocked';
  weight: number; // effective cost (distance * status multiplier)
}

export interface PatientRequest {
  id: string;
  villageId: string;
  villageName: string;
  condition: string;
  urgency: Urgency;
  specialistRequired: string;
  medicineRequired?: string;
  waitMinutes: number;
  status: 'queued' | 'routing' | 'assigned' | 'en-route' | 'completed' | 'at-risk';
  createdAt: number;
  assignedAmbulanceId?: string;
  assignedFacilityId?: string;
  route?: string[]; // node ids
  decisionReason?: string;
  estimatedEta?: number;
  costScore?: number;
}

export interface DispatchDecision {
  requestId: string;
  timestamp: number;
  chosenFacility: string;
  chosenAmbulance: string;
  routeDistanceKm: number;
  totalCost: number;
  reasons: string[];
  alternativesConsidered: number;
  algorithm: string;
}

export interface SimulationMetrics {
  activeIncidents: number;
  queuedRequests: number;
  availableAmbulances: number;
  avgWaitMinutes: number;
  costSavedPercent: number;
  slaAtRisk: number;
  totalDispatches: number;
  avgRouteMs: number;
}

export interface GraphState {
  nodes: Map<string, GraphNode>;
  roads: Road[];
  adjacency: Map<string, { to: string; weight: number; distanceKm: number; status: string }[]>;
}
