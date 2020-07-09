/*!
 * Copyright 2020 Cognite AS
 */

import { WorkerPool } from '@/utilities/workers/WorkerPool';
import { RevealParserWorker } from '@/utilities/workers/reveal.parser.worker';
import { SectorQuads } from '../rendering/types';
import { SectorGeometry } from './types';
import { ParseCtmInput } from '@/utilities/workers/types/reveal.parser.types';

export class CadSectorParser {
  private readonly workerPool: WorkerPool;
  constructor(workerPool: WorkerPool = WorkerPool.defaultPool) {
    this.workerPool = workerPool;
  }

  async parseF3D(data: Uint8Array): Promise<SectorQuads> {
    return this.parseSimple(data);
  }

  parseAndFinalizeI3D(i3dFile: string, ctmFiles: ParseCtmInput): Promise<SectorGeometry> {
    return this.parseAndFinalizeDetailed(i3dFile, ctmFiles);
  }

  private async parseAndFinalizeDetailed(i3dFile: string, ctmFiles: ParseCtmInput): Promise<SectorGeometry> {
    return this.workerPool.postWorkToAvailable(async (worker: RevealParserWorker) => {
      return worker.parseAndFinalizeDetailed(i3dFile, ctmFiles);
    });
  }

  private async parseSimple(quadsArrayBuffer: Uint8Array): Promise<SectorQuads> {
    return this.workerPool.postWorkToAvailable<SectorQuads>(async (worker: RevealParserWorker) =>
      worker.parseQuads(quadsArrayBuffer)
    );
  }
}
