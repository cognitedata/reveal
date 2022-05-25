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
    line = new MeasurementLine();
    domElement = document.createElement('div');
    camera = new THREE.Camera();
  });

  test('Generate line geometry and mesh', () => {
    const position = new THREE.Vector3(0, 0, 0);
    const mesh = line.startLine(position, 0);

    expect(mesh.geometry).not.toBeNull();
    expect(mesh.material).not.toBeNull();

    //check for startPoint
    const points = mesh.geometry.getAttribute('instanceStart').array;
    const startPoint = new THREE.Vector3(points[0], points[1], points[2]);

    expect(startPoint).toEqual(position);
  });

  test('update the line end point', () => {
    const position = new THREE.Vector3(100, 100, 100);
    const mesh = line.startLine(new THREE.Vector3(0, 0, 0), 0);

    let points = mesh.geometry.getAttribute('instanceStart').array;
    let endPoint = new THREE.Vector3(points[3], points[4], points[5]);

    expect(endPoint).toEqual(new THREE.Vector3(0, 0, 0));

    line.updateLine(0, 0, domElement, camera, position);

    points = mesh.geometry.getAttribute('instanceStart').array;
    endPoint = new THREE.Vector3(points[3], points[4], points[5]);

    expect(endPoint).toEqual(position);
  });

  test('distance between the measuring line start point & end point', () => {
    const startPosition = new THREE.Vector3();
    const endPosition = new THREE.Vector3(100, 100, 100);

    line.startLine(startPosition, 0);
    line.updateLine(0, 0, domElement, camera, endPosition);

    const distance = line.getMeasuredDistance();

    expect(endPosition.distanceTo(startPosition)).toBe(distance);
  });

  test('set measurement line width and color', () => {
    const lineOptions = { lineWidth: 1.0, color: 0xff0000 };
    line.setOptions(lineOptions);

    expect((line as any)._options.color).toBe(lineOptions.color);
    expect((line as any)._options.lineWidth).toBe(lineOptions.lineWidth);
  });

  test('mid point between the line', () => {
    const startPosition = new THREE.Vector3();
    const endPosition = new THREE.Vector3(100, 100, 100);

    line.startLine(startPosition, 0);
    line.updateLine(0, 0, domElement, camera, endPosition);

    const midPoint = line.getMidPointOnLine();

    expect(midPoint).toEqual(lineMidPoint(startPosition, endPosition));
  });
});

function lineMidPoint(startPoint: THREE.Vector3, endPoint: THREE.Vector3): THREE.Vector3 {
  let direction = endPoint.clone().sub(startPoint);
  const length = direction.length();
  direction = direction.normalize().multiplyScalar(length * 0.5);

  return startPoint.clone().add(direction);
}
