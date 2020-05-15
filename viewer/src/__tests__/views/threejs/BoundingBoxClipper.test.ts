/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { BoundingBoxClipper } from '@/utilities/BoundingBoxClipper';

describe('BoundingBoxClipper', () => {
  test('Clip planes placed correctly', () => {
    const box = new THREE.Box3(new THREE.Vector3(1.0, 2.0, 3.0), new THREE.Vector3(4.0, 5.0, 6.0));
    const clipper = new BoundingBoxClipper(box);

    expect(clipper.clippingPlanes[0].normal.dot(new THREE.Vector3(1, 0, 0))).toBe(1);
    expect(clipper.clippingPlanes[1].normal.dot(new THREE.Vector3(1, 0, 0))).toBe(-1);
    expect(clipper.clippingPlanes[2].normal.dot(new THREE.Vector3(0, 1, 0))).toBe(1);
    expect(clipper.clippingPlanes[3].normal.dot(new THREE.Vector3(0, 1, 0))).toBe(-1);
    expect(clipper.clippingPlanes[4].normal.dot(new THREE.Vector3(0, 0, 1))).toBe(1);
    expect(clipper.clippingPlanes[5].normal.dot(new THREE.Vector3(0, 0, 1))).toBe(-1);

    expect(clipper.clippingPlanes[0].constant).toBe(-1);
    expect(clipper.clippingPlanes[1].constant).toBe(4);
    expect(clipper.clippingPlanes[2].constant).toBe(-2);
    expect(clipper.clippingPlanes[3].constant).toBe(5);
    expect(clipper.clippingPlanes[4].constant).toBe(-3);
    expect(clipper.clippingPlanes[5].constant).toBe(6);
  });

  test('Changing min and max values should move clip planes', () => {
    const clipper = new BoundingBoxClipper();

    expect(clipper.clippingPlanes[0].normal.dot(new THREE.Vector3(1, 0, 0))).toBe(1);
    expect(clipper.clippingPlanes[1].normal.dot(new THREE.Vector3(1, 0, 0))).toBe(-1);
    expect(clipper.clippingPlanes[2].normal.dot(new THREE.Vector3(0, 1, 0))).toBe(1);
    expect(clipper.clippingPlanes[3].normal.dot(new THREE.Vector3(0, 1, 0))).toBe(-1);
    expect(clipper.clippingPlanes[4].normal.dot(new THREE.Vector3(0, 0, 1))).toBe(1);
    expect(clipper.clippingPlanes[5].normal.dot(new THREE.Vector3(0, 0, 1))).toBe(-1);

    expect(clipper.clippingPlanes[0].constant).toBe(-Infinity);
    expect(clipper.clippingPlanes[1].constant).toBe(-Infinity);
    expect(clipper.clippingPlanes[2].constant).toBe(-Infinity);
    expect(clipper.clippingPlanes[3].constant).toBe(-Infinity);
    expect(clipper.clippingPlanes[4].constant).toBe(-Infinity);
    expect(clipper.clippingPlanes[5].constant).toBe(-Infinity);

    clipper.minX = 1.0;
    clipper.minY = 2.0;
    clipper.minZ = 3.0;
    clipper.maxX = 4.0;
    clipper.maxY = 5.0;
    clipper.maxZ = 6.0;

    expect(clipper.clippingPlanes[0].normal.dot(new THREE.Vector3(1, 0, 0))).toBe(1);
    expect(clipper.clippingPlanes[1].normal.dot(new THREE.Vector3(1, 0, 0))).toBe(-1);
    expect(clipper.clippingPlanes[2].normal.dot(new THREE.Vector3(0, 1, 0))).toBe(1);
    expect(clipper.clippingPlanes[3].normal.dot(new THREE.Vector3(0, 1, 0))).toBe(-1);
    expect(clipper.clippingPlanes[4].normal.dot(new THREE.Vector3(0, 0, 1))).toBe(1);
    expect(clipper.clippingPlanes[5].normal.dot(new THREE.Vector3(0, 0, 1))).toBe(-1);

    expect(clipper.clippingPlanes[0].constant).toBe(-1);
    expect(clipper.clippingPlanes[1].constant).toBe(4);
    expect(clipper.clippingPlanes[2].constant).toBe(-2);
    expect(clipper.clippingPlanes[3].constant).toBe(5);
    expect(clipper.clippingPlanes[4].constant).toBe(-3);
    expect(clipper.clippingPlanes[5].constant).toBe(6);
  });
});
