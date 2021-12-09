/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { ParsePrimitiveAttribute } from '@cognite/reveal-parser-worker';
import {
  computeBoundingBoxFromCenterAndRadiusAttributes,
  computeBoundingBoxFromEllipseAttributes,
  computeBoundingBoxFromInstanceMatrixAttributes,
  computeBoundingBoxFromVertexAttributes
} from './computeBoundingBoxFromAttributes';

describe('computeBoundingBoxFromCenterAndRadiusAttributes', () => {
  let centerA_attribute: ParsePrimitiveAttribute;
  let centerB_attribute: ParsePrimitiveAttribute;
  let radiusA_attribute: ParsePrimitiveAttribute;
  let radiusB_attribute: ParsePrimitiveAttribute;
  let elementSize: number;

  beforeEach(() => {
    centerA_attribute = { offset: 0, size: 4 * 3 };
    centerB_attribute = { offset: 12, size: 4 * 3 };
    radiusA_attribute = { offset: 24, size: 4 };
    radiusB_attribute = { offset: 28, size: 4 };
    elementSize = 32;
  });

  test('simple sphere, returns correct bbox', () => {
    // Arange
    const valuesAsFloats = new Float32Array(8);
    populateValues([1, 1, 1], 1, [1, 1, 1], 1, 0, valuesAsFloats);

    // Act
    const result = computeBoundingBoxFromCenterAndRadiusAttributes(
      valuesAsFloats,
      centerA_attribute.offset,
      centerB_attribute.offset,
      radiusA_attribute.offset,
      radiusB_attribute.offset,
      elementSize,
      0,
      new THREE.Box3()
    );

    // Assert
    expect(result).toEqual(new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 2, 2)));
  });

  test('two spheres, result contains both sphere bounding boxes', () => {
    // Arange
    const valuesAsFloats = new Float32Array(8);
    populateValues([-1, -5, 3], 6, [5, 9, 10], 10, 0, valuesAsFloats);
    const sphere1 = new THREE.Sphere(new THREE.Vector3(-1, -5, 3), 6);
    const sphere2 = new THREE.Sphere(new THREE.Vector3(5, 9, 10), 10);

    // Act
    const result = computeBoundingBoxFromCenterAndRadiusAttributes(
      valuesAsFloats,
      centerA_attribute.offset,
      centerB_attribute.offset,
      radiusA_attribute.offset,
      radiusB_attribute.offset,
      elementSize,
      0,
      new THREE.Box3()
    );

    // Assert
    expect(result.containsBox(sphere1.getBoundingBox(new THREE.Box3()))).toBeTrue();
    expect(result.containsBox(sphere2.getBoundingBox(new THREE.Box3()))).toBeTrue();
  });

  test('second element returns correct bounding box', () => {
    // Arange
    const valuesAsFloats = new Float32Array(16);
    populateValues([3, 3, 3], 1, [7, 7, 7], 2, 1, valuesAsFloats);
    const sphere1 = new THREE.Sphere(new THREE.Vector3(3, 3, 3), 1);
    const sphere2 = new THREE.Sphere(new THREE.Vector3(7, 7, 7), 2);

    // Act
    const result = computeBoundingBoxFromCenterAndRadiusAttributes(
      valuesAsFloats,
      centerA_attribute.offset,
      centerB_attribute.offset,
      radiusA_attribute.offset,
      radiusB_attribute.offset,
      elementSize,
      1,
      new THREE.Box3()
    );

    // Assert
    expect(result.containsBox(sphere1.getBoundingBox(new THREE.Box3()))).toBeTrue();
    expect(result.containsBox(sphere2.getBoundingBox(new THREE.Box3()))).toBeTrue();
  });

  function populateValues(
    centerA: [number, number, number],
    radiusA: number,
    centerB: [number, number, number],
    radiusB: number,
    index: number,
    buffer: Float32Array
  ) {
    const offset = index * 8; // 8 floats per element
    buffer[offset + 0] = centerA[0];
    buffer[offset + 1] = centerA[1];
    buffer[offset + 2] = centerA[2];
    buffer[offset + 3] = centerB[0];
    buffer[offset + 4] = centerB[1];
    buffer[offset + 5] = centerB[2];
    buffer[offset + 6] = radiusA;
    buffer[offset + 7] = radiusB;
  }
});

