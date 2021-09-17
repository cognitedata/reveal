/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { computeNdcAreaOfBox } from './computeNdcAreaOfBox';

describe('computeNdcAreaOfBox', () => {
  let camera: THREE.PerspectiveCamera;

  beforeEach(() => {
    // At <0,0,0>, looking down negative z
    camera = new THREE.PerspectiveCamera();
  });

  test('box is out side frustum, returns 0', () => {
    const box = new THREE.Box3(new THREE.Vector3(5, 5, 2), new THREE.Vector3(6, 6, 3));
    const area = computeNdcAreaOfBox(camera, box);
    expect(area).toBe(0.0);
  });

  test('box is fully encapsulating frustum', () => {
    camera.near = 0.1;
    camera.far = 1.0;
    const box = new THREE.Box3(new THREE.Vector3(-10, -10, 0), new THREE.Vector3(10, 10, 1));
    const area = computeNdcAreaOfBox(camera, box);
    expect(area).toBe(1.0);
  });

  test('box is fully inside frustum', () => {
    camera.near = 0.1;
    camera.far = 1.0;
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    const box = new THREE.Box3(new THREE.Vector3(-0.25, -0.25, -2), new THREE.Vector3(0.25, 0.25, -1));
    const area = computeNdcAreaOfBox(camera, box);
    expect(area).toBeGreaterThan(0.0);
    expect(area).toBeLessThan(1.0);
  });

  test('box intersecting frustum', () => {
    const camera = new THREE.OrthographicCamera(-1, 1, -1, 1, 0, 1);
    const box = new THREE.Box3(new THREE.Vector3(0.0, 0.0, 0.0), new THREE.Vector3(1.5, 1.5, 1.5));
    const area = computeNdcAreaOfBox(camera, box);
    expect(area).toBe(1.0 / 4.0);
  });

  test('box corners is behind near plane', () => {
    camera.near = 1.0;
    camera.far = 10.0;
    camera.position.set(0, 0, 100.0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    const box = new THREE.Box3(new THREE.Vector3(-1, -1, 100.0), new THREE.Vector3(1, 1, -108.0));
    const area = computeNdcAreaOfBox(camera, box);
    expect(area).toBe(1.0);
  });

  test('box is behind camera', () => {
    const box = new THREE.Box3(new THREE.Vector3(-1, -1, 10.0), new THREE.Vector3(1, 1, 20.0));
    const area = computeNdcAreaOfBox(camera, box);
    expect(area).toBe(0.0);
  });

  test('regression #1', () => {
    // Probably fails because we're inside the box, but that part of the box is behind the near plane
    // which fails. See comments in https://stackoverflow.com/a/14693373
    const camera = new THREE.PerspectiveCamera(60.0, 1.7714748784440844, 0.1, 190);
    camera.position.set(249.02361547663446, 36.44317079418453, -311.05384943297673);
    camera.rotation.set(-0.19739555984988094, 0.5318080969475689, 0.10107292025169398, 'XYZ');
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    const box = new THREE.Box3(new THREE.Vector3(97, -50, -362), new THREE.Vector3(413, 121, -238));
    const area = computeNdcAreaOfBox(camera, box);
    expect(area).toBe(1.0);
  });
});
