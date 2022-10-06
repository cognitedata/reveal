/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { calculateVolumeOfMesh } from './calculateVolumeOfMesh';

describe(calculateVolumeOfMesh.name, () => {
  test('Volume of unit box should be 1', () => {
    const testBox = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
    const volume = calculateVolumeOfMesh(
      Float32Array.from(testBox.getAttribute('position').array),
      Uint32Array.from(testBox.getIndex()!.array)
    );

    expect(Math.abs(1 - volume)).toBeLessThan(1e-6);
  });

  test('Volume of unit sphere should be (4 / 3) * PI', () => {
    const testSphere = new THREE.SphereGeometry(1, 200, 200);
    const calculatedVolume = calculateVolumeOfMesh(
      Float32Array.from(testSphere.getAttribute('position').array),
      Uint32Array.from(testSphere.getIndex()!.array)
    );

    const realVolume = (4 / 3) * Math.PI;

    expect(Math.abs(realVolume - calculatedVolume)).toBeLessThan(1e-3);
  });

  test('Volume of unit cylinder should be PI', () => {
    const testCylinder = new THREE.CylinderGeometry(1, 1, 1, 200, 200);

    const calculatedVolume = calculateVolumeOfMesh(
      Float32Array.from(testCylinder.getAttribute('position').array),
      Uint32Array.from(testCylinder.getIndex()!.array)
    );

    const realVolume = Math.PI;

    expect(Math.abs(realVolume - calculatedVolume)).toBeLessThan(1e-3);
  });

  test('Volume of unit cone should be PI / 3', () => {
    const testCylinder = new THREE.ConeGeometry(1, 1, 200, 200);

    const calculatedVolume = calculateVolumeOfMesh(
      Float32Array.from(testCylinder.getAttribute('position').array),
      Uint32Array.from(testCylinder.getIndex()!.array)
    );

    const realVolume = Math.PI / 3;

    expect(Math.abs(realVolume - calculatedVolume)).toBeLessThan(1e-3);
  });
});
