/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { distanceFromBoxToLine } from './distanceFromBoxToLine';

describe('distanceFromBoxToLine', () => {
  test('line intersects box', () => {
    const line = new THREE.Line3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 10));
    const box = new THREE.Box3(new THREE.Vector3(-1, -1, 1), new THREE.Vector3(1, 1, 2));
    const result = distanceFromBoxToLine(box, line);
    expect(result).toBe(0.0);
  });

  test('line intersects box, but outside segment bounds', () => {
    const line = new THREE.Line3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 10));
    const box = new THREE.Box3(new THREE.Vector3(-1, -1, 100), new THREE.Vector3(1, 1, 200));
    const result = distanceFromBoxToLine(box, line);
    expect(result).toBeGreaterThan(0.0);
  });

  test('line is parallel to box edge', () => {
    const line = new THREE.Line3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 10));
    const box = new THREE.Box3(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 1, 2));
    const result = distanceFromBoxToLine(box, line);
    expect(result).toBe(0.0);
  });

  test('line doesnt intersect, returns shortest distance', () => {
    const line = new THREE.Line3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 10));
    const box = new THREE.Box3(new THREE.Vector3(0.5, 0.5, 1), new THREE.Vector3(1, 1, 2));
    const result = distanceFromBoxToLine(box, line);
    const expectedDistance = Math.sqrt(2 * 0.5 ** 2);
    expect(result).toBe(expectedDistance);
  });
});
