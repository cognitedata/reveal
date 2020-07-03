/*!
 * Copyright 2020 Cognite AS
 */

import { Repository } from './Repository';
import { WantedSector, SectorGeometry, FlatSectorGeometry, ConsumedSector } from './types';
import { LevelOfDetail } from './LevelOfDetail';
import {
  OperatorFunction,
  pipe,
  Observable,
  from,
  merge,
  partition,
  of,
  Subject,
  onErrorResumeNext,
  asapScheduler,
  BehaviorSubject
} from 'rxjs';
import {
  publish,
  filter,
  flatMap,
  map,
  tap,
  shareReplay,
  take,
  distinct,
  catchError,
  switchMap,
  distinctUntilChanged,
  share,
  finalize,
  subscribeOn
} from 'rxjs/operators';
import { CadSectorParser } from './CadSectorParser';
import { SimpleAndDetailedToSector3D } from './SimpleAndDetailedToSector3D';
import { CadSectorProvider } from './CadSectorProvider';
import { MemoryRequestCache } from '@/utilities/cache/MemoryRequestCache';
import { SectorQuads, InstancedMesh, InstancedMeshFile, TriangleMesh } from '@/datamodels/cad/rendering/types';
import { trackError } from '@/utilities/metrics';
import { DetailedSector } from '@/datamodels/cad/sector/detailedSector_generated';
import { flatbuffers } from 'flatbuffers';

type CtmFileResult = { fileName: string; data: ArrayBuffer };
type ParsedData = { blobUrl: string; lod: string; data: SectorGeometry | SectorQuads };

