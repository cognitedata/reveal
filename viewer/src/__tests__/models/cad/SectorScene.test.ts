/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { vec3, mat4 } from 'gl-matrix';

import { SectorMetadata } from '@/datamodels/cad';
import { SectorSceneImpl } from '@/datamodels/cad/sector/SectorScene';
import { traverseDepthFirst } from '@/utilities/objectTraversal';
import { Box3 } from '@/utilities';
import { fromThreeMatrix } from '@/utilities';

import { createSectorMetadata } from '../../testutils/createSectorMetadata';

describe('SectorSceneImpl', () => {
  const root = createSectorMetadata([
    0,
    [
      [1, [], new Box3([vec3.fromValues(0, 0, 0), vec3.fromValues(0.5, 1, 1)])],
      [2, [], new Box3([vec3.fromValues(0.5, 0, 0), vec3.fromValues(1, 1, 1)])]
    ],
    new Box3([vec3.fromValues(0, 0, 0), vec3.fromValues(1, 1, 1)])
  ]);
  const sectorsById = new Map<number, SectorMetadata>();
  traverseDepthFirst(root, x => {
    sectorsById.set(x.id, x);
    return true;
  });

  test('getSectorsContainingPoint', () => {
    const scene = new SectorSceneImpl(8, 3, root, sectorsById);

    expect(sectorIds(scene.getSectorsContainingPoint(vec3.fromValues(0.2, 0.5, 0.5)))).toEqual([0, 1]);
    expect(sectorIds(scene.getSectorsContainingPoint(vec3.fromValues(0.75, 0.5, 0.5)))).toEqual([0, 2]);
    expect(sectorIds(scene.getSectorsContainingPoint(vec3.fromValues(2, 0.5, 0.5)))).toEqual([]);
  });

  test('getSectorsIntersectingBox', () => {
    const scene = new SectorSceneImpl(8, 3, root, sectorsById);

    expect(sectorIds(scene.getSectorsIntersectingBox(Box3.fromBounds(-10, -10, -10, 10, 10, 10)))).toEqual([0, 1, 2]);
    expect(sectorIds(scene.getSectorsIntersectingBox(Box3.fromBounds(0, 0, 0, 0.2, 0.2, 0.2)))).toEqual([0, 1]);
    expect(sectorIds(scene.getSectorsIntersectingBox(Box3.fromBounds(0.6, 0.6, 0.6, 1, 1, 1)))).toEqual([0, 2]);
  });

  test('getSectorsIntersectingFrustum, some sectors inside', () => {
    // Arrange
    const scene = new SectorSceneImpl(8, 3, root, sectorsById);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10.0);
    camera.position.set(2.0, 0.5, -1);
    camera.lookAt(2.0, 0.5, 0.5);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    const cameraModelMatrixInverse = fromThreeMatrix(mat4.create(), camera.matrixWorldInverse);
    const projectionMatrix = fromThreeMatrix(mat4.create(), camera.projectionMatrix);

    // Act
    const sectors = scene.getSectorsIntersectingFrustum(projectionMatrix, cameraModelMatrixInverse);

    // Assert
    expect(sectorIds(sectors)).toEqual([0, 2]);
  });

  test('getSectorsIntersectingFrustum, all sectors inside frustum', () => {
    // Arrange
    const scene = new SectorSceneImpl(8, 3, root, sectorsById);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10.0);
    camera.position.set(0.5, 0.5, -1);
    camera.lookAt(0.5, 0.5, 0.5);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    const cameraModelMatrixInverse = fromThreeMatrix(mat4.create(), camera.matrixWorldInverse);
    const projectionMatrix = fromThreeMatrix(mat4.create(), camera.projectionMatrix);

    // Act
    const sectors = scene.getSectorsIntersectingFrustum(projectionMatrix, cameraModelMatrixInverse);

    // Assert
    expect(sectorIds(sectors)).toEqual([0, 1, 2]);
  });
});

function sectorIds(sectors: SectorMetadata[]): number[] {
  return sectors.map(x => x.id).sort();
}
