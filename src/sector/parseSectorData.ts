/*!
 * Copyright 2019 Cognite AS
 */

import { Sector, SectorMetadata, TriangleMesh } from './types';
import { FetchSectorDelegate, FetchCtmDelegate } from './delegates';
import { createOffsets as createMeshOffsets } from '../utils/arrayUtils';
import { CtmResult } from '../../pkg';
const rustModule = import('../../pkg');

export async function createParser(
  sectorRoot: SectorMetadata,
  fetchSector: FetchSectorDelegate,
  fetchCtmFile: FetchCtmDelegate
) {
  const rust = await rustModule;
  const rootSectorData = await fetchSector(sectorRoot.id);
  const rootSector = rust.parse_root_sector(rootSectorData);
  // TODO make caching into a function that wraps around the CTM fetch + parse
  // and can be replaced to implement different caching strategies
  const ctmData = new Map<number, CtmResult>();
  async function parse(sectorId: number, data: ArrayBuffer): Promise<Sector> {
    try {
      const sectorDataHandle = rust.parse_sector(rootSector, data);
      const sectorData = rust.convert_sector(sectorDataHandle);
      const sector = new Sector();
      const collection = sectorData.triangle_mesh_collection();
      const fileIds = collection.file_id();
      const nodeIds = collection.node_id();
      const treeIndexes = collection.tree_index();
      const colors = collection.color();
      const triangleCounts = collection.triangle_count();
      const sizes = collection.size();

      const meshesGroupedByFile = groupMeshesByFile(fileIds);
      const offsets = createMeshOffsets(triangleCounts);

      // Merge meshes by file
      for (const [fileId, meshIndices] of meshesGroupedByFile.entries()) {
        // Load CTM (geometry)
        const ctm = await loadCtmGeometry(fileId, fetchCtmFile);

        const indices = ctm.indices();
        const vertices = ctm.vertices();
        const normals = ctm.normals();
        const colorsBuffer = new Float32Array(vertices.length); // 3 components for each

        for (const meshIndex of meshIndices) {
          const rangeFrom = offsets[meshIndex];
          const rangeCount = triangleCounts[meshIndex];
          const [r, g, b, a] = readColorToFloat32s(colors, meshIndex);

          // TODO 20191025 lars: Per vertex coloring which wont really work.
          for (let i = 0; i < rangeCount; i++) {
            const idx = indices[rangeFrom + i];
            colorsBuffer[3 * idx] = r;
            colorsBuffer[3 * idx + 1] = g;
            colorsBuffer[3 * idx + 2] = b;
          }

          // colorsBuffer.fill(color, rangeFrom, rangeFrom + rangeCount);
        }

        const mesh: TriangleMesh = {
          // offset,
          // count,
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

    // TODO create THREE.IndexedBuffer outside this function

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

function readColorToUint32(colors: Uint8Array, index: number): number {
  const r = colors[4 * index];
  const g = colors[4 * index + 1];
  const b = colors[4 * index + 2];
  const a = colors[4 * index + 3];
  // tslint:disable-next-line: no-bitwise
  return (a << 24) | (b << 16) | (g << 8) | r;
}

function readColorToFloat32s(colors: Uint8Array, index: number): [number, number, number, number] {
  const r = colors[4 * index] / 255;
  const g = colors[4 * index + 1] / 255;
  const b = colors[4 * index + 2] / 255;
  const a = colors[4 * index + 3] / 255;
  return [r, g, b, a];
}

async function loadCtmGeometry(fileId: number, fetchCtmFile: FetchCtmDelegate): Promise<CtmResult> {
  const rust = await rustModule;

  try {
    const buffer = await fetchCtmFile(fileId);
    return rust.parse_ctm(buffer);
  } catch (err) {
    throw new Error(`Parsing CTM file ${fileId} failed: ${err}`);
  }
}

// export async function parseSectorData(sectorId: number, data: ArrayBuffer): Promise<Sector> {
//// const m = await rust;
//// const test = await m.parse_sector(data);
// return {};
// }
