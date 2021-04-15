/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { pipe, GroupedObservable, Observable, OperatorFunction } from 'rxjs';
import { groupBy, distinctUntilKeyChanged, withLatestFrom, mergeMap, filter, map } from 'rxjs/operators';

import { SectorGeometry, SectorMetadata, WantedSector, ConsumedSector } from './types';
import { Materials } from '../rendering/materials';

import { InstancedMeshFile, SectorQuads } from '../rendering/types';

import { toThreeJsBox3 } from '../../../utilities';
import { traverseDepthFirst } from '../../../utilities/objectTraversal';
import { createTriangleMeshes } from '../rendering/triangleMeshes';
import { createPrimitives } from '../rendering/primitives';
import { createSimpleGeometryMesh } from '../rendering/createSimpleGeometryMesh';

(window as any).clipped = 0;
(window as any).notClipped = 0;
(window as any).clippedInstances = 0;
(window as any).notClippedInstances = 0;
(window as any).clippedInstanceTreeIndices = [];

function isClipped(mesh: THREE.Mesh, clipBox: THREE.Box3): boolean {
  if (mesh.geometry.boundingBox === null) {
    console.error(mesh.name, 'does not have bounding box');
    return true;
  }

  const clipped = !clipBox.intersectsBox(mesh.geometry.boundingBox);
  if (clipped) {
    console.log(mesh.name, 'clipped', mesh.geometry.boundingBox);
    (window as any).clipped++;
  } else {
    (window as any).notClipped++;
  }
  return clipped;
}

function filterInstanceMeshes(instanceMeshFile: InstancedMeshFile, clipBox: THREE.Box3) {
  const vertices = instanceMeshFile.vertices;
  const baseBounds = new THREE.Box3();
  const instanceBounds = new THREE.Box3();
  const p = new THREE.Vector3();
  const instanceMatrix = new THREE.Matrix4();

  for (let i = 0; i < vertices.length; i += 3) {
    p.set(vertices[3 * i + 0], vertices[3 * i + 1], vertices[3 * i + 2]);
    baseBounds.expandByPoint(p);
  }

  for (let i = 0; i < instanceMeshFile.instances.length; i++) {
    const mesh = instanceMeshFile.instances[i];
    baseBounds.makeEmpty();
    for (let j = mesh.triangleOffset; j < mesh.triangleOffset + mesh.triangleCount; ++j) {
      p.set(vertices[3 * j + 0], vertices[3 * j + 1], vertices[3 * j + 2]);
      baseBounds.expandByPoint(p);
    }

    const m = mesh.instanceMatrices;
    let allClipped = true;
    for (let j = 0; j < mesh.treeIndices.length; j++) {
      const idx = 16 * j;
      instanceMatrix.set(
        m[idx + 0],
        m[idx + 1],
        m[idx + 2],
        m[idx + 3],
        m[idx + 4],
        m[idx + 5],
        m[idx + 6],
        m[idx + 7],
        m[idx + 8],
        m[idx + 9],
        m[idx + 10],
        m[idx + 11],
        m[idx + 12],
        m[idx + 13],
        m[idx + 14],
        m[idx + 15]
      );
      instanceBounds.copy(baseBounds).applyMatrix4(instanceMatrix);
      const clipped = !clipBox.intersectsBox(instanceBounds);
      allClipped = allClipped && clipped;
      if (clipped) {
        (window as any).clippedInstances++;
        (window as any).clippedInstanceTreeIndices.push(mesh.treeIndices[j]);
      } else {
        (window as any).notClippedInstances++;
      }
    }
    if (allClipped) {
      instanceMeshFile.instances.splice(i, 1);
      i--;
      console.log('ALL CLIPPED');
    }
  }
}

export function consumeSectorSimple(
  sector: SectorQuads,
  sectorBounds: THREE.Box3,
  materials: Materials,
  geometryClipBox: THREE.Box3 | null
): { sectorMeshes: THREE.Group; instancedMeshes: InstancedMeshFile[] } {
  if (sector.buffer.byteLength === 0) {
    // No data, just skip
    return { sectorMeshes: new THREE.Group(), instancedMeshes: [] };
  }

  const group = createSimpleGeometryMesh(sector.buffer, materials, sectorBounds, geometryClipBox);
  return { sectorMeshes: group, instancedMeshes: [] };
}

export function consumeSectorDetailed(
  sector: SectorGeometry,
  metadata: SectorMetadata,
  materials: Materials,
  geometryClipBox: THREE.Box3 | null
): { sectorMeshes: THREE.Group; instancedMeshes: InstancedMeshFile[] } {
  const bounds = toThreeJsBox3(new THREE.Box3(), metadata.bounds);

  if (geometryClipBox !== null && geometryClipBox.containsBox(bounds)) {
    // If sector bounds is fully inside clip Box, nothing will be clipped so don't go the extra mile
    // to check
    geometryClipBox = null;
  }

  const obj = new THREE.Group();
  for (const primtiveRoot of createPrimitives(sector, materials, bounds, geometryClipBox)) {
    // if (!isClipped(primtiveRoot)) {
    obj.add(primtiveRoot);
    // }
  }

  const triangleMeshes = createTriangleMeshes(sector.triangleMeshes, bounds, materials.triangleMesh);
  for (const triangleMesh of triangleMeshes) {
    // if (!isClipped(triangleMesh)) {
    // obj.add(triangleMesh);
    // }
  }
  // sector.instanceMeshes.forEach(x => filterInstanceMeshes(x));
  // return { sectorMeshes: obj, instancedMeshes: sector.instanceMeshes };
  return { sectorMeshes: obj, instancedMeshes: [] };
}

export function distinctUntilLevelOfDetailChanged() {
  return pipe(
    groupBy((sector: ConsumedSector) => sector.blobUrl),
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
          loaded.blobUrl === wantedSector.blobUrl &&
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
