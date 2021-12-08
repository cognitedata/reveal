/*!
 * Copyright 2021 Cognite AS
 */

import { V9GeometryFilterer } from './V9GeometryFilterer';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import * as THREE from 'three';

import {
  PrimitiveType,
  Ellipsoid,
  Box,
  getCollectionType
} from '../../../../test-utilities/src/primitives/primitiveTypes';

import {
  createPrimitiveInterleavedGeometry,
  parseInterleavedGeometry
} from '../../../../test-utilities/src/primitives/primitiveThreeBuffers';

function testSecondFilteredAwayFromBoxAtX10Yneg10Z0(primitives: any[], primitiveType: PrimitiveType) {
  const bufferGeometry = createPrimitiveInterleavedGeometry(primitiveType, primitives);

  const clipBox = new THREE.Box3(new THREE.Vector3(8, -12, -2), new THREE.Vector3(12, -8, 2));

  const collectionType = getCollectionType(primitiveType);

  const filteredGeometry = V9GeometryFilterer.filterGeometry(bufferGeometry, collectionType, clipBox);

  const newPrimitives = parseInterleavedGeometry(primitiveType, filteredGeometry);

  expect(newPrimitives).toHaveLength(1);
  expect(newPrimitives[0]).toContainEntries(Object.entries(primitives[0]));
}

describe('V9GeometryFilterer filters primitives correctly', () => {
  test('no clipbox, returns original', () => {
    const ellipsoid: Ellipsoid = {
      horizontalRadius: 10,
      verticalRadius: 10,
      height: 10,
      center: [0, 0, 0]
    };

    const bufferGeometry = createPrimitiveInterleavedGeometry(PrimitiveType.Ellipsoid, [ellipsoid]);

    const newGeometry = V9GeometryFilterer.filterGeometry(
      bufferGeometry,
      RevealGeometryCollectionType.EllipsoidSegmentCollection,
      undefined
    );

    expect(newGeometry).toBe(bufferGeometry);
  });

  test('Two ellipsoid segments: one accepted, one rejected - returns filtered', () => {
    const ellipsoids: Ellipsoid[] = [
      {
        horizontalRadius: 1,
        verticalRadius: 1,
        height: 1,
        center: [10, -10, 0]
      },
      {
        horizontalRadius: 1,
        verticalRadius: 1,
        height: 1,
        center: [10, 10, 10]
      }
    ];

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(ellipsoids, PrimitiveType.Ellipsoid);
  });

  test('Two boxes: one accepted, one rejected - returns filtered', () => {
    const mat0 = new THREE.Matrix4()
      .makeTranslation(10, -10, 0)
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 1, 2, 'XYZ')));
    const mat1 = new THREE.Matrix4()
      .makeTranslation(-10, 5, 10)
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 1, 2, 'XYZ')));
    const boxes: Box[] = [
      {
        instanceMatrix: mat0.toArray()
      },
      {
        instanceMatrix: mat1.toArray()
      }
    ];

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(boxes, PrimitiveType.Box);
  });
});
