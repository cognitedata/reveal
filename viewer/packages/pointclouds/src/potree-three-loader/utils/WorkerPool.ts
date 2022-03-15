/*!
 * Copyright 2022 Cognite AS
 */
class WorkerPool {
  private readonly _workers: any;
  private _maxWorkers: number;

  constructor() {
    this._workers = {};
  }

  getWorker(url: string) {
    if (!this._workers[url]) {
      this._workers[url] = [];
    }

    if (this._workers[url].length === 0) {
      const worker = new Worker(url);
      this._workers[url].push(worker);
    }

    const worker = this._workers[url].pop();

    return worker;
  }

  returnWorker(url: string, worker: any) {
    this._workers[url].push(worker);
  }

  get maxWorkers(): number {
    return this._maxWorkers;
  }

  set maxWorkers(maxWorkers: number) {
    this._maxWorkers = maxWorkers;
  }
};

export const workerPool = new WorkerPool();
