/**
 * Binary Min-Heap Priority Queue
 * 
 * Time Complexity:
 *   - insert: O(log n)
 *   - extractMin: O(log n)
 *   - peek: O(1)
 * 
 * Used for:
 * 1. Patient request prioritization (critical > urgent > routine + wait time)
 * 2. A* open set (f-score ordering)
 */

export interface PriorityItem<T> {
  item: T;
  priority: number; // lower = higher priority
}

export class PriorityQueue<T> {
  private heap: PriorityItem<T>[] = [];

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  peek(): T | null {
    return this.heap.length > 0 ? this.heap[0].item : null;
  }

  insert(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): T | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!.item;

    const min = this.heap[0].item;
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].priority <= this.heap[index].priority) break;
      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    const n = this.heap.length;
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (left < n && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < n && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }

  /** Rebuild heap from array of items — useful for bulk updates */
  rebuild(items: PriorityItem<T>[]): void {
    this.heap = [...items];
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.bubbleDown(i);
    }
  }

  toArray(): PriorityItem<T>[] {
    return [...this.heap];
  }
}

/**
 * Urgency scoring for patient requests.
 * Critical gets huge priority boost so it always comes first.
 * Within same urgency, longer wait time = higher priority.
 */
export function requestPriority(urgency: string, waitMinutes: number): number {
  const urgencyWeight: Record<string, number> = {
    critical: 0,
    urgent: 1000,
    routine: 5000,
  };
  return (urgencyWeight[urgency] ?? 5000) + Math.max(0, 100 - waitMinutes);
}
