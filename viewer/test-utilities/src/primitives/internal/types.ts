/*!
 * Copyright 2021 Cognite AS
 */

import { RevealGeometryCollectionType } from '../../../../packages/sector-parser';

export enum PrimitiveName {
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

export type PrimitiveComponent = number | number[];

export type Primitive =
  | Box
  | Circle
  | Cone
  | EccentricCone
  | Ellipsoid
  | GeneralCylinder
  | GeneralRing
  | Quad
  | Torus
  | Trapezium
  | Nut;

const primitiveTypeToCollectionTypeMap: Map<PrimitiveName, RevealGeometryCollectionType> = new Map([
  [PrimitiveName.Box, RevealGeometryCollectionType.BoxCollection],
  [PrimitiveName.Circle, RevealGeometryCollectionType.CircleCollection],
  [PrimitiveName.Cone, RevealGeometryCollectionType.ConeCollection],
  [PrimitiveName.EccentricCone, RevealGeometryCollectionType.EccentricConeCollection],
  [PrimitiveName.Ellipsoid, RevealGeometryCollectionType.EllipsoidSegmentCollection],
  [PrimitiveName.GeneralCylinder, RevealGeometryCollectionType.GeneralCylinderCollection],
  [PrimitiveName.GeneralRing, RevealGeometryCollectionType.GeneralRingCollection],
  [PrimitiveName.Quad, RevealGeometryCollectionType.QuadCollection],
  [PrimitiveName.Torus, RevealGeometryCollectionType.TorusSegmentCollection],
  [PrimitiveName.Trapezium, RevealGeometryCollectionType.TrapeziumCollection],
  [PrimitiveName.Nut, RevealGeometryCollectionType.NutCollection]
]);

/**
 * Returns the RevealGeometryCollectionType corresponding to this PrimitiveName
 */
export function getCollectionType(primitiveType: PrimitiveName): RevealGeometryCollectionType {
  const collectionType = primitiveTypeToCollectionTypeMap.get(primitiveType);

  if (collectionType === undefined) {
    throw Error('Could not find primitive type in primitiveTypeToCollectionTypeMap');
  }

  return collectionType;
}
