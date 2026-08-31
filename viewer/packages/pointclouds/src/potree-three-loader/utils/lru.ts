import type { IPointCloudTreeNodeBase } from '../tree/IPointCloudTreeNodeBase';

export type Node = IPointCloudTreeNodeBase;

// DEBUGGING
/**
 * Build fingerprint. This is a top-level log that runs once when the LRU module
 * is imported (which happens on the very first PointCloud interaction).
 * This is only for debugging purposes. It will be removed in prod builds.
 */
const REVEAL_MEM_BUILD_TAG = 'webgl-context-lost-fix @ 2026-08-30';
// eslint-disable-next-line no-console
console.log(
  `%c[reveal-mem] Potree LRU module loaded - build: ${REVEAL_MEM_BUILD_TAG}. ` +
    `Enable verbose logs with: window.__revealMemDebug = true`,
  'color:#4caf50;font-weight:bold'
);

/**
 * Debug logging for the LRU. Enable at runtime from the browser console:
 * window.__revealMemDebug = true
 * Disable with:
 * window.__revealMemDebug = false
 */
function memDebugEnabled(): boolean {
  return typeof globalThis !== 'undefined' && (globalThis as { __revealMemDebug?: boolean }).__revealMemDebug === true;
}
function memLog(...args: unknown[]): void {
  if (memDebugEnabled()) {
    // eslint-disable-next-line no-console
    console.log('[reveal-mem][LRU]', ...args);
  }
}

/**
 * Multiplier applied to `pointBudget` to determine when the LRU should start
 * freeing nodes, reducing the memory footprint and the pressure on GPU memory.
 */
const LRU_OVERSHOOT_FACTOR = 1.2;
export class LRUItem {
  next: LRUItem | null = null;
  previous: LRUItem | null = null;
  constructor(public node: Node) {}
}

/**
 * A doubly-linked-list of the least recently used elements.
 */
export class LRU {
  // the least recently used item
  first: LRUItem | null = null;
  // the most recently used item
  last: LRUItem | null = null;
  numPoints: number = 0;

  private readonly items = new Map<number, LRUItem>();

  constructor(public pointBudget: number = 1_000_000) {}

  /**
   * Debug snapshot of the current LRU state. Call from the browser console:
   * viewer.__potreeInstance?.lru?.getMemStats?.() // if exposed
   * Or, more portably, enable window.__revealMemDebug and read the periodic
   * logs emitted by freeMemory().
   */
  getMemStats(): { budget: number; overshootFactor: number; threshold: number; numPoints: number; nodes: number } {
    return {
      budget: this.pointBudget,
      overshootFactor: LRU_OVERSHOOT_FACTOR,
      threshold: Math.round(this.pointBudget * LRU_OVERSHOOT_FACTOR),
      numPoints: this.numPoints,
      nodes: this.items.size
    };
  }

  get size(): number {
    return this.items.size;
  }

  has(node: Node): boolean {
    return this.items.has(node.id);
  }

  /**
   * Makes the specified the most recently used item. if the list does not contain node, it will
   * be added.
   */
  touch(node: Node): void {
    if (!node.loaded) {
      return;
    }

    const item = this.items.get(node.id);
    if (item) {
      this.touchExisting(item);
    } else {
      this.addNew(node);
    }
  }

  private addNew(node: Node): void {
    const item = new LRUItem(node);
    item.previous = this.last;
    this.last = item;
    if (item.previous) {
      item.previous.next = item;
    }

    if (!this.first) {
      this.first = item;
    }

    this.items.set(node.id, item);
    this.numPoints += node.numPoints;
  }

  private touchExisting(item: LRUItem): void {
    if (!item.previous) {
      // handle touch on first element
      if (item.next) {
        this.first = item.next;
        this.first.previous = null;
        item.previous = this.last;
        item.next = null;
        this.last = item;

        if (item.previous) {
          item.previous.next = item;
        }
      }
    } else if (!item.next) {
      // handle touch on last element
    } else {
      // handle touch on any other element
      item.previous.next = item.next;
      item.next.previous = item.previous;
      item.previous = this.last;
      item.next = null;
      this.last = item;

      if (item.previous) {
        item.previous.next = item;
      }
    }
  }

  remove(node: Node): void {
    const item = this.items.get(node.id);
    if (!item) {
      return;
    }

    if (this.items.size === 1) {
      this.first = null;
      this.last = null;
    } else {
      if (!item.previous) {
        this.first = item.next;
        this.first!.previous = null;
      }

      if (!item.next) {
        this.last = item.previous;
        this.last!.next = null;
      }

      if (item.previous && item.next) {
        item.previous.next = item.next;
        item.next.previous = item.previous;
      }
    }

    this.items.delete(node.id);
    this.numPoints -= node.numPoints;
  }

  getLRUItem(): Node | undefined {
    return this.first ? this.first.node : undefined;
  }

  freeMemory(): void {
    if (this.items.size <= 1) {
      return;
    }

    const threshold = this.pointBudget * LRU_OVERSHOOT_FACTOR;
    if (this.numPoints <= threshold) {
      return;
    }

    const startPoints = this.numPoints;
    const startSize = this.items.size;
    memLog(
      `freeMemory: over threshold - numPoints=${startPoints.toLocaleString()} ` +
        `threshold=${Math.round(threshold).toLocaleString()} ` +
        `(budget=${this.pointBudget.toLocaleString()} × ${LRU_OVERSHOOT_FACTOR}) ` +
        `nodes=${startSize}`
    );

    let subtreesDisposed = 0;
    while (this.numPoints > threshold) {
      const node = this.getLRUItem();
      if (node) {
        this.disposeSubtree(node);
        subtreesDisposed++;
      }
    }

    memLog(
      `freeMemory: done - freed points=${(startPoints - this.numPoints).toLocaleString()} ` +
        `freed nodes=${startSize - this.items.size} ` +
        `subtreesDisposed=${subtreesDisposed} ` +
        `remaining points=${this.numPoints.toLocaleString()} nodes=${this.items.size}`
    );
  }

  disposeSubtree(node: Node): void {
    // Collect all the nodes which are to be disposed and removed.
    const nodesToDispose: Node[] = [node];
    node.traverse(n => {
      if (n.loaded) {
        nodesToDispose.push(n);
      }
    });

    // Dispose of all the nodes in one go.
    for (const n of nodesToDispose) {
      n.dispose();
      this.remove(n);
    }
  }
}
