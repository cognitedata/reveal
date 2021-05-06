/*!
 * Copyright 2021 Cognite AS
 */

import { Repository } from './Repository';
import { WantedSector, SectorGeometry, ConsumedSector } from './types';
import { LevelOfDetail } from './LevelOfDetail';
import { OperatorFunction, Observable, from, zip, onErrorResumeNext, defer, scheduled, asyncScheduler } from 'rxjs';
import { mergeMap, map, tap, shareReplay, take, retry, reduce, catchError } from 'rxjs/operators';
import { CadSectorParser } from './CadSectorParser';
import { SimpleAndDetailedToSector3D } from './SimpleAndDetailedToSector3D';
import { MemoryRequestCache } from '../../../utilities/cache/MemoryRequestCache';
import { ParseCtmResult, ParseSectorResult } from '@cognite/reveal-parser-worker';
import { TriangleMesh, InstancedMeshFile, InstancedMesh } from '../rendering/types';
import { assertNever, createOffsetsArray } from '../../../utilities';
import { trackError } from '../../../utilities/metrics';
import { BinaryFileProvider } from '../../../utilities/networking/types';
import { groupMeshesByNumber } from './groupMeshesByNumber';
import { MostFrequentlyUsedCache } from '../../../utilities/MostFrequentlyUsedCache';
import { AutoDisposeGroup } from '../../../utilities/three';

type CtmFileRequest = { blobUrl: string; fileName: string };
type CtmFileResult = { fileName: string; data: ParseCtmResult };

// TODO: j-bjorne 16-04-2020: REFACTOR FINALIZE INTO SOME OTHER FILE PLEZ!
export class CachedRepository implements Repository {
  private readonly _consumedSectorCache: MemoryRequestCache<string, Promise<ConsumedSector>>;
  private readonly _ctmFileCache: MostFrequentlyUsedCache<string, Observable<CtmFileResult>>;

  private readonly _modelSectorProvider: BinaryFileProvider;
  private readonly _modelDataParser: CadSectorParser;
  private readonly _modelDataTransformer: SimpleAndDetailedToSector3D;
  private readonly _concurrentCtmRequests: number;

  constructor(
    modelSectorProvider: BinaryFileProvider,
    modelDataParser: CadSectorParser,
    modelDataTransformer: SimpleAndDetailedToSector3D,
    concurrentCtmRequest: number = 10
  ) {
    this._modelSectorProvider = modelSectorProvider;
    this._modelDataParser = modelDataParser;
    this._modelDataTransformer = modelDataTransformer;
    this._concurrentCtmRequests = concurrentCtmRequest;

    this._consumedSectorCache = new MemoryRequestCache(50, async consumedSector => {
      const sector = await consumedSector;
      if (sector.group !== undefined) {
        // Dereference so GPU resources can be cleaned up if geomety isn't used anymore
        sector.group.dereference();
      }
    });
    this._ctmFileCache = new MostFrequentlyUsedCache(10);
  }

  clear() {
    this._consumedSectorCache.clear();
    this._ctmFileCache.clear();
  }

  // TODO j-bjorne 16-04-2020: Should look into ways of not sending in discarded sectors,
  // unless we want them to eventually set their priority to lower in the cache.

