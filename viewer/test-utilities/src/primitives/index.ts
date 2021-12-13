/*!
 * Copyright 2021 Cognite AS
 */

export { PrimitiveName,
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
         Primitive,
         getCollectionType,
       } from './internal/primitiveTypes';

export { createPrimitiveInterleavedGeometriesSharingBuffer,
         createPrimitiveInterleavedGeometry,
         parseInterleavedGeometry } from './internal/primitiveThreeBuffers';
