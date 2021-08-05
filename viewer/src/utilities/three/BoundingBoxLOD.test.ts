/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { BoundingBoxLOD } from './BoundingBoxLOD';

describe('BoundingBoxLOD', () => {
  let camera: THREE.PerspectiveCamera;
  let boundingBox: THREE.Box3;
  let lod: BoundingBoxLOD;

  beforeEach(() => {
    boundingBox = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
    camera = new THREE.PerspectiveCamera();
    camera.position.set(10, 0, 0);
    camera.updateMatrixWorld();
    lod = new BoundingBoxLOD(boundingBox);
  });

  test('no LODs, update() does nothing', () => {
    lod.update(camera);
    expect(lod.getCurrentLevel()).toBe(0);
  });

  test('single LOD, update() sets visible', () => {
    const l0 = new THREE.Object3D();
    l0.visible = false;
    lod.addLevel(l0, 10.0);
    lod.update(camera);
    expect(l0.visible).toBeTrue();
  });

  test('two LODs, camera is outside distance of l1 - sets correct level visible', () => {
    const l0 = new THREE.Object3D();
    const l1 = new THREE.Object3D();
    lod.addLevel(l0, 0.0);
    lod.addLevel(l1, 5.0);
    lod.update(camera);
    expect(lod.getCurrentLevel()).toBe(1);
    expect(l0.visible).toBeFalse();
    expect(l1.visible).toBeTrue();
  });

  test('several LODs added out of order, selects correct one', () => {
    lod.addLevel(new THREE.Object3D(), 0.0);
    lod.addLevel(new THREE.Object3D(), 3.0);
    lod.addLevel(new THREE.Object3D(), 7.0);
    lod.addLevel(new THREE.Object3D(), 10.0);
    lod.addLevel(new THREE.Object3D(), 15.0);
    const l = new THREE.Object3D();
    lod.addLevel(l, 8.0);

    lod.update(camera);

    expect(lod.getCurrentLevel()).toBe(3);
    expect(l.visible).toBe(true);
  });
});
