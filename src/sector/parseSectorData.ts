/*!
 * Copyright 2019 Cognite AS
 */

import { Sector, SectorMetadata, TriangleMesh } from './types';
import { FetchSectorDelegate, FetchCtmDelegate } from './delegates';
import { createOffsets } from '../utils/arrayUtils';
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

      const uniqueIds = new Set<number>(fileIds);

      const loadCtmOperations = [...uniqueIds].map(async id => {
        try {
          const buffer = await fetchCtmFile(id);
          const parsedCtm = rust.parse_ctm(buffer);
          ctmData.set(id, parsedCtm);
        } catch (err) {
          throw new Error(`Parsing CTM file ${id} failed: ${err}`);
        }
      });

      // Turn triangle counts into vertex counts
      for (let i = 0; i < triangleCounts.length; i++) {
        triangleCounts[i] *= 3;
      }
      const offsets = createOffsets(triangleCounts);
      await Promise.all(loadCtmOperations);

      for (let i = 0; i < fileIds.length; ++i) {
        const fileId = fileIds[i];
        const color = readColor(colors, i); // TODO 20191023 larsmoa: Replace with Uint32Array parsed in Rust
        const offset = offsets[i];
        const count = triangleCounts[i];
        const ctm = ctmData.get(fileId)!;

        const mesh: TriangleMesh = {
          offset,
          count,
          color,
          fileId,
          indices: ctm.indices(),
          vertices: ctm.vertices(),
          normals: ctm.normals()
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

function readColor(colors: Uint8Array, index: number): number {
  const r = colors[4 * index];
  const g = colors[4 * index + 1];
  const b = colors[4 * index + 2];
  const a = colors[4 * index + 3];
  // tslint:disable-next-line: no-bitwise
  return (a << 24) | (b << 16) | (g << 8) | r;
}

// export async function parseSectorData(sectorId: number, data: ArrayBuffer): Promise<Sector> {
//// const m = await rust;
//// const test = await m.parse_sector(data);
// return {};
// }
