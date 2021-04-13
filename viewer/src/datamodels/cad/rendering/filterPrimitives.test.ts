/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { ParsePrimitiveAttribute } from '@cognite/reveal-parser-worker';

import {
  filterPrimitivesOutsideClipBoxByCenterAndRadius,
  filterPrimitivesOutsideClipBoxByVertices
} from './filterPrimitives';

describe('filterPrimitivesOutsideClipBoxByCenterAndRadius', () => {
  let attributes: Map<string, ParsePrimitiveAttribute>;

  beforeEach(() => {
    attributes = new Map<string, ParsePrimitiveAttribute>([
      ['centerA', { offset: 0, size: 3 * 4 }],
      ['radiusA', { offset: 12, size: 4 }],
      ['centerB', { offset: 16, size: 3 * 4 }],
      ['radiusB', { offset: 28, size: 4 }]
    ]);
  });

  test('no clipbox, returns original', () => {
    const original = new Uint8Array(32);
    const filtered = filterPrimitivesOutsideClipBoxByCenterAndRadius(original, attributes, undefined);
    expect(filtered).toBe(original);
  });

  test('one accepted, one reject - returns filtered', () => {
    // Arrange
    const original = new Float32Array([
      // Element 1
      ...createElement([0, 0, 0], 1),
      ...createElement([2, 2, 2], 1),
      // Element 2
      ...createElement([10, 10, 10], 1),
      ...createElement([11, 11, 11], 1)
    ]);
    const bytes = new Uint8Array(original.buffer);
    const clipBox = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 2, 2));

    const filtered = filterPrimitivesOutsideClipBoxByCenterAndRadius(bytes, attributes, clipBox);
    const filteredFloats = new Float32Array(filtered.buffer);
    expect(filteredFloats).toEqual(original.subarray(0, original.length / 2));
  });

  function createElement(center: [number, number, number], radius: number): [number, number, number, number] {
    return [...center, radius];
  }
});

describe('filterPrimitivesOutsideClipBoxByVertices', () => {
  let attributes: Map<string, ParsePrimitiveAttribute>;

  beforeEach(() => {
    attributes = new Map<string, ParsePrimitiveAttribute>([
      ['vertex1', { offset: 0, size: 3 * 4 }],
      ['vertex2', { offset: 12, size: 3 * 4 }],
      ['vertex3', { offset: 24, size: 3 * 4 }],
      ['vertex4', { offset: 36, size: 3 * 4 }]
    ]);
  });

  test('no clipbox, returns original', () => {
    const original = new Uint8Array(48);
    const filtered = filterPrimitivesOutsideClipBoxByVertices(original, attributes, undefined);
    expect(filtered).toBe(original);
  });

  test('one accepted, one reject - returns filtered', () => {
    // Arrange
    const original = new Float32Array([
      // Element 1
      ...[1, 1, 1],
      ...[2, 2, 2],
      ...[3, 3, 3],
      ...[4, 4, 4],
      // Element 2
      ...[11, 11, 11],
      ...[12, 12, 12],
      ...[13, 13, 13],
      ...[14, 14, 14]
    ]);
    const bytes = new Uint8Array(original.buffer);
    const clipBox = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 2, 2));

    const filtered = filterPrimitivesOutsideClipBoxByVertices(bytes, attributes, clipBox);
    const filteredFloats = new Float32Array(filtered.buffer);
    expect(filteredFloats).toEqual(original.subarray(0, original.length / 2));
  });
});
