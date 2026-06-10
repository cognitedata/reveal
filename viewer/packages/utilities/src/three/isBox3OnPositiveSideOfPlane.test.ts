/*!
 * Copyright 2021 Cognite AS
 */
import { isBox3OnPositiveSideOfPlane } from './isBox3OnPositiveSideOfPlane';
import { Box3, Plane, Vector3 } from 'three';

describe('isBox3OnPositiveSideOfPlane', () => {
  test('All box-corners are on positive side of plane', () => {
    const box = createBox([0, 0, 0], [1, 1, 1]);
    const plane = new Plane().setFromNormalAndCoplanarPoint(new Vector3(0, 1, 0), new Vector3(0, -5, 0));
    expect(isBox3OnPositiveSideOfPlane(box, plane)).toBeTruthy();
  });

  test('All box-corners are on the negative side of plane', () => {
    const box = createBox([0, 0, 0], [1, 1, 1]);
    const plane = new Plane().setFromNormalAndCoplanarPoint(new Vector3(0, 1, 0), new Vector3(0, 5, 0));
    expect(isBox3OnPositiveSideOfPlane(box, plane)).toBeFalsy();
  });

  test('Plane slices box', () => {
    const box = createBox([0, 0, 0], [1, 1, 1]);
    const plane = new Plane().setFromNormalAndCoplanarPoint(new Vector3(0, 1, 0), new Vector3(0, 0.5, 0));
    expect(isBox3OnPositiveSideOfPlane(box, plane)).toBeTruthy();
  });
});

function createBox(min: [number, number, number], max: [number, number, number]): Box3 {
  return new Box3().setFromArray([...min, ...max]);
}
