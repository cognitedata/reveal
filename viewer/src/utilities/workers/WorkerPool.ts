/*!
 * Copyright 2020 Cognite AS
 */

import * as Comlink from 'comlink';
import type { RevealParserWorker } from './reveal.parser.worker';

// Equals the configuration option's output.publicPath
declare let __webpack_public_path__: string;

type WorkDelegate<T> = (worker: RevealParserWorker) => Promise<T>;

interface PooledWorker {
  // The worker returned by Comlink.wrap is not strictly speaking a RevealParserWorker,
  // but it should expose the same functions
  worker: RevealParserWorker;
  activeJobCount: number;
  messageIdCounter: number;
}

export class WorkerPool {
  static get defaultPool(): WorkerPool {
    WorkerPool._defaultPool = WorkerPool._defaultPool || new WorkerPool();
    return WorkerPool._defaultPool;
  }

  private static _defaultPool: WorkerPool | undefined;

  private readonly workerList: PooledWorker[] = [];

  constructor() {
    const numberOfWorkers = this.determineNumberOfWorkers();
    const workerCdnUrl = __webpack_public_path__ + 'reveal.parser.worker.js';

    try {
      for (let i = 0; i < numberOfWorkers; i++) {
        const newWorker = {
          // NOTE: As of Comlink 4.2.0 we need to go through unknown before RevealParserWorker
          // Please feel free to remove `as unknown` if possible.
          worker: (Comlink.wrap(new Worker(getWorkerURL(workerCdnUrl))) as unknown) as RevealParserWorker,
          activeJobCount: 0,
          messageIdCounter: 0
        };
        this.workerList.push(newWorker);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }

    URL.revokeObjectURL(workerCdnUrl);
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

// Returns a blob:// URL which points to a javascript file,
// which will call importScripts with the given URL.
// You can't load a worker from another origin, so this is the workaround.
function getWorkerURL(url: string) {
  const content = `importScripts( "${url}" );`;
  return URL.createObjectURL(new Blob([content], { type: 'text/javascript' }));
}
