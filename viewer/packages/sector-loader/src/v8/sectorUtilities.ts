/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorQuads } from '@cognite/reveal-parser-worker';

import { createSimpleGeometryMesh, Materials, createPrimitives } from '@reveal/rendering';
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
  const bounds = metadata.bounds;

  if (geometryClipBox !== null && geometryClipBox.containsBox(bounds)) {
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
