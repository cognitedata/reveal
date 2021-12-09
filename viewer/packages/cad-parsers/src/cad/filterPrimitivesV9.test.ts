/*!
 * Copyright 2021 Cognite AS
 */

import { filterGeometryOutsideClipBox } from './filterPrimitivesV9';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import * as THREE from 'three';

import {
  PrimitiveType,
  Box,
  Circle,
  Cone,
  EccentricCone,
  Ellipsoid,
  GeneralCylinder,
  GeneralRing,
  Quad,
  Torus,
  Trapezium,
  Nut,
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

  const filteredGeometry = filterGeometryOutsideClipBox(bufferGeometry, collectionType, clipBox);

  const newPrimitives = parseInterleavedGeometry(primitiveType, filteredGeometry);

  expect(newPrimitives).toHaveLength(1);
  expect(newPrimitives[0]).toContainKeys(Object.keys(primitives[0]));

  for (const key in primitives[0]) {
    if (Array.isArray(primitives[0][key])) {
      const array0 = primitives[0][key] as number[];
      const array1 = newPrimitives[0][key] as number[];

      expect(array0).toHaveLength(array1.length);

      for (let i = 0; i < array0.length; i++) {
        expect(array0[i]).toBeCloseTo(array1[i]);
      }
    } else {
      expect(primitives[0][key]).toBeCloseTo(newPrimitives[0][key] as number);
    }
  }
}

