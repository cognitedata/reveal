/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { createPrimitives } from './primitives';
import { createEmptySector } from '../../../../test-utilities';

import { ParsePrimitiveAttribute } from '@cognite/reveal-parser-worker';

import { RenderMode, createMaterials, Materials } from '@reveal/rendering';
import { SectorGeometry } from '@reveal/cad-parsers';
import { BoundingBoxLOD } from '@reveal/utilities';

function createMockAttributes(): Map<string, ParsePrimitiveAttribute> {
  const map = new Map<string, ParsePrimitiveAttribute>();

  const mockAttribute0: ParsePrimitiveAttribute = { offset: 0, size: 4 };
  const mockAttribute1: ParsePrimitiveAttribute = { offset: 4, size: 8 };
  const mockAttribute2: ParsePrimitiveAttribute = { offset: 12, size: 12 };

  const treeIndexAttribute: ParsePrimitiveAttribute = { offset: 16, size: 4 };
  const mockInstanceMatrix: ParsePrimitiveAttribute = { offset: 20, size: 16 };

  const mockVertex1: ParsePrimitiveAttribute = { offset: 36, size: 3 };
  const mockVertex2: ParsePrimitiveAttribute = { offset: 39, size: 3 };
  const mockVertex3: ParsePrimitiveAttribute = { offset: 42, size: 3 };
  const mockVertex4: ParsePrimitiveAttribute = { offset: 45, size: 3 };

  map.set('attrOne', mockAttribute0);
  map.set('attrTwo', mockAttribute1);
  map.set('attrThree', mockAttribute2);

  map.set('instanceMatrix', mockInstanceMatrix);

  map.set('vertex1', mockVertex1);
  map.set('vertex2', mockVertex2);
  map.set('vertex3', mockVertex3);
  map.set('vertex4', mockVertex4);

  map.set('treeIndex', treeIndexAttribute);

  return map;
}

function createMockAttributeBufferFromAttributes(attributes: Map<string, ParsePrimitiveAttribute>): Uint8Array {
  let bufferSize = 0;

  for (const attribute of attributes.values()) {
    bufferSize += attribute.size;
  }

  return new Uint8Array(bufferSize);
}

