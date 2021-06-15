/*!
 * Copyright 2021 Cognite AS
 */

import { Repository } from './Repository';
import { WantedSector, SectorGeometry, ConsumedSector } from './types';
import { LevelOfDetail } from './LevelOfDetail';

import { CadSectorParser, ParseGltfResult } from './CadSectorParser';
import { SimpleAndDetailedToSector3D } from './SimpleAndDetailedToSector3D';
import { MemoryRequestCache } from '../../../utilities/cache/MemoryRequestCache';
import { ParseCtmResult, ParseSectorResult } from '@cognite/reveal-parser-worker';
import { TriangleMesh, InstancedMeshFile, InstancedMesh } from '../rendering/types';
import { assertNever, createOffsetsArray } from '../../../utilities';

import { BinaryFileProvider } from '../../../utilities/networking/types';
import { groupMeshesByNumber } from './groupMeshesByNumber';
import { MostFrequentlyUsedCache } from '../../../utilities/MostFrequentlyUsedCache';
import { trackError } from '../../../utilities/metrics';

import * as THREE from 'three';

// TODO: j-bjorne 16-04-2020: REFACTOR FINALIZE INTO SOME OTHER FILE PLEZ!
export class CachedRepository implements Repository {
  private readonly _consumedSectorCache: MemoryRequestCache<string, ConsumedSector>;
  private readonly _ctmFileCache: MostFrequentlyUsedCache<string, ParseCtmResult>;
  private readonly _gltfFileCache: MostFrequentlyUsedCache<string, ParseGltfResult>;

  private readonly _modelSectorProvider: BinaryFileProvider;
  private readonly _modelDataParser: CadSectorParser;
  private readonly _modelDataTransformer: SimpleAndDetailedToSector3D;

  constructor(
    modelSectorProvider: BinaryFileProvider,
    modelDataParser: CadSectorParser,
    modelDataTransformer: SimpleAndDetailedToSector3D
  ) {
    this._modelSectorProvider = modelSectorProvider;
    this._modelDataParser = modelDataParser;
    this._modelDataTransformer = modelDataTransformer;

    this._consumedSectorCache = new MemoryRequestCache(50, consumedSector => {
      if (consumedSector.group !== undefined) {
        // Dereference so GPU resources can be cleaned up if geomety isn't used anymore
        consumedSector.group.dereference();
      }
    });
    this._ctmFileCache = new MostFrequentlyUsedCache(10);
    this._gltfFileCache = new MostFrequentlyUsedCache(10);
  }

