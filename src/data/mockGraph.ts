/**
 * Demo-scale graph for Sanjivani Grid.
 * Algorithms are identical to what would run on 50k+ nodes.
 * Coordinates are percentage-based (0-100) for the map.
 */

import type { GraphNode, Road, PatientRequest, GraphState } from '../types';

export const VILLAGES: GraphNode[] = [
  { id: 'v-dharampur', name: 'Dharampur', type: 'village', x: 18, y: 28, pendingRequests: 0 },
  { id: 'v-kalyanpur', name: 'Kalyanpur', type: 'village', x: 32, y: 68, pendingRequests: 0 },
  { id: 'v-bela', name: 'Bela', type: 'village', x: 52, y: 38, pendingRequests: 0 },
  { id: 'v-sonari', name: 'Sonari', type: 'village', x: 74, y: 72, pendingRequests: 0 },
  { id: 'v-nandgaon', name: 'Nandgaon', type: 'village', x: 88, y: 30, pendingRequests: 0 },
  { id: 'v-rampur', name: 'Rampur', type: 'village', x: 42, y: 55, pendingRequests: 0 },
  { id: 'v-sikandra', name: 'Sikandra', type: 'village', x: 22, y: 48, pendingRequests: 0 },
  { id: 'v-mahuli', name: 'Mahuli', type: 'village', x: 65, y: 22, pendingRequests: 0 },
];

export const FACILITIES: GraphNode[] = [
  {
    id: 'f-rural-b',
    name: 'Rural Health Point B',
    type: 'facility',
    x: 40,
    y: 22,
    bedsAvailable: 8,
    bedsTotal: 12,
    specialists: ['General medicine', 'Pediatrics'],
    medicines: { ORS: 40, Amoxicillin: 25, Paracetamol: 60 },
    status: 'No cardiology',
  },
  {
    id: 'f-kaveri',
    name: 'Kaveri District Hospital',
    type: 'facility',
    x: 68,
    y: 45,
    bedsAvailable: 18,
    bedsTotal: 24,
    specialists: ['Cardiology', 'General medicine', 'Emergency', 'Neurology'],
    medicines: { Aspirin: 30, Heparin: 12, Amoxicillin: 40, Insulin: 15 },
    status: 'Specialist on duty',
  },
  {
    id: 'f-sonari-cc',
    name: 'Sonari Community Center',
    type: 'facility',
    x: 70,
    y: 80,
    bedsAvailable: 3,
    bedsTotal: 10,
    specialists: ['General medicine', 'Obstetrics'],
    medicines: { ORS: 20, Oxytocin: 8, Paracetamol: 35 },
    status: 'Operating',
  },
  {
    id: 'f-nandgaon',
    name: 'Nandgaon Medical Hub',
    type: 'facility',
    x: 90,
    y: 55,
    bedsAvailable: 0,
    bedsTotal: 18,
    specialists: ['Cardiology', 'Neurology', 'Emergency'],
    medicines: { Aspirin: 5, Heparin: 2, Insulin: 8 },
    status: 'Beds full',
  },
  {
    id: 'f-central',
    name: 'Central Trauma Center',
    type: 'facility',
    x: 48,
    y: 48,
    bedsAvailable: 11,
    bedsTotal: 20,
    specialists: ['Emergency', 'Cardiology', 'General medicine', 'Obstetrics'],
    medicines: { Aspirin: 50, ORS: 80, Oxytocin: 20, Heparin: 18 },
    status: 'Fully operational',
  },
];

export const AMBULANCES: GraphNode[] = [
  { id: 'a-01', name: 'RV-04', type: 'ambulance', x: 25, y: 35, callSign: 'RV-04', status: 'Available', capacity: 2, etaMinutes: 6 },
  { id: 'a-02', name: 'RV-07', type: 'ambulance', x: 50, y: 70, callSign: 'RV-07', status: 'En route', capacity: 2, etaMinutes: 14 },
  { id: 'a-03', name: 'RV-11', type: 'ambulance', x: 80, y: 25, callSign: 'RV-11', status: 'Available', capacity: 1, etaMinutes: 9 },
  { id: 'a-04', name: 'RV-14', type: 'ambulance', x: 72, y: 78, callSign: 'RV-14', status: 'Available', capacity: 2, etaMinutes: 11 },
  { id: 'a-05', name: 'RV-18', type: 'ambulance', x: 55, y: 50, callSign: 'RV-18', status: 'Maintenance', capacity: 2, etaMinutes: 99 },
  { id: 'a-06', name: 'RV-21', type: 'ambulance', x: 35, y: 60, callSign: 'RV-21', status: 'Available', capacity: 2, etaMinutes: 7 },
];

