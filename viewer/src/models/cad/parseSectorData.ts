/*!
 * Copyright 2019 Cognite AS
 */

import { Sector, SectorQuads, SectorMetadata, TriangleMesh, InstancedMesh, InstancedMeshFile } from './types';
import { FetchSectorDelegate, FetchCtmDelegate, ParseSectorDelegate } from './delegates';
import { createOffsetsArray } from '../../utils/arrayUtils';
import { WorkerArguments, ParseQuadsResult, ParseSectorResult } from '../../workers/types/parser.types';
import { ParserWorker } from '../../workers/parser.worker';
import * as Comlink from 'comlink';
import { createSimpleCache } from '../createCache';

type WorkDelegate<T> = (worker: ParserWorker) => Promise<T>;

// TODO 2019-11-01 larsmoa: Move PooledWorker.
interface PooledWorker {
  // The worker returned by Comlink.wrap is not strictly speaking a ParserWorker,
  // but it should expose the same functions
  worker: ParserWorker;
  activeJobCount: number;
  messageIdCounter: number;
}

async function postWorkToAvailable<T>(workerList: PooledWorker[], work: WorkDelegate<T>): Promise<T> {
  let targetWorker = workerList[0];
  for (const worker of workerList) {
    if (worker.activeJobCount < targetWorker.activeJobCount) {
      targetWorker = worker;
    }
  }
  targetWorker.activeJobCount += 1;
  const result = await work(targetWorker.worker);
  targetWorker.activeJobCount -= 1;
  return result;
}

async function postWorkToAll(workerList: PooledWorker[], work: WorkDelegate<void>) {
  const operations = workerList.map(async worker => {
    worker.activeJobCount += 1;
    await work(worker.worker);
    worker.activeJobCount -= 1;
  });

  await Promise.all(operations);
}

// TODO 20191030 larsmoa: Extract to separate file. Use Comlink (or other library
// for web workers) to prettify.
function createWorkers<U>(): PooledWorker[] {
  const workerList: PooledWorker[] = [];

  for (let i = 0; i < window.navigator.hardwareConcurrency; i++) {
    const newWorker = {
      worker: Comlink.wrap(
        new Worker('../../workers/parser.worker', { name: 'parser', type: 'module' })
      ) as ParserWorker,
      activeJobCount: 0,
      messageIdCounter: 0
    };
    workerList.push(newWorker);
  }

  return workerList;
}