describe('computeBoundingBoxFromVertexAttributes', () => {
  let vertex1Attribute: ParsePrimitiveAttribute;
  let vertex2Attribute: ParsePrimitiveAttribute;
  let vertex3Attribute: ParsePrimitiveAttribute;
  let vertex4Attribute: ParsePrimitiveAttribute;
  let elementSize: number;

  beforeEach(() => {
    vertex1Attribute = { offset: 0, size: 4 * 3 };
    vertex2Attribute = { offset: 12, size: 4 * 3 };
    vertex3Attribute = { offset: 24, size: 4 * 3 };
    vertex4Attribute = { offset: 36, size: 4 * 3 };
    elementSize = 48;
  });

  test('simple box, returns correct bbox', () => {
    // Arange
    const valuesAsFloats = new Float32Array(12);
    populateValues([1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4], 0, valuesAsFloats);

    // Act
    const result = computeBoundingBoxFromVertexAttributes(
      vertex1Attribute.offset,
      vertex2Attribute.offset,
      vertex3Attribute.offset,
      vertex4Attribute.offset,
      valuesAsFloats,
      elementSize,
      0,
      new THREE.Box3()
    );

    // Assert
    expect(result).toEqual(new THREE.Box3(new THREE.Vector3(1, 1, 1), new THREE.Vector3(4, 4, 4)));
  });

  test('second element returns correct bounding box', () => {
    // Arange
    /* eslint-disable prettier/prettier */
    const values = [
      // Element 1
      0,0,0, 0,0,0, 0,0,0, 0,0,0, 
      // Element 2 
      1,2,3, 4,5,6, 7,8,9, 10,11,12
    ];
    /* eslint-enable prettier/prettier */
    const valuesAsFloats = new Float32Array(values);

    // Act
    const result = computeBoundingBoxFromVertexAttributes(
      vertex1Attribute.offset,
      vertex2Attribute.offset,
      vertex3Attribute.offset,
      vertex4Attribute.offset,
      valuesAsFloats,
      elementSize,
      1,
      new THREE.Box3()
    );

    // Assert
    const box = new THREE.Box3().setFromArray(values.slice(12));
    expect(result).toEqual(box);
  });

  function populateValues(
    vertex1: [number, number, number],
    vertex2: [number, number, number],
    vertex3: [number, number, number],
    vertex4: [number, number, number],
    index: number,
    buffer: Float32Array
  ) {
    const offset = index * 12; // 12 floats per element
    buffer[offset + 0] = vertex1[0];
    buffer[offset + 1] = vertex1[1];
    buffer[offset + 2] = vertex1[2];
    buffer[offset + 3] = vertex2[0];
    buffer[offset + 4] = vertex2[1];
    buffer[offset + 5] = vertex2[2];
    buffer[offset + 6] = vertex3[0];
    buffer[offset + 7] = vertex3[1];
    buffer[offset + 8] = vertex3[2];
    buffer[offset + 9] = vertex4[0];
    buffer[offset + 10] = vertex4[1];
    buffer[offset + 11] = vertex4[2];
  }
});

describe('computeBoundingBoxFromInstanceMatrixAttributes', () => {
  let instanceMatrixAttribute: ParsePrimitiveAttribute;
  let elementSize: number;

  beforeEach(() => {
    instanceMatrixAttribute = { offset: 0, size: 4 * 16 };
    elementSize = instanceMatrixAttribute.size;
  });

  test('unit bbox with identity transform, returns unit bbox', () => {
    // Arange
    const baseBbox = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
    const matrix = new THREE.Matrix4().identity();
    const valuesAsFloats = new Float32Array(matrix.toArray());
    const matrixByteOffset = instanceMatrixAttribute.offset;

    // Act
    const result = computeBoundingBoxFromInstanceMatrixAttributes(
      valuesAsFloats,
      matrixByteOffset,
      elementSize,
      0,
      baseBbox,
      new THREE.Box3()
    );

    // Assert
    expect(result).toEqual(baseBbox);
  });

  test('complex bbox with complex transform, returns transformed bbox', () => {
    // Arange
    const baseBbox = new THREE.Box3(new THREE.Vector3(-2, 3, -5), new THREE.Vector3(2, 7, 3));
    const matrix = new THREE.Matrix4().multiplyMatrices(
      new THREE.Matrix4().makeTranslation(10, 11, 12),
      new THREE.Matrix4().makeScale(1, 2, 3)
    );
    const valuesAsFloats = new Float32Array(matrix.toArray());
    const matrixByteOffset = instanceMatrixAttribute.offset;

    // Act
    const result = computeBoundingBoxFromInstanceMatrixAttributes(
      valuesAsFloats,
      matrixByteOffset,
      elementSize,
      0,
      baseBbox,
      new THREE.Box3()
    );

    // Assert
    expect(result).toEqual(baseBbox.applyMatrix4(matrix));
  });
});

describe('computeBoundingBoxFromEllipseAttributes', () => {
  let centerAttribute: ParsePrimitiveAttribute;
  let radius1Attribute: ParsePrimitiveAttribute;
  let radius2Attribute: ParsePrimitiveAttribute;
  let heightAttribute: ParsePrimitiveAttribute;
  let elementSize: number;

  beforeEach(() => {
    centerAttribute = { offset: 0, size: 3 * 4 };
    radius1Attribute = { offset: 12, size: 4 };
    radius2Attribute = { offset: 16, size: 4 };
    heightAttribute = { offset: 20, size: 4 };
    elementSize = 24;
  });

  test('unit ellipse, returns unit bbox', () => {
    // Arange
    const baseBbox = new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1));
    const valuesAsFloats = new Float32Array([
      // Center
      ...[0, 0, 0],
      // Radius 1, 2 and height
      1,
      1,
      1
    ]);

    // Act
    const result = computeBoundingBoxFromEllipseAttributes(
      centerAttribute,
      radius1Attribute,
      radius2Attribute,
      heightAttribute,
      valuesAsFloats,
      elementSize,
      0,
      new THREE.Box3()
    );

    // Assert
    expect(result).toEqual(baseBbox);
  });

  test('complex bbox with complex transform, returns transformed bbox', () => {
    // Arange
    const values = [1, 2, 3, 2, 3, 4];
    const valuesAsFloats = new Float32Array(values);

    // Act
    const result = computeBoundingBoxFromEllipseAttributes(
      centerAttribute,
      radius1Attribute,
      radius2Attribute,
      heightAttribute,
      valuesAsFloats,
      elementSize,
      0,
      new THREE.Box3()
    );

    // Assert
    expect(result).toEqual(
      new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(1, 2, 3), new THREE.Vector3(8, 8, 8))
    );
  });
});
