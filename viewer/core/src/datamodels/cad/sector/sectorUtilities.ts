/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { SectorMetadata, traverseDepthFirst } from '@reveal/cad-parsers';

import { pipe, GroupedObservable, Observable, OperatorFunction } from 'rxjs';
import { groupBy, distinctUntilKeyChanged, withLatestFrom, mergeMap, filter, map } from 'rxjs/operators';

import { SectorGeometry, WantedSector, ConsumedSector } from './types';
import { Materials } from '../rendering/materials';

import { InstancedMeshFile, SectorQuads } from '../rendering/types';

import { createTriangleMeshes } from '../rendering/triangleMeshes';
import { createPrimitives } from '../rendering/primitives';
import { createSimpleGeometryMesh } from '../rendering/createSimpleGeometryMesh';
import { filterInstanceMesh } from '../rendering/filterInstanceMesh';
import { AutoDisposeGroup } from '../../../utilities/three';

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
  metadata: SectorMetadata,
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

export function distinctUntilLevelOfDetailChanged() {
  return pipe(
    groupBy((sector: ConsumedSector) => sector.modelIdentifier),
    mergeMap((modelGroup: GroupedObservable<string, ConsumedSector>) => {
      return modelGroup.pipe(
        groupBy((sector: ConsumedSector) => sector.metadata.id),
        mergeMap((group: GroupedObservable<number, ConsumedSector>) =>
          group.pipe(distinctUntilKeyChanged('levelOfDetail'))
        )
      );
    })
  );
}

export function filterCurrentWantedSectors(
  wantedObservable: Observable<WantedSector[]>
): OperatorFunction<ConsumedSector, ConsumedSector> {
  return pipe(
    withLatestFrom(wantedObservable),
    filter(([loaded, wanted]) => {
      for (const wantedSector of wanted) {
        if (
          loaded.modelIdentifier === wantedSector.modelIdentifier &&
          loaded.metadata.id === wantedSector.metadata.id &&
          loaded.levelOfDetail === wantedSector.levelOfDetail
        ) {
          return true;
        }
      }
      return false;
    }),
    map(([loaded, _wanted]) => loaded)
  );
}

export function findSectorMetadata(root: SectorMetadata, sectorId: number): SectorMetadata {
  let foundSector: SectorMetadata | null = null;
  traverseDepthFirst(root, sector => {
    if (sector.id === sectorId) {
      foundSector = sector;
    }
    return !foundSector;
  });
  if (!foundSector) {
    throw new Error(`Could not find metadata for sector ${sectorId} - invalid id?`);
  }
  return foundSector;
}
