# Sanjivani Grid

**Intelligent Rural Healthcare Dispatch Engine**

> Capacity-aware A* pathfinding + Binary Heap Priority Queues for ambulance, doctor & medicine routing under real-world constraints.

Built for the **CodeRush Coding Competition** — Rural Healthcare: The Doctor, Ambulance & Medicine Routing Problem.

---

## What is this?

Sanjivani Grid is a live web simulation of a rural healthcare command center. It dynamically:

1. Accepts patient requests from villages (with urgency tiers)
2. Finds the **best medical facility** that has the required specialist, beds and medicines
3. Computes the **lowest-cost route** using capacity-aware A*
4. Assigns the **nearest available ambulance**
5. Logs every decision with full transparency so judges can see *why* a route was chosen

The algorithms are the same ones that would run on 50,000+ nodes and 200,000+ edges. The demo uses a smaller graph so the UI stays smooth at 60 fps.

---

## Tech Stack 

| Layer | Technology | Why we chose it |
|-------|------------|-----------------|
| Framework | **React 18 + TypeScript** | Type safety, component model, industry standard |
| Build tool | **Vite** | Extremely fast HMR, modern ESM |
| Styling | **Tailwind CSS** | Precise control, no generic “AI look” |
| Algorithms | **Custom TypeScript** | Binary Heap PQ + A* written by us (no black-box libraries) |
| Icons | Lucide React | Clean, consistent |

We deliberately **did not** use any heavy mapping library or graph library so the core solution is 100% our own code.

---

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open the URL shown (usually http://localhost:5173)
```

For production build:

```bash
npm run build
npm run preview
```

---

## Project Structure

```
sanjivani-grid/
├── src/
│   ├── algorithms/
│   │   ├── priorityQueue.ts   ← Binary Min-Heap (O(log n) insert/extract)
│   │   ├── aStar.ts           ← Capacity-aware A* pathfinding
│   │   └── dispatcher.ts      ← Orchestrates queue + routing + allocation
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── MetricsBar.tsx
│   │   ├── NetworkMap.tsx     ← SVG live network visualization
│   │   ├── RequestQueue.tsx
│   │   ├── DecisionLog.tsx    ← Explains every routing choice
│   │   └── FleetPanel.tsx
│   ├── data/
│   │   └── mockGraph.ts       ← Villages, facilities, roads, requests
│   ├── hooks/
│   │   └── useSimulation.ts   ← Live tick engine
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── README.md
└── package.json
```

---

## Algorithmic Design (40% + 20% of marks)

### 1. Priority Queue for Patient Requests

We use a **Binary Min-Heap**.

- **Insert**: O(log n)
- **Extract-min**: O(log n)
- **Peek**: O(1)

Priority formula:

```
priority = urgencyWeight[urgency] + max(0, 100 - waitMinutes)
```

| Urgency   | Weight |
|-----------|--------|
| critical  | 0      |
| urgent    | 1000   |
| routine   | 5000   |

Critical patients always come first. Within the same urgency, longer waiting patients rise higher.

### 2. Capacity-Aware A*

Classic A* finds the lowest-cost path. We add hard filters **before** pathfinding:

1. Facility must have the required **specialist**
2. Facility must have **beds available**
3. Facility must have the required **medicine** (if any)
4. Road status `blocked` is treated as infinite cost

Only facilities that pass the filters are considered. Among them we pick the one with lowest path cost.

**Heuristic**: Euclidean distance on the map (admissible → A* is optimal).

**Complexity**: O((V + E) log V) with the binary heap open set.

### 3. Ambulance Assignment

After the facility is chosen we run A* from every **Available** ambulance to the village and pick the nearest one.

### 4. Decision Log

Every successful dispatch records:

- Chosen facility & ambulance
- Route distance
- Number of alternatives considered
- Human-readable reasons (specialist available, beds free, medicine in stock, nodes expanded, time taken)

This directly addresses the “Decision Log / Cost transparency” requirement.

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| No specialist at nearest hospital | Skip that hospital, try next |
| All beds full | Facility filtered out |
| Medicine depleted | Facility filtered out |
| Road blocked | Edge weight = ∞, path never uses it |
| No available ambulance | Request marked `at-risk` and re-queued with wait penalty |
| Simultaneous criticals | Priority queue guarantees order |
| Disconnected graph | A* returns `found: false` with reason |

---

## UI Features (10% of marks)

- Live metrics bar (active incidents, queue size, ambulances ready, avg wait, cost avoided, SLA at risk)
- Interactive SVG network map with villages, facilities, ambulances and animated active route
- Request queue sorted by urgency + wait time
- Decision log with full reasoning breadcrumbs
- Fleet & bed capacity panel
- One-click “New Emergency” button
- Pause / Resume simulation
- Force-process next request

Visual design: dark command-center aesthetic with medical teal accents. Dense information hierarchy, not a generic template.

---

## Complexity Analysis (for judges)

| Operation | Time | Space |
|-----------|------|-------|
| Enqueue request | O(log n) | O(1) |
| Process next request | O(F · (V+E) log V) | O(V) |
| A* single query | O((V+E) log V) | O(V) |
| Full dispatch cycle | Dominated by A* | O(V + E) |

Where F = number of facilities (small constant in practice).

Even at 50k nodes the logarithmic factors keep it practical for real-time use.

---

## How the Simulation Works

1. On load we seed a priority queue with sample patient requests.
2. Every ~2.2 seconds the engine:
   - Ages waiting requests
   - Sometimes processes the highest-priority request
   - Sometimes injects a new random emergency
   - Sometimes frees an ambulance that was en-route
3. Metrics and the decision log update live.
4. The map highlights the most recent route.

You can also click **New Emergency** or the refresh button to force activity.

---

## What to say in Viva (simple language)

> “We treat the rural area as a weighted graph. Villages and hospitals are nodes, roads are edges with distance and status.  
> Patient requests go into a priority queue so critical cases are always handled first.  
> When we process a request we first filter hospitals that have the right doctor, beds and medicine.  
> Then we run A* from the village to each remaining hospital and pick the cheapest path.  
> Finally we assign the nearest free ambulance.  
> Every decision is logged with reasons so anyone can audit why that hospital and ambulance were chosen.  
> The algorithms are optimal and scale logarithmically.”

---

## License & Attribution

Built for CodeRush Coding Competition.  
Core routing, prioritization and capacity logic are original implementations.

---

**Sanjivani Grid** — Because every minute and every kilometre matters.
