/*!
 * Copyright 2020 Cognite AS
 */

import { Sector } from '../../../../models/cad/types';
import { createPrimitives } from '../../../../views/threejs/cad/primitives';
import { createEmptySector } from '../../../models/cad/emptySector';
import { createMaterials } from '../../../../views/threejs/cad/materials';

describe('createPrimitives', () => {
  const materials = createMaterials(64);
  let emptySector: Sector;

  beforeEach(() => {
    emptySector = createEmptySector();
  });

  test('no primitives doesnt return any nods', () => {
    const nodes = Array.from(createPrimitives(emptySector, materials));
    expect(nodes).toBeEmpty();
  });

  test('Box primitives, returns one geometry', () => {
    const boxes = newAttributes(10);
    const sector: Sector = Object.assign(emptySector, { boxes } as Sector);
    const nodes = Array.from(createPrimitives(sector, materials));
    expect(nodes.length).toBe(1);
  });

  test('Circle primitives, returns one geometry', () => {
    const circles = newAttributes(10);
    const sector: Sector = Object.assign(emptySector, { circles } as Sector);
    const nodes = Array.from(createPrimitives(sector, materials));
    expect(nodes.length).toBe(1);
  });

  test('Cone primitives, returns one geometry', () => {
    const cones = newAttributes(10);
    const sector: Sector = Object.assign(emptySector, { cones } as Sector);
    const nodes = Array.from(createPrimitives(sector, materials));
    expect(nodes.length).toBe(1);
  });

  test('Eccentric cone primitives, returns one geometry', () => {
    const eccentricCones = newAttributes(10);
    const sector: Sector = Object.assign(emptySector, { eccentricCones } as Sector);
    const nodes = Array.from(createPrimitives(sector, materials));
    expect(nodes.length).toBe(1);
  });

  test('Ellipsoid segments primitives, returns one geometry', () => {
    const ellipsoidSegments = newAttributes(10);
    const sector: Sector = Object.assign(emptySector, { ellipsoidSegments } as Sector);
    const nodes = Array.from(createPrimitives(sector, materials));
    expect(nodes.length).toBe(1);
  });

  test('General cylinder primitives, returns one geometry', () => {
    const generalCylinders = newAttributes(10);
    const sector: Sector = Object.assign(emptySector, { generalCylinders } as Sector);
    const nodes = Array.from(createPrimitives(sector, materials));
    expect(nodes.length).toBe(1);
  });

  test('General ring primitives, returns one geometry', () => {
    const generalRings = newAttributes(10);
    const sector: Sector = Object.assign(emptySector, { generalRings } as Sector);
    const nodes = Array.from(createPrimitives(sector, materials));
    expect(nodes.length).toBe(1);
  });

  test('Nut primitives, returns one geometry', () => {
    const nuts = newAttributes(10);
    const sector: Sector = Object.assign(emptySector, { nuts } as Sector);
    const nodes = Array.from(createPrimitives(sector, materials));
    expect(nodes.length).toBe(1);
  });

  test('Quad primitives, returns one geometry', () => {
    const quads = newAttributes(10);
    const sector: Sector = Object.assign(emptySector, { quads } as Sector);
    const nodes = Array.from(createPrimitives(sector, materials));
    expect(nodes.length).toBe(1);
  });

  test('Spherical segment primitives, returns one geometry', () => {
    const sphericalSegments = newAttributes(10);
    sphericalSegments.f32Attributes.set('radius', new Float32Array(10));
    const sector: Sector = Object.assign(emptySector, { sphericalSegments } as Sector);
    const nodes = Array.from(createPrimitives(sector, materials));
    expect(nodes.length).toBe(1);
  });

  test('Torus segment primitives, returns one geometry', () => {
    const attributes = newAttributes(10);
    attributes.f32Attributes.set('size', new Float32Array(10));
    const sector: Sector = Object.assign(emptySector, { torusSegments: attributes } as Sector);
    const nodes = Array.from(createPrimitives(sector, materials));
    expect(nodes.length).toBe(1);
  });

  test('Trapezium primitives, returns one geometry', () => {
    const sector: Sector = Object.assign(emptySector, { trapeziums: newAttributes(10) } as Sector);
    const nodes = Array.from(createPrimitives(sector, materials));
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
