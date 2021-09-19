/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { distanceBetweenLines } from './distanceBetweenLines';

describe('distanceBetweenLines', () => {
  test('overlapping lines', () => {
    const l1 = new THREE.Line3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0));
    const l2 = new THREE.Line3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0));
    const distance = distanceBetweenLines(l1, l2);
    expect(distance).toBe(0.0);
  });

  test('intersection lines', () => {
    const l1 = new THREE.Line3(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0));
    const l2 = new THREE.Line3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 0));
    const distance = distanceBetweenLines(l1, l2);
    expect(distance).toBe(0.0);
  });

  test('parallel lines', () => {
    const l1 = new THREE.Line3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0));
    const l2 = new THREE.Line3(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 1, 0));
    const distance = distanceBetweenLines(l1, l2);
    expect(distance).toBe(1.0);
  });

  test('non-parallel lines in same plane, not intersecting', () => {
    debugger;
    const l1 = new THREE.Line3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0));
    const l2 = new THREE.Line3(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0.1, 0));
    const distance = distanceBetweenLines(l1, l2);
    expect(Math.abs(distance - 0.1)).toBeLessThanOrEqual(1e-6);
  });
});
