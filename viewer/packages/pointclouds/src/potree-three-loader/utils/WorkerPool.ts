
import EptDecoderWorker from '../workers/eptBinaryDecoder.worker';

export enum WorkerType {
  Ept
};

class WorkerPool {
  private _maxWorkers: number;
  private readonly _workers: Record<WorkerType, Worker[]>;

  constructor() {
    this._workers = {
      0: []
    }
  }

  createNewWorker(workerType: WorkerType): Worker;
  createNewWorker(_workerType: WorkerType.Ept): Worker {
    return new EptDecoderWorker();
  }

  getWorker(workerType: WorkerType.Ept) {
    if (!this._workers[workerType]) {
      this._workers[workerType] = [];
    }

    if (this._workers[workerType].length === 0) {
      const worker = this.createNewWorker(workerType);
      this._workers[workerType].push(worker);
    }

    const worker = this._workers[workerType].pop();

    return worker;
  }

  returnWorker(workerType: WorkerType, worker: any) {
    this._workers[workerType].push(worker);
  }

  get maxWorkers(): number {
    return this._maxWorkers;
  }

  set maxWorkers(maxWorkers: number) {
    this._maxWorkers = maxWorkers;
  }
};

export const workerPool = new WorkerPool();
