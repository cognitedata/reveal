/*!
 * Copyright 2020 Cognite AS
 */

import { Repository } from './Repository';
import { WantedSector } from '../../data/model/WantedSector';
import { LevelOfDetail } from '../../data/model/LevelOfDetail';
import { OperatorFunction, pipe, Observable, from, merge, partition, of, asapScheduler, zip } from 'rxjs';
import {
  publish,
  filter,
  flatMap,
  map,
  share,
  tap,
  shareReplay,
  take,
  retry,
  reduce,
  subscribeOn,
  retryWhen,
  delay
} from 'rxjs/operators';
import { ModelDataRetriever } from '../../datasources/ModelDataRetriever';
import { CadSectorParser } from '../../data/parser/CadSectorParser';
import { SimpleAndDetailedToSector3D } from '../../data/transformer/three/SimpleAndDetailedToSector3D';
import { ConsumedSector } from '../../data/model/ConsumedSector';
import { MemoryRequestCache } from '../../cache/MemoryRequestCache';
import { ParseCtmResult, ParseSectorResult } from '../../workers/types/parser.types';
import { Sector, TriangleMesh, InstancedMeshFile, InstancedMesh } from '../../models/cad/types';
import { createOffsetsArray } from '../../utils/arrayUtils';

// TODO: j-bjorne 16-04-2020: REFACTOR FINALIZE INTO SOME OTHER FILE PLEZ!
export class CachedRepository implements Repository {
  private readonly _modelDataCache: MemoryRequestCache<string, Observable<ConsumedSector>> = new MemoryRequestCache({
    maxElementsInCache: 50
  });
  private readonly _ctmFileCache: MemoryRequestCache<string, Observable<ParseCtmResult>> = new MemoryRequestCache({
    maxElementsInCache: 300
  });
  private readonly _modelDataParser: CadSectorParser;
  private readonly _modelDataRetriever: ModelDataRetriever;
  private readonly _modelDataTransformer: SimpleAndDetailedToSector3D;

  constructor(
    modelDataRetriever: ModelDataRetriever,
    modelDataParser: CadSectorParser,
    modelDataTransformer: SimpleAndDetailedToSector3D
  ) {
    this._modelDataRetriever = modelDataRetriever;
    this._modelDataParser = modelDataParser;
    this._modelDataTransformer = modelDataTransformer;
  }

  // TODO j-bjorne 16-04-2020: Should look into ways of not sending in discarded sectors,
  // unless we want them to eventually set their priority to lower in the cache.

  loadSector(): OperatorFunction<WantedSector, ConsumedSector> {
    return pipe(
      subscribeOn(asapScheduler),
      publish((wantedSectorObservable: Observable<WantedSector>) => {
        // Creates an observable for simple and detailed only.
        const simpleAndDetailedObservable = wantedSectorObservable.pipe(
          filter(wantedSector => wantedSector.levelOfDetail !== LevelOfDetail.Discarded),
          share()
        );

        // Splits the observable into two observables based on the result of the predication
        const [cachedSectorObservable, uncachedSectorObservable] = partition(
          simpleAndDetailedObservable,
          wantedSector => this._modelDataCache.has(this.cacheKey(wantedSector))
        );

        const discardedSectorObservable: Observable<ConsumedSector> = wantedSectorObservable.pipe(
          filter(wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Discarded),
          map(wantedSector => ({ ...wantedSector, group: undefined }))
        );
        return merge(
          cachedSectorObservable.pipe(flatMap(wantedSector => this._modelDataCache.get(this.cacheKey(wantedSector)))),
          uncachedSectorObservable.pipe(this.loadSectorFromNetwork()),
          discardedSectorObservable
        );
      }),
      retryWhen(errors => {
        return errors.pipe(tap(e => console.error(e)), delay(5000));
      })
    );
  }

  clearCache() {
    this._modelDataCache.clear();
  }

