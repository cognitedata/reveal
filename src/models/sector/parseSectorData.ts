/*!
 * Copyright 2019 Cognite AS
 */

import { Sector, SectorQuads, SectorMetadata, TriangleMesh } from './types';
import { FetchSectorDelegate, FetchCtmDelegate } from './delegates';
import { createOffsetsArray } from '../../utils/arrayUtils';
import { WorkerArguments, ParseSectorResult, ParseQuadsResult, ParseCtmResult } from '../../../workers/types/parser.types';
import { ParserWorker } from '../../../workers/parser.worker';
import * as Comlink from 'comlink';

type WorkDelegate<T> = (worker: ParserWorker) => Promise<T>;

// TODO 2019-11-01 larsmoa: Move PooledWorker.
interface PooledWorker {
  // The worker returned by Comlink.wrap is not strictly speaking a ParserWorker,
  // but it should expose the same functions
  worker: ParserWorker;
  activeJobCount: number;
  messageIdCounter: number;
}


async function postWorkToAvailable<T>(workerList: PooledWorker[], work: WorkDelegate<T>):
Promise<T>
  {
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
};

async function postWorkToAll(workerList: PooledWorker[], work: WorkDelegate<void>) {
  const operations = workerList.map(async worker => {
    worker.activeJobCount += 1;
    await work(worker.worker);
    worker.activeJobCount -= 1;
  });

  await Promise.all(operations);
};


// TODO 20191030 larsmoa: Extract to separate file. Use Comlink (or other library
// for web workers) to prettify.
function createWorkers<U>(): PooledWorker[] {
  const workerList: PooledWorker[] = [];

  for (let i = 0; i < window.navigator.hardwareConcurrency; i++) {
    const newWorker = {
      worker: Comlink.wrap(new Worker('../../../workers/parser.worker', { name: 'parser', type: 'module' })) as ParserWorker,
      activeJobCount: 0,
      messageIdCounter: 0
    };
    workerList.push(newWorker);
  }

  return workerList;
}

// TODO make caching into a function that wraps around the CTM fetch + parse
// and can be replaced to implement different caching strategies

export async function createParser(
  sectorRoot: SectorMetadata,
  fetchSector: FetchSectorDelegate,
  fetchCtmFile: FetchCtmDelegate
) {
  const rootSectorArrayBuffer = await fetchSector(sectorRoot.id);
  const workerList = createWorkers();

  postWorkToAll(workerList, async (worker: ParserWorker) => {
    // NOTE: It is important that we copy the ArrayBuffer here, since it will be neutered the
    // first time it is passed to a worker. We copy it by calling slice().
    worker.parseRootSector(rootSectorArrayBuffer.slice())
  });

  async function parse(sectorId: number, sectorArrayBuffer: Uint8Array): Promise<Sector> {
    try {
      const sectorResult = await postWorkToAvailable(workerList, async (worker: ParserWorker) => worker.parseSector(sectorArrayBuffer));
      const sector = new Sector();
      const { fileIds, colors, triangleCounts } = sectorResult;

      const meshesGroupedByFile = groupMeshesByFile(fileIds);

      // Merge meshes by file
      for (const [fileId, meshIndices] of meshesGroupedByFile.entries()) {
        const fileTriangleCounts = meshIndices.map(i => triangleCounts[i]);
        const offsets = createOffsetsArray(fileTriangleCounts);
        // Load CTM (geometry)
        const ctm = await loadCtmGeometry(fileId, fetchCtmFile, workerList);

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
  const workerList = await createWorkers<WorkerArguments>();

  async function parse(sectorId: number, quadsArrayBuffer: Uint8Array): Promise<SectorQuads> {
    try {
      const sectorResult = await postWorkToAvailable<ParseQuadsResult>(workerList, async (worker: ParserWorker) => worker.parseQuads(quadsArrayBuffer));
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

// export async function parseSectorData(sectorId: number, data: ArrayBuffer): Promise<Sector> {
//// const m = await rust;
//// const test = await m.parse_sector(data);
// return {};
// }
