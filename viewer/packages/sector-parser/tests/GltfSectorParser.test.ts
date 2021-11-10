/*!
 * Copyright 2021 Cognite AS
 */

import fs from 'fs';

import 'jest-extended';
import { GltfSectorParser } from '../src/GltfSectorParser';
import { RevealGeometryCollectionType } from '../src/types';

describe(GltfSectorParser.name, () => {
  let parsedResult: { type: RevealGeometryCollectionType; buffer: THREE.BufferGeometry }[];

  beforeAll(() => {
    const parser = new GltfSectorParser();
    const buffer = fs.readFileSync(__dirname + '/test.glb');

    parsedResult = parser.parseSector(buffer.buffer);
  });

  test('Parsing test.glb should have 11 output primitive types', () => {
    expect(parsedResult.length).toBe(11);
  });

  test('Parsing test.glb should contain 1 box result with 2 instances', () => {
    const boxResult = parsedResult.filter(x => x.type === RevealGeometryCollectionType.BoxCollection);

    expect(boxResult.length).toBe(1);

    const boxes = boxResult[0].buffer;

    for (const attribute in boxes.attributes) {
      if (attribute.startsWith('a_')) expect(boxes.attributes[attribute].count).toBe(2);
    }

    expect(boxes.attributes['position'].count).toBe(24);
    expect(boxes.attributes['normal'].count).toBe(24);
  });

  test('Parsing test.glb should contain 1 circle result with 10 instances', () => {
    //Assert
    const circleResult = parsedResult.filter(x => x.type === RevealGeometryCollectionType.CircleCollection);

    expect(circleResult.length).toBe(1);

    const circles = circleResult[0].buffer;

    for (const attribute in circles.attributes) {
      if (attribute.startsWith('a_')) expect(circles.attributes[attribute].count).toBe(10);
    }

    //Quad geometry
    expect(circles.attributes['position'].count).toBe(4);
    expect(circles.attributes['normal'].count).toBe(4);
  });

  test('Parsing test.glb should contain 1 cone result with 20 instances', () => {
    //Assert
    const coneResult = parsedResult.filter(x => x.type === RevealGeometryCollectionType.ConeCollection);

    expect(coneResult.length).toBe(1);

    const cones = coneResult[0].buffer;

    for (const attribute in cones.attributes) {
      if (attribute.startsWith('a_')) expect(cones.attributes[attribute].count).toBe(20);
    }

    // Double quad geometry
    expect(cones.attributes['position'].count).toBe(6);
  });

  test('Parsing test.glb should contain 1 eccentricCone result with 2 instances', () => {
    //Assert
    const eccentricConeResult = parsedResult.filter(
      x => x.type === RevealGeometryCollectionType.EccentricConeCollection
    );

    expect(eccentricConeResult.length).toBe(1);

    const eccentricCones = eccentricConeResult[0].buffer;

    for (const attribute in eccentricCones.attributes) {
      if (attribute.startsWith('a_')) expect(eccentricCones.attributes[attribute].count).toBe(2);
    }

    // Double quad geometry
    expect(eccentricCones.attributes['position'].count).toBe(6);
  });

  test('Parsing test.glb should contain 1 ellipsoidSegment result with 8 instances', () => {
    //Assert
    const ellipsoidSegmentResult = parsedResult.filter(
      x => x.type === RevealGeometryCollectionType.EllipsoidSegmentCollection
    );

    expect(ellipsoidSegmentResult.length).toBe(1);

    const ellipsoidSegments = ellipsoidSegmentResult[0].buffer;

    for (const attribute in ellipsoidSegments.attributes) {
      if (attribute.startsWith('a_')) expect(ellipsoidSegments.attributes[attribute].count).toBe(8);
    }

    // Double quad geometry
    expect(ellipsoidSegments.attributes['position'].count).toBe(6);
  });

  test('Parsing test.glb should contain 1 generalCylinder result with 10 instances', () => {
    //Assert
    const generalCylinderResult = parsedResult.filter(
      x => x.type === RevealGeometryCollectionType.GeneralCylinderCollection
    );

    expect(generalCylinderResult.length).toBe(1);

    const generalCylinders = generalCylinderResult[0].buffer;

    for (const attribute in generalCylinders.attributes) {
      if (attribute.startsWith('a_')) expect(generalCylinders.attributes[attribute].count).toBe(10);
    }

    // Double quad geometry
    expect(generalCylinders.attributes['position'].count).toBe(6);
  });

  test('Parsing test.glb should contain 1 generalRing result with 20 instances', () => {
    //Assert
    const generalRingResult = parsedResult.filter(x => x.type === RevealGeometryCollectionType.GeneralRingCollection);

    expect(generalRingResult.length).toBe(1);

    const generalRings = generalRingResult[0].buffer;

    for (const attribute in generalRings.attributes) {
      if (attribute.startsWith('a_')) expect(generalRings.attributes[attribute].count).toBe(20);
    }

    // Quad geometry
    expect(generalRings.attributes['position'].count).toBe(4);
  });

  test('Parsing test.glb should contain 1 quad result with 4 instances', () => {
    //Assert
    const quadResult = parsedResult.filter(x => x.type === RevealGeometryCollectionType.QuadCollection);

    expect(quadResult.length).toBe(1);

    const quads = quadResult[0].buffer;

    for (const attribute in quads.attributes) {
      if (attribute.startsWith('a_')) expect(quads.attributes[attribute].count).toBe(4);
    }

    // Quad geometry
    expect(quads.attributes['position'].count).toBe(4);
  });

  test('Parsing test.glb should contain 1 torus result with 4 instances', () => {
    //Assert
    const torusResult = parsedResult.filter(x => x.type === RevealGeometryCollectionType.TorusSegmentCollection);

    expect(torusResult.length).toBe(1);

    const tori = torusResult[0].buffer;

    for (const attribute in tori.attributes) {
      if (attribute.startsWith('a_')) expect(tori.attributes[attribute].count).toBe(4);
    }

    // Torus geometry
    expect(tori.attributes['position'].count).toBe(190);
  });

  test('Parsing test.glb should contain 1 trapezium result with 8 instances', () => {
    //Assert
    const trapeziumResult = parsedResult.filter(x => x.type === RevealGeometryCollectionType.TrapeziumCollection);

    expect(trapeziumResult.length).toBe(1);

    const trapeziums = trapeziumResult[0].buffer;

    for (const attribute in trapeziums.attributes) {
      if (attribute.startsWith('a_')) expect(trapeziums.attributes[attribute].count).toBe(8);
    }

    // Quad geometry
    expect(trapeziums.attributes['position'].count).toBe(4);
  });
});
