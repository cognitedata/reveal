/*!
 * Copyright 2021 Cognite AS
 */

import { RevealGeometryCollectionType } from '../../../packages/sector-parser';

export enum PrimitiveType {
  Box,
  Circle,
  Cone,
  GeneralCylinder,
  Ellipsoid,
  GeneralRing,
  Quad
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

export type Ellipsoid = CommonAttributes & {
  horizontalRadius: number;
  verticalRadius: number;
  height: number;
  center: [number, number, number];
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

const primitiveTypeToCollectionTypeMap: Map<PrimitiveType, RevealGeometryCollectionType> = new Map([
  [PrimitiveType.Box, RevealGeometryCollectionType.BoxCollection],
  [PrimitiveType.Circle, RevealGeometryCollectionType.CircleCollection],
  [PrimitiveType.Cone, RevealGeometryCollectionType.ConeCollection],
  [PrimitiveType.GeneralCylinder, RevealGeometryCollectionType.GeneralCylinderCollection],
  [PrimitiveType.Ellipsoid, RevealGeometryCollectionType.EllipsoidSegmentCollection],
  [PrimitiveType.GeneralRing, RevealGeometryCollectionType.GeneralRingCollection],
  [PrimitiveType.Quad, RevealGeometryCollectionType.QuadCollection]
]);

export function getCollectionType(primitiveType: PrimitiveType): RevealGeometryCollectionType {
  const collectionType = primitiveTypeToCollectionTypeMap.get(primitiveType);

  if (collectionType === undefined) {
    throw Error('Could not find primitive type in primitiveTypeToCollectionTypeMap');
  }

  return collectionType;
}
