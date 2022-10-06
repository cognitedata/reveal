/*!
 * Copyright 2021 Cognite AS
 */

import fs from 'fs';

import 'jest-extended';
import { calculateVolumeOfMesh, TypedArray } from '@reveal/utilities';
import { GltfSectorParser } from '../src/GltfSectorParser';
import { RevealGeometryCollectionType } from '../src/types';

describe(GltfSectorParser.name, () => {
  let parsedPrimitivesResult: { type: RevealGeometryCollectionType; geometryBuffer: THREE.BufferGeometry }[];
  let parsedDracoResult: { type: RevealGeometryCollectionType; geometryBuffer: THREE.BufferGeometry }[];
  let parser: GltfSectorParser;

  beforeAll(async () => {
    parser = new GltfSectorParser();
    const primitivesByteBuffer = fs.readFileSync(__dirname + '/test-all-primitives.glb');
    const dracoTestByteBuffer = fs.readFileSync(__dirname + '/anders-test-scene-draco.glb');

    parsedPrimitivesResult = await parser.parseSector(primitivesByteBuffer.buffer);
    parsedDracoResult = await parser.parseSector(dracoTestByteBuffer.buffer);
  });

  test('Parsing test.glb should have 11 output primitive types', () => {
    expect(parsedPrimitivesResult.length).toBe(11);
  });

  test('Parsing test.glb should contain 1 box result with 2 instances', () => {
    const boxResult = parsedPrimitivesResult.filter(x => x.type === RevealGeometryCollectionType.BoxCollection);

    expect(boxResult.length).toBe(1);

    const boxes = boxResult[0].geometryBuffer;

    for (const attribute in boxes.attributes) {
      if (attribute.startsWith('a_')) expect(boxes.attributes[attribute].count).toBe(2);
    }

    expect(boxes.attributes['position'].count).toBe(24);
    expect(boxes.attributes['normal'].count).toBe(24);
  });

  test('Parsing test.glb should contain 1 circle result with 10 instances', () => {
    //Assert
    const circleResult = parsedPrimitivesResult.filter(x => x.type === RevealGeometryCollectionType.CircleCollection);

    expect(circleResult.length).toBe(1);

    const circles = circleResult[0].geometryBuffer;

    for (const attribute in circles.attributes) {
      if (attribute.startsWith('a_')) expect(circles.attributes[attribute].count).toBe(24);
    }

    //Quad geometry
    expect(circles.attributes['position'].count).toBe(4);
    expect(circles.attributes['normal'].count).toBe(4);
  });

  test('Parsing test.glb should contain 1 cone result with 20 instances', () => {
    //Assert
    const coneResult = parsedPrimitivesResult.filter(x => x.type === RevealGeometryCollectionType.ConeCollection);

    expect(coneResult.length).toBe(1);

    const cones = coneResult[0].geometryBuffer;

    for (const attribute in cones.attributes) {
      if (attribute.startsWith('a_')) expect(cones.attributes[attribute].count).toBe(32);
    }

    // Double quad geometry
    expect(cones.attributes['position'].count).toBe(6);
  });

  test('Parsing test.glb should contain 1 eccentricCone result with 2 instances', () => {
    //Assert
    const eccentricConeResult = parsedPrimitivesResult.filter(
      x => x.type === RevealGeometryCollectionType.EccentricConeCollection
    );

    expect(eccentricConeResult.length).toBe(1);

    const eccentricCones = eccentricConeResult[0].geometryBuffer;

    for (const attribute in eccentricCones.attributes) {
      if (attribute.startsWith('a_')) expect(eccentricCones.attributes[attribute].count).toBe(4);
    }

    // Double quad geometry
    expect(eccentricCones.attributes['position'].count).toBe(6);
  });

  test('Parsing test.glb should contain 1 ellipsoidSegment result with 8 instances', () => {
    //Assert
    const ellipsoidSegmentResult = parsedPrimitivesResult.filter(
      x => x.type === RevealGeometryCollectionType.EllipsoidSegmentCollection
    );

    expect(ellipsoidSegmentResult.length).toBe(1);

    const ellipsoidSegments = ellipsoidSegmentResult[0].geometryBuffer;

    for (const attribute in ellipsoidSegments.attributes) {
      if (attribute.startsWith('a_')) expect(ellipsoidSegments.attributes[attribute].count).toBe(12);
    }

    // Double quad geometry
    expect(ellipsoidSegments.attributes['position'].count).toBe(6);
  });

  test('Parsing test.glb should contain 1 generalCylinder result with 10 instances', () => {
    //Assert
    const generalCylinderResult = parsedPrimitivesResult.filter(
      x => x.type === RevealGeometryCollectionType.GeneralCylinderCollection
    );

    expect(generalCylinderResult.length).toBe(1);

    const generalCylinders = generalCylinderResult[0].geometryBuffer;

    for (const attribute in generalCylinders.attributes) {
      if (attribute.startsWith('a_')) expect(generalCylinders.attributes[attribute].count).toBe(36);
    }

    // Double quad geometry
    expect(generalCylinders.attributes['position'].count).toBe(6);
  });

  test('Parsing test.glb should contain 1 generalRing result with 20 instances', () => {
    //Assert
    const generalRingResult = parsedPrimitivesResult.filter(
      x => x.type === RevealGeometryCollectionType.GeneralRingCollection
    );

    expect(generalRingResult.length).toBe(1);

    const generalRings = generalRingResult[0].geometryBuffer;

    for (const attribute in generalRings.attributes) {
      if (attribute.startsWith('a_')) expect(generalRings.attributes[attribute].count).toBe(58);
    }

    // Quad geometry
    expect(generalRings.attributes['position'].count).toBe(4);
  });

  test('Parsing test.glb should contain 1 quad result with 4 instances', () => {
    //Assert
    const quadResult = parsedPrimitivesResult.filter(x => x.type === RevealGeometryCollectionType.QuadCollection);

    expect(quadResult.length).toBe(1);

    const quads = quadResult[0].geometryBuffer;

    for (const attribute in quads.attributes) {
      if (attribute.startsWith('a_')) expect(quads.attributes[attribute].count).toBe(4);
    }

    // Quad geometry
    expect(quads.attributes['position'].count).toBe(4);
  });

  test('Parsing test.glb should contain 1 torus result with 4 instances', () => {
    //Assert
    const torusResult = parsedPrimitivesResult.filter(
      x => x.type === RevealGeometryCollectionType.TorusSegmentCollection
    );

    expect(torusResult.length).toBe(1);

    const tori = torusResult[0].geometryBuffer;

    for (const attribute in tori.attributes) {
      if (attribute.startsWith('a_')) expect(tori.attributes[attribute].count).toBe(6);
    }

    // Torus geometry
    expect(tori.attributes['position'].count).toBe(190);
  });

  test('Parsing test.glb should contain 1 trapezium result with 8 instances', () => {
    //Assert
    const trapeziumResult = parsedPrimitivesResult.filter(
      x => x.type === RevealGeometryCollectionType.TrapeziumCollection
    );

    expect(trapeziumResult.length).toBe(1);

    const trapeziums = trapeziumResult[0].geometryBuffer;

    for (const attribute in trapeziums.attributes) {
      if (attribute.startsWith('a_')) expect(trapeziums.attributes[attribute].count).toBe(16);
    }

    // Quad geometry
    expect(trapeziums.attributes['position'].count).toBe(4);
  });

  test('Parsing draco encoded sector should return proper triangle mesh', () => {
    const triangleMeshes = parsedDracoResult.filter(x => x.type === RevealGeometryCollectionType.TriangleMesh);
    expect(triangleMeshes.length).toBe(1);

    const { geometryBuffer } = triangleMeshes[0];

    const attributes = geometryBuffer.attributes;

    const attributeNames = Object.keys(attributes);

    expect(attributeNames.length).toBe(3);

    expect(attributeNames.includes('position')).toBeTrue();
    expect(attributeNames.includes('treeIndex')).toBeTrue();
    expect(attributeNames.includes('color')).toBeTrue();

    // Test if all attributes point to the same underlying buffer
    const underlyingBuffers = Object.values(attributes).map(p => (p.array as TypedArray).buffer);
    const bufferInstance = underlyingBuffers[0];

    for (let i = 1; i < underlyingBuffers.length; i++) {
      const buffer = underlyingBuffers[i];
      expect(buffer).toEqual(bufferInstance);
    }

    const triangleMeshNumberOfVertices = 13751;
    expect(attributes.position.count).toBe(triangleMeshNumberOfVertices);
    expect(attributes.treeIndex.count).toBe(triangleMeshNumberOfVertices);
    expect(attributes.color.count).toBe(triangleMeshNumberOfVertices);
  });

  test('Draco mesh and un-encoded mesh should have approximatly same volume', async () => {
    const dracoTriangleMeshes = parsedDracoResult.filter(x => x.type === RevealGeometryCollectionType.TriangleMesh);
    expect(dracoTriangleMeshes.length).toBe(1);

    const { geometryBuffer: dracoGeometryBuffer } = dracoTriangleMeshes[0];

    const dracoPositionAttribute = dracoGeometryBuffer.getAttribute('position') as THREE.InterleavedBufferAttribute;
    const dracoPositionOffset = dracoPositionAttribute.offset;
    const dracoStride = dracoPositionAttribute.data.stride;

    const dracoVertexBuffer = Float32Array.from(dracoGeometryBuffer.getAttribute('position').array).filter((_, n) => {
      return n % dracoStride >= dracoPositionOffset;
    });

    const dracoMeshVolume = calculateVolumeOfMesh(
      dracoVertexBuffer,
      Uint16Array.from(dracoGeometryBuffer.getIndex()!.array)
    );

    const testFileByteBuffer = fs.readFileSync(__dirname + '/anders-test-scene.glb');
    const parsedResult = await parser.parseSector(testFileByteBuffer.buffer);

    const triangleMeshes = parsedResult.filter(x => x.type === RevealGeometryCollectionType.TriangleMesh);
    expect(triangleMeshes.length).toBe(1);

    const { geometryBuffer } = triangleMeshes[0];

    const positionAttribute = geometryBuffer.getAttribute('position') as THREE.InterleavedBufferAttribute;
    const positionOffset = positionAttribute.offset;
    const stride = positionAttribute.data.stride;

    const vertexBuffer = Float32Array.from(geometryBuffer.getAttribute('position').array).filter((_, n) => {
      return n % stride >= positionOffset;
    });

    const meshVolume = calculateVolumeOfMesh(vertexBuffer, Uint16Array.from(geometryBuffer.getIndex()!.array));

    expect(Math.abs(1 - dracoMeshVolume / meshVolume)).toBeLessThan(1e-4);
  });
});
