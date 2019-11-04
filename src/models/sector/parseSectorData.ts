/*!
 * Copyright 2019 Cognite AS
 */

import { Sector, SectorQuads, SectorMetadata, TriangleMesh } from './types';
import { FetchSectorDelegate, FetchCtmDelegate } from './delegates';
import { createOffsetsArray } from '../../utils/arrayUtils';
import { WorkerArguments } from '../../../workers/types/parser.types';

// TODO 2019-11-01 larsmoa: Move PooledWorker.
interface PooledWorker {
  worker: Worker;
  activeJobCount: number;
  messageIdCounter: number;
}

// TODO 20191030 larsmoa: Extract to separate file. Use Comlink (or other library
// for web workers) to prettify.
async function createWorkers<AcceptedArguments>() {
  const workerList: PooledWorker[] = [];

  const postWork = async (worker: PooledWorker, work: any) => {
    const result = await new Promise(resolve => {
      // TODO add type
      // TODO try to avoid passing rootSectorData - perhaps keep this stored in worker?
      const messageId = worker.messageIdCounter;

      worker.worker.addEventListener('message', event => {
        if (!event.data || event.data.messageId !== messageId) {
          return;
        }
        worker.activeJobCount -= 1;
        resolve(event.data.result);
      });

      worker.activeJobCount += 1;
      worker.messageIdCounter += 1;

      worker.worker.postMessage({
        // TODO add type
        messageId,
        work
      });
    });
    return result;
  };

  for (let i = 0; i < window.navigator.hardwareConcurrency; i++) {
    const newWorker = {
      worker: new Worker('parser.worker.js'),
      activeJobCount: 0,
      messageIdCounter: 0
    };
    workerList.push(newWorker);
  }

  const postWorkToAvailable = async (work: AcceptedArguments): Promise<any> => {
    // TODO add type
    let targetWorker = workerList[0];
    for (const worker of workerList) {
      // TODO rewrite in a functional way
      if (worker.activeJobCount < targetWorker.activeJobCount) {
        targetWorker = worker;
      }
    }
    return postWork(targetWorker, work);
  };

  const postWorkToAll = async (work: AcceptedArguments) => {
    const operations = workerList.map(worker => postWork(worker, work));

    await Promise.all(operations);
  };

  return [postWorkToAvailable, postWorkToAll];
}

// TODO make caching into a function that wraps around the CTM fetch + parse
// and can be replaced to implement different caching strategies

export async function createParser(
  sectorRoot: SectorMetadata,
  fetchSector: FetchSectorDelegate,
  fetchCtmFile: FetchCtmDelegate
) {
  const rootSectorPromise = fetchSector(sectorRoot.id);
  const workersPromise = createWorkers<WorkerArguments>();

  const [rootSectorArrayBuffer, workers] = await Promise.all([rootSectorPromise, workersPromise]);

  const [postWork, postWorkToAll] = workers;

  postWorkToAll({
    parseRootSector: {
      buffer: rootSectorArrayBuffer
    }
  });

  async function parse(sectorId: number, sectorArrayBuffer: ArrayBuffer): Promise<Sector> {
    try {
      const sectorResult: any = await postWork({
        parseSector: {
          buffer: sectorArrayBuffer
        }
      });
      const sector = new Sector();
      const { fileIds, colors, triangleCounts } = sectorResult;

      const meshesGroupedByFile = groupMeshesByFile(fileIds);

      // Merge meshes by file
      for (const [fileId, meshIndices] of meshesGroupedByFile.entries()) {
        const fileTriangleCounts = meshIndices.map(i => triangleCounts[i]);
        const offsets = createOffsetsArray(fileTriangleCounts);
        // Load CTM (geometry)
        const ctm = await loadCtmGeometry(fileId, fetchCtmFile, postWork);

        const indices = ctm.indices;
        const vertices = ctm.vertices;
        const normals = ctm.normals;

        const colorsBuffer = new Float32Array((3 * vertices.length) / 3);
        for (let i = 0; i < meshIndices.length; i++) {
          const meshIdx = meshIndices[i];
          const triOffset = offsets[i];
          const triCount = fileTriangleCounts[i];
          const [r, g, b] = readColorToFloat32s(colors, meshIdx);

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
          indices,
          vertices,
          normals
        };
        sector.triangleMeshes.push(mesh);
      }
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
  const [postWork] = await createWorkers<WorkerArguments>();

  async function parse(sectorId: number, quadsArrayBuffer: ArrayBuffer): Promise<SectorQuads> {
    try {
      const sectorResult: any = await postWork({
        parseQuads: {
          buffer: quadsArrayBuffer
        }
      });
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

function groupMeshesByFile(fileIds: Float64Array) {
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
  postWork: (args: WorkerArguments) => any
): Promise<any> {
  try {
    const buffer = await fetchCtmFile(fileId);
    const ctm = await postWork({
      parseCtm: { buffer }
    });
    return ctm;
  } catch (err) {
    throw new Error(`Parsing CTM file ${fileId} failed: ${err}`);
  }
}

// export async function parseSectorData(sectorId: number, data: ArrayBuffer): Promise<Sector> {
//// const m = await rust;
//// const test = await m.parse_sector(data);
// return {};
// }
