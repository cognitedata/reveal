/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { vec3 } from 'gl-matrix';

import { SectorMetadata } from '../../../datamodels/cad';
import { SectorSceneImpl } from '../../../datamodels/cad/sector/SectorScene';
import { traverseDepthFirst } from '../../../utilities/objectTraversal';
import { Box3 } from '../../../utilities';

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
    const scene = new SectorSceneImpl(8, 3, 'Meters', root, sectorsById);

    expect(sectorIds(scene.getSectorsContainingPoint(vec3.fromValues(0.2, 0.5, 0.5)))).toEqual([0, 1]);
    expect(sectorIds(scene.getSectorsContainingPoint(vec3.fromValues(0.75, 0.5, 0.5)))).toEqual([0, 2]);
    expect(sectorIds(scene.getSectorsContainingPoint(vec3.fromValues(2, 0.5, 0.5)))).toEqual([]);
  });

  test('getSectorsIntersectingBox', () => {
    const scene = new SectorSceneImpl(8, 3, 'Meters', root, sectorsById);

    expect(sectorIds(scene.getSectorsIntersectingBox(Box3.fromBounds(-10, -10, -10, 10, 10, 10)))).toEqual([0, 1, 2]);
    expect(sectorIds(scene.getSectorsIntersectingBox(Box3.fromBounds(0, 0, 0, 0.2, 0.2, 0.2)))).toEqual([0, 1]);
    expect(sectorIds(scene.getSectorsIntersectingBox(Box3.fromBounds(0.6, 0.6, 0.6, 1, 1, 1)))).toEqual([0, 2]);
  });

  test('getSectorsIntersectingFrustum, some sectors inside', () => {
    // Arrange
    const scene = new SectorSceneImpl(8, 3, 'Meters', root, sectorsById);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10.0);
    camera.position.set(2.0, 0.5, -1);
    camera.lookAt(2.0, 0.5, 0.5);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    const cameraModelMatrixInverse = camera.matrixWorldInverse;
    const projectionMatrix = camera.projectionMatrix;

    // Act
    const sectors = scene.getSectorsIntersectingFrustum(projectionMatrix, cameraModelMatrixInverse);

    // Assert
    expect(sectorIds(sectors)).toEqual([0, 2]);
  });

  test('getSectorsIntersectingFrustum, all sectors inside frustum', () => {
    // Arrange
    const scene = new SectorSceneImpl(8, 3, 'Meters', root, sectorsById);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10.0);
    camera.position.set(0.5, 0.5, -1);
    camera.lookAt(0.5, 0.5, 0.5);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    const cameraModelMatrixInverse = camera.matrixWorldInverse;
    const projectionMatrix = camera.projectionMatrix;

    // Act
    const sectors = scene.getSectorsIntersectingFrustum(projectionMatrix, cameraModelMatrixInverse);

    // Assert
    expect(sectorIds(sectors)).toEqual([0, 1, 2]);
  });

  test('getBoundsOfMostGeometry of simple scene returns full bounds', () => {
    const scene = new SectorSceneImpl(8, 3, 'Meters', root, sectorsById);
    const bounds = scene.getBoundsOfMostGeometry();
    expect(bounds).toEqual(scene.root.bounds);
  });

  test('getBoundsOfMostGeometry of scene with junk geometry, returns filtered bounds', () => {
    // Arrange
    const root = createSectorMetadata([
      0,
      [
        [1, [], new Box3([vec3.fromValues(0, 0, 0), vec3.fromValues(0.5, 1, 1)])],
        [2, [], new Box3([vec3.fromValues(0.5, 0, 0), vec3.fromValues(1, 1, 1)])],
        [3, [], new Box3([vec3.fromValues(1000.5, 1000, 1000), vec3.fromValues(1001, 1001, 1001)])]
      ],
      new Box3([vec3.fromValues(0, 0, 0), vec3.fromValues(1001, 1001, 1001)])
    ]);
    const sectorsById = new Map<number, SectorMetadata>();
    traverseDepthFirst(root, x => {
      sectorsById.set(x.id, x);
      return true;
    });

    // Act
    const scene = new SectorSceneImpl(8, 3, 'Meters', root, sectorsById);
    const bounds = scene.getBoundsOfMostGeometry();

    // Assert - sector 3 is excluded because it's so far way from the other geometry
    expect(bounds).not.toEqual(scene.root.bounds);
    expect(scene.root.bounds.containsPoint(bounds.min)).toBeTrue();
    expect(scene.root.bounds.containsPoint(bounds.max)).toBeTrue();
  });
});

function sectorIds(sectors: SectorMetadata[]): number[] {
  return sectors.map(x => x.id).sort();
}
