/*!
 * Copyright 2021 Cognite AS
 */
import { isBox3OnPositiveSideOfPlane } from '@reveal/utilities';
import * as THREE from 'three';

describe('isBox3OnPositiveSideOfPlane', () => {
  test('All box-corners are on positive side of plane', () => {
    const box = createBox([0, 0, 0], [1, 1, 1]);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -5, 0)
    );
    expect(isBox3OnPositiveSideOfPlane(box, plane)).toBeTrue();
  });

  test('All box-corners are on the negative side of plane', () => {
    const box = createBox([0, 0, 0], [1, 1, 1]);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 5, 0)
    );
    expect(isBox3OnPositiveSideOfPlane(box, plane)).toBeFalse();
  });

  test('Plane slices box', () => {
    const box = createBox([0, 0, 0], [1, 1, 1]);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0.5, 0)
    );
    expect(isBox3OnPositiveSideOfPlane(box, plane)).toBeTrue();
  });
});

function createBox(min: [number, number, number], max: [number, number, number]): THREE.Box3 {
  return new THREE.Box3().setFromArray([...min, ...max]);
}
