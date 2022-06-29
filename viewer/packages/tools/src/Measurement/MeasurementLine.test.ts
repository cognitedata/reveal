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
    line = new MeasurementLine({
      changeMeasurementLabelMetrics: (distance: number) => {
        return { distance: distance * 2.0, units: 'ft' };
      }
    });
    domElement = document.createElement('div');
    camera = new THREE.Camera();
  });

  test('Generate line geometry and mesh', () => {
    const position = new THREE.Vector3();
    const meshGroup = line.startLine(position, 0);
    const mesh = meshGroup.children[0] as THREE.Mesh;

    expect(mesh.geometry).not.toBeNull();
    expect(mesh.material).not.toBeNull();

    //check for startPoint
    const points = mesh.geometry.getAttribute('instanceStart').array;
    const startPoint = new THREE.Vector3(points[0], points[1], points[2]);

    expect(startPoint).toEqual(position);
  });

  test('update the line end point', () => {
    let position = new THREE.Vector3();
    const meshGroup = line.startLine(position, 0);
    const mesh = meshGroup.children[0] as THREE.Mesh;

    let points = mesh.geometry.getAttribute('instanceStart').array;
    let endPoint = new THREE.Vector3(points[3], points[4], points[5]);

    expect(endPoint).toEqual(new THREE.Vector3());

    position = new THREE.Vector3(100, 100, 100);
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

    expect(distance).toBe(endPosition.distanceTo(startPosition));
  });

  test('set measurement line width and color', () => {
    const lineOptions = {
      lineWidth: 1.0,
      color: 0xff0000
    };
    line.setOptions(lineOptions);

    expect((line as any)._options.lineWidth).toEqual(1.0);
    expect((line as any)._options.color).toEqual(0xff0000);
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

  test('Clear line geometry and material', () => {
    const position = new THREE.Vector3();
    const meshGroup = line.startLine(position, 0);
    const mesh = meshGroup.children[0] as THREE.Mesh;

    expect(mesh.geometry).not.toBeNull();
    expect(mesh.material).not.toBeNull();

    //clear the line geometry & material.
    line.clearObjects();

    expect((line as any)._geometry).toBeNull();
    expect((line as any)._material.length).toBe(0);
  });
});
