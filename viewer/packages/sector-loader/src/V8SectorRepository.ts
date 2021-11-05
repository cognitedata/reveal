/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever, MostFrequentlyUsedCache, MemoryRequestCache } from '@reveal/utilities';
import { MetricsLogger } from '@reveal/metrics';
import {
  CadSectorParser,
  LevelOfDetail,
  WantedSector,
  SectorGeometry,
  ConsumedSector,
  TriangleMesh,
  InstancedMeshFile,
  InstancedMesh,
  V8SectorMetadata
} from '@reveal/cad-parsers';

import { SimpleAndDetailedToSector3D } from './v8/SimpleAndDetailedToSector3D';
import { SectorRepository } from './SectorRepository';

import { groupMeshesByNumber } from './v8/groupMeshesByNumber';
import { createOffsetsArray } from './v8/arrays';

import { BinaryFileProvider } from '@reveal/modeldata-api';
import { ParseCtmResult, ParseSectorResult } from '@cognite/reveal-parser-worker';
import { CadMaterialManager } from '@reveal/rendering';

export class V8SectorRepository implements SectorRepository {
  private readonly _consumedSectorCache: MemoryRequestCache<string, ConsumedSector>;
  private readonly _ctmFileCache: MostFrequentlyUsedCache<string, Promise<ParseCtmResult>>;

  private readonly _modelSectorProvider: BinaryFileProvider;
  private readonly _modelDataParser: CadSectorParser;
  private readonly _modelDataTransformer: SimpleAndDetailedToSector3D;

  constructor(modelSectorProvider: BinaryFileProvider, materialManager: CadMaterialManager) {
    this._modelSectorProvider = modelSectorProvider;
    this._modelDataParser = new CadSectorParser();
    this._modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);

