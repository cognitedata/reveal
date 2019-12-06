/*!
 * Copyright 2019 Cognite AS
 */

import { Sector } from '../../../../models/sector/types';
import { createPrimitives } from '../../../../views/threejs/sector/primitives';
import { PrimitiveAttributes } from '../../../../../workers/types/parser.types';

describe('createPrimitives', () => {
  const emptyAttributes = newAttributes();
  const emptySector: Sector = {
    boxes: emptyAttributes,
    circles: emptyAttributes,
    cones: emptyAttributes,
    eccentricCones: emptyAttributes,
    ellipsoidSegments: emptyAttributes,
    generalCylinders: emptyAttributes,
    generalRings: emptyAttributes,
    nuts: emptyAttributes,
    quads: emptyAttributes,
    sphericalSegments: emptyAttributes,
    torusSegments: emptyAttributes,
    trapeziums: emptyAttributes,

    triangleMeshes: [],
    instanceMeshes: []
  };

  test('no primitives doesnt return any nods', () => {
    const nodes = Array.from(createPrimitives(emptySector));
    expect(nodes).toBeEmpty();
  });

  test('Box primitives, returns one geometry', () => {
    const sector: Sector = Object.assign({} as Sector, emptySector);
    sector.boxes = newAttributes(10);
    const nodes = Array.from(createPrimitives(sector));
    expect(nodes.length).toBe(1);
  });

  test('Circle primitives, returns one geometry', () => {
    const sector: Sector = Object.assign({} as Sector, emptySector);
    sector.circles = newAttributes(10);
    const nodes = Array.from(createPrimitives(sector));
    expect(nodes.length).toBe(1);
  });

  test('Cone primitives, returns one geometry', () => {
    const sector: Sector = Object.assign({} as Sector, emptySector);
    sector.cones = newAttributes(10);
    const nodes = Array.from(createPrimitives(sector));
    expect(nodes.length).toBe(1);
  });

  test('Eccentric cone primitives, returns one geometry', () => {
    const sector: Sector = Object.assign({} as Sector, emptySector);
    sector.eccentricCones = newAttributes(10);
    const nodes = Array.from(createPrimitives(sector));
    expect(nodes.length).toBe(1);
  });

  test('Ellipsoid segments primitives, returns one geometry', () => {
    const sector: Sector = Object.assign({} as Sector, emptySector);
    sector.ellipsoidSegments = newAttributes(10);
    const nodes = Array.from(createPrimitives(sector));
    expect(nodes.length).toBe(1);
  });

  test('General cylinder primitives, returns one geometry', () => {
    const sector: Sector = Object.assign({} as Sector, emptySector);
    sector.generalCylinders = newAttributes(10);
    const nodes = Array.from(createPrimitives(sector));
    expect(nodes.length).toBe(1);
  });

  test('General ring primitives, returns one geometry', () => {
    const sector: Sector = Object.assign({} as Sector, emptySector);
    sector.generalRings = newAttributes(10);
    const nodes = Array.from(createPrimitives(sector));
    expect(nodes.length).toBe(1);
  });

  test('Nut primitives, returns one geometry', () => {
    const sector: Sector = Object.assign({} as Sector, emptySector);
    sector.nuts = newAttributes(10);
    const nodes = Array.from(createPrimitives(sector));
    expect(nodes.length).toBe(1);
  });

  test('Quad primitives, returns one geometry', () => {
    const sector: Sector = Object.assign({} as Sector, emptySector);
    sector.quads = newAttributes(10);
    const nodes = Array.from(createPrimitives(sector));
    expect(nodes.length).toBe(1);
  });

  test('Spherical segment primitives, returns one geometry', () => {
    const sector: Sector = Object.assign({} as Sector, emptySector);
    const attributes = newAttributes(10);
    attributes.f32Attributes.set('radius', new Float32Array(10));
    sector.sphericalSegments = attributes;
    const nodes = Array.from(createPrimitives(sector));
    expect(nodes.length).toBe(1);
  });

  test('Torus segment primitives, returns one geometry', () => {
    const sector: Sector = Object.assign({} as Sector, emptySector);
    const attributes = newAttributes(10);
    attributes.f32Attributes.set('size', new Float32Array(10));
    sector.torusSegments = attributes;
    const nodes = Array.from(createPrimitives(sector));
    expect(nodes.length).toBe(1);
  });

  test('Trapezium primitives, returns one geometry', () => {
    const sector: Sector = Object.assign({} as Sector, emptySector);
    sector.trapeziums = newAttributes(10);
    const nodes = Array.from(createPrimitives(sector));
    expect(nodes.length).toBe(1);
  });
});

function newAttributes(elementCount: number = 0): PrimitiveAttributes {
  const attributes: PrimitiveAttributes = {
    f32Attributes: new Map<string, Float32Array>(),
    f64Attributes: new Map<string, Float64Array>(),
    u8Attributes: new Map<string, Uint8Array>(),
    vec3Attributes: new Map<string, Float32Array>(),
    vec4Attributes: new Map<string, Float32Array>(),
    mat4Attributes: new Map<string, Float32Array>()
  };
  const ids: number[] = [];
  for (let i = 0; i < elementCount; i++) {
    ids.push(i);
  }
  attributes.f64Attributes.set('nodeId', new Float64Array(ids));
  return attributes;
}
