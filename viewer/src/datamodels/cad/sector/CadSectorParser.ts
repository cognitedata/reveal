/*!
 * Copyright 2020 Cognite AS
 */

import { RevealParserWorker } from '@cognite/reveal-parser-worker';
import { WorkerPool } from '../../../utilities/workers/WorkerPool';
import { ParseCtmResult, ParseSectorResult, SectorQuads } from '../rendering/types';

export class CadSectorParser {
  private readonly workerPool: WorkerPool;
  constructor(workerPool: WorkerPool = WorkerPool.defaultPool) {
    this.workerPool = workerPool;
  }

  parseI3D(data: Uint8Array): Promise<ParseSectorResult> {
    return this.parseDetailed(data);
  }

  parseF3D(data: Uint8Array): Promise<SectorQuads> {
    return this.parseSimple(data);
  }

  parseCTM(data: Uint8Array): Promise<ParseCtmResult> {
    return this.parseCtm(data);
  }

  private async parseSimple(quadsArrayBuffer: Uint8Array): Promise<SectorQuads> {
    return this.workerPool.postWorkToAvailable<SectorQuads>(async (worker: RevealParserWorker) =>
      worker.parseQuads(quadsArrayBuffer)
    );
  }

  private async parseDetailed(sectorArrayBuffer: Uint8Array): Promise<ParseSectorResult> {
    return this.workerPool.postWorkToAvailable(async (worker: RevealParserWorker) =>
      worker.parseSector(sectorArrayBuffer)
    );
  }

  private async parseCtm(ctmArrayBuffer: Uint8Array): Promise<ParseCtmResult> {
    return this.workerPool.postWorkToAvailable(async (worker: RevealParserWorker) => worker.parseCtm(ctmArrayBuffer));
  }
}
