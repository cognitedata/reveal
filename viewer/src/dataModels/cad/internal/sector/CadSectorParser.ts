/*!
 * Copyright 2020 Cognite AS
 */

import { OperatorFunction, merge } from 'rxjs';
import { SectorQuads } from './types';
import { publish, filter, flatMap, map } from 'rxjs/operators';
import { WorkerPool } from '../../../../utilities/workers/WorkerPool';
import { ParseSectorResult, ParseCtmResult, ParseQuadsResult } from '../../../../utilities/workers/types/parser.types';
import { ParserWorker } from '../../../../utilities/workers/parser.worker';

export class CadSectorParser {
  private readonly workerPool: WorkerPool;
  constructor(workerPool: WorkerPool = WorkerPool.defaultPool) {
    this.workerPool = workerPool;
  }

  parse(): OperatorFunction<{ format: string; data: Uint8Array }, ParseSectorResult | ParseCtmResult | SectorQuads> {
    return publish(dataObservable => {
      const i3dObservable = dataObservable.pipe(
        filter(data => data.format === 'i3d'),
        flatMap(data => this.parseDetailed(data.data))
      );
      const f3dObservable = dataObservable.pipe(
        filter(data => data.format === 'f3d'),
        flatMap(data => this.parseSimple(data.data)),
        map(parsedQuadsResult => this.finalizeSimple(parsedQuadsResult))
      );
      const ctmObservable = dataObservable.pipe(
        filter(data => data.format === 'ctm'),
        flatMap(data => this.parseCtm(data.data))
      );
      return merge(i3dObservable, f3dObservable, ctmObservable);
    });
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
