/*!
 * Copyright 2021 Cognite AS
 */
import * as Comlink from 'comlink';
import { RevealParserWorker } from '@cognite/reveal-parser-worker';
import { revealEnv } from '../../revealEnv';
import { isTheSameDomain } from '../networking/isTheSameDomain';

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

  private static async checkWorkerVersion(worker: RevealParserWorker) {
    // eslint-disable-next-line no-console
    console.log('the version is', await worker.version);
  }

  private static _defaultPool: WorkerPool | undefined;

  private readonly workerList: PooledWorker[] = [];

  private workerObjUrl?: string;

  constructor(numberOfWorkers = Math.max(2, Math.min(4, window.navigator.hardwareConcurrency || 2))) {
    for (let i = 0; i < numberOfWorkers; i++) {
      const newWorker = {
        // NOTE: As of Comlink 4.2.0 we need to go through unknown before RevealParserWorker
        // Please feel free to remove `as unknown` if possible.
        worker: (Comlink.wrap(this.createWorker()) as unknown) as RevealParserWorker,
        activeJobCount: 0,
        messageIdCounter: 0
      };
      this.workerList.push(newWorker);
    }

    WorkerPool.checkWorkerVersion(this.workerList[0].worker);

    if (this.workerObjUrl) {
      URL.revokeObjectURL(this.workerObjUrl);
    }
  }

  // Used to construct workers with or without importScripts usage to overcome CORS.
  // When publicPath is not set we need to fetch worker from CDN (perform cross-origin request)
  // and that's possible only with importScripts.
  // If publicPath is set and points on the same domain, we use it normally.
  private createWorker() {
    const workerUrl = (revealEnv.publicPath || __webpack_public_path__) + 'reveal.parser.worker.js';
    const options = { name: 'reveal.parser' };

    if (isTheSameDomain(workerUrl)) {
      return new Worker(workerUrl, options);
    }

    if (!this.workerObjUrl) {
      const blob = new Blob([`importScripts(${JSON.stringify(workerUrl)});`], {
        type: 'text/javascript'
      });
      this.workerObjUrl = URL.createObjectURL(blob);
    }

    return new Worker(this.workerObjUrl, options);
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
}
