/*!
 * Copyright 2026 Cognite AS
 */

type QueuedOperation = {
  start: () => void;
  onAbort: () => void;
};

/**
 * Limits how many asynchronous operations submitted through `run()` may be in
 * flight at the same time. Operations beyond the limit are queued in the order they
 * were submitted (FIFO) and started as earlier operations complete.
 *
 * An operation can be submitted together with an `AbortSignal`. If the signal aborts while
 * the operation is still queued, the operation is dropped without ever starting.
 *
 * Useful for capping fan-out when many independent async chains might otherwise be
 * kicked off at once (e.g. loading metadata for a large number of models added in a
 * loop), without needing to change how the caller structures its own async code.
 */
export class ConcurrencyLimiter {
  private readonly _maxConcurrent: number;
  private _numRunning = 0;
  private readonly _queue: QueuedOperation[] = [];

  /**
   * @param maxConcurrent - Maximum number of operations running at the same time. Must be an integer >= 1.
   */
  constructor(maxConcurrent: number) {
    if (!Number.isInteger(maxConcurrent) || maxConcurrent < 1) {
      throw new Error(`maxConcurrent must be an integer >= 1, got ${maxConcurrent}`);
    }
    this._maxConcurrent = maxConcurrent;
  }

  /**
   * Runs `operation`, waiting for a free slot first if the concurrency limit is
   * currently reached. The slot is held until `operation`'s returned promise settles
   * (resolves or rejects, or `operation` throws synchronously), then released for the
   * next queued operation.
   *
   * @param operation - The operation to run.
   * @param abortSignal - Optional. If it aborts while the operation is still queued, the operation
   * is removed from the queue without starting and the returned promise rejects with the
   * signal's reason. Aborting after the operation has started does not cancel it - the operation
   * itself has to observe the signal for that.
   */
  public run<T>(operation: () => Promise<T>, abortSignal?: AbortSignal): Promise<T> {
    if (abortSignal?.aborted) {
      return Promise.reject(abortSignal.reason);
    }

    return new Promise<T>((resolve, reject) => {
      const queued: QueuedOperation = {
        start: () => {
          abortSignal?.removeEventListener('abort', queued.onAbort);
          this._numRunning++;

          let result: Promise<T>;
          try {
            result = operation();
          } catch (error) {
            result = Promise.reject(error);
          }

          result.then(
            value => {
              this.releaseSlot();
              resolve(value);
            },
            error => {
              this.releaseSlot();
              reject(error);
            }
          );
        },
        onAbort: () => {
          const index = this._queue.indexOf(queued);
          if (index === -1) {
            return;
          }
          this._queue.splice(index, 1);
          reject(abortSignal?.reason);
        }
      };

      abortSignal?.addEventListener('abort', queued.onAbort, { once: true });
      this._queue.push(queued);
      this.startQueued();
    });
  }

  private releaseSlot(): void {
    this._numRunning--;
    this.startQueued();
  }

  private startQueued(): void {
    while (this._numRunning < this._maxConcurrent) {
      const next = this._queue.shift();
      if (next === undefined) {
        return;
      }
      next.start();
    }
  }
}
