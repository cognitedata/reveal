/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { MeasurementLine } from './MeasurementLine';

describe(MeasurementLine.name, () => {
  let line: MeasurementLine;
  let domElement: HTMLElement;
  let camera: THREE.Camera;

  beforeEach(() => {
    line = new MeasurementLine(4, 0xff00ff);
    domElement = document.createElement('div');
    camera = new THREE.Camera();
  });

  test('startLine() creates mesh', () => {
    line.startLine(new THREE.Vector3(), 0);
    expect(line.meshes.children).not.toBeEmpty();
  });

  test('mid point between the line', () => {
    const startPosition = new THREE.Vector3();
    const endPosition = new THREE.Vector3(100, 100, 100);

    line.startLine(startPosition, 0);
    line.updateLine(0, 0, domElement, camera, endPosition);

    const midPoint = line.getMidPointOnLine();
    const expectedMidPoint = new THREE.Vector3(50, 50, 50);

    //Have to roundToZero to remove floating comparison error
    expect(expectedMidPoint).toEqual(midPoint.roundToZero());
  });
});
