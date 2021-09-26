/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { SectorMetadata } from '../../../../../../dist/internals';
import { traverseDepthFirst } from '../../../../utilities';
import { createSectorMetadata } from '../../../../__testutilities__';
import { WeightFunctionsHelper } from './WeightFunctionsHelper';

describe('WeightFunctionsHelper', () => {
  let camera: THREE.PerspectiveCamera;
  let helper: WeightFunctionsHelper;
  let sectors: SectorMetadata[];
  const identityMatrix = new THREE.Matrix4().identity();

  beforeEach(() => {
    camera = new THREE.PerspectiveCamera();
    camera.near = 0.1;
    camera.far = 10.0;
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 1);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    helper = new WeightFunctionsHelper(camera);

    const rootSector = createSectorMetadata([
      0,
      [
        [1, [], new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, 1, 1))],
        [2, [], new THREE.Box3(new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(1, 1, 1))]
      ],
      new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1))
    ]);
    sectors = [];
    traverseDepthFirst(rootSector, x => {
      sectors.push(x);
      return true;
    });
  });

  test('computeTransformedSectorBounds applies model matrix', () => {
    const modelMatrix = new THREE.Matrix4().makeRotationX(Math.PI / 4);
    const bounds = new THREE.Box3(new THREE.Vector3(-1, -2, -3), new THREE.Vector3(4, 5, 6));
    const expectedResult = bounds.clone().applyMatrix4(modelMatrix);

    const result = new THREE.Box3();
    helper.computeTransformedSectorBounds(bounds, modelMatrix, result);

    expect(result).toEqual(expectedResult);
  });

  test('computeDistanceToCameraWeight returns 1 for camera sector is inside', () => {
    helper.addCandidateSectors(sectors, identityMatrix);
    const bounds = new THREE.Box3().setFromArray([0, 0, 0, 1, 1, 1]);
    camera.position.set(0.5, 0.5, 0.5);

    const weight = helper.computeDistanceToCameraWeight(bounds);

    expect(weight).toBe(1.0);
  });

  test('computeDistanceToCameraWeight returns values in range [0,1]', () => {
    camera.position.set(11, 12, 13);
    helper.addCandidateSectors(sectors, identityMatrix);

    const weights = sectors.map(x => helper.computeDistanceToCameraWeight(x.bounds));
    weights.sort();

    expect(weights[0]).toBe(0.0);
    expect(weights[weights.length - 1]).toBe(1.0);
  });

  test('computeScreenAreaWeight returns 0 for sector outside frustum', () => {
    const bounds = new THREE.Box3().setFromArray([1000, 1000, 1000, 1001, 1001, 1001]);
    const weight = helper.computeScreenAreaWeight(bounds);
    expect(weight).toBe(0.0);
  });

  test('computeScreenAreaWeight returns 1 for sector camera is inside', () => {
    const bounds = new THREE.Box3().setFromArray([0, 0, 0, 1, 1, 1]);
    camera.position.set(0.5, 0.5, 0.5);
    camera.updateProjectionMatrix();

    const weight = helper.computeScreenAreaWeight(bounds);

    expect(weight).toBe(1.0);
  });

  test('computeScreenArea returns value in range (0, 1) for sector partially overlapping view', () => {
    const bounds = new THREE.Box3().setFromArray([-0.2, -0.2, 0.9, 0.2, 0.2, 1]);

    const weight = helper.computeScreenAreaWeight(bounds);

    expect(weight).toBeGreaterThan(0.0);
    expect(weight).toBeLessThan(1.0);
  });

  test('computeFrustumDepthWeight returns 0 for sector outside frustum', () => {
    const bounds = new THREE.Box3().setFromArray([11, 11, 11, 12, 12, 12]);

    const weight = helper.computeFrustumDepthWeight(bounds);

    expect(weight).toBe(0.0);
  });

  test('computeFrustumDepthWeight returns weight greater if covers more depth', () => {
    const partialDepthBounds = new THREE.Box3().setFromArray([-10, -10, 2, 10, 10, 5]);
    const fullDepthBounds = new THREE.Box3().setFromArray([-10, -10, 0, 10, 10, 15]);

    const partialDepthWeight = helper.computeFrustumDepthWeight(partialDepthBounds);
    const fullDepthWeight = helper.computeFrustumDepthWeight(fullDepthBounds);

    expect(fullDepthWeight).toBeGreaterThan(partialDepthWeight);
  });
});
