/*!
 * Copyright 2020 Cognite AS
 */

import { Sector } from '../../../../models/cad/types';
import { createPrimitives } from '../../../../views/threejs/cad/primitives';
import { createEmptySector } from '../../../models/cad/emptySector';
import { createMaterials, Materials } from '../../../../views/threejs/cad/materials';
import { ParsePrimitiveAttribute } from '../../../../workers/types/parser.types';
import { Mesh, InstancedBufferGeometry, LOD } from 'three';

function createMockAttributes(): Map<string, ParsePrimitiveAttribute>{
 
  let map = new Map<string, ParsePrimitiveAttribute>();
  
  let mockAttribute_0 = {offset: 0, size: 4} as ParsePrimitiveAttribute;
  let mockAttribute_1 = {offset: 4, size: 8} as ParsePrimitiveAttribute;
  let mockAttribute_2 = {offset: 12, size: 12} as ParsePrimitiveAttribute;
  
  map.set("attrOne", mockAttribute_0);
  map.set("attrTwo", mockAttribute_1);
  map.set("attrThree", mockAttribute_2);

  return map;
}

function createMockAttributeBufferFromAttributes(attributes: Map<string, ParsePrimitiveAttribute> ): Uint8Array{
  
  let bufferSize = 0;

  for(let attribute of attributes.values()){
    bufferSize += attribute.size;
  }
  
  return new Uint8Array(bufferSize);
}

describe('createPrimitives', () => {
  const materials = createMaterials(64);
  let emptySector: Sector;
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

    let boxSector = emptySector;
    boxSector.primitives.boxCollection = mockAttributeBuffer;
    boxSector.primitives.boxAttributes = mockAttributes;

    testPrimitiveBase(boxSector, materials, mockAttributes, "box", 2);

  });

  test('Circle primitives, returns one geometry', () => {
    let circleSector = emptySector;
    circleSector.primitives.circleCollection = mockAttributeBuffer;
    circleSector.primitives.circleAttributes = mockAttributes;

    testPrimitiveBase(circleSector, materials, mockAttributes, "circle", 2);
  });

  test('Cone primitives, returns one geometry', () => {
    let coneSector = emptySector;
    coneSector.primitives.coneCollection = mockAttributeBuffer;
    coneSector.primitives.coneAttributes = mockAttributes;

    testPrimitiveBase(coneSector, materials, mockAttributes, "cone");
  });

  test('Eccentric cone primitives, returns one geometry', () => {
    let eccentricConeSector = emptySector;
    eccentricConeSector.primitives.eccentricConeCollection = mockAttributeBuffer;
    eccentricConeSector.primitives.eccentricConeAttributes = mockAttributes;

    testPrimitiveBase(eccentricConeSector, materials, mockAttributes, "eccentriccone");
  });

  test('Ellipsoid segments primitives, returns one geometry', () => {
    let ellipsoidSector = emptySector;
    ellipsoidSector.primitives.ellipsoidSegmentCollection = mockAttributeBuffer;
    ellipsoidSector.primitives.ellipsoidSegmentAttributes = mockAttributes;

    testPrimitiveBase(ellipsoidSector, materials, mockAttributes, "ellipsoid");
  });

  test('General cylinder primitives, returns one geometry', () => {
    let generalCylinderSector = emptySector;
    generalCylinderSector.primitives.generalCylinderCollection = mockAttributeBuffer;
    generalCylinderSector.primitives.generalCylinderAttributes = mockAttributes;

    testPrimitiveBase(generalCylinderSector, materials, mockAttributes, "generalcylinder");
  });

  test('General ring primitives, returns one geometry', () => {
    let generalRingSector = emptySector;
    generalRingSector.primitives.generalRingCollection = mockAttributeBuffer;
    generalRingSector.primitives.generalRingAttributes = mockAttributes;

    testPrimitiveBase(generalRingSector, materials, mockAttributes, "generalring");
  });

  test('Nut primitives, returns one geometry', () => {
    let nutSector = emptySector;
    nutSector.primitives.nutCollection = mockAttributeBuffer;
    nutSector.primitives.nutAttributes = mockAttributes;

    testPrimitiveBase(nutSector, materials, mockAttributes, "nut", 2);
  });

  test('Quad primitives, returns one geometry', () => {
    let quadSector = emptySector;
    quadSector.primitives.quadCollection = mockAttributeBuffer;
    quadSector.primitives.quadAttributes = mockAttributes;

    testPrimitiveBase(quadSector, materials, mockAttributes, "quad", 2);
  });

  test('Spherical segment primitives, returns one geometry', () => {
    let sphericalSegmentSector = emptySector;
    sphericalSegmentSector.primitives.sphericalSegmentCollection = mockAttributeBuffer;
    sphericalSegmentSector.primitives.sphericalSegmentAttributes = mockAttributes;

    //The expected name is ellipsoid because we reuse that shader during rendering
    testPrimitiveBase(sphericalSegmentSector, materials, mockAttributes, "ellipsoidsegments", 3);
  });

  test('Torus segment primitives, returns one geometry', () => {

    //Torus segments must have the size attribute, so we add it
    mockAttributes.set("size", {size: 4, offset: 24});

    let torusSegmentSector = emptySector;
    torusSegmentSector.primitives.torusSegmentCollection = new Uint8Array(mockAttributeBuffer.length + 4);
    torusSegmentSector.primitives.torusSegmentAttributes = mockAttributes;

    let result = [];
  
    for (const primitiveRoot of createPrimitives(torusSegmentSector, materials)) {
      result.push(primitiveRoot);
    }
    
    expect(result.length).toBe(1);
    
    let lodResult = result[0] as LOD;
    
    expect(lodResult.name.toLowerCase().includes("torussegment"))
      .toBeTrue();

    for (const lodMesh of lodResult.children) {
      let mesh = lodMesh as Mesh;
      let geometry = mesh.geometry as InstancedBufferGeometry;

      //one extra attribute is added (position/vertex)
      expect(Object.entries(geometry.attributes).length)
        .toBe(mockAttributes.size + 1);

    }
  });

  test('Trapezium primitives, returns one geometry', () => {
    let trapeziumSector = emptySector;
    trapeziumSector.primitives.trapeziumCollection = mockAttributeBuffer;
    trapeziumSector.primitives.trapeziumAttributes = mockAttributes;

    testPrimitiveBase(trapeziumSector, materials, mockAttributes, "trapezium");
  });
});


function testPrimitiveBase(sector: Sector, 
  materials: Materials, 
  mockAttributes: Map<string, ParsePrimitiveAttribute>, 
  expectedNameSubstring: string,
  extraAttributes = 1) {

  let result = [];
  
  for (const primitiveRoot of createPrimitives(sector, materials)) {
    result.push(primitiveRoot);
  }
  
  expect(result.length).toBe(1);
  
  let meshResult = result[0] as Mesh;
  
  expect(meshResult.name.toLowerCase().includes(expectedNameSubstring))
    .toBeTrue();
  
  let geometry = meshResult.geometry as InstancedBufferGeometry;
  
  // Should be additional attributes in the addition to our mock attributes
  // Because the f.ex position and other attributes may be added as well
  expect(Object.entries(geometry.attributes).length)
    .toBe(mockAttributes.size + extraAttributes);
}