export const ROADS: Road[] = [
  // Village ↔ Facility connections
  { from: 'v-dharampur', to: 'f-rural-b', distanceKm: 9.2, status: 'open', weight: 9.2 },
  { from: 'v-dharampur', to: 'f-central', distanceKm: 18.5, status: 'open', weight: 18.5 },
  { from: 'v-dharampur', to: 'f-kaveri', distanceKm: 28.0, status: 'slow', weight: 42.0 },
  { from: 'v-kalyanpur', to: 'f-sonari-cc', distanceKm: 14.1, status: 'blocked', weight: 999 },
  { from: 'v-kalyanpur', to: 'f-central', distanceKm: 16.8, status: 'open', weight: 16.8 },
  { from: 'v-kalyanpur', to: 'f-rural-b', distanceKm: 22.0, status: 'open', weight: 22.0 },
  { from: 'v-bela', to: 'f-kaveri', distanceKm: 12.4, status: 'open', weight: 12.4 },
  { from: 'v-bela', to: 'f-central', distanceKm: 8.9, status: 'open', weight: 8.9 },
  { from: 'v-sonari', to: 'f-kaveri', distanceKm: 15.6, status: 'open', weight: 15.6 },
  { from: 'v-sonari', to: 'f-sonari-cc', distanceKm: 6.2, status: 'open', weight: 6.2 },
  { from: 'v-sonari', to: 'f-nandgaon', distanceKm: 19.0, status: 'open', weight: 19.0 },
  { from: 'v-nandgaon', to: 'f-nandgaon', distanceKm: 5.1, status: 'open', weight: 5.1 },
  { from: 'v-nandgaon', to: 'f-kaveri', distanceKm: 21.3, status: 'slow', weight: 32.0 },
  { from: 'v-rampur', to: 'f-central', distanceKm: 7.4, status: 'open', weight: 7.4 },
  { from: 'v-rampur', to: 'f-kaveri', distanceKm: 14.0, status: 'open', weight: 14.0 },
  { from: 'v-sikandra', to: 'f-rural-b', distanceKm: 11.0, status: 'open', weight: 11.0 },
  { from: 'v-sikandra', to: 'f-central', distanceKm: 13.5, status: 'open', weight: 13.5 },
  { from: 'v-mahuli', to: 'f-kaveri', distanceKm: 10.8, status: 'open', weight: 10.8 },
  { from: 'v-mahuli', to: 'f-nandgaon', distanceKm: 17.2, status: 'open', weight: 17.2 },

  // Inter-facility roads
  { from: 'f-rural-b', to: 'f-central', distanceKm: 14.0, status: 'open', weight: 14.0 },
  { from: 'f-central', to: 'f-kaveri', distanceKm: 11.5, status: 'open', weight: 11.5 },
  { from: 'f-kaveri', to: 'f-nandgaon', distanceKm: 13.0, status: 'open', weight: 13.0 },
  { from: 'f-kaveri', to: 'f-sonari-cc', distanceKm: 16.0, status: 'open', weight: 16.0 },
  { from: 'f-central', to: 'f-sonari-cc', distanceKm: 19.5, status: 'slow', weight: 29.0 },

  // Ambulance parking positions connected to nearby facilities/villages
  { from: 'a-01', to: 'v-dharampur', distanceKm: 4.2, status: 'open', weight: 4.2 },
  { from: 'a-01', to: 'f-rural-b', distanceKm: 8.0, status: 'open', weight: 8.0 },
  { from: 'a-02', to: 'v-kalyanpur', distanceKm: 5.5, status: 'open', weight: 5.5 },
  { from: 'a-02', to: 'f-central', distanceKm: 9.0, status: 'open', weight: 9.0 },
  { from: 'a-03', to: 'v-mahuli', distanceKm: 6.1, status: 'open', weight: 6.1 },
  { from: 'a-03', to: 'f-kaveri', distanceKm: 10.0, status: 'open', weight: 10.0 },
  { from: 'a-04', to: 'v-sonari', distanceKm: 3.8, status: 'open', weight: 3.8 },
  { from: 'a-04', to: 'f-sonari-cc', distanceKm: 4.5, status: 'open', weight: 4.5 },
  { from: 'a-06', to: 'v-rampur', distanceKm: 5.0, status: 'open', weight: 5.0 },
  { from: 'a-06', to: 'f-central', distanceKm: 6.5, status: 'open', weight: 6.5 },
];

