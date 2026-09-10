/*!
 * Copyright 2021 Cognite AS
 */

export type {
  CommonAttributes,
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
  Nut,
  Primitive
} from './internal/types';
export { PrimitiveName, getCollectionType } from './internal/types';

export {
  createPrimitiveInterleavedGeometriesSharingBuffer,
  createPrimitiveInterleavedGeometry,
  parseInterleavedGeometry
} from './internal/threeTranslation';
