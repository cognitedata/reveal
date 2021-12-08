/*!
 * Copyright 2021 Cognite AS
 */

import { RevealGeometryCollectionType } from '../../../packages/sector-parser';

export enum PrimitiveType {
  Ellipsoid,
  Box
}

export type CommonAttributes = {
  treeIndex?: number;
  color?: [number, number, number, number];
};

export type Box = CommonAttributes & {
  instanceMatrix: number[];
};

export type Ellipsoid = CommonAttributes & {
  horizontalRadius: number;
  verticalRadius: number;
  height: number;
  center: [number, number, number];
};

const primitiveTypeToCollectionTypeMap: Map<PrimitiveType, RevealGeometryCollectionType> = new Map([
  [PrimitiveType.Box, RevealGeometryCollectionType.BoxCollection],
  [PrimitiveType.Ellipsoid, RevealGeometryCollectionType.EllipsoidSegmentCollection]
]);

export function getCollectionType(primitiveType: PrimitiveType): RevealGeometryCollectionType {
  const collectionType = primitiveTypeToCollectionTypeMap.get(primitiveType);

  if (collectionType === undefined) {
    throw Error('Could not find primitive type in primitiveTypeToCollectionTypeMap');
  }

  return collectionType;
}
