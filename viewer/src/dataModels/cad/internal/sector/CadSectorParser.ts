/*!
 * Copyright 2020 Cognite AS
 */

import { SectorQuads } from './types';
import { WorkerPool } from '@/utilities/workers/WorkerPool';
import { ParseSectorResult, ParseCtmResult, ParseQuadsResult } from '@/utilities/workers/types/parser.types';
import { ParserWorker } from '@/utilities/workers/parser.worker';

export class CadSectorParser {
  private readonly workerPool: WorkerPool;
  constructor(workerPool: WorkerPool = WorkerPool.defaultPool) {
    this.workerPool = workerPool;
  }

  parseI3D(data: Uint8Array): Promise<ParseSectorResult> {
    return this.parseDetailed(data);
  }

  async parseF3D(data: Uint8Array): Promise<SectorQuads> {
    const parsed = await this.parseSimple(data);
    return this.finalizeSimple(parsed);
  }

  parseCTM(data: Uint8Array): Promise<ParseCtmResult> {
    return this.parseCtm(data);
  }

  private async parseSimple(quadsArrayBuffer: Uint8Array): Promise<ParseQuadsResult> {
    return this.workerPool.postWorkToAvailable<ParseQuadsResult>(async (worker: ParserWorker) =>
      worker.parseQuads(quadsArrayBuffer)
    );
  }

  // TODO: j-bjorne 16-04-2020: Move outside
  private finalizeSimple(parsedQuadsResult: ParseQuadsResult): SectorQuads {
    return {
      treeIndexToNodeIdMap: parsedQuadsResult.treeIndexToNodeIdMap,
      nodeIdToTreeIndexMap: parsedQuadsResult.nodeIdToTreeIndexMap,
      buffer: parsedQuadsResult.faces
    };
  }

  private async parseDetailed(sectorArrayBuffer: Uint8Array): Promise<ParseSectorResult> {
    return this.workerPool.postWorkToAvailable(async (worker: ParserWorker) => worker.parseSector(sectorArrayBuffer));
  }

  private async parseCtm(ctmArrayBuffer: Uint8Array): Promise<ParseCtmResult> {
    return this.workerPool.postWorkToAvailable(async (worker: ParserWorker) => worker.parseCtm(ctmArrayBuffer));
  }
}
