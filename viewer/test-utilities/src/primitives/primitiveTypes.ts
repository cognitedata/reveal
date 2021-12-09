/*!
 * Copyright 2021 Cognite AS
 */

import { RevealGeometryCollectionType } from '../../../packages/sector-parser';

export enum PrimitiveType {
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
  Nut
}

export type CommonAttributes = {
  treeIndex?: number;
  color?: [number, number, number, number];
};

export type Box = CommonAttributes & {
  instanceMatrix: number[];
};

export type Circle = CommonAttributes & {
  instanceMatrix: number[];
  normal: [number, number, number];
};

export type Cone = CommonAttributes & {
  angle: number;
  arcAngle: number;
  centerA: [number, number, number];
  centerB: [number, number, number];
  localXAxis: [number, number, number];
  radiusA: number;
  radiusB: number;
};

export type EccentricCone = CommonAttributes & {
  centerA: [number, number, number];
  centerB: [number, number, number];
  normal: [number, number, number];
  radiusA: number;
  radiusB: number;
};

export type Ellipsoid = CommonAttributes & {
  horizontalRadius: number;
  verticalRadius: number;
  height: number;
  center: [number, number, number];
};

export type GeneralCylinder = CommonAttributes & {
  angle: number;
  arcAngle: number;
  centerA: [number, number, number];
  centerB: [number, number, number];
  localXAxis: [number, number, number];
  planeA: [number, number, number, number];
  planeB: [number, number, number, number];
  radius: number;
};

export type GeneralRing = CommonAttributes & {
  angle: number;
  arcAngle: number;
  instanceMatrix: number[];
  normal: [number, number, number];
  thickness: number;
};

export type Quad = CommonAttributes & {
  instanceMatrix: number[];
};

export type Torus = CommonAttributes & {
  arcAngle: number;
  instanceMatrix: number[];
  radius: number;
  tubeRadius: number;
};

export type Trapezium = CommonAttributes & {
  vertex1: [number, number, number];
  vertex2: [number, number, number];
  vertex3: [number, number, number];
  vertex4: [number, number, number];
};

export type Nut = CommonAttributes & {
  instanceMatrix: number[];
};

const primitiveTypeToCollectionTypeMap: Map<PrimitiveType, RevealGeometryCollectionType> = new Map([
  [PrimitiveType.Box, RevealGeometryCollectionType.BoxCollection],
  [PrimitiveType.Circle, RevealGeometryCollectionType.CircleCollection],
  [PrimitiveType.Cone, RevealGeometryCollectionType.ConeCollection],
  [PrimitiveType.EccentricCone, RevealGeometryCollectionType.EccentricConeCollection],
  [PrimitiveType.Ellipsoid, RevealGeometryCollectionType.EllipsoidSegmentCollection],
  [PrimitiveType.GeneralCylinder, RevealGeometryCollectionType.GeneralCylinderCollection],
  [PrimitiveType.GeneralRing, RevealGeometryCollectionType.GeneralRingCollection],
  [PrimitiveType.Quad, RevealGeometryCollectionType.QuadCollection],
  [PrimitiveType.Torus, RevealGeometryCollectionType.TorusSegmentCollection],
  [PrimitiveType.Trapezium, RevealGeometryCollectionType.TrapeziumCollection],
  [PrimitiveType.Nut, RevealGeometryCollectionType.NutCollection]
]);

export function getCollectionType(primitiveType: PrimitiveType): RevealGeometryCollectionType {
  const collectionType = primitiveTypeToCollectionTypeMap.get(primitiveType);

  if (collectionType === undefined) {
    throw Error('Could not find primitive type in primitiveTypeToCollectionTypeMap');
  }

  return collectionType;
}