// TODO: j-bjorne 16-04-2020: REFACTOR FINALIZE INTO SOME OTHER FILE PLEZ!
export class CachedRepository implements Repository {
  private readonly _consumedSectorCache: MemoryRequestCache<
    string,
    Observable<ConsumedSector>
  > = new MemoryRequestCache({
    maxElementsInCache: 50
  });
  private readonly _ctmFileCache: MemoryRequestCache<string, Observable<CtmFileResult>> = new MemoryRequestCache({
    maxElementsInCache: 300
  });
  private readonly _modelSectorProvider: CadSectorProvider;
  private readonly _modelDataParser: CadSectorParser;
  private readonly _modelDataTransformer: SimpleAndDetailedToSector3D;
  private readonly _isLoadingSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);

  // Adding this to support parse map for migration wrapper. Should be removed later.
  private readonly _parsedDataSubject: Subject<{
    blobUrl: string;
    sectorId: number;
    lod: string;
    data: SectorGeometry | SectorQuads;
  }> = new Subject();

  private readonly _concurrentNetworkOperations: number;

  constructor(
    modelSectorProvider: CadSectorProvider,
    modelDataParser: CadSectorParser,
    modelDataTransformer: SimpleAndDetailedToSector3D,
    concurrentNetworkOperations: number = 50
  ) {
    this._modelSectorProvider = modelSectorProvider;
    this._modelDataParser = modelDataParser;
    this._modelDataTransformer = modelDataTransformer;
    this._concurrentNetworkOperations = concurrentNetworkOperations;
  }

  clearCaches() {
    this._consumedSectorCache.clear();
    this._ctmFileCache.clear();
  }

  getParsedData(): Observable<ParsedData> {
    return this._parsedDataSubject.pipe(
      distinct(keySelector => '' + keySelector.blobUrl + '.' + keySelector.sectorId + '.' + keySelector.lod)
    ); // TODO: Should we do replay subject here instead of variable type?
  }

  getLoadingStateObserver(): Observable<boolean> {
    return this._isLoadingSubject.pipe(distinctUntilChanged(), share());
  }

  // TODO j-bjorne 16-04-2020: Should look into ways of not sending in discarded sectors,
  // unless we want them to eventually set their priority to lower in the cache.

  loadSector(): OperatorFunction<WantedSector[], ConsumedSector> {
    return pipe(
      subscribeOn(asapScheduler),
      switchMap(wantedSectorsArray => {
        return from(wantedSectorsArray).pipe(
          tap(_ => {
            this._isLoadingSubject.next(true);
          }),
          publish(wantedSectorsObservable => {
            const simpleAndDetailedObservable = wantedSectorsObservable.pipe(
              filter(
                wantedSector =>
                  wantedSector.levelOfDetail === LevelOfDetail.Simple ||
                  wantedSector.levelOfDetail === LevelOfDetail.Detailed
              ),
              this.loadSimpleAndDetailedSector()
            );

            const discardedSectorObservable = wantedSectorsObservable.pipe(
              filter(wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Discarded),
              map(wantedSector => ({ ...wantedSector, group: undefined } as ConsumedSector))
            );

            return merge(simpleAndDetailedObservable, discardedSectorObservable);
          }),
          finalize(() => this._isLoadingSubject.next(false))
        );
      }),
      finalize(() => {
        this.clearCaches();
      })
    );
  }

  private loadSimpleAndDetailedSector(): OperatorFunction<WantedSector, ConsumedSector> {
    return publish(wantedSectorObservable => {
      const [cachedSectorObservable, uncachedSectorObservable] = partition(wantedSectorObservable, wantedSector =>
        this._consumedSectorCache.has(this.wantedSectorCacheKey(wantedSector))
      );

      return merge(
        cachedSectorObservable.pipe(
          flatMap(wantedSector => this._consumedSectorCache.get(this.wantedSectorCacheKey(wantedSector)))
        ),
        uncachedSectorObservable.pipe(this.loadSimpleAndDetailedSectorFromNetwork())
      );
    });
  }

  private loadSimpleAndDetailedSectorFromNetwork(): OperatorFunction<WantedSector, ConsumedSector> {
    return flatMap(wantedSector => {
      if (wantedSector.levelOfDetail === LevelOfDetail.Simple) {
        return this.loadSimpleSectorFromNetwork(wantedSector);
      } else if (wantedSector.levelOfDetail === LevelOfDetail.Detailed) {
        return this.loadDetailedSectorFromNetwork(wantedSector);
      } else {
        throw new Error('Unhandled LevelOfDetail');
      }
    }, this._concurrentNetworkOperations);
  }

  private loadSimpleSectorFromNetwork(wantedSector: WantedSector): Observable<ConsumedSector> {
    const networkObservable: Observable<ConsumedSector> = onErrorResumeNext(
      from(
        this._modelSectorProvider.getCadSectorFile(wantedSector.blobUrl, wantedSector.metadata.facesFile.fileName!)
      ).pipe(
        catchError(error => {
          trackError(error, {
            moduleName: 'CachedRepository',
            methodName: 'loadSimpleSectorFromNetwork'
          });
          this._consumedSectorCache.remove(this.wantedSectorCacheKey(wantedSector));
          throw error;
        }),
        flatMap(buffer => this._modelDataParser.parseF3D(new Uint8Array(buffer))),
        tap(sectorQuads => {
          this._parsedDataSubject.next({
            blobUrl: wantedSector.blobUrl,
            sectorId: wantedSector.metadata.id,
            lod: 'simple',
            data: sectorQuads
          });
        }),
        map(sectorQuads => ({ ...wantedSector, data: sectorQuads })),
        this._modelDataTransformer.transform(),
        tap(group => {
          group.name = `Quads ${wantedSector.metadata.id}`;
        }),
        map(group => ({ ...wantedSector, group })),
        shareReplay(1),
        take(1)
      )
    );
    this._consumedSectorCache.forceInsert(this.wantedSectorCacheKey(wantedSector), networkObservable);
    return networkObservable;
  }

  private loadDetailedSectorFromNetwork(wantedSector: WantedSector): Observable<ConsumedSector> {
    const i3dFileObservable = of(wantedSector.metadata.indexFile).pipe(map(indexFile => indexFile.fileName));
    const networkObservable = onErrorResumeNext(
      i3dFileObservable.pipe(
        catchError(error => {
          trackError(error, {
            moduleName: 'CachedRepository',
            methodName: 'loadDetailedSectorFromNetwork'
          });
          this._consumedSectorCache.remove(this.wantedSectorCacheKey(wantedSector));
          throw error;
        }),
        flatMap(i3dFile =>
          this._modelDataParser.parseAndFinalizeDetailed(i3dFile, {
            blobUrl: wantedSector.blobUrl,
            headers: this._modelSectorProvider.headers
          })
        ),
        map(data => {
          const sector = this.unflattenSector(data);
          this._parsedDataSubject.next({
            blobUrl: wantedSector.blobUrl,
            sectorId: wantedSector.metadata.id,
            lod: 'detailed',
            data: sector
          }); // TODO: Remove when migration is gone.
          return { ...wantedSector, data: sector };
        }),
        this._modelDataTransformer.transform(),
        map(group => ({ ...wantedSector, group })),
        shareReplay(1),
        take(1)
      )
    );
    this._consumedSectorCache.forceInsert(this.wantedSectorCacheKey(wantedSector), networkObservable);
    return networkObservable;
  }

  private wantedSectorCacheKey(wantedSector: WantedSector) {
    return '' + wantedSector.blobUrl + '.' + wantedSector.metadata.id + '.' + wantedSector.levelOfDetail;
  }

  private unflattenSector(data: FlatSectorGeometry): SectorGeometry {
    const buf = new flatbuffers.ByteBuffer(data.buffer);
    const sectorG = DetailedSector.SectorGeometry.getRootAsSectorGeometry(buf);
    const iMeshes: InstancedMeshFile[] = [];
    for (let i = 0; i < sectorG.instanceMeshesLength(); i++) {
      const instances: InstancedMesh[] = [];
      const meshFile = sectorG.instanceMeshes(i)!;
      for (let j = 0; j < meshFile.instancesLength(); j++) {
        const int = meshFile.instances(j)!;
        const colors = int.colorsArray()!;
        const instanceMatrices = int.instanceMatricesArray()!;
        const treeIndices = int.treeIndicesArray()!;
        instances.push({
          triangleCount: int.triangleCount(),
          triangleOffset: int.triangleOffset(),
          colors,
          instanceMatrices,
          treeIndices
        });
      }
      const indices = meshFile.indicesArray()!;
      const vertices = meshFile.verticesArray()!;
      const norm = meshFile.normalsArray();
      iMeshes.push({
        fileId: meshFile.fileId(),
        indices,
        vertices,
        normals: norm ? norm : undefined,
        instances
      });
    }
    const tMeshes: TriangleMesh[] = [];
    for (let i = 0; i < sectorG.triangleMeshesLength(); i++) {
      const tri = sectorG.triangleMeshes(i)!;
      const indices = tri.indicesArray()!;
      const treeIndices = tri.treeIndicesArray()!;
      const vertices = tri.verticesArray()!;
      const colors = tri.colorsArray()!;
      const norm = tri.normalsArray();
      tMeshes.push({
        fileId: tri.fileId(),
        indices,
        treeIndices,
        vertices,
        normals: norm ? norm : undefined,
        colors
      });
    }
    return {
      instanceMeshes: iMeshes,
      triangleMeshes: tMeshes,
      ...data
    };
  }
}