describe('filterPrimitivesV9 filters primitives correctly', () => {
  test('no clipbox, returns original', () => {
    const ellipsoid: Ellipsoid = {
      horizontalRadius: 10,
      verticalRadius: 10,
      height: 10,
      center: [0, 0, 0]
    };

    const bufferGeometry = createPrimitiveInterleavedGeometry(PrimitiveType.Ellipsoid, [ellipsoid]);

    const newGeometry = filterGeometryOutsideClipBox(
      bufferGeometry,
      RevealGeometryCollectionType.EllipsoidSegmentCollection,
      undefined
    );

    expect(newGeometry).toBe(bufferGeometry);
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

  test('Two circles: one accepted, one rejected - returns filtered', () => {
    const mat0 = new THREE.Matrix4()
      .makeTranslation(10, -10, 0)
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 1, 2, 'XYZ')));
    const mat1 = new THREE.Matrix4()
      .makeTranslation(-10, 5, 10)
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 1, 2, 'XYZ')));

    const circles: Circle[] = [
      {
        instanceMatrix: mat0.toArray(),
        normal: [0, 1, 0]
      },
      {
        instanceMatrix: mat1.toArray(),
        normal: [0, 1, 0]
      }
    ];

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(circles, PrimitiveType.Circle);
  });

  test('Two cones: one accepted, one rejected - returns filtered', () => {
    const cones: Cone[] = [
      {
        angle: 0,
        arcAngle: Math.PI,
        centerA: [10, -10, -0.5],
        centerB: [10, -10, 0.5],
        localXAxis: [1, 0, 0],
        radiusA: 0.5,
        radiusB: 0.3
      },
      {
        angle: 0,
        arcAngle: Math.PI,
        centerA: [-10, 5, 9],
        centerB: [-10, 5, 11],
        localXAxis: [1, 0, 0],
        radiusA: 0.5,
        radiusB: 0.3
      }
    ];

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(cones, PrimitiveType.Cone);
  });

  test('Two eccentric cones: one accepted, one rejected - returns filtered', () => {
    const eccentricCones: EccentricCone[] = [
      {
        centerA: [10, -10, -0.5],
        centerB: [10, -10, 0.5],
        normal: [0, 0, 1],
        radiusA: 0.5,
        radiusB: 0.3
      },
      {
        centerA: [-10, 5, -2],
        centerB: [-10, 5, 2],
        normal: [0, 0, 1],
        radiusA: 0.5,
        radiusB: 0.3
      }
    ];

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(eccentricCones, PrimitiveType.EccentricCone);
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

  test('Two general cylinders: one accepted, one rejected - returns filtered', () => {
    const generalCylinders: GeneralCylinder[] = [
      {
        angle: 0,
        arcAngle: Math.PI,
        centerA: [10, -10, -0.5],
        centerB: [10, -10, 0.5],
        localXAxis: [1, 0, 0],
        planeA: [0, 1, 0, 1],
        planeB: [0, -1, 0, 1],
        radius: 0.5
      },
      {
        angle: 0,
        arcAngle: Math.PI,
        centerA: [-10, 5, -0.5],
        centerB: [-10, 5, 0.5],
        localXAxis: [1, 0, 0],
        planeA: [0, 1, 0, 1],
        planeB: [0, -1, 0, 1],
        radius: 0.5
      }
    ];

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(generalCylinders, PrimitiveType.GeneralCylinder);
  });

  test('Two general rings: one accepted, one rejected - returns filtered', () => {
    const mat0 = new THREE.Matrix4()
      .makeTranslation(10, -10, 0)
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 1, 2, 'XYZ')));

    const mat1 = new THREE.Matrix4()
      .makeTranslation(-10, 5, 10)
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 1, 2, 'XYZ')));

    const normal: [number, number, number] = [0, 1, 0];

    const generalRings: GeneralRing[] = [
      {
        angle: 0,
        arcAngle: Math.PI,
        instanceMatrix: mat0.toArray(),
        normal: normal,
        thickness: 0.5
      },
      {
        angle: 0,
        arcAngle: Math.PI,
        instanceMatrix: mat1.toArray(),
        normal: normal,
        thickness: 0.5
      }
    ];

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(generalRings, PrimitiveType.GeneralRing);
  });

  test('Two quads: one accepted, one rejected - returns filtered', () => {
    const mat0 = new THREE.Matrix4()
      .makeTranslation(10, -10, 0)
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 1, 2, 'XYZ')));

    const mat1 = new THREE.Matrix4()
      .makeTranslation(-10, 5, 10)
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 1, 2, 'XYZ')));

    const quads: Quad[] = [
      {
        instanceMatrix: mat0.toArray()
      },
      {
        instanceMatrix: mat1.toArray()
      }
    ];

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(quads, PrimitiveType.Quad);
  });

  test('Two tori: one accepted, one rejected - returns filtered', () => {
    const mat0 = new THREE.Matrix4()
      .makeTranslation(10, -10, 0)
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 1, 2, 'XYZ')));

    const mat1 = new THREE.Matrix4()
      .makeTranslation(-10, 5, 10)
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 1, 2, 'XYZ')));

    const tori: Torus[] = [
      {
        arcAngle: Math.PI,
        instanceMatrix: mat0.toArray(),
        radius: 0.5,
        tubeRadius: 0.1
      },
      {
        arcAngle: Math.PI,
        instanceMatrix: mat1.toArray(),
        radius: 0.5,
        tubeRadius: 0.1
      }
    ];

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(tori, PrimitiveType.Torus);
  });

  test('Two trapeziums: one accepted, one rejected - returns filtered', () => {
    const trapeziums: Trapezium[] = [
      {
        vertex1: [9.5, -10, -0.5],
        vertex2: [9.5, -10, 0.5],
        vertex3: [10.5, -10, -0.5],
        vertex4: [10.5, -10, 0.5]
      },
      {
        vertex1: [-10.5, 5, 9.5],
        vertex2: [-10.5, 5, 10.5],
        vertex3: [-9.5, 5, 9.5],
        vertex4: [-9.5, 5, 10.5]
      }
    ];

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(trapeziums, PrimitiveType.Trapezium);
  });

  test('Two nuts: one accepted, one rejected - returns filtered', () => {
    const mat0 = new THREE.Matrix4()
      .makeTranslation(10, -10, 0)
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 1, 2, 'XYZ')));

    const mat1 = new THREE.Matrix4()
      .makeTranslation(-10, 5, 10)
      .multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 1, 2, 'XYZ')));

    const nuts: Nut[] = [
      {
        instanceMatrix: mat0.toArray()
      },
      {
        instanceMatrix: mat1.toArray()
      }
    ];

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(nuts, PrimitiveType.Nut);
  });
});
