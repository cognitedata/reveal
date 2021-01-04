/*!
 * Copyright 2020 Cognite AS
 */
import * as THREE from 'three';
import { asapScheduler, from, zip } from 'rxjs';
import { concatMap, filter, map, reduce, subscribeOn, takeWhile } from 'rxjs/operators';
import { RevealParserWorker } from '@cognite/reveal-parser-worker';
import { BinaryFileProvider } from '../../../utilities/networking/types';
import { MaterialManager } from '../MaterialManager';
import { ParseCtmResult, ParseSectorResult, SectorGeometry } from '../rendering/types';
import { CadSectorParser } from './CadSectorParser';
import { consumeSectorDetailed } from './sectorUtilities';
import { WantedSector } from './types';
import { MostFrequentlyUsedCache } from '../../../utilities/cache/MostFrequentlyUsedCache';
import { WorkerPool } from '../../../utilities/workers/WorkerPool';
import { CancellationSource, downloadWithRetry, createCtmKey } from './CadSectorLoader';

export class CadDetailedSectorLoader {
  private readonly _workerPool: WorkerPool;
  private readonly _fileProvider: BinaryFileProvider;
  private readonly _parser: CadSectorParser;
  private readonly _materialManager: MaterialManager;
  private readonly _ctmCache = new MostFrequentlyUsedCache<string, Promise<ParseCtmResult>>(5);

  constructor(fileProvider: BinaryFileProvider, parser: CadSectorParser, materialManager: MaterialManager) {
    this._fileProvider = fileProvider;
    this._parser = parser;
    this._materialManager = materialManager;

    this._workerPool = WorkerPool.defaultPool;
  }

  async load(sector: WantedSector, cancellationSource: CancellationSource): Promise<THREE.Group> {
    const file = sector.metadata.indexFile;
    const materials = this._materialManager.getModelMaterials(sector.blobUrl);
    if (!materials) {
      throw new Error(`Could not find materials for model ${sector.blobUrl}`);
    }

    // Prefetch CTM
    const ctmFiles$ = from(file.peripheralFiles).pipe(filter(f => f.toLowerCase().endsWith('.ctm')));
    const ctms$ = ctmFiles$.pipe(
      subscribeOn(asapScheduler),
      takeWhile(() => !cancellationSource.isCanceled()),
      map(ctmFile => this.retrieveCTM(sector.blobUrl, ctmFile, cancellationSource)),
      // Note! concatMap() is used to maintain ordering of files to make zip work below
      concatMap(p => p)
    );
    const ctmMap$ = zip(ctmFiles$, ctms$).pipe(
      map(v => ({ ctmFile: v[0], ctm: v[1] })),
      reduce((map, v) => {
        map.set(v.ctmFile, v.ctm);
        return map;
      }, new Map<string, ParseCtmResult>())
    );
    cancellationSource.throwIfCanceled();
    const ctmMap = await ctmMap$.toPromise();

    // I3D
    cancellationSource.throwIfCanceled();
    const i3dBuffer = await downloadWithRetry(this._fileProvider, sector.blobUrl, file.fileName);
    cancellationSource.throwIfCanceled();
    const parsedI3D = await this._parser.parseI3D(new Uint8Array(i3dBuffer));

    // Stich together
    cancellationSource.throwIfCanceled();
    const geometry = await this.finalizeDetailed(parsedI3D, ctmMap);

    // Create ThreeJS group
    cancellationSource.throwIfCanceled();
    const group = consumeSectorDetailed(geometry, sector.metadata, materials);
    return group;
  }

  private retrieveCTM(
    baseUrl: string,
    filename: string,
    cancellationSource: CancellationSource
  ): Promise<ParseCtmResult> {
    const key = createCtmKey(baseUrl, filename);
    const cachedCtm = this._ctmCache.get(key);
    if (cachedCtm !== undefined) {
      return cachedCtm;
    }

    // Not cached, retrieve
    const parser = this._parser;
    const fileProvider = this._fileProvider;
    async function retrieve(): Promise<ParseCtmResult> {
      cancellationSource.throwIfCanceled();
      const buffer = await downloadWithRetry(fileProvider, baseUrl, filename);
      cancellationSource.throwIfCanceled();
      const parsed = await parser.parseCTM(new Uint8Array(buffer));
      return parsed;
    }
    const promise = retrieve();
    this._ctmCache.set(key, promise);
    return promise;
  }

  private async finalizeDetailed(
    i3dFile: ParseSectorResult,
    ctmFiles: Map<string, ParseCtmResult>
  ): Promise<SectorGeometry> {
    const operationId = Array.from(ctmFiles.keys()).join(',');
    performance.mark(`finalizeDetail-${operationId}-start`);
    return this._workerPool
      .postWorkToAvailable<SectorGeometry>(async (worker: RevealParserWorker) =>
        worker.createDetailedGeometry(i3dFile, ctmFiles)
      )
      .then(x => {
        performance.mark(`finalizeDetail-${operationId}-end`);
        performance.measure(
          `finalizeDetail-${operationId}`,
          `finalizeDetail-${operationId}-start`,
          `finalizeDetail-${operationId}-end`
        );
        return x;
      });
  }
}