  async loadSector(sector: WantedSector): Promise<ConsumedSector> {
    const cacheKey = this.wantedSectorCacheKey(sector);
    if (this._consumedSectorCache.has(cacheKey)) {
      return this._consumedSectorCache.get(cacheKey);
    }

    async function waitAndReference(operation: Promise<ConsumedSector>): Promise<ConsumedSector> {
      const consumed = await operation;
      if (consumed.group !== undefined) {
        // Increase reference count to avoid geometry from being disposed
        consumed.group.reference();
      }
      return consumed;
    }

    switch (sector.levelOfDetail) {
      case LevelOfDetail.Detailed: {
        const loadOperation = this.loadDetailedSectorFromNetwork(sector).toPromise();
        this._consumedSectorCache.forceInsert(cacheKey, loadOperation);
        return waitAndReference(loadOperation);
      }

      case LevelOfDetail.Simple: {
        const loadOperation = this.loadSimpleSectorFromNetwork(sector).toPromise();
        this._consumedSectorCache.forceInsert(cacheKey, loadOperation);
        return waitAndReference(loadOperation);
      }

      case LevelOfDetail.Discarded:
        return {
          blobUrl: sector.blobUrl,
          metadata: sector.metadata,
          levelOfDetail: sector.levelOfDetail,
          instancedMeshes: [],
          group: undefined
        };

      default:
        assertNever(sector.levelOfDetail);
    }
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

  private nameGroup(
    wantedSector: WantedSector
  ): OperatorFunction<
    { sectorMeshes: AutoDisposeGroup; instancedMeshes: InstancedMeshFile[] },
    { sectorMeshes: AutoDisposeGroup; instancedMeshes: InstancedMeshFile[] }
  > {
    return tap(group => {
      group.sectorMeshes.name = `Quads ${wantedSector.metadata.id}`;
    });
  }

  private loadSimpleSectorFromNetwork(wantedSector: WantedSector): Observable<ConsumedSector> {
    const networkObservable: Observable<ConsumedSector> = onErrorResumeNext(
      defer(() =>
        this._modelSectorProvider.getBinaryFile(wantedSector.blobUrl, wantedSector.metadata.facesFile.fileName!)
      ).pipe(
        this.catchWantedSectorError(wantedSector, 'loadSimpleSectorFromNetwork'),
        mergeMap(buffer => this._modelDataParser.parseF3D(new Uint8Array(buffer))),
        map(sectorQuads => ({ ...wantedSector, data: sectorQuads })),
        this._modelDataTransformer.transform(),
        this.nameGroup(wantedSector),
        map(group => ({ ...wantedSector, group: group.sectorMeshes, instancedMeshes: group.instancedMeshes })),
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
            mergeMap(buffer => this._modelDataParser.parseI3D(new Uint8Array(buffer)))
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
            map(data => {
              return { ...wantedSector, data };
            }),
            this._modelDataTransformer.transform(),
            map(group => ({ ...wantedSector, group: group.sectorMeshes, instancedMeshes: group.instancedMeshes })),
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
    return mergeMap(ctmRequest => {
      const key = this.ctmFileCacheKey(ctmRequest);
      const ctmFile = this._ctmFileCache.get(key);
      if (ctmFile !== undefined) {
        return ctmFile;
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
        mergeMap(buffer => this._modelDataParser.parseCTM(new Uint8Array(buffer))),
        map(data => ({ fileName: ctmRequest.fileName, data: data as ParseCtmResult })),
        shareReplay(1),
        take(1)
      )
    );
    this._ctmFileCache.set(this.ctmFileCacheKey(ctmRequest), networkObservable);
    return networkObservable;
  }

  private finalizeDetailed(i3dFile: ParseSectorResult, ctmFiles: Map<string, ParseCtmResult>): SectorGeometry {
    const { instanceMeshes, triangleMeshes } = i3dFile;

    const finalTriangleMeshes = (() => {
      const { fileIds, colors, triangleCounts, treeIndices } = triangleMeshes;

      const finalMeshes = [];

      for (const { id: fileId, meshIndices } of groupMeshesByNumber(fileIds)) {
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

      const finalMeshes: InstancedMeshFile[] = [];
      // Merge meshes by file
      // TODO do this in Rust instead
      // TODO de-duplicate this with the merged meshes above
      for (const { id: fileId, meshIndices } of groupMeshesByNumber(fileIds)) {
        const fileName = `mesh_${fileId}.ctm`;
        const ctm = ctmFiles.get(fileName)!;

        const indices = ctm.indices;
        const vertices = ctm.vertices;
        const instancedMeshes: InstancedMesh[] = [];

        const fileTriangleOffsets = new Float64Array(meshIndices.map(i => triangleOffsets[i]));
        const fileTriangleCounts = new Float64Array(meshIndices.map(i => triangleCounts[i]));

        for (const { id: triangleOffset, meshIndices: fileMeshIndices } of groupMeshesByNumber(fileTriangleOffsets)) {
          // NOTE the triangle counts should be the same for all meshes with the same offset,
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

  private wantedSectorCacheKey(wantedSector: WantedSector) {
    return '' + wantedSector.blobUrl + '.' + wantedSector.metadata.id + '.' + wantedSector.levelOfDetail;
  }

  private ctmFileCacheKey(request: { blobUrl: string; fileName: string }) {
    return '' + request.blobUrl + '.' + request.fileName;
  }
}