  clear() {
    this._consumedSectorCache.clear();
    this._ctmFileCache.clear();
    this._gltfFileCache.clear();
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
            blobUrl: sector.blobUrl,
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
      trackError(error, { methodName: 'loadSector', moduleName: 'CachedRepository' });
      throw error;
    }
  }

  private async loadSimpleSectorFromNetwork(wantedSector: WantedSector): Promise<ConsumedSector> {
    // TODO 2021-05-05 larsmoa: Retry
    const buffer = await this._modelSectorProvider.getBinaryFile(
      wantedSector.blobUrl,
      wantedSector.metadata.facesFile.fileName!
    );
    const geometry = await this._modelDataParser.parseF3D(new Uint8Array(buffer));
    const transformed = await this._modelDataTransformer.transformSimpleSector(
      wantedSector.blobUrl,
      wantedSector.metadata,
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

  private async loadI3DFromNetwork(modelBlobUrl: string, filename: string): Promise<ParseSectorResult> {
    const buffer = await this._modelSectorProvider.getBinaryFile(modelBlobUrl, filename);
    return this._modelDataParser.parseI3D(new Uint8Array(buffer));
  }

  private async loadCtmsFromNetwork(
    modelBlobUrl: string,
    ctmFilenames: string[]
  ): Promise<Map<string, ParseCtmResult>> {
    const ctms = await Promise.all(ctmFilenames.map(x => this.loadCtmFileFromNetwork(modelBlobUrl, x)));
    return ctmFilenames.reduce(
      (map, filename, index) => map.set(filename, ctms[index]),
      new Map<string, ParseCtmResult>()
    );
  }

  private async loadGltfsFromNetwork(
    modelBlobUrl: string,
    gltfFileNames: string[]
  ): Promise<Map<string, ParseGltfResult>> {
    const gltfs = await Promise.all(gltfFileNames.map(x => this.loadGltfFileFromNetwork(modelBlobUrl, x)));
    return gltfFileNames.reduce(
      (map, filename, index) => map.set(filename, gltfs[index]),
      new Map<string, ParseGltfResult>()
    );
  }

  private async loadDetailedSectorFromNetwork(wantedSector: WantedSector): Promise<ConsumedSector> {
    const indexFile = wantedSector.metadata.indexFile;

    const gltf = true;

    const i3dPromise = this.loadI3DFromNetwork(wantedSector.blobUrl, indexFile.fileName);

    let geometry: SectorGeometry;

    if (gltf) {
      const gltfPromise = this.loadGltfsFromNetwork(wantedSector.blobUrl, indexFile.peripheralFiles);

      const i3d = await i3dPromise;
      const gltfs = await gltfPromise;

      geometry = this.finalizeDetailedGltf(i3d, gltfs);
    } else {
      const ctmsPromise = this.loadCtmsFromNetwork(wantedSector.blobUrl, indexFile.peripheralFiles);

      const i3d = await i3dPromise;
      const ctms = await ctmsPromise;

      geometry = this.finalizeDetailedCtm(i3d, ctms);
    }

    const transformed = await this._modelDataTransformer.transformDetailedSector(
      wantedSector.blobUrl,
      wantedSector.metadata,
      geometry,
      wantedSector.geometryClipBox
    );

    console.log("We have " + transformed.instancedMeshes.length + " instance meshes");

    // transformed.instancedMeshes[0].
    
    for (let i = 0; i < transformed.instancedMeshes.length; i++) {
      const instanceMesh = transformed.instancedMeshes[i];
      if (!instanceMesh.instances) {
        console.log("No instances, skipping");
        continue;
      }
      console.log("For instance mesh: " + instanceMesh.instances.length + " instances");
      for (let j = 0; j < instanceMesh.instances.length; j++) {
        const instance = instanceMesh.instances[j];
      }
    }

    const consumedSector: ConsumedSector = {
      ...wantedSector,
      group: transformed.sectorMeshes,
      instancedMeshes: transformed.instancedMeshes
    };

    return consumedSector;
  }

  private async loadCtmFileFromNetwork(modelBlobUrl: string, filename: string): Promise<ParseCtmResult> {
    const cacheKey = this.ctmFileCacheKey(modelBlobUrl, filename);
    const cached = this._ctmFileCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    console.log("Trying to get file " + filename);
    
    // TODO 2021-05-05 larsmoa: Move retry to getBinaryFile()
    const buffer = await this._modelSectorProvider.getBinaryFile(modelBlobUrl, filename);
    const parsedCtm = await this._modelDataParser.parseCTM(new Uint8Array(buffer));
    this._ctmFileCache.set(cacheKey, parsedCtm);
    return parsedCtm;
  }

  private async loadGltfFileFromNetwork(modelBlobUrl: string, filename: string): Promise<ParseGltfResult> {
    const cacheKey = this.gltfFileCacheKey(modelBlobUrl, filename);
    const cached = this._gltfFileCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const parsedGltf = await this._modelDataParser.parseGltf(modelBlobUrl + '/' + filename);
    this._gltfFileCache.set(cacheKey, parsedGltf);
    return parsedGltf;
  }

  private finalizeDetailedGltf(i3dFile: ParseSectorResult, gltfFiles: Map<string, ParseGltfResult>): SectorGeometry {
    const { instanceMeshes, triangleMeshes } = i3dFile;

    const finalTriangleMeshes = (() => {
      const { fileIds, colors, triangleCounts, treeIndices } = triangleMeshes;

      const finalMeshes = [];

      for (const { id: fileId, meshIndices } of groupMeshesByNumber(fileIds)) {
        const fileTriangleCounts = meshIndices.map(i => triangleCounts[i]);
        const offsets = createOffsetsArray(fileTriangleCounts);
        // Load glb (geometry)
        const fileName = `mesh_${fileId}.glb`;

        const newVertices: number[] = [];
        const newIndices: number[] = [];

        const { indices, vertices, normals, gltf } = gltfFiles.get(fileName)!; // TODO: j-bjorne 16-04-2020: try catch error???

        // Should these be 3 * vertices.length, vertices.length instead?
        // const sharedColors = new Uint8Array(3 * indices.length);
        // const sharedTreeIndices = new Float32Array(indices.length);
        const sharedColors: number[] = [];
        const sharedTreeIndices: number[] = [];

        for (let i = 0; i < meshIndices.length; i++) {
          const meshIdx = meshIndices[i];
          const treeIndex = treeIndices[meshIdx];
          const originalTriOffset = offsets[i];
          const originalTriCount = fileTriangleCounts[i];
        
          const meshName = `mesh_${originalTriOffset}_${originalTriCount}`;
          const mesh: THREE.Mesh<any, any> = (gltf.scene.getObjectByName(meshName) as THREE.Mesh<any, any>);

          const isolatedVertices = mesh.geometry.attributes['position'].array;
          const isolatedIndices = mesh.geometry.index.array;

          const triOffset = newIndices.length / 3;
          
          const indexOffset = newVertices.length / 3;
          for (let i = 0; i < isolatedVertices.length / 3; i++) {
            newVertices.push(- isolatedVertices[3 * i + 0]);
            newVertices.push(isolatedVertices[3 * i + 2]);
            newVertices.push(isolatedVertices[3 * i + 1]);
          }

          for (let i = 0; i < isolatedIndices.length; i++) {
            newIndices.push(isolatedIndices[i] + indexOffset);
          }

          while (sharedColors.length < newVertices.length) {
            sharedColors.push(0);
          }

          while (sharedTreeIndices.length < newVertices.length / 3) {
            sharedTreeIndices.push(0);
          }

          const triCount = newIndices.length / 3 - triOffset;
          
          const [r, g, b] = [colors[4 * meshIdx + 0], colors[4 * meshIdx + 1], colors[4 * meshIdx + 2]];
          for (let triIdx = triOffset; triIdx < triOffset + triCount; triIdx++) {
            
            for (let j = 0; j < 3; j++) {
              const vIdx = newIndices[3 * triIdx + j];

              sharedTreeIndices[vIdx] = treeIndex;

              sharedColors[3 * vIdx] = r;
              sharedColors[3 * vIdx + 1] = g;
              sharedColors[3 * vIdx + 2] = b;
            }
          }
        }

        const reformattedVertices = new Float32Array(newVertices.length);
        const reformattedIndices = new Uint32Array(newIndices.length);
        const reformattedSharedColors = new Uint8Array(sharedColors.length);
        const reformattedSharedTreeIndices = new Float32Array(sharedTreeIndices.length);

        for (let i = 0; i < newVertices.length; i++) {
          reformattedVertices[i] = newVertices[i];
        }
        
        for (let i = 0; i < newIndices.length; i++) {
          reformattedIndices[i] = newIndices[i];
        }

        for (let i = 0; i < sharedColors.length; i++) {
          reformattedSharedColors[i] = sharedColors[i];
        }

        for (let i = 0; i < sharedTreeIndices.length; i++) {
          reformattedSharedTreeIndices[i] = sharedTreeIndices[i];
        }

        console.log("Num vertices = " + newVertices.length);
        console.log("Num indices = " + newIndices.length);

        let maxi = 0;
        let mini = 1e9;
        for (let i = 0; i < newIndices.length; i++) {
          maxi = Math.max(newIndices[i], maxi);
          mini = Math.min(newIndices[i], mini);
        }

        console.log("Max i = " + maxi);
        console.log("Min i = " + mini);

        const mesh: TriangleMesh = {
          // colors: sharedColors,
          colors: reformattedSharedColors,
          fileId,
          // treeIndices: sharedTreeIndices,
          treeIndices: reformattedSharedTreeIndices,
          indices: reformattedIndices,
          // vertices,
          vertices: reformattedVertices,
          normals
        };
        finalMeshes.push(mesh);
      }

      // debugger;
      
      return finalMeshes;
    })();

    const finalInstanceMeshes = (() => {
      const { fileIds, colors, treeIndices, triangleCounts, triangleOffsets, instanceMatrices } = instanceMeshes;

      const finalMeshes: InstancedMeshFile[] = [];
      // Merge meshes by file
      // TODO do this in Rust instead
      // TODO de-duplicate this with the merged meshes above
      for (const { id: fileId, meshIndices } of groupMeshesByNumber(fileIds)) {
        const fileName = `mesh_${fileId}.glb`;
        const gltf = gltfFiles.get(fileName)!;

        // const vertices = gltf.vertices;
        const instancedMeshes: InstancedMesh[] = [];

        const fileTriangleOffsets = new Float64Array(meshIndices.map(i => triangleOffsets[i]));
        const fileTriangleCounts = new Float64Array(meshIndices.map(i => triangleCounts[i]));

        const newIndices: number[] = [];
        const newVertices: number[] = [];
        
        const indices = gltf.indices;
        console.log("10 first original indices = ");
        for (let i = 0; i < 10; i++) {
          console.log(indices[i]);
        }
        /* const reformattedIndices = new Uint32Array(indices.length);
        for (let i = 0; i < indices.length; i++) {
          reformattedIndices[i] = indices[i];
        } */

        const indexMap = new Map<number, { triangleOffset: number; triangleCount: number; }>();

        for (const { id: triangleOffset, meshIndices: fileMeshIndices } of groupMeshesByNumber(fileTriangleOffsets)) {
          // NOTE the triangle counts should be the same for all meshes with the same offset,
          const triangleCount = fileTriangleCounts[fileMeshIndices[0]];

          const meshName = `mesh_${triangleOffset}_${triangleCount}`;
          const mesh: THREE.Mesh<any, any> = (gltf.gltf.scene.getObjectByName(meshName) as THREE.Mesh<any, any>);

          if (!mesh) {
            console.log("Could not find object with name " + meshName);
          }

          let offset: number;
          let count: number;
          
          if (triangleOffset in indexMap) {
            const indexTuple = indexMap.get(triangleOffset)!;
            offset = indexTuple.triangleOffset;
            count = indexTuple.triangleCount;
          } else {
            offset = Math.floor(newIndices.length / 3);
            count = mesh.geometry.index.array.length / 3; // Math.floor(mesh.geometry.index.array.length / 3);

            const vertexIndexOffset = newVertices.length / 3;

            for (let i = 0; i < mesh.geometry.attributes['position'].array.length / 3; i++) {
              newVertices.push(- mesh.geometry.attributes['position'].array[3 * i + 0]);
              newVertices.push(mesh.geometry.attributes['position'].array[3 * i + 2]);
              newVertices.push(mesh.geometry.attributes['position'].array[3 * i + 1]);
            }
            
            for (let i = 0; i < mesh.geometry.index.array.length; i++) {
              newIndices.push(mesh.geometry.index.array[i] + vertexIndexOffset);
            }

            indexMap.set(triangleOffset, { triangleOffset: offset, triangleCount: count });
          }

          console.log("For mesh name " + meshName + ", using offset = " + offset + ", count = " + count);
          console.log("Had originally offset = " + triangleOffset + ", count = " + triangleCount);
          
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
            // triangleCount,
            // triangleOffset,
            triangleOffset: offset,
            triangleCount: count,
            instanceMatrices: instanceMatrixBuffer,
            colors: colorBuffer,
            treeIndices: treeIndicesBuffer
          });
        }

        const reformattedIndices = new Uint32Array(newIndices.length);
        const reformattedVertices = new Float32Array(newVertices.length);

        for (let i = 0; i < newIndices.length; i++) {
          reformattedIndices[i] = newIndices[i];
        }

        for (let i = 0; i < newVertices.length; i++) {
          reformattedVertices[i] = newVertices[i];
        }

        console.log("10 first new indices = ");
        for (let i = 0; i < 10; i++) {
          console.log(reformattedIndices[i]);
        }

        const mesh: InstancedMeshFile = {
          fileId,
          indices: reformattedIndices,
          // vertices,
          vertices: reformattedVertices,
          instances: instancedMeshes
        };
        finalMeshes.push(mesh);
      }
      
      // debugger;

      return finalMeshes;
    })();

    const sector: SectorGeometry = {
      treeIndexToNodeIdMap: i3dFile.treeIndexToNodeIdMap,
      nodeIdToTreeIndexMap: i3dFile.nodeIdToTreeIndexMap,
      primitives: i3dFile.primitives,
      instanceMeshes: finalInstanceMeshes,
      triangleMeshes: finalTriangleMeshes
    };

    // debugger;

    return sector;
  }

  private finalizeDetailedCtm(i3dFile: ParseSectorResult, ctmFiles: Map<string, ParseCtmResult>): SectorGeometry {
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
      treeIndexToNodeIdMap: i3dFile.treeIndexToNodeIdMap,
      nodeIdToTreeIndexMap: i3dFile.nodeIdToTreeIndexMap,
      primitives: i3dFile.primitives,
      instanceMeshes: finalInstanceMeshes,
      triangleMeshes: finalTriangleMeshes
    };

    return sector;
  }

  private wantedSectorCacheKey(wantedSector: WantedSector) {
    return wantedSector.blobUrl + '.' + wantedSector.metadata.id + '.' + wantedSector.levelOfDetail;
  }

  private ctmFileCacheKey(blobUrl: string, fileName: string) {
    return blobUrl + '.' + fileName;
  }

  private gltfFileCacheKey(blobUrl: string, fileName: string) {
    return blobUrl + '.' + fileName;
  }
}
