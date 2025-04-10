/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';

import { TrianglesBuffers } from './TrianglesBuffers';
import { Vector3 } from 'three';

const point1 = new Vector3(1, 2, 3);
const point2 = new Vector3(4, 5, 6);

const normal1 = new Vector3(1, 0, 0);
const normal2 = new Vector3(0, 0, 1);

describe(TrianglesBuffers.name, () => {
  test('should make positions', () => {
    const buffer = new TrianglesBuffers(2, false);
    buffer.addPosition(point1);
    buffer.addPosition(point2);
    const geometry = buffer.createBufferGeometry();
    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    const uvs = geometry.getAttribute('uv');

    expect(positions.count).toBe(2);
    expect(normals).toBeUndefined();
    expect(uvs).toBeUndefined();

    expect(positions.array[5]).toBe(point2.z);
  });

  test('should make positions and normals', () => {
    for (const add of [true, false]) {
      const buffer = new TrianglesBuffers(2);
      if (add) {
        buffer.add(point1, normal1);
        buffer.add(point2, normal2);
      } else {
        buffer.setAt(0, point1, normal1);
        buffer.setAt(1, point2, normal2);
      }
      const geometry = buffer.createBufferGeometry();
      const positions = geometry.getAttribute('position');
      const normals = geometry.getAttribute('normal');
      const uvs = geometry.getAttribute('uv');

      expect(positions.count).toBe(2);
      expect(normals.count).toBe(2);
      expect(uvs).toBeUndefined();

      expect(positions.array[5]).toBe(point2.z);
      expect(normals.array[5]).toBe(normal2.z);
    }
  });

  test('should make positions, normals and uv`s', () => {
    for (const add of [true, false]) {
      const buffer = new TrianglesBuffers(2, true, true);
      if (add) {
        buffer.add(point1, normal1, 0, 1);
        buffer.add(point2, normal2, 2, 3);
      } else {
        buffer.setAt(0, point1, normal1, 0, 1);
        buffer.setAt(1, point2, normal2, 2, 3);
      }
      const geometry = buffer.createBufferGeometry();
      const positions = geometry.getAttribute('position');
      const normals = geometry.getAttribute('normal');
      const uvs = geometry.getAttribute('uv');

      expect(positions.count).toBe(2);
      expect(normals.count).toBe(2);
      expect(uvs.count).toBe(2);

      expect(positions.array[5]).toBe(point2.z);
      expect(normals.array[5]).toBe(normal2.z);
      expect(uvs.array[3]).toBe(3);
    }
  });

  test('should make indexes for 3 triangles', () => {
    const buffer = new TrianglesBuffers(0);
    buffer.addTriangle(0, 1, 2);
    buffer.addTriangle(3, 4, 5);
    buffer.addTriangle(6, 7, 8);

    const geometry = buffer.createBufferGeometry();
    const index = geometry.getIndex();
    expect(index).toBeDefined();
    if (index === null) {
      return;
    }
    expect(index.count).toBe(9);
    expect(index.array.length).toBe(9);

    for (let i = 0; i < index.array.length; i++) {
      expect(index.array[i]).toBe(i);
    }
  });

  test('should make a quad with one normal and u', () => {
    const buffer = new TrianglesBuffers(4, true, true);
    buffer.addPairWithNormal(point1, point2, normal1, 3);
    expect(buffer.isFilled).toBe(false);
    buffer.addPairWithNormal(point1, point2, normal1, 3);
    expect(buffer.isFilled).toBe(true);

    const geometry = buffer.createBufferGeometry();
    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    const uvs = geometry.getAttribute('uv');
    const index = geometry.getIndex();

    expect(positions.count).toBe(4);
    expect(normals.count).toBe(4);
    expect(uvs.count).toBe(4);
    expect(index).toBeDefined();
    if (index === null) {
      return;
    }
    expect(index.count).toBe(6);
    expect(index.array.length).toBe(6);

    expect(positions.array[5]).toBe(point2.z);
    expect(normals.array[5]).toBe(normal1.z);
    expect(uvs.array[2]).toBe(3);
    expect(uvs.array[3]).toBe(0);

    const expectedArray = [0, 3, 2, 0, 1, 3];
    for (let i = 0; i < expectedArray.length; i++) {
      expect(index.array[i]).toBe(expectedArray[i]);
    }
  });
});
