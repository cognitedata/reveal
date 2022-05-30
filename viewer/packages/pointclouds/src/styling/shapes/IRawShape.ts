/*!
 * Copyright 2022 Cognite AS
 */

export enum ShapeType {
  Cylinder,
  Box,
  Composite
}

export interface IRawShape {
  type: ShapeType;
}
