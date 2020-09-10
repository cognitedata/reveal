/*!
 * Copyright 2020 Cognite AS
 */

import { Repository } from './Repository';
import { WantedSector, SectorGeometry, ConsumedSector } from './types';
import { LevelOfDetail } from './LevelOfDetail';
import {
  OperatorFunction,
  Observable,
  from,
  zip,
  Subject,
  onErrorResumeNext,
  defer,
  scheduled,
  asyncScheduler,
  merge,
  NextObserver
} from 'rxjs';
import {
  flatMap,
  map,
  tap,
  shareReplay,
  take,
  retry,
  reduce,
  distinct,
  catchError,
  throttleTime,
  startWith,
  filter,
  subscribeOn,
  mergeAll,
  publish
} from 'rxjs/operators';
import { CadSectorParser } from './CadSectorParser';
import { SimpleAndDetailedToSector3D } from './SimpleAndDetailedToSector3D';
import { MemoryRequestCache } from '@/utilities/cache/MemoryRequestCache';
import { ParseCtmResult, ParseSectorResult } from '@cognite/reveal-parser-worker';
import { TriangleMesh, InstancedMeshFile, InstancedMesh, SectorQuads } from '../rendering/types';
import { createOffsetsArray, LoadingState } from '@/utilities';
import { trackError } from '@/utilities/metrics';
import { BinaryFileProvider } from '@/utilities/networking/types';
import { Group } from 'three';
import { RxTaskTracker } from '@/utilities/RxTaskTracker';

