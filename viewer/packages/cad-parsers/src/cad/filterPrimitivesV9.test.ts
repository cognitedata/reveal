/*!
 * Copyright 2021 Cognite AS
 */

import { filterGeometryOutsideClipBox } from './filterPrimitivesV9';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import * as THREE from 'three';

import {
  PrimitiveName,
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
  Primitive,
  getCollectionType,
  createPrimitiveInterleavedGeometriesSharingBuffer,
  createPrimitiveInterleavedGeometry,
  parseInterleavedGeometry
} from '../../../../test-utilities/src/primitives';

function assertApproximateObjectEquality(obj0: any, obj1: any) {
  for (const key in obj0) {
    if (Array.isArray(obj0[key])) {
      const array0 = obj0[key] as number[];
      const array1 = obj1[key] as number[];

      expect(array0).toHaveLength(array1.length);

      for (let i = 0; i < array0.length; i++) {
        expect(array0[i]).toBeCloseTo(array1[i]);
      }
    } else {
      expect(obj0[key]).toBeCloseTo(obj1[key] as number);
    }
  }
}

function testSecondFilteredAwayFromBoxAtX10Yneg10Z0(primitives: Primitive[], primitiveType: PrimitiveName) {
  const bufferGeometry = createPrimitiveInterleavedGeometry(primitiveType, primitives);

  const clipBox = new THREE.Box3(new THREE.Vector3(8, -12, -2), new THREE.Vector3(12, -8, 2));

  const collectionType = getCollectionType(primitiveType);

  const filteredGeometry = filterGeometryOutsideClipBox(bufferGeometry, collectionType, clipBox);

  expect(filteredGeometry).toBeDefined();

  const newPrimitives = parseInterleavedGeometry(primitiveType, filteredGeometry!);

  expect(newPrimitives).toHaveLength(1);
  expect(newPrimitives[0]).toContainKeys(Object.keys(primitives[0]));
  assertApproximateObjectEquality(primitives[0], newPrimitives[0]);
}

describe(filterGeometryOutsideClipBox.name, () => {
  test('no clipbox, returns original', () => {
    const ellipsoid: Ellipsoid = {
      horizontalRadius: 10,
      verticalRadius: 10,
      height: 10,
      center: [0, 0, 0]
    };

    const bufferGeometry = createPrimitiveInterleavedGeometry(PrimitiveName.Ellipsoid, [ellipsoid]);

    const newGeometry = filterGeometryOutsideClipBox(
      bufferGeometry,
      RevealGeometryCollectionType.EllipsoidSegmentCollection,
      undefined
    );

    expect(newGeometry).toBe(bufferGeometry);
  });

  test('returns undefined if nothing intersects clipbox', () => {
    const ellipsoids: Ellipsoid[] = [
      {
        horizontalRadius: 10,
        verticalRadius: 10,
        height: 10,
        center: [0, 0, 0]
      },
      {
        horizontalRadius: 10,
        verticalRadius: 10,
        height: 10,
        center: [20, 20, 0]
      }
    ];

    const bufferGeometry = createPrimitiveInterleavedGeometry(PrimitiveName.Ellipsoid, ellipsoids);

    const clipBox = new THREE.Box3();
    clipBox.min.set(-30, -30, -30);
    clipBox.max.set(-20, -20, -20);

    const newGeometry = filterGeometryOutsideClipBox(
      bufferGeometry,
      RevealGeometryCollectionType.EllipsoidSegmentCollection,
      clipBox
    );

    expect(newGeometry).toBeUndefined();
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

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(boxes, PrimitiveName.Box);
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

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(circles, PrimitiveName.Circle);
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

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(cones, PrimitiveName.Cone);
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

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(eccentricCones, PrimitiveName.EccentricCone);
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

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(ellipsoids, PrimitiveName.Ellipsoid);
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

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(generalCylinders, PrimitiveName.GeneralCylinder);
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

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(generalRings, PrimitiveName.GeneralRing);
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

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(quads, PrimitiveName.Quad);
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

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(tori, PrimitiveName.Torus);
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

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(trapeziums, PrimitiveName.Trapezium);
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

    testSecondFilteredAwayFromBoxAtX10Yneg10Z0(nuts, PrimitiveName.Nut);
  });

  test('Two different primitive types in same buffer: one of each accepted', () => {
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

    const cylinders: GeneralCylinder[] = [
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

    const primitives = [ellipsoids, cylinders];
    const primitiveTypes = [PrimitiveName.Ellipsoid, PrimitiveName.GeneralCylinder];
    const collectionTypes = primitiveTypes.map(getCollectionType);

    const geometries = createPrimitiveInterleavedGeometriesSharingBuffer(primitiveTypes, primitives);

    const clipBox = new THREE.Box3(new THREE.Vector3(8, -12, -2), new THREE.Vector3(12, -8, 2));

    for (let i = 0; i < collectionTypes.length; i++) {
      const filtered = filterGeometryOutsideClipBox(geometries[i], collectionTypes[i], clipBox);

      expect(filtered).toBeDefined();

      const newPrimitives = parseInterleavedGeometry(primitiveTypes[i], filtered!);

      expect(newPrimitives).toHaveLength(1);
      expect(newPrimitives[0]).toContainKeys(Object.keys(primitives[i][0]));

      assertApproximateObjectEquality(primitives[i][0], newPrimitives[0]);
    }
  });
});