describe('createPrimitives', () => {
  const materials = createMaterials(
    RenderMode.Color,
    [],
    new THREE.DataTexture(new Uint8Array(64), 4, 4),
    new THREE.DataTexture(new Uint8Array(64), 4, 4),
    new THREE.DataTexture(new Uint8Array(64), 4, 4)
  );
  const bounds = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1));
  let emptySector: SectorGeometry;
  let mockAttributes: Map<string, ParsePrimitiveAttribute>;
  let mockAttributeBuffer: Uint8Array;

  beforeEach(() => {
    emptySector = createEmptySector();
    mockAttributes = createMockAttributes();
    mockAttributeBuffer = createMockAttributeBufferFromAttributes(mockAttributes);
  });

  test('no primitives doesnt return any nods', () => {
    const nodes = Array.from(createPrimitives(emptySector, materials, bounds));
    expect(nodes).toBeEmpty();
  });

  test('Box primitives, returns one geometry with added attributes', () => {
    const boxSector = emptySector;
    boxSector.primitives.boxCollection = mockAttributeBuffer;
    boxSector.primitives.boxAttributes = mockAttributes;

    testPrimitiveBase(boxSector, materials, mockAttributes, 'box', bounds, 2);
  });

  test('Circle primitives, returns one geometry', () => {
    const circleSector = emptySector;
    circleSector.primitives.circleCollection = mockAttributeBuffer;
    circleSector.primitives.circleAttributes = mockAttributes;

    testPrimitiveBase(circleSector, materials, mockAttributes, 'circle', bounds, 2);
  });

  test('Cone primitives, returns one geometry', () => {
    const coneSector = emptySector;
    coneSector.primitives.coneCollection = mockAttributeBuffer;
    coneSector.primitives.coneAttributes = mockAttributes;

    testPrimitiveBase(coneSector, materials, mockAttributes, 'cone', bounds);
  });

  test('Eccentric cone primitives, returns one geometry', () => {
    const eccentricConeSector = emptySector;
    eccentricConeSector.primitives.eccentricConeCollection = mockAttributeBuffer;
    eccentricConeSector.primitives.eccentricConeAttributes = mockAttributes;

    testPrimitiveBase(eccentricConeSector, materials, mockAttributes, 'eccentriccone', bounds);
  });

  test('Ellipsoid segments primitives, returns one geometry', () => {
    const ellipsoidSector = emptySector;
    ellipsoidSector.primitives.ellipsoidSegmentCollection = mockAttributeBuffer;
    ellipsoidSector.primitives.ellipsoidSegmentAttributes = mockAttributes;

    testPrimitiveBase(ellipsoidSector, materials, mockAttributes, 'ellipsoid', bounds);
  });

  test('General cylinder primitives, returns one geometry', () => {
    const generalCylinderSector = emptySector;
    generalCylinderSector.primitives.generalCylinderCollection = mockAttributeBuffer;
    generalCylinderSector.primitives.generalCylinderAttributes = mockAttributes;

    testPrimitiveBase(generalCylinderSector, materials, mockAttributes, 'generalcylinder', bounds);
  });

  test('General ring primitives, returns one geometry', () => {
    const generalRingSector = emptySector;
    generalRingSector.primitives.generalRingCollection = mockAttributeBuffer;
    generalRingSector.primitives.generalRingAttributes = mockAttributes;

    testPrimitiveBase(generalRingSector, materials, mockAttributes, 'generalring', bounds);
  });

  test('Nut primitives, returns one geometry', () => {
    const nutSector = emptySector;
    nutSector.primitives.nutCollection = mockAttributeBuffer;
    nutSector.primitives.nutAttributes = mockAttributes;

    testPrimitiveBase(nutSector, materials, mockAttributes, 'nut', bounds, 2);
  });

  test('Quad primitives, returns one geometry', () => {
    const quadSector = emptySector;
    quadSector.primitives.quadCollection = mockAttributeBuffer;
    quadSector.primitives.quadAttributes = mockAttributes;

    testPrimitiveBase(quadSector, materials, mockAttributes, 'quad', bounds, 2);
  });

  test('Spherical segment primitives, returns one geometry', () => {
    const sphericalSegmentSector = emptySector;
    sphericalSegmentSector.primitives.sphericalSegmentCollection = mockAttributeBuffer;
    sphericalSegmentSector.primitives.sphericalSegmentAttributes = mockAttributes;

    // The expected name is ellipsoid because we reuse that shader during rendering
    testPrimitiveBase(sphericalSegmentSector, materials, mockAttributes, 'ellipsoidsegments', bounds, 3);
  });

  test('Torus segment primitives, returns one geometry', () => {
    // Torus segments must have the size attribute, so we add it
    mockAttributes.set('size', { size: 4, offset: 24 });

    const torusSegmentSector = emptySector;
    torusSegmentSector.primitives.torusSegmentCollection = new Uint8Array(mockAttributeBuffer.length + 4);
    torusSegmentSector.primitives.torusSegmentAttributes = mockAttributes;

    const results: (THREE.Mesh | BoundingBoxLOD)[] = [];
    for (const primitiveRoot of createPrimitives(torusSegmentSector, materials, bounds)) {
      results.push(primitiveRoot);
    }
    expect(results.length).toBe(1);

    const meshResult = results[0] as BoundingBoxLOD;

    expect(meshResult.name.toLowerCase()).toInclude('torussegment');
  });

  test('Trapezium primitives, returns one geometry', () => {
    const trapeziumSector = emptySector;
    trapeziumSector.primitives.trapeziumCollection = mockAttributeBuffer;
    trapeziumSector.primitives.trapeziumAttributes = mockAttributes;

    testPrimitiveBase(trapeziumSector, materials, mockAttributes, 'trapezium', bounds);
  });
});

function testPrimitiveBase(
  sector: SectorGeometry,
  materials: Materials,
  mockAttributes: Map<string, ParsePrimitiveAttribute>,
  expectedNameSubstring: string,
  bounds: THREE.Box3,
  extraAttributes = 1
) {
  const result = [];

  for (const primitiveRoot of createPrimitives(sector, materials, bounds)) {
    result.push(primitiveRoot);
  }

  expect(result.length).toBe(1);

  const meshResult = result[0] as THREE.Mesh;

  expect(meshResult.name.toLowerCase().includes(expectedNameSubstring)).toBeTrue();

  const geometry = meshResult.geometry as THREE.InstancedBufferGeometry;

  // Should be additional attributes in the addition to our mock attributes
  // Because the f.ex position and other attributes may be added as well
  expect(Object.entries(geometry.attributes).length).toBe(mockAttributes.size + extraAttributes);
}