type KeyedWantedSector = { key: string; wantedSector: WantedSector };
type WantedSecorWithRequestObservable = {
  key: string;
  wantedSector: WantedSector;
  observable: Observable<ConsumedSector>;
};
type CtmFileRequest = { blobUrl: string; fileName: string };
type CtmFileResult = { fileName: string; data: ParseCtmResult };
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
  private readonly _modelSectorProvider: BinaryFileProvider;
  private readonly _modelDataParser: CadSectorParser;
  private readonly _modelDataTransformer: SimpleAndDetailedToSector3D;
  private readonly _taskTracker: RxTaskTracker = new RxTaskTracker();

  // Adding this to support parse map for migration wrapper. Should be removed later.
  private readonly _parsedDataSubject: Subject<{
    blobUrl: string;
    sectorId: number;
    lod: string;
    data: SectorGeometry | SectorQuads;
  }> = new Subject();

  private readonly _concurrentNetworkOperations: number;
  private readonly _concurrentCtmRequests: number;

  constructor(
    modelSectorProvider: BinaryFileProvider,
    modelDataParser: CadSectorParser,
    modelDataTransformer: SimpleAndDetailedToSector3D,
    concurrentNetworkOperations: number = 50,
    concurrentCtmRequest: number = 10
  ) {
    this._modelSectorProvider = modelSectorProvider;
    this._modelDataParser = modelDataParser;
    this._modelDataTransformer = modelDataTransformer;
    this._concurrentNetworkOperations = concurrentNetworkOperations;
    this._concurrentCtmRequests = concurrentCtmRequest;
  }

  clear() {
    this._consumedSectorCache.clear();
    this._ctmFileCache.clear();
  }

  getParsedData(): Observable<ParsedData> {
    return this._parsedDataSubject.pipe(
      distinct(keySelector => '' + keySelector.blobUrl + '.' + keySelector.sectorId + '.' + keySelector.lod)
    ); // TODO: Should we do replay subject here instead of variable type?
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._taskTracker.getTaskTrackerObservable().pipe(
      throttleTime(30, asyncScheduler, { trailing: true }), // Take 1 emission every 30ms
      map(
        ({ taskCount, taskCompleted }) =>
          ({
            isLoading: taskCount != taskCompleted,
            itemsRequested: taskCount,
            itemsLoaded: taskCompleted
          } as LoadingState)
      ),
      startWith({ isLoading: false, itemsRequested: 0, itemsLoaded: 0 })
    );
  }

  // TODO j-bjorne 16-04-2020: Should look into ways of not sending in discarded sectors,
  // unless we want them to eventually set their priority to lower in the cache.

  loadSector(): OperatorFunction<WantedSector, ConsumedSector> {
    return publish((source$: Observable<WantedSector>) => {
      /* Split wantedSectors into a pipe of discarded wantedSectors and a pipe of simple and detailed wantedSectors.
       * ----------- wantedSectors -----------------------
       * \---------- discarded wantedSectors -------------
       *  \--------- simple and detailed wantedSectors ---
       */
      const discarded$ = source$.pipe(filter(wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Discarded));
      const simpleAndDetailed$ = source$.pipe(
        filter(
          wantedSector =>
            wantedSector.levelOfDetail === LevelOfDetail.Simple || wantedSector.levelOfDetail === LevelOfDetail.Detailed
        ),
        map(wantedSector => ({ key: this.wantedSectorCacheKey(wantedSector), wantedSector }))
      );

      /* Split simple and detailed wanted sectors into a pipe of cached request and uncached requests.
       * ----------- simple and detailed wantedSectors ---
       * \---------- cached wantedSectors ----------------
       *  \--------- uncached wantedSectors --------------
       */
      const existsInCache = ({ key }: KeyedWantedSector) => this._consumedSectorCache.has(key);
      const cached$ = simpleAndDetailed$.pipe(filter(existsInCache));
      const uncached$ = simpleAndDetailed$.pipe(
        filter((keyedWantedSector: KeyedWantedSector) => !existsInCache(keyedWantedSector))
      );

      /* Merge simple and detailed pipeline, save observable to cache, and decrease loadcount
       */
      const getSimpleSectorFromNetwork = ({ key, wantedSector }: { key: string; wantedSector: WantedSector }) => ({
        key,
        wantedSector,
        observable: this.loadSimpleSectorFromNetwork(wantedSector)
      });

      /* Split uncached wanted sectors into a pipe of simple wantedSectors and detailed wantedSectors. Increase load count
       * ----------- uncached wantedSectors --------------
       * \---------- simple wantedSectors ----------------
       *  \--------- detailed wantedSectors --------------
       */
      const simple$ = uncached$.pipe(
        subscribeOn(asyncScheduler),
        filter(({ wantedSector }) => wantedSector.levelOfDetail == LevelOfDetail.Simple),
        this._taskTracker.incrementTaskCountOnNext(),
        map(getSimpleSectorFromNetwork)
      );

      const getDetailedSectorFromNetwork = ({ key, wantedSector }: { key: string; wantedSector: WantedSector }) => ({
        key,
        wantedSector,
        observable: this.loadDetailedSectorFromNetwork(wantedSector)
      });

      const detailed$ = uncached$.pipe(
        subscribeOn(asyncScheduler),
        filter(({ wantedSector }) => wantedSector.levelOfDetail == LevelOfDetail.Detailed),
        this._taskTracker.incrementTaskCountOnNext(),
        map(getDetailedSectorFromNetwork)
      );

      const saveToCache = ({ key, observable }: WantedSecorWithRequestObservable) =>
        this._consumedSectorCache.forceInsert(key, observable);

      const network$ = merge(simple$, detailed$).pipe(
        tap({
          next: saveToCache
        }),
        map(({ observable }) => observable),
        mergeAll(this._concurrentNetworkOperations),
        this._taskTracker.incrementTaskCompletedOnNext()
      );

      const toDiscardedConsumedSector = (wantedSector: WantedSector) =>
        ({ ...wantedSector, group: undefined } as ConsumedSector);

      const getFromCache = ({ key }: KeyedWantedSector) => {
        return this._consumedSectorCache.get(key);
      };

      return merge(discarded$.pipe(map(toDiscardedConsumedSector)), cached$.pipe(flatMap(getFromCache)), network$).pipe(
        this._taskTracker.resetOnComplete()
      );
    });
  }

  private catchWantedSectorError<T>(wantedSector: WantedSector, methodName: string) {
    return catchError<T, Observable<T>>(error => {
      trackError(error, { moduleName: 'CachedRepository', methodName });
      this._consumedSectorCache.remove(this.wantedSectorCacheKey(wantedSector));
      throw error;
    });
  }

  private catchCtmFileError<T>(ctmRequest: CtmFileRequest, methodName: string) {
    return catchError<T, Observable<T>>(error => {
      trackError(error, {
        moduleName: 'CachedRepository',
        methodName
      });
      this._ctmFileCache.remove(this.ctmFileCacheKey(ctmRequest));
      throw error;
    });
  }

  private parsedDataObserver(wantedSector: WantedSector): NextObserver<SectorGeometry | SectorQuads> {
    return {
      next: data => {
        this._parsedDataSubject.next({
          blobUrl: wantedSector.blobUrl,
          sectorId: wantedSector.metadata.id,
          lod: wantedSector.levelOfDetail == LevelOfDetail.Simple ? 'simple' : 'detailed',
          data
        });
      }
    };
  }

  private nameGroup(wantedSector: WantedSector): OperatorFunction<Group, Group> {
    return tap(group => {
      group.name = `Quads ${wantedSector.metadata.id}`;
    });
  }

  private loadSimpleSectorFromNetwork(wantedSector: WantedSector): Observable<ConsumedSector> {
    const networkObservable: Observable<ConsumedSector> = onErrorResumeNext(
      defer(() =>
        this._modelSectorProvider.getBinaryFile(wantedSector.blobUrl, wantedSector.metadata.facesFile.fileName!)
      ).pipe(
        this.catchWantedSectorError(wantedSector, 'loadSimpleSectorFromNetwork'),
        flatMap(buffer => this._modelDataParser.parseF3D(new Uint8Array(buffer))),
        tap(this.parsedDataObserver(wantedSector)),
        map(sectorQuads => ({ ...wantedSector, data: sectorQuads })),
        this._modelDataTransformer.transform(),
        this.nameGroup(wantedSector),
        map(group => ({ ...wantedSector, group })),
        shareReplay(1),
        take(1)
      )
    );
    return networkObservable;
  }

  private loadDetailedSectorFromNetwork(wantedSector: WantedSector): Observable<ConsumedSector> {
    const networkObservable = onErrorResumeNext(
      scheduled(
        defer(() => {
          const indexFile = wantedSector.metadata.indexFile;
          const i3dFileObservable = from(
            this._modelSectorProvider.getBinaryFile(wantedSector.blobUrl, indexFile.fileName)
          ).pipe(
            retry(3),
            flatMap(buffer => this._modelDataParser.parseI3D(new Uint8Array(buffer)))
          );
          const ctmFilesObservable = from(indexFile.peripheralFiles).pipe(
            map(fileName => ({
              blobUrl: wantedSector.blobUrl,
              fileName
            })),
            this.loadCtmFile(),
            reduce((accumulator, value) => {
              accumulator.set(value.fileName, value.data);
              return accumulator;
            }, new Map())
          );
          return zip(i3dFileObservable, ctmFilesObservable).pipe(
            this.catchWantedSectorError(wantedSector, 'loadDetailedSectorFromNetwork'),
            map(([i3dFile, ctmFiles]) => this.finalizeDetailed(i3dFile as ParseSectorResult, ctmFiles)),
            tap(this.parsedDataObserver(wantedSector)),
            map(data => {
              return { ...wantedSector, data };
            }),
            this._modelDataTransformer.transform(),
            map(group => ({ ...wantedSector, group })),
            shareReplay(1),
            take(1)
          );
        }),
        asyncScheduler
      )
    );
    return networkObservable;
  }

  private loadCtmFile(): OperatorFunction<CtmFileRequest, CtmFileResult> {
    return flatMap(ctmRequest => {
      const key = this.ctmFileCacheKey(ctmRequest);
      if (this._ctmFileCache.has(key)) {
        return this._ctmFileCache.get(key);
      } else {
        return this.loadCtmFileFromNetwork(ctmRequest);
      }
    }, this._concurrentCtmRequests);
  }

  private loadCtmFileFromNetwork(ctmRequest: CtmFileRequest): Observable<CtmFileResult> {
    const networkObservable: Observable<{ fileName: string; data: ParseCtmResult }> = onErrorResumeNext(
      defer(() => this._modelSectorProvider.getBinaryFile(ctmRequest.blobUrl, ctmRequest.fileName)).pipe(
        this.catchCtmFileError(ctmRequest, 'loadCtmFileFromNetwork'),
        retry(3),
        flatMap(buffer => this._modelDataParser.parseCTM(new Uint8Array(buffer))),
        map(data => ({ fileName: ctmRequest.fileName, data: data as ParseCtmResult })),
        shareReplay(1),
        take(1)
      )
    );
    this._ctmFileCache.forceInsert(this.ctmFileCacheKey(ctmRequest), networkObservable);
    return networkObservable;
  }

  private finalizeDetailed(i3dFile: ParseSectorResult, ctmFiles: Map<string, ParseCtmResult>): SectorGeometry {
    const { instanceMeshes, triangleMeshes } = i3dFile;

    const finalTriangleMeshes = (() => {
      const { fileIds, colors, triangleCounts, treeIndices } = triangleMeshes;

      const meshesGroupedByFile = this.groupMeshesByNumber(fileIds);

      const finalMeshes = [];
      // Merge meshes by file
      // TODO do this in Rust instead
      for (const [fileId, meshIndices] of meshesGroupedByFile.entries()) {
        const fileTriangleCounts = meshIndices.map(i => triangleCounts[i]);
        const offsets = createOffsetsArray(fileTriangleCounts);
        // Load CTM (geometry)
        const fileName = `mesh_${fileId}.ctm`;
        const { indices, vertices, normals } = ctmFiles.get(fileName)!; // TODO: j-bjorne 16-04-2020: try catch error???

        const sharedColors = new Uint8Array(3 * indices.length);
        const sharedTreeIndices = new Float32Array(indices.length);

        for (let i = 0; i < meshIndices.length; i++) {
          const meshIdx = meshIndices[i];
          const treeIndex = treeIndices[meshIdx];
          const triOffset = offsets[i];
          const triCount = fileTriangleCounts[i];
          const [r, g, b] = [colors[4 * meshIdx + 0], colors[4 * meshIdx + 1], colors[4 * meshIdx + 2]];
          for (let triIdx = triOffset; triIdx < triOffset + triCount; triIdx++) {
            for (let j = 0; j < 3; j++) {
              const vIdx = indices[3 * triIdx + j];

              sharedTreeIndices[vIdx] = treeIndex;

              sharedColors[3 * vIdx] = r;
              sharedColors[3 * vIdx + 1] = g;
              sharedColors[3 * vIdx + 2] = b;
            }
          }
        }

        const mesh: TriangleMesh = {
          colors: sharedColors,
          fileId,
          treeIndices: sharedTreeIndices,
          indices,
          vertices,
          normals
        };
        finalMeshes.push(mesh);
      }
      return finalMeshes;
    })();

    const finalInstanceMeshes = (() => {
      const { fileIds, colors, treeIndices, triangleCounts, triangleOffsets, instanceMatrices } = instanceMeshes;
      const meshesGroupedByFile = this.groupMeshesByNumber(fileIds);

      const finalMeshes: InstancedMeshFile[] = [];
      // Merge meshes by file
      // TODO do this in Rust instead
      // TODO de-duplicate this with the merged meshes above
      for (const [fileId, meshIndices] of meshesGroupedByFile.entries()) {
        const fileName = `mesh_${fileId}.ctm`;
        const ctm = ctmFiles.get(fileName)!;

        const indices = ctm.indices;
        const vertices = ctm.vertices;
        const normals = ctm.normals;
        const instancedMeshes: InstancedMesh[] = [];

        const fileTriangleOffsets = new Float64Array(meshIndices.map(i => triangleOffsets[i]));
        const fileTriangleCounts = new Float64Array(meshIndices.map(i => triangleCounts[i]));
        const fileMeshesGroupedByOffsets = this.groupMeshesByNumber(fileTriangleOffsets);

        for (const [triangleOffset, fileMeshIndices] of fileMeshesGroupedByOffsets) {
          // NOTE the triangle counts should be the same for all meshes with the same offset,
          // hence we can look up only fileMeshIndices[0] instead of enumerating here
          const triangleCount = fileTriangleCounts[fileMeshIndices[0]];
          const instanceMatrixBuffer = new Float32Array(16 * fileMeshIndices.length);
          const treeIndicesBuffer = new Float32Array(fileMeshIndices.length);
          const colorBuffer = new Uint8Array(4 * fileMeshIndices.length);
          for (let i = 0; i < fileMeshIndices.length; i++) {
            const meshIdx = meshIndices[fileMeshIndices[i]];
            const treeIndex = treeIndices[meshIdx];
            const instanceMatrix = instanceMatrices.slice(meshIdx * 16, meshIdx * 16 + 16);
            instanceMatrixBuffer.set(instanceMatrix, i * 16);
            treeIndicesBuffer[i] = treeIndex;
            const color = colors.slice(meshIdx * 4, meshIdx * 4 + 4);
            colorBuffer.set(color, i * 4);
          }
          instancedMeshes.push({
            triangleCount,
            triangleOffset,
            instanceMatrices: instanceMatrixBuffer,
            colors: colorBuffer,
            treeIndices: treeIndicesBuffer
          });
        }

        const mesh: InstancedMeshFile = {
          fileId,
          indices,
          vertices,
          normals,
          instances: instancedMeshes
        };
        finalMeshes.push(mesh);
      }

      return finalMeshes;
    })();

    const sector: SectorGeometry = {
      treeIndexToNodeIdMap: i3dFile.treeIndexToNodeIdMap,
      nodeIdToTreeIndexMap: i3dFile.nodeIdToTreeIndexMap,
      primitives: i3dFile.primitives,
      instanceMeshes: finalInstanceMeshes,
      triangleMeshes: finalTriangleMeshes
    };

    return sector;
  }

  private groupMeshesByNumber(fileIds: Float64Array) {
    const meshesGroupedByFile = new Map<number, number[]>();
    for (let i = 0; i < fileIds.length; ++i) {
      const fileId = fileIds[i];
      const oldValue = meshesGroupedByFile.get(fileId);
      if (oldValue) {
        meshesGroupedByFile.set(fileId, [...oldValue, i]);
      } else {
        meshesGroupedByFile.set(fileId, [i]);
      }
    }
    return meshesGroupedByFile;
  }

  private wantedSectorCacheKey(wantedSector: WantedSector) {
    return '' + wantedSector.blobUrl + '.' + wantedSector.metadata.id + '.' + wantedSector.levelOfDetail;
  }

  private ctmFileCacheKey(request: { blobUrl: string; fileName: string }) {
    return '' + request.blobUrl + '.' + request.fileName;
  }
}
