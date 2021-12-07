/*!
 * Copyright 2021 Cognite AS
 */

import { RevealGeometryCollectionType } from "../../../packages/sector-parser";

export enum PrimitiveType {
  Ellipsoid,
  Box
};

export type Box = {
  instanceMatrix: number[]
};

export type Ellipsoid = {
  horizontalRadius: number,
  verticalRadius: number,
  height: number,
  center: [number, number, number]
};


const primitiveTypeToCollectionTypeMap: Map<PrimitiveType, RevealGeometryCollectionType> = new Map([
  [PrimitiveType.Box, RevealGeometryCollectionType.BoxCollection],
  [PrimitiveType.Ellipsoid, RevealGeometryCollectionType.EllipsoidSegmentCollection]
]);

export function getCollectionType(primitiveType: PrimitiveType): RevealGeometryCollectionType {
  const collectionType = primitiveTypeToCollectionTypeMap.get(primitiveType);
  if (!collectionType) {
    throw Error('Could not find primitive type in primitiveTypeToCollectionTypeMap');
  }
  return collectionType;
}
