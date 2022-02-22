/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorMetadata } from '../metadata/types';
import { SectorSceneImpl } from './SectorScene';
import { traverseDepthFirst } from '@reveal/utilities';

import { createV8SectorMetadata } from '../../../../test-utilities';

describe('SectorSceneImpl', () => {
  const root = createV8SectorMetadata([
    0,
    [
      [1, [], new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, 1, 1))],
      [2, [], new THREE.Box3(new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(1, 1, 1))]
    ],
    new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1))
  ]) as SectorMetadata;
  const sectorsById = new Map<number, SectorMetadata>();
  traverseDepthFirst(root, x => {
    sectorsById.set(x.id, x);
    return true;
  });

  test('getSectorsContainingPoint', () => {
    const scene = new SectorSceneImpl(8, 3, 'Meters', root, sectorsById);

    expect(sectorIds(scene.getSectorsContainingPoint(new THREE.Vector3(0.2, 0.5, 0.5)))).toEqual([0, 1]);
    expect(sectorIds(scene.getSectorsContainingPoint(new THREE.Vector3(0.75, 0.5, 0.5)))).toEqual([0, 2]);
    expect(sectorIds(scene.getSectorsContainingPoint(new THREE.Vector3(2, 0.5, 0.5)))).toEqual([]);
  });

  test('getSectorsIntersectingBox', () => {
    const scene = new SectorSceneImpl(8, 3, 'Meters', root, sectorsById);
    expect(
      sectorIds(scene.getSectorsIntersectingBox(new THREE.Box3().setFromArray([-10, -10, -10, 10, 10, 10])))
    ).toEqual([0, 1, 2]);
    expect(sectorIds(scene.getSectorsIntersectingBox(new THREE.Box3().setFromArray([0, 0, 0, 0.2, 0.2, 0.2])))).toEqual(
      [0, 1]
    );
    expect(sectorIds(scene.getSectorsIntersectingBox(new THREE.Box3().setFromArray([0.6, 0.6, 0.6, 1, 1, 1])))).toEqual(
      [0, 2]
    );
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
    expect(bounds).toEqual(scene.root.subtreeBoundingBox);
  });

  test('getBoundsOfMostGeometry of scene with junk geometry, returns filtered bounds', () => {
    // Arrange
    const root = createV8SectorMetadata([
      0,
      [
        [1, [], new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, 1, 1))],
        [2, [], new THREE.Box3(new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(1, 1, 1))],
        [3, [], new THREE.Box3(new THREE.Vector3(1000.5, 1000, 1000), new THREE.Vector3(1001, 1001, 1001))]
      ],
      new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1001, 1001, 1001))
    ]) as SectorMetadata;
    const sectorsById = new Map<number, SectorMetadata>();
    traverseDepthFirst(root, x => {
      sectorsById.set(x.id, x);
      return true;
    });

    // Act
    const scene = new SectorSceneImpl(8, 3, 'Meters', root, sectorsById);
    const bounds = scene.getBoundsOfMostGeometry();

    // Assert - sector 3 is excluded because it's so far way from the other geometry
    expect(bounds).not.toEqual(scene.root.subtreeBoundingBox);
    expect(scene.root.subtreeBoundingBox.containsPoint(bounds.min)).toBeTrue();
    expect(scene.root.subtreeBoundingBox.containsPoint(bounds.max)).toBeTrue();
  });

  test('getBoundsOfMostGeometry with root with only one child, result is child bounds', () => {
    // Arrange
    const leafBounds = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));
    const root = createV8SectorMetadata([
      0,
      [[1, [], leafBounds]],
      new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 10, 10))
    ]) as SectorMetadata;
    const sectorsById = new Map<number, SectorMetadata>();
    traverseDepthFirst(root, x => {
      sectorsById.set(x.id, x);
      return true;
    });

    // Act
    const scene = new SectorSceneImpl(8, 3, 'Meters', root, sectorsById);
    const bounds = scene.getBoundsOfMostGeometry();

    // Assert
    expect(bounds).toEqual(leafBounds);
  });
});

function sectorIds(sectors: SectorMetadata[]): number[] {
  return sectors.map(x => x.id).sort();
}