  private loadSectorFromNetwork(): OperatorFunction<WantedSector, ConsumedSector> {
    return publish(wantedSectorObservable => {
      const simpleSectorObservable: Observable<ConsumedSector> = wantedSectorObservable.pipe(
        filter(wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Simple),
        flatMap((wantedSector: WantedSector) => {
          const networkObservable: Observable<ConsumedSector> = from(
            this._modelDataRetriever.fetchData(wantedSector.metadata.facesFile.fileName!)
          ).pipe(
            retry(3),
            map(arrayBuffer => ({ format: 'f3d', data: new Uint8Array(arrayBuffer) })),
            this._modelDataParser.parse(),
            map(data => {
              return { ...wantedSector, data };
            }),
            this._modelDataTransformer.transform(),
            tap(group => {
              group.name = `Quads ${wantedSector.id}`;
            }),
            map(group => ({ ...wantedSector, group })),
            shareReplay(1),
            take(1)
          );
          while (true) {
            try {
              this._modelDataCache.add(this.cacheKey(wantedSector), networkObservable);
              break;
            } catch (e) {
              this._modelDataCache.cleanCache(10);
            }
          }
          return networkObservable;
        })
      );
      const detailedSectorObservable: Observable<ConsumedSector> = wantedSectorObservable.pipe(
        filter(wantedSector => wantedSector.levelOfDetail === LevelOfDetail.Detailed),
        // tap(e => this.requestSet.add(this.cacheKey(e))),
        flatMap(wantedSector => {
          const i3dFileObservable = of(wantedSector.metadata.indexFile).pipe(
            flatMap(indexFile => this._modelDataRetriever.fetchData(indexFile.fileName)),
            map(response => ({
              format: 'i3d',
              data: new Uint8Array(response)
            })),
            retry(3),
            this._modelDataParser.parse()
          );

          const ctmFilesObservable = from(wantedSector.metadata.indexFile.peripheralFiles).pipe(
            this.loadCtmFile(),
            reduce((accumulator, value) => {
              accumulator.set(value.fileName, value.data);
              return accumulator;
            }, new Map())
          );
          const networkObservable = zip(i3dFileObservable, ctmFilesObservable).pipe(
            map(([i3dFile, ctmFiles]) => this.finalizeDetailed(i3dFile as ParseSectorResult, ctmFiles)),
            map(data => ({ ...wantedSector, data })),
            this._modelDataTransformer.transform(),
            map(group => ({ ...wantedSector, group })),
            shareReplay(1),
            take(1)
          );
          while (true) {
            try {
              this._modelDataCache.add(this.cacheKey(wantedSector), networkObservable);
              break;
            } catch (e) {
              this._modelDataCache.cleanCache(10);
            }
          }
          return networkObservable;
        })
      );
      return merge(simpleSectorObservable, detailedSectorObservable);
    });
  }

  private loadCtmFile(): OperatorFunction<string, { fileName: string; data: ParseCtmResult }> {
    return publish(fileNameArrayObservable => {
      const [cachedCtmFileObservable, uncachedCtmFileObservable] = partition(fileNameArrayObservable, fileName =>
        this._ctmFileCache.has(fileName)
      );
      return merge(
        cachedCtmFileObservable.pipe(
          flatMap(
            fileName => this._ctmFileCache.get(fileName),
            (fileName, data) => ({ fileName, data })
          )
        ),
        uncachedCtmFileObservable.pipe(this.loadCtmFileFromNetwork())
      );
    });
  }

  private loadCtmFileFromNetwork(): OperatorFunction<string, { fileName: string; data: ParseCtmResult }> {
    return pipe(
      flatMap(
        fileName => {
          const networkObservable = from(this._modelDataRetriever.fetchData(fileName)).pipe(
            retry(3),
            map(arrayBuffer => ({ format: 'ctm', data: new Uint8Array(arrayBuffer) })),
            this._modelDataParser.parse(),
            shareReplay(1),
            take(1)
          );
          while (true) {
            try {
              this._ctmFileCache.add(fileName, networkObservable as Observable<ParseCtmResult>);
              break;
            } catch (e) {
              this._ctmFileCache.cleanCache(10);
            }
          }
          return networkObservable;
        },
        (fileName, data) => ({ fileName, data: data as ParseCtmResult })
      )
    );
  }

  private finalizeDetailed(i3dFile: ParseSectorResult, ctmFiles: Map<string, ParseCtmResult>): Sector {
    const {
      boxes,
      circles,
      cones,
      eccentricCones,
      ellipsoidSegments,
      generalCylinders,
      generalRings,
      instanceMeshes,
      nuts,
      quads,
      sphericalSegments,
      torusSegments,
      trapeziums,
      triangleMeshes
    } = i3dFile;

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

        const sharedColors = new Float32Array(indices.length);
        const sharedTreeIndices = new Float32Array(indices.length);

        for (let i = 0; i < meshIndices.length; i++) {
          const meshIdx = meshIndices[i];
          const treeIndex = treeIndices[meshIdx];
          const triOffset = offsets[i];
          const triCount = fileTriangleCounts[i];
          const [r, g, b] = this.readColorToFloat32s(colors, meshIdx);

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

    const sector: Sector = {
      treeIndexToNodeIdMap: i3dFile.treeIndexToNodeIdMap,
      nodeIdToTreeIndexMap: i3dFile.nodeIdToTreeIndexMap,
      boxes,
      circles,
      cones,
      eccentricCones,
      ellipsoidSegments,
      generalCylinders,
      generalRings,
      instanceMeshes: finalInstanceMeshes,
      nuts,
      quads,
      sphericalSegments,
      torusSegments,
      trapeziums,
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

  private readColorToFloat32s(colors: Uint8Array, index: number): [number, number, number, number] {
    const r = colors[4 * index] / 255;
    const g = colors[4 * index + 1] / 255;
    const b = colors[4 * index + 2] / 255;
    const a = colors[4 * index + 3] / 255;
    return [r, g, b, a];
  }

  private cacheKey(wantedSector: WantedSector) {
    return '' + wantedSector.id + '.' + wantedSector.levelOfDetail;
  }
}
