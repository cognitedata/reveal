/*!
 * Copyright 2020 Cognite AS
 */
import * as Comlink from 'comlink';
import type { RevealParserWorker } from './reveal.parser.worker';

type WorkDelegate<T> = (worker: RevealParserWorker) => Promise<T>;

interface PooledWorker {
  // The worker returned by Comlink.wrap is not strictly speaking a RevealParserWorker,
  // but it should expose the same functions
  worker: RevealParserWorker;
  activeJobCount: number;
  messageIdCounter: number;
}

// wraps window.Worker with own function that allows to import worker from another domain (to avoid CORS)
// because worker-plugin parses call to new Worker it's necessary to keep that syntax to have working build
// also, reuses single blob url to create each worker for the pool
const workerHacks = (() => {
  const skipHacks = __webpack_public_path__ === '';
  const _Worker = window.Worker;
  let blob: Blob | undefined;
  let objURL: string | undefined;

  return {
    init() {
      if (skipHacks) {
        return;
      }
      // @ts-ignore
      window.Worker = function (url: string, opts: WorkerOptions) {
        if (!objURL) {
          blob = new Blob(['importScripts(' + JSON.stringify(url) + ')'], {
            type: 'text/javascript'
          });
          objURL = URL.createObjectURL(blob);
        }
        return new _Worker(objURL, opts);
      };
    },
    dispose() {
      if (skipHacks) {
        return;
      }
      if (objURL) {
        URL.revokeObjectURL(objURL);
      }
      window.Worker = _Worker;
    }
  };
})();

export class WorkerPool {
  static get defaultPool(): WorkerPool {
    WorkerPool._defaultPool = WorkerPool._defaultPool || new WorkerPool();
    return WorkerPool._defaultPool;
  }

  private static _defaultPool: WorkerPool | undefined;

  private readonly workerList: PooledWorker[] = [];

  constructor() {
    const numberOfWorkers = this.determineNumberOfWorkers();
    workerHacks.init();

    for (let i = 0; i < numberOfWorkers; i++) {
      const newWorker = {
        // NOTE: As of Comlink 4.2.0 we need to go through unknown before RevealParserWorker
        // Please feel free to remove `as unknown` if possible.
        worker: (Comlink.wrap(
          new Worker('./reveal.parser.worker', { name: 'reveal.parser', type: 'module' })
        ) as unknown) as RevealParserWorker,
        activeJobCount: 0,
        messageIdCounter: 0
      };
      this.workerList.push(newWorker);
    }

    workerHacks.dispose();
  }

  async postWorkToAvailable<T>(work: WorkDelegate<T>): Promise<T> {
    let targetWorker = this.workerList[0];
    for (const worker of this.workerList) {
      if (worker.activeJobCount < targetWorker.activeJobCount) {
        targetWorker = worker;
      }
    }
    targetWorker.activeJobCount += 1;
    const result = await work(targetWorker.worker);
    targetWorker.activeJobCount -= 1;
    return result;
  }

  // TODO j-bjorne 16-04-2020: Send in constructor instead
  private determineNumberOfWorkers() {
    // Use between 2-4 workers, depending on hardware
    return Math.max(2, Math.min(4, window.navigator.hardwareConcurrency || 2));
  }
}
