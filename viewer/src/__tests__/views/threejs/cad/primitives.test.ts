/*!
 * Copyright 2020 Cognite AS
 */

import { SectorGeometry } from '@/datamodels/cad/sector/types';
import { createPrimitives } from '@/datamodels/cad/rendering/primitives';
import { createEmptySector } from '../../../models/cad/emptySector';
import { createMaterials, Materials } from '@/datamodels/cad/rendering/materials';
import { ParsePrimitiveAttribute } from '@/utilities/workers/types/reveal.parser.types';
import { InstancedBufferGeometry, LOD, Mesh } from 'three';
import { RenderMode } from '@/datamodels/cad/rendering/RenderMode';

function createMockAttributes(): Map<string, ParsePrimitiveAttribute> {
  const map = new Map<string, ParsePrimitiveAttribute>();

  const mockAttribute0: ParsePrimitiveAttribute = { offset: 0, size: 4 };
  const mockAttribute1: ParsePrimitiveAttribute = { offset: 4, size: 8 };
  const mockAttribute2: ParsePrimitiveAttribute = { offset: 12, size: 12 };

  const treeIndexAttribute: ParsePrimitiveAttribute = { offset: 16, size: 4 };

  map.set('attrOne', mockAttribute0);
  map.set('attrTwo', mockAttribute1);
  map.set('attrThree', mockAttribute2);

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
  const materials = createMaterials(64, RenderMode.Color, []);
  let emptySector: SectorGeometry;
  let mockAttributes: Map<string, ParsePrimitiveAttribute>;
  let mockAttributeBuffer: Uint8Array;

  beforeEach(() => {
    emptySector = createEmptySector();
    mockAttributes = createMockAttributes();
    mockAttributeBuffer = createMockAttributeBufferFromAttributes(mockAttributes);
  });

  test('no primitives doesnt return any nods', () => {
    const nodes = Array.from(createPrimitives(emptySector, materials));
    expect(nodes).toBeEmpty();
  });

  test('Box primitives, returns one geometry with added attributes', () => {
    const boxSector = emptySector;
    boxSector.primitives.boxCollection = mockAttributeBuffer;
    boxSector.primitives.boxAttributes = mockAttributes;

    testPrimitiveBase(boxSector, materials, mockAttributes, 'box', 2);
  });

  test('Circle primitives, returns one geometry', () => {
    const circleSector = emptySector;
    circleSector.primitives.circleCollection = mockAttributeBuffer;
    circleSector.primitives.circleAttributes = mockAttributes;

    testPrimitiveBase(circleSector, materials, mockAttributes, 'circle', 2);
  });

  test('Cone primitives, returns one geometry', () => {
    const coneSector = emptySector;
    coneSector.primitives.coneCollection = mockAttributeBuffer;
    coneSector.primitives.coneAttributes = mockAttributes;

    testPrimitiveBase(coneSector, materials, mockAttributes, 'cone');
  });

  test('Eccentric cone primitives, returns one geometry', () => {
    const eccentricConeSector = emptySector;
    eccentricConeSector.primitives.eccentricConeCollection = mockAttributeBuffer;
    eccentricConeSector.primitives.eccentricConeAttributes = mockAttributes;

    testPrimitiveBase(eccentricConeSector, materials, mockAttributes, 'eccentriccone');
  });

  test('Ellipsoid segments primitives, returns one geometry', () => {
    const ellipsoidSector = emptySector;
    ellipsoidSector.primitives.ellipsoidSegmentCollection = mockAttributeBuffer;
    ellipsoidSector.primitives.ellipsoidSegmentAttributes = mockAttributes;

    testPrimitiveBase(ellipsoidSector, materials, mockAttributes, 'ellipsoid');
  });

  test('General cylinder primitives, returns one geometry', () => {
    const generalCylinderSector = emptySector;
    generalCylinderSector.primitives.generalCylinderCollection = mockAttributeBuffer;
    generalCylinderSector.primitives.generalCylinderAttributes = mockAttributes;

    testPrimitiveBase(generalCylinderSector, materials, mockAttributes, 'generalcylinder');
  });

  test('General ring primitives, returns one geometry', () => {
    const generalRingSector = emptySector;
    generalRingSector.primitives.generalRingCollection = mockAttributeBuffer;
    generalRingSector.primitives.generalRingAttributes = mockAttributes;

    testPrimitiveBase(generalRingSector, materials, mockAttributes, 'generalring');
  });

  test('Nut primitives, returns one geometry', () => {
    const nutSector = emptySector;
    nutSector.primitives.nutCollection = mockAttributeBuffer;
    nutSector.primitives.nutAttributes = mockAttributes;

    testPrimitiveBase(nutSector, materials, mockAttributes, 'nut', 2);
  });

  test('Quad primitives, returns one geometry', () => {
    const quadSector = emptySector;
    quadSector.primitives.quadCollection = mockAttributeBuffer;
    quadSector.primitives.quadAttributes = mockAttributes;

    testPrimitiveBase(quadSector, materials, mockAttributes, 'quad', 2);
  });

  test('Spherical segment primitives, returns one geometry', () => {
    const sphericalSegmentSector = emptySector;
    sphericalSegmentSector.primitives.sphericalSegmentCollection = mockAttributeBuffer;
    sphericalSegmentSector.primitives.sphericalSegmentAttributes = mockAttributes;

    // The expected name is ellipsoid because we reuse that shader during rendering
    testPrimitiveBase(sphericalSegmentSector, materials, mockAttributes, 'ellipsoidsegments', 3);
  });

  test('Torus segment primitives, returns one geometry', () => {
    // Torus segments must have the size attribute, so we add it
    mockAttributes.set('size', { size: 4, offset: 24 });

    const torusSegmentSector = emptySector;
    torusSegmentSector.primitives.torusSegmentCollection = new Uint8Array(mockAttributeBuffer.length + 4);
    torusSegmentSector.primitives.torusSegmentAttributes = mockAttributes;

    const result = [];

    for (const primitiveRoot of createPrimitives(torusSegmentSector, materials)) {
      result.push(primitiveRoot);
    }

    expect(result.length).toBe(1);

    const lodResult = result[0] as LOD;

    expect(lodResult.name.toLowerCase().includes('torussegment')).toBeTrue();

    for (const lodMesh of lodResult.children) {
      const mesh = lodMesh as Mesh;
      const geometry = mesh.geometry as InstancedBufferGeometry;

      // one extra attribute is added (position/vertex)
      expect(Object.entries(geometry.attributes).length).toBe(mockAttributes.size + 1);
    }
  });

  test('Trapezium primitives, returns one geometry', () => {
    const trapeziumSector = emptySector;
    trapeziumSector.primitives.trapeziumCollection = mockAttributeBuffer;
    trapeziumSector.primitives.trapeziumAttributes = mockAttributes;

    testPrimitiveBase(trapeziumSector, materials, mockAttributes, 'trapezium');
  });
});

function testPrimitiveBase(
  sector: SectorGeometry,
  materials: Materials,
  mockAttributes: Map<string, ParsePrimitiveAttribute>,
  expectedNameSubstring: string,
  extraAttributes = 1
) {
  const result = [];

  for (const primitiveRoot of createPrimitives(sector, materials)) {
    result.push(primitiveRoot);
  }

  expect(result.length).toBe(1);

  const meshResult = result[0] as Mesh;

  expect(meshResult.name.toLowerCase().includes(expectedNameSubstring)).toBeTrue();

  const geometry = meshResult.geometry as InstancedBufferGeometry;

  // Should be additional attributes in the addition to our mock attributes
  // Because the f.ex position and other attributes may be added as well
  expect(Object.entries(geometry.attributes).length).toBe(mockAttributes.size + extraAttributes);
}
