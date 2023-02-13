import { AsyncBlockingQueue } from './async-blocking-queue';

export class AutoTerminatingWorker {
  private timeoutId: number | undefined = undefined;
  private terminated: boolean = false;
  private _wrappedWorker: Worker | undefined;

  constructor(wrappedWorker: Worker, private readonly maxIdle: number) {
    this._wrappedWorker = wrappedWorker;
  }

  public get worker(): Worker {
    return this._wrappedWorker!;
  }

  get isTerminated(): boolean {
    return this.terminated;
  }

  markIdle(): void {
    this.timeoutId = window.setTimeout(() => {
      this.terminated = true;
      this._wrappedWorker!.terminate();
      this._wrappedWorker = undefined;
    }, this.maxIdle);
  }

  markInUse(): void {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }
}

export class WorkerPool<T extends Worker> {
  /**
   * The maximum amount of idle time that can elapse before a worker from this pool is automatically terminated
   */
  private static readonly POOL_MAX_IDLE = 7000;

  private readonly pool = new AsyncBlockingQueue<AutoTerminatingWorker>();
  private poolSize = 0;

  constructor(public maxWorkers: number, private readonly workerType: new () => T) {}

  /**
   * Returns a worker promise which is resolved when one is available.
   */
  public getWorker(): Promise<AutoTerminatingWorker> {
    // If the number of active workers is smaller than the maximum, return a new one.
    // Otherwise, return a promise for worker from the pool.
    if (this.poolSize < this.maxWorkers) {
      this.poolSize++;
      return Promise.resolve(new AutoTerminatingWorker(new this.workerType(), WorkerPool.POOL_MAX_IDLE));
    } else {
      return this.pool.dequeue().then(worker => {
        worker.markInUse();
        // If the dequeued worker has been terminated, decrease the pool size and make a recursive call to get a new worker
        if (worker.isTerminated) {
          this.poolSize--;
          return this.getWorker();
        }
        return worker;
      });
    }
  }

  /**
   * Releases a Worker back into the pool
   * @param worker
   */
  public releaseWorker(worker: AutoTerminatingWorker): void {
    worker.markIdle();
    this.pool.enqueue(worker);
  }
}
