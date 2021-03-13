/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { pipe, GroupedObservable, Observable, OperatorFunction } from 'rxjs';
import { groupBy, distinctUntilKeyChanged, withLatestFrom, mergeMap, filter, map } from 'rxjs/operators';

import { SectorGeometry, SectorMetadata, WantedSector, ConsumedSector } from './types';
import { Materials } from '../rendering/materials';
import { createPrimitives } from '../rendering/primitives';
import { createTriangleMeshes } from '../rendering/triangleMeshes';
import { createInstancedMeshes } from '../rendering/instancedMeshes';
import { SectorQuads } from '../rendering/types';
import { disposeAttributeArrayOnUpload } from '../../../utilities/disposeAttributeArrayOnUpload';
import { toThreeJsBox3 } from '../../../utilities';
import { traverseDepthFirst } from '../../../utilities/objectTraversal';

const quadVertexData = new Float32Array([
  /* eslint-disable prettier/prettier */
  -0.5, -0.5, 0.0,
  0.5, -0.5, 0.0,
  0.5, 0.5, 0.0,

  0.5, 0.5, 0.0,
  -0.5, 0.5, 0.0,
  -0.5, -0.5, 0.0,
  /*  eslint-enable prettier/prettier  */
]);

const quadVertexBufferAttribute = new THREE.Float32BufferAttribute(quadVertexData.buffer, 3);

export function consumeSectorSimple(sector: SectorQuads, materials: Materials): THREE.Group {
  const group = new THREE.Group();
  const stride = 3 + 1 + 3 + 16;
  if (sector.buffer.byteLength === 0) {
    // No data, just skip
    return new THREE.Group();
  }
  if (sector.buffer.byteLength % stride !== 0) {
    throw new Error(`Expected buffer size to be multiple of ${stride}, but got ${sector.buffer.byteLength}`);
  }

  const geometry = new THREE.InstancedBufferGeometry();

  const interleavedBuffer32 = new THREE.InstancedInterleavedBuffer(sector.buffer, stride);
  const color = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 3, 0, true);
  const treeIndex = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 1, 3, false);
  const normal = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 3, 4, true);
  const matrix0 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 7, false);
  const matrix1 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 11, false);
  const matrix2 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 15, false);
  const matrix3 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 19, false);

  geometry.setAttribute('position', quadVertexBufferAttribute);
  geometry.setAttribute('color', color);
  geometry.setAttribute('treeIndex', treeIndex);
  geometry.setAttribute('normal', normal);
  geometry.setAttribute('matrix0', matrix0);
  geometry.setAttribute('matrix1', matrix1);
  geometry.setAttribute('matrix2', matrix2);
  geometry.setAttribute('matrix3', matrix3);

  const obj = new THREE.Mesh(geometry, materials.simple);
  obj.onAfterRender = () => {
    disposeAttributeArrayOnUpload.bind(interleavedBuffer32)();
    obj.onAfterRender = () => {};
  };

  obj.onBeforeRender = () => {
    const inverseModelMatrix: THREE.Matrix4 = materials.simple.uniforms.inverseModelMatrix.value;
    inverseModelMatrix.copy(obj.matrixWorld).invert();
  };

  setTreeIndeciesToUserData();

  // obj.name = `Quads ${sectorId}`;
  // TODO 20191028 dragly figure out why the quads are being culled wrongly and if we
  // can avoid disabling it entirely
  obj.frustumCulled = false;
  group.add(obj);
  return group;

  function setTreeIndeciesToUserData() {
    const treeIndexAttributeOffset = 3;

    const treeIndecies = new Set();

    for (let i = 0; i < sector.buffer.length / stride; i++) {
      treeIndecies.add(sector.buffer[i * stride + treeIndexAttributeOffset]);
    }
    obj.userData.treeIndices = treeIndecies;
  }
}

export function consumeSectorDetailed(sector: SectorGeometry, metadata: SectorMetadata, materials: Materials) {
  const bounds = toThreeJsBox3(new THREE.Box3(), metadata.bounds);
  const obj = new THREE.Group();
  for (const primtiveRoot of createPrimitives(sector, materials)) {
    obj.add(primtiveRoot);
  }

  const triangleMeshes = createTriangleMeshes(sector.triangleMeshes, bounds, materials.triangleMesh);
  for (const triangleMesh of triangleMeshes) {
    obj.add(triangleMesh);
  }
  const instanceMeshes = createInstancedMeshes(sector.instanceMeshes, bounds, materials.instancedMesh);
  for (const instanceMesh of instanceMeshes) {
    obj.add(instanceMesh);
  }

  return obj;
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