    this._consumedSectorCache = new MemoryRequestCache(50, consumedSector => {
      if (consumedSector.group !== undefined) {
        // Dereference so GPU resources can be cleaned up if geomety isn't used anymore
        consumedSector.group.dereference();
      }
    });
    this._ctmFileCache = new MostFrequentlyUsedCache(10);
  }

  clear(): void {
    this._consumedSectorCache.clear();
    this._ctmFileCache.clear();
  }

  // TODO j-bjorne 16-04-2020: Should look into ways of not sending in discarded sectors,
  // unless we want them to eventually set their priority to lower in the cache.

  async loadSector(sector: WantedSector): Promise<ConsumedSector> {
    const cacheKey = this.wantedSectorCacheKey(sector);
    try {
      if (this._consumedSectorCache.has(cacheKey)) {
        return this._consumedSectorCache.get(cacheKey);
      }

      switch (sector.levelOfDetail) {
        case LevelOfDetail.Detailed: {
          const consumed = await this.loadDetailedSectorFromNetwork(sector);
          this._consumedSectorCache.forceInsert(cacheKey, consumed);
          // Increase reference count to avoid geometry from being disposed
          consumed?.group?.reference();
          return consumed;
        }

        case LevelOfDetail.Simple: {
          const consumed = await this.loadSimpleSectorFromNetwork(sector);
          this._consumedSectorCache.forceInsert(cacheKey, consumed);
          // Increase reference count to avoid geometry from being disposed
          consumed?.group?.reference();
          return consumed;
        }

        case LevelOfDetail.Discarded:
          return {
            modelIdentifier: sector.modelIdentifier,
            metadata: sector.metadata,
            levelOfDetail: sector.levelOfDetail,
            instancedMeshes: [],
            group: undefined
          };

        default:
          assertNever(sector.levelOfDetail);
      }
    } catch (error) {
      this._consumedSectorCache.remove(cacheKey);
      MetricsLogger.trackError(error as Error, { methodName: 'loadSector', moduleName: 'CachedRepository' });
      throw error;
    }
  }

  private async loadSimpleSectorFromNetwork(wantedSector: WantedSector): Promise<ConsumedSector> {
    const metadata = wantedSector.metadata as V8SectorMetadata;

    // TODO 2021-05-05 larsmoa: Retry
    const buffer = await this._modelSectorProvider.getBinaryFile(
      wantedSector.modelBaseUrl,
      metadata.facesFile.fileName!
    );
    const geometry = await this._modelDataParser.parseF3D(new Uint8Array(buffer));
    const transformed = await this._modelDataTransformer.transformSimpleSector(
      wantedSector.modelIdentifier,
      metadata,
      geometry,
      wantedSector.geometryClipBox
    );
    const consumedSector: ConsumedSector = {
      ...wantedSector,
      group: transformed.sectorMeshes,
      instancedMeshes: transformed.instancedMeshes
    };
    return consumedSector;
  }

  private async loadI3DFromNetwork(modelBaseUrl: string, filename: string): Promise<ParseSectorResult> {
    const buffer = await this._modelSectorProvider.getBinaryFile(modelBaseUrl, filename);
    return this._modelDataParser.parseI3D(new Uint8Array(buffer));
  }

  private async loadCtmsFromNetwork(
    modelBaseUrl: string,
    ctmFilenames: string[]
  ): Promise<Map<string, ParseCtmResult>> {
    const ctms = await Promise.all(ctmFilenames.map(x => this.loadCtmFileFromNetwork(modelBaseUrl, x)));
    return ctmFilenames.reduce(
      (map, filename, index) => map.set(filename, ctms[index]),
      new Map<string, ParseCtmResult>()
    );
  }

  private async loadDetailedSectorFromNetwork(wantedSector: WantedSector): Promise<ConsumedSector> {
    const metadata = wantedSector.metadata as V8SectorMetadata;
    const indexFile = metadata.indexFile;

    const i3dPromise = this.loadI3DFromNetwork(wantedSector.modelBaseUrl, indexFile.fileName);
    const ctmsPromise = this.loadCtmsFromNetwork(wantedSector.modelBaseUrl, indexFile.peripheralFiles);

    const i3d = await i3dPromise;
    const ctms = await ctmsPromise;
    const geometry = this.finalizeDetailed(i3d, ctms);

    const transformed = await this._modelDataTransformer.transformDetailedSector(
      wantedSector.modelIdentifier,
      metadata,
      geometry,
      wantedSector.geometryClipBox
    );

    const consumedSector: ConsumedSector = {
      ...wantedSector,
      group: transformed.sectorMeshes,
      instancedMeshes: transformed.instancedMeshes
    };
    return consumedSector;
  }

  private async loadCtmFileFromNetwork(modelBaseUrl: string, filename: string): Promise<ParseCtmResult> {
    const cacheKey = this.ctmFileCacheKey(modelBaseUrl, filename);
    const cached = this._ctmFileCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }
    const ctmPromise = this._modelSectorProvider
      .getBinaryFile(modelBaseUrl, filename)
      .then(buffer => this._modelDataParser.parseCTM(new Uint8Array(buffer)));
    this._ctmFileCache.set(cacheKey, ctmPromise);
    return ctmPromise;
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
            const instanceMatrix = instanceMatrices.subarray(meshIdx * 16, meshIdx * 16 + 16);
            instanceMatrixBuffer.set(instanceMatrix, i * 16);
            treeIndicesBuffer[i] = treeIndex;
            const color = colors.subarray(meshIdx * 4, meshIdx * 4 + 4);
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
      primitives: i3dFile.primitives,
      instanceMeshes: finalInstanceMeshes,
      triangleMeshes: finalTriangleMeshes
    };

    return sector;
  }

  private wantedSectorCacheKey(wantedSector: WantedSector) {
    return wantedSector.modelIdentifier + '.' + wantedSector.metadata.id + '.' + wantedSector.levelOfDetail;
  }

  private ctmFileCacheKey(modelBaseUrl: string, fileName: string) {
    return modelBaseUrl + '.' + fileName;
  }
}