export async function createParser(
  sectorRoot: SectorMetadata,
  fetchSector: FetchSectorDelegate,
  fetchCtmFile: FetchCtmDelegate
): Promise<ParseSectorDelegate<Sector>> {
  const rootSectorArrayBuffer = await fetchSector(sectorRoot.id);
  const workerList = createWorkers();

  postWorkToAll(workerList, async (worker: ParserWorker) => {
    // NOTE: It is important that we copy the ArrayBuffer here, since it will be neutered the
    // first time it is passed to a worker. We copy it by calling slice().
    worker.parseRootSector(rootSectorArrayBuffer.slice());
  });

  // TODO define the cache outside of the createParser function to make it configurable
  const loadCtmGeometryCache = createSimpleCache((fileId: number) => {
    return loadCtmGeometry(fileId, fetchCtmFile, workerList);
  });

  async function parse(sectorId: number, sectorArrayBuffer: Uint8Array): Promise<Sector> {
    try {
      const sectorResult: ParseSectorResult = await postWorkToAvailable(workerList, async (worker: ParserWorker) =>
        worker.parseSector(sectorArrayBuffer)
      );
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
      } = sectorResult;

      const finalTriangleMeshes = await (async () => {
        const { fileIds, colors, triangleCounts, treeIndices } = triangleMeshes;

        const meshesGroupedByFile = groupMeshesByNumber(fileIds);

        const finalMeshes = [];
        // Merge meshes by file
        // TODO do this in Rust instead
        for (const [fileId, meshIndices] of meshesGroupedByFile.entries()) {
          const fileTriangleCounts = meshIndices.map(i => triangleCounts[i]);
          const offsets = createOffsetsArray(fileTriangleCounts);
          // Load CTM (geometry)
          const ctm = await loadCtmGeometryCache.request(fileId);

          const indices: Uint32Array = ctm.indices;
          const vertices: Float32Array = ctm.vertices;
          const normals: Float32Array = ctm.normals;
          const expandedTreeIndices = new Float32Array(indices.length);

          const colorsBuffer = new Float32Array((3 * vertices.length) / 3);
          for (let i = 0; i < meshIndices.length; i++) {
            const meshIdx = meshIndices[i];
            const treeIndex = treeIndices[meshIdx];
            const triOffset = offsets[i];
            const triCount = fileTriangleCounts[i];
            const [r, g, b] = readColorToFloat32s(colors, meshIdx);

            expandedTreeIndices.fill(treeIndex, triOffset, triOffset + triCount);
            for (let triIdx = triOffset; triIdx < triOffset + triCount; triIdx++) {
              for (let j = 0; j < 3; j++) {
                const vIdx = indices[3 * triIdx + j];

                colorsBuffer[3 * vIdx] = r;
                colorsBuffer[3 * vIdx + 1] = g;
                colorsBuffer[3 * vIdx + 2] = b;
              }
            }
          }

          const mesh: TriangleMesh = {
            colors: colorsBuffer,
            fileId,
            treeIndices: expandedTreeIndices,
            indices,
            vertices,
            normals
          };
          finalMeshes.push(mesh);
        }
        return finalMeshes;
      })();

      const finalInstanceMeshes = await (async () => {
        const { fileIds, colors, treeIndices, triangleCounts, triangleOffsets, instanceMatrices } = instanceMeshes;
        const meshesGroupedByFile = groupMeshesByNumber(fileIds);

        const finalMeshes: InstancedMeshFile[] = [];
        // Merge meshes by file
        // TODO do this in Rust instead
        // TODO de-duplicate this with the merged meshes above
        for (const [fileId, meshIndices] of meshesGroupedByFile.entries()) {
          const ctm = await loadCtmGeometryCache.request(fileId);

          const indices = ctm.indices;
          const vertices = ctm.vertices;
          const normals = ctm.normals;
          const instancedMeshes: InstancedMesh[] = [];

          const fileTriangleOffsets = new Float64Array(meshIndices.map(i => triangleOffsets[i]));
          const fileTriangleCounts = new Float64Array(meshIndices.map(i => triangleCounts[i]));
          const fileMeshesGroupedByOffsets = groupMeshesByNumber(fileTriangleOffsets);

          for (const [triangleOffset, fileMeshIndices] of fileMeshesGroupedByOffsets) {
            // NOTE the triangle counts should be the same for all meshes with the same offset,
            // hence we can look up only fileMeshIndices[0] instead of enumerating here
            const triangleCount = fileTriangleCounts[fileMeshIndices[0]];
            const instanceMatrixBuffer = new Float32Array(16 * fileMeshIndices.length);
            const treeIndicesBuffer: number[] = new Array<number>(fileMeshIndices.length);
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
              treeIndices: Float32Array.from(treeIndicesBuffer)
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
    } catch (err) {
      throw new Error(`Parsing sector ${sectorId} failed: ${err}`);
    }

    // TODO 20191023 larsmoa: Remember to free data from rust
  }
  return parse;
}

export async function createQuadsParser() {
  // TODO consider sharing workers with i3df parser
  const workerList = await createWorkers<WorkerArguments>();

  async function parse(sectorId: number, quadsArrayBuffer: Uint8Array): Promise<SectorQuads> {
    try {
      const sectorResult = await postWorkToAvailable<ParseQuadsResult>(workerList, async (worker: ParserWorker) =>
        worker.parseQuads(quadsArrayBuffer)
      );
      return {
        buffer: sectorResult.data
      } as SectorQuads;
    } catch (err) {
      throw new Error(`Parsing sector ${sectorId} failed: ${err}`);
    }

    // TODO 20191023 larsmoa: Remember to free data from rust
  }
  return parse;
}

function groupMeshesByNumber(fileIds: Float64Array) {
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

function readColorToFloat32s(colors: Uint8Array, index: number): [number, number, number, number] {
  const r = colors[4 * index] / 255;
  const g = colors[4 * index + 1] / 255;
  const b = colors[4 * index + 2] / 255;
  const a = colors[4 * index + 3] / 255;
  return [r, g, b, a];
}

async function loadCtmGeometry(
  fileId: number,
  fetchCtmFile: FetchCtmDelegate,
  workerList: PooledWorker[]
): Promise<any> {
  try {
    const buffer = await fetchCtmFile(fileId);
    const ctm = await postWorkToAvailable(workerList, async (worker: ParserWorker) => worker.parseCtm(buffer));
    return ctm;
  } catch (err) {
    throw new Error(`Parsing CTM file ${fileId} failed: ${err}`);
  }
}
