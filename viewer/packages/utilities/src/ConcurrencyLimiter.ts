/*!
 * Copyright 2026 Cognite AS
 */

/**
 * Limits how many asynchronous operations submitted through `run()` may be in
 * flight at the same time. Operations beyond the limit are queued in the order they
 * were submitted (FIFO) and started as earlier operations complete.
 *
 * Useful for capping fan-out when many independent async chains might otherwise be
 * kicked off at once (e.g. loading metadata for a large number of models added in a
 * loop), without needing to change how the caller structures its own async code.
 */
export class ConcurrencyLimiter {
  private readonly _maxConcurrent: number;
  private _numRunning = 0;
  private readonly _queue: Array<() => void> = [];

  constructor(maxConcurrent: number) {
    if (!Number.isFinite(maxConcurrent) || maxConcurrent < 1) {
      throw new Error('maxConcurrent must be a finite number >= 1');
    }
    this._maxConcurrent = maxConcurrent;
  }

  /**
   * Runs `operation`, waiting for a free slot first if the concurrency limit is
   * currently reached. The slot is held until `operation`'s returned promise settles
   * (resolves or rejects), then released for the next queued operation.
   */
  async run<T>(operation: () => Promise<T>): Promise<T> {
    await this.acquireSlot();
    try {
      return await operation();
    } finally {
      this.releaseSlot();
    }
  }

  private acquireSlot(): Promise<void> {
    if (this._numRunning < this._maxConcurrent) {
      this._numRunning++;
      return Promise.resolve();
    }

    return new Promise<void>(resolve => {
      this._queue.push(() => {
        this._numRunning++;
        resolve();
      });
    });
  }

  private releaseSlot(): void {
    this._numRunning--;
    const next = this._queue.shift();
    if (next !== undefined) {
      next();
    }
  }
}
