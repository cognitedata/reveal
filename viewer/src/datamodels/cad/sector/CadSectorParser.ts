/*!
 * Copyright 2020 Cognite AS
 */

import { WorkerPool } from '@/utilities/workers/WorkerPool';
import { ParserWorker } from '@/utilities/workers/parser.worker';
import { SectorQuads } from '../rendering/types';
import { SectorGeometry } from './types';
import { ParseCtmInput } from '@/utilities/workers/types/parser.types';

export class CadSectorParser {
  private readonly workerPool: WorkerPool;
  constructor(workerPool: WorkerPool = WorkerPool.defaultPool) {
    this.workerPool = workerPool;
  }

  async parseF3D(data: Uint8Array): Promise<SectorQuads> {
    return this.parseSimple(data);
  }

  parseAndFinalizeDetailed(i3dFile: string, ctmFiles: ParseCtmInput): Promise<SectorGeometry> {
    return this.workerPool.postWorkToAvailable(async (worker: ParserWorker) =>
      worker.parseAndFinalizeDetailed(i3dFile, ctmFiles)
    );
  }

  private async parseSimple(quadsArrayBuffer: Uint8Array): Promise<SectorQuads> {
    return this.workerPool.postWorkToAvailable<SectorQuads>(async (worker: ParserWorker) =>
      worker.parseQuads(quadsArrayBuffer)
    );
  }
}