/** Build adjacency list (undirected) */
export function buildGraphState(): GraphState {
  const nodes = new Map<string, GraphNode>();
  [...VILLAGES, ...FACILITIES, ...AMBULANCES].forEach(n => nodes.set(n.id, { ...n }));

  const adjacency = new Map<string, { to: string; weight: number; distanceKm: number; status: string }[]>();

  const addEdge = (from: string, to: string, distanceKm: number, weight: number, status: string) => {
    if (!adjacency.has(from)) adjacency.set(from, []);
    adjacency.get(from)!.push({ to, weight, distanceKm, status });
  };

  for (const road of ROADS) {
    addEdge(road.from, road.to, road.distanceKm, road.weight, road.status);
    addEdge(road.to, road.from, road.distanceKm, road.weight, road.status); // undirected
  }

  return { nodes, roads: ROADS, adjacency };
}

export const INITIAL_REQUESTS: PatientRequest[] = [
  {
    id: 'REQ-2049',
    villageId: 'v-sonari',
    villageName: 'Sonari',
    condition: 'Headache / mild fever',
    urgency: 'routine',
    specialistRequired: 'General medicine',
    medicineRequired: 'Paracetamol',
    waitMinutes: 0,
    status: 'queued',
    createdAt: Date.now() - 60000,
  },
  {
    id: 'REQ-2048',
    villageId: 'v-dharampur',
    villageName: 'Dharampur',
    condition: 'Acute chest pain',
    urgency: 'critical',
    specialistRequired: 'Cardiology',
    medicineRequired: 'Aspirin',
    waitMinutes: 4,
    status: 'queued',
    createdAt: Date.now() - 240000,
  },
  {
    id: 'REQ-2047',
    villageId: 'v-kalyanpur',
    villageName: 'Kalyanpur',
    condition: 'Postpartum hemorrhage',
    urgency: 'critical',
    specialistRequired: 'Obstetrics',
    medicineRequired: 'Oxytocin',
    waitMinutes: 11,
    status: 'queued',
    createdAt: Date.now() - 660000,
  },
  {
    id: 'REQ-2046',
    villageId: 'v-bela',
    villageName: 'Bela',
    condition: 'High fever / dehydration',
    urgency: 'urgent',
    specialistRequired: 'General medicine',
    medicineRequired: 'ORS',
    waitMinutes: 18,
    status: 'queued',
    createdAt: Date.now() - 1080000,
  },
  {
    id: 'REQ-2045',
    villageId: 'v-sonari',
    villageName: 'Sonari',
    condition: 'Suspected stroke',
    urgency: 'critical',
    specialistRequired: 'Neurology',
    medicineRequired: undefined,
    waitMinutes: 22,
    status: 'queued',
    createdAt: Date.now() - 1320000,
  },
  {
    id: 'REQ-2044',
    villageId: 'v-nandgaon',
    villageName: 'Nandgaon',
    condition: 'Respiratory distress',
    urgency: 'urgent',
    specialistRequired: 'Emergency',
    waitMinutes: 28,
    status: 'queued',
    createdAt: Date.now() - 1680000,
  },
];

export function createRandomRequest(id: number): PatientRequest {
  const villages = VILLAGES;
  const conditions = [
    { condition: 'Fever / dehydration', urgency: 'urgent' as const, specialist: 'General medicine', medicine: 'ORS' },
    { condition: 'Chest discomfort', urgency: 'critical' as const, specialist: 'Cardiology', medicine: 'Aspirin' },
    { condition: 'Injury / trauma', urgency: 'urgent' as const, specialist: 'Emergency', medicine: undefined },
    { condition: 'Pediatric fever', urgency: 'urgent' as const, specialist: 'Pediatrics', medicine: 'Paracetamol' },
    { condition: 'Labor complication', urgency: 'critical' as const, specialist: 'Obstetrics', medicine: 'Oxytocin' },
    { condition: 'Mild headache', urgency: 'routine' as const, specialist: 'General medicine', medicine: 'Paracetamol' },
  ];

  const v = villages[Math.floor(Math.random() * villages.length)];
  const c = conditions[Math.floor(Math.random() * conditions.length)];

  return {
    id: `REQ-${2050 + id}`,
    villageId: v.id,
    villageName: v.name,
    condition: c.condition,
    urgency: c.urgency,
    specialistRequired: c.specialist,
    medicineRequired: c.medicine,
    waitMinutes: 0,
    status: 'queued',
    createdAt: Date.now(),
  };
}
