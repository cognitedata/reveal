/*!
 * Copyright 2020 Cognite AS
 */

import { ParsedPrimitives } from '@/utilities/workers/types/parser.types';
import { Sector } from '@/datamodels/cad/internal/sector/types';

export function createEmptyPrimitive(): ParsedPrimitives {
  return {
    boxCollection: new Uint8Array(),
    boxAttributes: new Map(),
    circleCollection: new Uint8Array(),
    circleAttributes: new Map(),
    coneCollection: new Uint8Array(),
    coneAttributes: new Map(),
    eccentricConeCollection: new Uint8Array(),
    eccentricConeAttributes: new Map(),
    ellipsoidSegmentCollection: new Uint8Array(),
    ellipsoidSegmentAttributes: new Map(),
    generalCylinderCollection: new Uint8Array(),
    generalCylinderAttributes: new Map(),
    generalRingCollection: new Uint8Array(),
    generalRingAttributes: new Map(),
    nutCollection: new Uint8Array(),
    nutAttributes: new Map(),
    quadCollection: new Uint8Array(),
    quadAttributes: new Map(),
    sphericalSegmentCollection: new Uint8Array(),
    sphericalSegmentAttributes: new Map(),
    torusSegmentCollection: new Uint8Array(),
    torusSegmentAttributes: new Map(),
    trapeziumCollection: new Uint8Array(),
    trapeziumAttributes: new Map()
  };
}

export function createEmptySector(): Sector {
  return {
    nodeIdToTreeIndexMap: new Map(),
    treeIndexToNodeIdMap: new Map(),
    primitives: createEmptyPrimitive(),
    instanceMeshes: [],
    triangleMeshes: []
  };
}
