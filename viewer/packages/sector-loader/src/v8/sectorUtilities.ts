/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorQuads } from '@cognite/reveal-parser-worker';

import { Materials } from '@reveal/rendering';
import { createSimpleGeometryMesh, createPrimitives } from '@reveal/cad-parsers';
import { AutoDisposeGroup } from '@reveal/utilities';
import {
  InstancedMeshFile,
  SectorGeometry,
  V8SectorMetadata,
  filterInstanceMesh,
  createTriangleMeshes
} from '@reveal/cad-parsers';

export function consumeSectorSimple(
  sector: SectorQuads,
  sectorBounds: THREE.Box3,
  materials: Materials,
  geometryClipBox: THREE.Box3 | null
): { sectorMeshes: AutoDisposeGroup; instancedMeshes: InstancedMeshFile[] } {
  const group = new AutoDisposeGroup();
  group.name = 'Quads';
  if (sector.buffer.byteLength === 0) {
    // No data, just skip
    return { sectorMeshes: new AutoDisposeGroup(), instancedMeshes: [] };
  }

  const mesh = createSimpleGeometryMesh(sector.buffer, materials, sectorBounds, geometryClipBox);
  if (mesh !== undefined) {
    group.add(mesh);
  }
  return { sectorMeshes: group, instancedMeshes: [] };
}

export function consumeSectorDetailed(
  sector: SectorGeometry,
  metadata: V8SectorMetadata,
  materials: Materials,
  geometryClipBox: THREE.Box3 | null
): { sectorMeshes: AutoDisposeGroup; instancedMeshes: InstancedMeshFile[] } {
  const bounds = metadata.subtreeBoundingBox;

  if (geometryClipBox !== null && isSectorBoundsFullyInsideClipBox(geometryClipBox, bounds)) {
    // If sector bounds is fully inside clip Box, nothing will be clipped so don't go the extra mile
    // to check
    geometryClipBox = null;
  }

  const group = new AutoDisposeGroup();
  for (const primitiveRoot of createPrimitives(sector, materials, bounds, geometryClipBox)) {
    group.add(primitiveRoot);
  }

  const triangleMeshes = createTriangleMeshes(sector.triangleMeshes, bounds, materials.triangleMesh, geometryClipBox);
  for (const triangleMesh of triangleMeshes) {
    group.add(triangleMesh);
  }
  const instanceMeshes = sector.instanceMeshes
    .map(instanceMeshFile => {
      const filteredMeshes = instanceMeshFile.instances
        .map(mesh => filterInstanceMesh(instanceMeshFile.vertices, instanceMeshFile.indices, mesh, geometryClipBox))
        .filter(x => x.treeIndices.length > 0);
      const filteredInstanceMeshFile: InstancedMeshFile = {
        fileId: instanceMeshFile.fileId,
        vertices: instanceMeshFile.vertices,
        indices: instanceMeshFile.indices,
        instances: filteredMeshes
      };
      return filteredInstanceMeshFile;
    })
    .filter(x => x.instances.length > 0);
  return { sectorMeshes: group, instancedMeshes: instanceMeshes };
}

/**
 * Checks if sector bounds is partially outside clip box, and hence
 * if it should be clipped (as opposition to clipping). Since model
 * sectors are clipped to fit within the clip box on load, we
 * consider sectors on the boundary to be outside. Worst case, this
 * causes geometry within some sectors to be unnecessary clipped
 * towards to clip box, but will not lead to any lost geometry.
 */
function isSectorBoundsFullyInsideClipBox(
  boxToCheckIfCovers: THREE.Box3,
  possiblyCovered: THREE.Box3,
  fuzziness: number = 1e-4
): boolean {
  const big = boxToCheckIfCovers;
  const small = possiblyCovered;
  return (
    big.min.x - small.min.x >= fuzziness &&
    small.max.x - big.max.x >= fuzziness &&
    big.min.y - small.min.y >= fuzziness &&
    small.max.y - big.max.y >= fuzziness &&
    big.min.z - small.min.z >= fuzziness &&
    small.max.z - big.max.z >= fuzziness
  );
}
