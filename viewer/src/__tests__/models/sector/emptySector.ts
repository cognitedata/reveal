/*!
 * Copyright 2019 Cognite AS
 */

import { PrimitiveAttributes } from '../../../../workers/types/parser.types';
import { Sector } from '../../../models/sector/types';

export function createEmptyPrimitive(): PrimitiveAttributes {
  return {
    f32Attributes: new Map(),
    f64Attributes: new Map(),
    u8Attributes: new Map(),
    vec3Attributes: new Map(),
    vec4Attributes: new Map(),
    mat4Attributes: new Map()
  };
}

export function createEmptySector(): Sector {
  return {
    boxes: createEmptyPrimitive(),
    circles: createEmptyPrimitive(),
    cones: createEmptyPrimitive(),
    eccentricCones: createEmptyPrimitive(),
    ellipsoidSegments: createEmptyPrimitive(),
    generalCylinders: createEmptyPrimitive(),
    generalRings: createEmptyPrimitive(),
    instanceMeshes: [],
    nuts: createEmptyPrimitive(),
    quads: createEmptyPrimitive(),
    sphericalSegments: createEmptyPrimitive(),
    torusSegments: createEmptyPrimitive(),
    trapeziums: createEmptyPrimitive(),
    triangleMeshes: []
  };
}
