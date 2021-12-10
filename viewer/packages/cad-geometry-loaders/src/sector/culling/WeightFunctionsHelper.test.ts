/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { WeightFunctionsHelper } from './WeightFunctionsHelper';

import { PrioritizedArea } from '@reveal/cad-styling';
import { traverseDepthFirst } from '@reveal/utilities';
import { SectorMetadata } from '@reveal/cad-parsers';

import { createV8SectorMetadata } from '../../../../../test-utilities';

describe('WeightFunctionsHelper', () => {
  let camera: THREE.PerspectiveCamera;
  let sectors: SectorMetadata[];
  let helper: WeightFunctionsHelper;
  const identityMatrix = new THREE.Matrix4().identity();

  beforeEach(() => {
    camera = new THREE.PerspectiveCamera(60, 1, 0.1, 10.0);
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 1);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    const rootSector = createV8SectorMetadata([
      0,
      [
        [1, [], new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.5, 1, 1))],
        [2, [], new THREE.Box3(new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(1, 1, 1))]
      ],
      new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1))
    ]);
    sectors = [];
    traverseDepthFirst(rootSector as SectorMetadata, x => {
      sectors.push(x);
      return true;
    });

    helper = new WeightFunctionsHelper(camera);
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
    helper.addCandidateSectors(sectors, identityMatrix);

    const weights = sectors.map(x => helper.computeDistanceToCameraWeight(x.bounds));
    weights.sort();

    expect(weights[0]).toBe(0.0);
    expect(weights[weights.length - 1]).toBe(1.0);
  });

  test('computeScreenAreaWeight returns 0 for sector outside frustum', () => {
    camera.position.set(11, 12, 13);
    camera.updateMatrixWorld();

    const bounds = new THREE.Box3().setFromArray([1000, 1000, 1000, 1001, 1001, 1001]);
    const weight = helper.computeScreenAreaWeight(bounds);
    expect(weight).toBe(0.0);
  });

  test('computeScreenAreaWeight returns 1 for sector camera is inside', () => {
    camera.position.set(0.5, 0.5, 0.5);
    camera.updateProjectionMatrix();
    const helper = new WeightFunctionsHelper(camera);
    const bounds = new THREE.Box3().setFromArray([0, 0, 0, 1, 1, 1]);

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
    const partialDepthBounds = new THREE.Box3().setFromArray([-0.1, -0.1, 2, 0.1, 0.1, 5]);
    const fullDepthBounds = new THREE.Box3().setFromArray([-0.1, -0.1, 0, 0.1, 0.1, 15]);

    const partialDepthWeight = helper.computeFrustumDepthWeight(partialDepthBounds);
    const fullDepthWeight = helper.computeFrustumDepthWeight(fullDepthBounds);

    expect(fullDepthWeight).toBeGreaterThan(partialDepthWeight);
  });

  test('computeMaximumNodeScreenSizeWeight returns greater weight for large objects', () => {
    const bounds = new THREE.Box3().setFromArray([-1, -1, 5, 1, 1, 6]);

    const smallObjectWeight = helper.computeMaximumNodeScreenSizeWeight(bounds, 0.1);
    const largeObjectWeight = helper.computeMaximumNodeScreenSizeWeight(bounds, 0.2);

    expect(smallObjectWeight).toBeGreaterThan(0.0);
    expect(largeObjectWeight).toBeGreaterThan(smallObjectWeight);
    expect(largeObjectWeight).toBeLessThan(1.0);
  });

  test('computeMaximumNodeScreenSizeWeight returns 1.0 for regardless of size if camera is inside sector', () => {
    const bounds = new THREE.Box3().setFromArray([-1, -1, -1, 1, 1, 1]);
    expect(helper.computeMaximumNodeScreenSizeWeight(bounds, 1e-10)).toBe(1);
    expect(helper.computeMaximumNodeScreenSizeWeight(bounds, 1e10)).toBe(1);
  });

  test('computePrioritizedAreaWeight returns 0 when sector doesnt intersect prioritized area', () => {
    const bounds = new THREE.Box3().setFromArray([-1, -1, -1, 1, 1, 1]);
    const areas: PrioritizedArea[] = [
      { area: new THREE.Box3().setFromArray([10, 10, 10, 11, 11, 11]), extraPriority: 10.0 }
    ];
    expect(helper.computePrioritizedAreaWeight(bounds, areas)).toBe(0.0);
  });

  test('computePrioritizedAreaWeight returns maximum extra priority when sector intersects several areas', () => {
    const bounds = new THREE.Box3().setFromArray([-1, -1, -1, 1, 1, 1]);
    const areas: PrioritizedArea[] = [
      { area: new THREE.Box3().setFromArray([-0.5, -0.5, -0.5, 0, 0, 0]), extraPriority: 2.0 },
      { area: new THREE.Box3().setFromArray([0, 0, 0, 0.5, 0.5, 0.5]), extraPriority: 4.0 }
    ];
    expect(helper.computePrioritizedAreaWeight(bounds, areas)).toBe(4.0);
  });
});
